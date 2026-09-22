import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { getAuthUrl } from "openstack-uicore-foundation/lib/security/methods";
import LogInCallbackRoute from "../login-callback-route";

jest.mock("openstack-uicore-foundation/lib/security/methods", () => ({
  getAuthUrl: jest.fn(() => ({ toString: () => "https://idp.test/oauth2/auth?mocked=1" })),
}));

jest.mock("@utils/envVariables", () => ({
  getEnvVariable: jest.fn(() => "tenant-1"),
  TENANT_ID: "TENANT_ID",
}));

const renderRoute = (location, doLogin) =>
  render(
    <Provider store={createStore(() => ({}))}>
      <LogInCallbackRoute doLogin={doLogin} location={location} />
    </Provider>
  );

describe("LogInCallbackRoute", () => {
  const originalLocation = window.location;
  let replace;
  let doLogin;

  beforeEach(() => {
    jest.clearAllMocks();
    replace = jest.fn();
    doLogin = jest.fn();
    delete window.location;
    window.location = { replace };
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("forwards an id_token_hint from the fragment to the site's own authorize request", () => {
    renderRoute({ search: "?backUrl=%2Fa%2Fmy-tickets%2F", hash: "#id_token_hint=aaa.bbb." }, doLogin);

    expect(getAuthUrl).toHaveBeenCalledWith("/a/my-tickets/", null, "aaa.bbb.", null, null, null, "tenant-1");
    expect(replace).toHaveBeenCalledWith("https://idp.test/oauth2/auth?mocked=1");
    expect(doLogin).not.toHaveBeenCalled();
  });

  it("accepts the id_token_hint from the query string as a fallback", () => {
    renderRoute({ search: "?backUrl=%2Fa%2Fmy-tickets%2F&id_token_hint=aaa.bbb.", hash: "" }, doLogin);

    expect(getAuthUrl).toHaveBeenCalledWith("/a/my-tickets/", null, "aaa.bbb.", null, null, null, "tenant-1");
    expect(replace).toHaveBeenCalledWith("https://idp.test/oauth2/auth?mocked=1");
    expect(doLogin).not.toHaveBeenCalled();
  });

  it("does not forward login_hint alongside the id_token_hint", () => {
    renderRoute({ search: "?login_hint=a%40b.com&backUrl=%2F", hash: "#id_token_hint=aaa.bbb." }, doLogin);

    const [, , tokenHint, , loginHint, otpLoginHint] = getAuthUrl.mock.calls[0];
    expect(tokenHint).toBe("aaa.bbb.");
    expect(loginHint).toBeNull();
    expect(otpLoginHint).toBeNull();
  });

  it("keeps the email magic link (login_hint + otp_login_hint) on the existing doLogin path", () => {
    renderRoute({ search: "?login_hint=a%40b.com&otp_login_hint=123456&backUrl=%2Fa%2Fextra-questions", hash: "" }, doLogin);

    expect(doLogin).toHaveBeenCalledWith("/a/extra-questions", "a@b.com", "123456", null, null, "tenant-1");
    expect(getAuthUrl).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
