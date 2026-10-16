/**
 * AUTH_ERROR_MISSING_AUTH_INFO means the session is already gone: it must not
 * count as an error in Sentry, while every other auth error is still reported.
 */
import * as Sentry from "@sentry/react";
import { dropExpectedAuthErrors } from "../loginUtils";

jest.mock("gatsby", () => ({ navigate: jest.fn() }));
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
