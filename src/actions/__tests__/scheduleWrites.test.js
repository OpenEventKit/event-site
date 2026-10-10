/**
 * addToSchedule / removeFromSchedule used to resolve with the error on a failed
 * request, so the schedule widgets took it as success. They must reject, and
 * leave what the user sees to executeUserIntent.
 */
import axios from "axios";
import * as Sentry from "@sentry/react";
import { addToSchedule, removeFromSchedule, ADD_TO_SCHEDULE, REMOVE_FROM_SCHEDULE } from "../user-actions";

jest.mock("axios", () => ({ post: jest.fn(), delete: jest.fn() }));
jest.mock("@sentry/react", () => ({ captureException: jest.fn() }));
jest.mock("../../utils/loginUtils", () => ({ getAccessTokenSafely: jest.fn(() => Promise.resolve("token")) }));
jest.mock("openstack-uicore-foundation/lib/utils/actions", () => ({
  getRequest: jest.fn(),
  postRequest: jest.fn(),
  putRequest: jest.fn(),
  deleteRequest: jest.fn(),
  putFile: jest.fn(),
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
jest.mock("@utils/alerts", () => ({ alertSuccess: jest.fn(), alertWarning: jest.fn() }));

const event = { id: 42 };
const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { response: { status } });
const dispatch = jest.fn((a) => a);

beforeEach(() => jest.clearAllMocks());

describe.each([
  ["addToSchedule", addToSchedule, "post", ADD_TO_SCHEDULE],
  ["removeFromSchedule", removeFromSchedule, "delete", REMOVE_FROM_SCHEDULE],
])("%s", (_name, action, method, type) => {
  it("resolves with the event and records it when the API accepts", async () => {
    axios[method].mockResolvedValue({});
    await expect(action(event)(dispatch)).resolves.toBe(event);
    expect(dispatch).toHaveBeenCalledWith({ type, payload: event });
  });

  it.each([412, 500])("rejects on a %i instead of resolving with the error", async (status) => {
    const error = httpError(status);
    axios[method].mockRejectedValue(error);
    await expect(action(event)(dispatch)).rejects.toBe(error);
    expect(dispatch).not.toHaveBeenCalledWith({ type, payload: event });
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });
});
