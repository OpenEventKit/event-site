/**
 * AUTH_ERROR_MISSING_AUTH_INFO means the session is already gone: it must not
 * count as an error in Sentry, while every other auth error is still reported.
 * Concurrent token failures share a single logout navigation.
 */
import * as Sentry from "@sentry/react";
import { navigate } from "gatsby";
import { getAccessToken } from "openstack-uicore-foundation/lib/security/methods";
import { dropExpectedAuthErrors, getAccessTokenSafely } from "../loginUtils";

jest.mock("gatsby", () => ({ navigate: jest.fn() }));
jest.mock("openstack-uicore-foundation/lib/security/methods", () => ({ getAccessToken: jest.fn() }));
jest.mock("@utils/eventTriggers", () => ({ triggerLogoutEvent: jest.fn() }));
jest.mock("@sentry/react", () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
}));

const exceptionEvent = (value) => ({
  exception: { values: [{ type: "Error", value }] },
});

describe("dropExpectedAuthErrors", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("drops AUTH_ERROR_MISSING_AUTH_INFO and keeps it as a breadcrumb", () => {
    expect(dropExpectedAuthErrors(exceptionEvent("AUTH_ERROR_MISSING_AUTH_INFO"))).toBeNull();
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({ category: "auth", message: "AUTH_ERROR_MISSING_AUTH_INFO" })
    );
  });

  it("keeps AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR unchanged", () => {
    const event = exceptionEvent("AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR");

    expect(dropExpectedAuthErrors(event)).toBe(event);
    expect(Sentry.addBreadcrumb).not.toHaveBeenCalled();
  });

  it("keeps events without an exception unchanged", () => {
    const event = { message: "hello" };

    expect(dropExpectedAuthErrors(event)).toBe(event);
  });
});

describe("getAccessTokenSafely", () => {
  it("navigates to logout once for concurrent failures and rejects each with the original error", async () => {
    const error = new Error("AUTH_ERROR_MISSING_AUTH_INFO");
    getAccessToken.mockRejectedValue(error);

    const results = await Promise.allSettled([getAccessTokenSafely(), getAccessTokenSafely(), getAccessTokenSafely()]);

    expect(navigate).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith("/auth/logout", expect.anything());
    results.forEach((result) => expect(result).toEqual({ status: "rejected", reason: error }));
  });
});
