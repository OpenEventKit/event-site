import React from "react";
import { render, waitFor } from "@testing-library/react";
import { clearAuthInfo, getLogoutUrl } from "openstack-uicore-foundation/lib/security/methods";
import { getFromLocalStorage } from "openstack-uicore-foundation/lib/utils/methods";
import { persistor } from "../../state/store";
import { LogOutCallbackRoute } from "../logout-callback-route";

jest.mock("openstack-uicore-foundation/lib/security/methods", () => ({
  clearAuthInfo: jest.fn(),
  getIdToken: jest.fn(() => "id.token."),
  getLogoutUrl: jest.fn(() => ({ toString: () => "https://idp.test/oauth2/end-session?mocked=1" })),
}));

// the real module pulls in sweetalert2, whose injected css jsdom can't parse
jest.mock("openstack-uicore-foundation/lib/security/actions", () => ({
  doLogout: jest.fn(),
}));

jest.mock("openstack-uicore-foundation/lib/utils/methods", () => ({
  getFromLocalStorage: jest.fn(),
}));

jest.mock("../../state/store", () => ({
  persistor: { flush: jest.fn() },
}));

jest.mock("gatsby", () => ({ navigate: jest.fn() }));

jest.mock("@gatsbyjs/reach-router", () => ({
  Redirect: ({ to }) => <div data-testid="redirect">{to}</div>,
}));

describe("LogOutCallbackRoute", () => {
  const originalLocation = window.location;
  let replace;
  let doLogout;
  let resolveFlush;

  beforeEach(() => {
    jest.clearAllMocks();
    replace = jest.fn();
    doLogout = jest.fn();
    delete window.location;
    window.location = { replace };
    persistor.flush.mockImplementation(() => new Promise((resolve) => { resolveFlush = resolve; }));
  });

  afterEach(() => {
    window.location = originalLocation;
  });

  it("logs out of redux after building the end-session url and leaves only once the state is flushed", async () => {
    getFromLocalStorage.mockReturnValue(null);
    // the reducer clears authInfo on LOGOUT_USER, so the id_token must already be in the url
    doLogout.mockImplementation(() => expect(getLogoutUrl).toHaveBeenCalledWith("id.token."));

    render(<LogOutCallbackRoute doLogout={doLogout} location={{ search: "", state: { backUrl: "/a/" } }} />);

    expect(clearAuthInfo).toHaveBeenCalled();
    expect(doLogout).toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();

    resolveFlush();
    await waitFor(() => expect(replace).toHaveBeenCalledWith("https://idp.test/oauth2/end-session?mocked=1"));
  });

  it("logs out of redux on an invalid nonce and shows the error once the state is flushed", async () => {
    getFromLocalStorage.mockReturnValue("stored-state");

    const { queryByTestId, findByTestId } = render(
      <LogOutCallbackRoute doLogout={doLogout} location={{ search: "?state=other-state" }} />
    );

    expect(clearAuthInfo).toHaveBeenCalled();
    expect(doLogout).toHaveBeenCalled();
    expect(queryByTestId("redirect")).toBeNull();

    resolveFlush();
    expect((await findByTestId("redirect")).textContent).toContain("error=Invalid Nonce");
    expect(replace).not.toHaveBeenCalled();
  });
});
