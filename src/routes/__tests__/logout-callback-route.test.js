/**
 * Only a completed logout tells the other open tabs to drop their logged in
 * state; a failed one (state mismatch) must leave them alone.
 */
import React from "react";
import { render } from "@testing-library/react";
import { LogOutCallbackRoute } from "../logout-callback-route";
import { broadcastLogout } from "../../utils/logoutBroadcast";

jest.mock("gatsby", () => ({ navigate: jest.fn() }));
jest.mock("@gatsbyjs/reach-router", () => ({ Redirect: () => null }));
jest.mock("openstack-uicore-foundation/lib/security/methods", () => ({
  initLogOut: jest.fn(),
}));
jest.mock("../../utils/logoutBroadcast", () => ({
  broadcastLogout: jest.fn(),
}));

const renderRoute = (search) =>
  render(<LogOutCallbackRoute doLogout={jest.fn()} location={{ search, state: null }} />);

describe("LogOutCallbackRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    window.localStorage.setItem("post_logout_state", "abc");
  });

  it("broadcasts the logout after a completed logout", () => {
    renderRoute("?state=abc");

    expect(broadcastLogout).toHaveBeenCalledTimes(1);
  });

  it("does not broadcast when the logout state does not match", () => {
    renderRoute("?state=other");

    expect(broadcastLogout).not.toHaveBeenCalled();
  });
});
