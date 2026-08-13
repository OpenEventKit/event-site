/**
 * The profile fetch serves two callers with different needs. The login flow
 * wants the full chain -- IDP profile, schedule sync link -- and failures
 * surfaced to the user. The registration-surface refresh wants the ownership
 * snapshot only, quietly: it runs on every modal open, so a failure alert
 * about the "Login Flow" and a POST per open are both wrong there.
 */
import { getUserProfile, getIDPProfile, refreshUserProfile } from "../user-actions";
import { voidErrorHandler } from "../../utils/customErrorHandler";
import { alertWarning } from "@utils/alerts";
import { initLogOut } from "openstack-uicore-foundation/lib/security/methods";

jest.mock("../../utils/loginUtils", () => ({
  getAccessTokenSafely: jest.fn(() => Promise.resolve("token")),
}));

let mockGetResult;
let mockPostResult;
jest.mock("openstack-uicore-foundation/lib/utils/actions", () => ({
  getRequest: jest.fn(() => () => () => mockGetResult()),
  postRequest: jest.fn(() => () => () => mockPostResult()),
  putRequest: jest.fn(() => () => () => Promise.resolve({})),
  deleteRequest: jest.fn(() => () => () => Promise.resolve({})),
  putFile: jest.fn(() => () => () => Promise.resolve({})),
  createAction: (type) => (payload) => ({ type, payload }),
  startLoading: () => ({ type: "START_LOADING" }),
  stopLoading: () => ({ type: "STOP_LOADING" }),
}));
jest.mock("openstack-uicore-foundation/lib/utils/methods", () => ({
  putOnLocalStorage: jest.fn(),
  getFromLocalStorage: jest.fn(),
}));
jest.mock("openstack-uicore-foundation/lib/security/methods", () => ({
  passwordlessLogin: jest.fn(),
  initLogOut: jest.fn(),
}));
jest.mock("openstack-uicore-foundation/lib/utils/questions-set", () => jest.fn());
jest.mock("@utils/alerts", () => ({
  alertSuccess: jest.fn(),
  alertWarning: jest.fn(),
}));

const { getRequest, postRequest } = require("openstack-uicore-foundation/lib/utils/actions");

const dispatch = jest.fn((action) =>
  typeof action === "function" ? action(dispatch, getState) : action
);
const getState = () => ({ loggedUserState: { isLoggedUser: 1 }, userState: { loading: false } });

// The queue clears itself a microtask after settling; hop a macrotask so one
// test's refresh cannot bleed into the next.
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

const profileCalls = () =>
  getRequest.mock.calls.filter(([, , url]) => url.includes("/members/me"));
const idpCalls = () =>
  getRequest.mock.calls.filter(([, , url]) => url.includes("/users/me"));
const syncLinkCalls = () =>
  postRequest.mock.calls.filter(([, , url]) => url.includes("shareable-link"));

beforeAll(() => {
  window.SUMMIT_API_BASE_URL = "https://summit-api.test";
  window.SUMMIT_ID = "73";
  window.IDP_BASE_URL = "https://idp.test";
});

beforeEach(() => {
  jest.clearAllMocks();
  mockGetResult = () => Promise.resolve({});
  mockPostResult = () => Promise.resolve({});
});

describe("the registration-surface refresh", () => {
  it("fetches the profile and nothing else", async () => {
    await refreshUserProfile()(dispatch, getState);
    await tick();

    expect(profileCalls()).toHaveLength(1);
    expect(idpCalls()).toHaveLength(0);
    expect(syncLinkCalls()).toHaveLength(0);
  });

  it("uses the quiet error handler", async () => {
    await refreshUserProfile()(dispatch, getState);
    await tick();

    expect(profileCalls()[0][3]).toBe(voidErrorHandler);
  });

  it("fails without raising the login-flow alert", async () => {
    mockGetResult = () => Promise.reject({ res: { statusCode: 500 } });

    await refreshUserProfile()(dispatch, getState);
    await tick();

    expect(alertWarning).not.toHaveBeenCalled();
  });
});

describe("the login flow", () => {
  it("chains the IDP profile and the schedule sync link", async () => {
    await getUserProfile()(dispatch);
    await tick();

    expect(profileCalls()).toHaveLength(1);
    // The profile leg rides the shared queue, so it is quiet at the request
    // layer; the outer catch owns what the user sees.
    expect(profileCalls()[0][3]).toBe(voidErrorHandler);
    expect(idpCalls()).toHaveLength(1);
    expect(syncLinkCalls()).toHaveLength(1);
  });

  it("never puts a second profile request on the wire while one is out", async () => {
    // uicore aborts an in-flight request to the same URL, and an aborted
    // request never settles: whoever awaited it hangs forever. The only safe
    // number of concurrent /members/me requests is one, whichever paths ask.
    let settleFirst;
    mockGetResult = () => new Promise((resolve) => { settleFirst = resolve; });

    const refresh = refreshUserProfile()(dispatch, getState);
    const login = getUserProfile()(dispatch);
    await tick();
    expect(profileCalls()).toHaveLength(1);

    mockGetResult = () => Promise.resolve({});
    settleFirst({});
    await refresh;
    await login;
    await tick();
  });

  it("queues a second refresh behind the one in flight", async () => {
    let settleFirst;
    mockGetResult = () => new Promise((resolve) => { settleFirst = resolve; });

    const first = refreshUserProfile()(dispatch, getState);
    const second = refreshUserProfile()(dispatch, getState);
    await tick();
    expect(profileCalls()).toHaveLength(1);

    // The queued run must find a settling fetch, or it hangs and poisons the
    // module-level queue for every test after this one.
    mockGetResult = () => Promise.resolve({});
    settleFirst({});
    await first;
    await second;
    await tick();
  });

  it("does not alert on a 401", async () => {
    // 401 is owned by the request's error handler (expiredToken sends the
    // user to /auth/expired); an alert or a hard logout here would fight it.
    // getRequest rejects with { err, res, ... }: the status lives on res, so
    // the old e?.status read was never set and sent 401s to the alert.
    mockGetResult = () => Promise.reject({ res: { statusCode: 401 } });

    await getUserProfile()(dispatch);
    await tick();

    expect(initLogOut).not.toHaveBeenCalled();
    expect(alertWarning).not.toHaveBeenCalled();
  });

  it("never puts a second IDP request on the wire while one is out", async () => {
    // Same abort hazard one layer down: two getUserProfile chains settling
    // together used to fire two IDP GETs, and the second aborted the first,
    // stranding its caller -- the auth callback on "Checking credentials...".
    let settleFirst;
    mockGetResult = () => new Promise((resolve) => { settleFirst = resolve; });

    const first = getIDPProfile()(dispatch);
    const second = getIDPProfile()(dispatch);
    await tick();
    expect(idpCalls()).toHaveLength(1);

    mockGetResult = () => Promise.resolve({});
    settleFirst({});
    await first;
    await second;
    await tick();
    expect(idpCalls()).toHaveLength(2);
  });

  it("alerts on any other failure", async () => {
    mockGetResult = () => Promise.reject({ res: { statusCode: 500 } });

    await getUserProfile()(dispatch);
    await tick();

    expect(alertWarning).toHaveBeenCalled();
    expect(initLogOut).not.toHaveBeenCalled();
  });
});
