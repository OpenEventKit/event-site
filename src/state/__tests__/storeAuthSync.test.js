/**
 * Other tabs change the shared authInfo token (login, logout, failed token
 * refresh); this tab reloads whenever its login state no longer matches it,
 * so it never persists a stale login state.
 */
import { storeAuthInfo } from "openstack-uicore-foundation/lib/security/methods";
import { store, persistor } from "../store";

// a reducer dependency runs a graphql query at module load
jest.mock("gatsby", () => ({
  graphql: jest.fn(),
  navigate: jest.fn(),
  useStaticQuery: jest.fn(),
  withPrefix: (path) => path,
}));
jest.mock("../../actions/user-actions", () => ({
  getUserProfile: jest.fn(() => ({ type: "GET_USER_PROFILE_MOCK" })),
}));

const AUTH_INFO = JSON.stringify({ accessToken: "token", expiresIn: 3600, accessTokenUpdatedAt: 0 });

// another tab changed localStorage; the browser only fires this in the other tabs
const otherTabChanged = (key) => window.dispatchEvent(new StorageEvent("storage", { key }));

const setLoggedIn = () => store.dispatch({ type: "SET_LOGGED_USER", payload: { sessionState: null } });
const setLoggedOut = () => store.dispatch({ type: "LOGOUT_USER", payload: { backUrl: null } });

describe("store auth sync across tabs", () => {
  const originalLocation = window.location;
  let reload;
  let replace;
  let pause;

  beforeEach(() => {
    reload = jest.fn();
    replace = jest.fn();
    delete window.location;
    window.location = { reload, replace };
    pause = jest.spyOn(persistor, "pause");
    window.localStorage.clear();
  });

  afterEach(() => {
    window.location = originalLocation;
    window.history.replaceState(null, "");
    jest.restoreAllMocks();
  });

  it("uicore stores the token under the key this tab listens to", () => {
    storeAuthInfo("token", 3600);

    expect(window.localStorage.getItem("authInfo")).not.toBeNull();
  });

  it("reloads a logged in tab when another tab logs out", () => {
    setLoggedIn();

    otherTabChanged(null);

    expect(pause).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("reloads a logged in tab when another tab's token refresh fails", () => {
    setLoggedIn();

    otherTabChanged("authInfo");

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("sends a logged out tab back to its login redirect page when another tab logs in", () => {
    setLoggedOut();
    window.history.replaceState({ backUrl: "/a/my-tickets/" }, "");
    window.localStorage.setItem("authInfo", AUTH_INFO);

    otherTabChanged("authInfo");

    expect(pause).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith("/a/my-tickets/");
    expect(reload).not.toHaveBeenCalled();
  });

  it("reloads a logged out tab with no login redirect when another tab logs in", () => {
    setLoggedOut();
    window.localStorage.setItem("authInfo", AUTH_INFO);

    otherTabChanged("authInfo");

    expect(reload).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  it("does nothing when another tab refreshes the token", () => {
    setLoggedIn();
    window.localStorage.setItem("authInfo", AUTH_INFO);

    otherTabChanged("authInfo");

    expect(pause).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });

  it("ignores other keys", () => {
    setLoggedIn();

    otherTabChanged("persist:root");

    expect(reload).not.toHaveBeenCalled();
  });
});
