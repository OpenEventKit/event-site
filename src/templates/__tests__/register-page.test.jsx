/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";

// The stale-ownership fix on /register is the mount dispatch itself; deleting
// it brings the bug back with everything else green. This pins the wiring.
import RegisterPage from "../register-page";
import { refreshUserProfile } from "../../actions/user-actions";

jest.mock("../../actions/user-actions", () => ({
  refreshUserProfile: jest.fn(() => ({ type: "TEST/REFRESH_USER_PROFILE" })),
  setPasswordlessLogin: jest.fn(() => ({ type: "TEST/NOOP" })),
  setUserOrder: jest.fn(() => ({ type: "TEST/NOOP" })),
  checkOrderData: jest.fn(() => ({ type: "TEST/NOOP" })),
  checkRequireExtraQuestionsByAttendee: jest.fn(() => ({ type: "TEST/NOOP" })),
}));
jest.mock("../../actions/base-actions", () => ({
  getThirdPartyProviders: jest.fn(() => ({ type: "TEST/NOOP" })),
}));
jest.mock("../../actions/summit-actions", () => ({
  getExtraQuestions: jest.fn(() => ({ type: "TEST/NOOP" })),
}));
jest.mock("@utils/useRegistrationWidgetProps", () => () => ({}));
jest.mock("summit-registration-lite/dist/components/registration-form", () => () => null);
jest.mock("../../components/Layout", () => ({ children }) => <>{children}</>);
jest.mock("../../components/Seo", () => () => null);

const state = {
  userState: { loading: false, loadingIDP: false, userProfile: null, idpProfile: null, attendee: null },
  summitState: { third_party_providers: [], allows_native_auth: true, allows_otp_auth: true, summit: { id: 73 } },
  settingState: { colorSettings: {} },
};
const store = { getState: () => state, subscribe: () => () => {}, dispatch: jest.fn((a) => a) };

describe("RegisterPage", () => {
  it("refreshes the profile on mount", () => {
    render(
      <Provider store={store}>
        <RegisterPage location={{ pathname: "/register" }} />
      </Provider>
    );
    expect(refreshUserProfile).toHaveBeenCalledTimes(1);
  });
});
