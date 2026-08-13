/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";

// The stale-ownership fix is these dispatches firing when the modal surfaces,
// not anything in the reducer: deleting the refreshUserProfile() call from an
// open path brings the bug back with every other test still green. These pin
// the wiring itself.
import RegistrationModalComponent from "../RegistrationModalComponent";
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
jest.mock("summit-registration-lite/dist/components/registration-modal", () => () => null);

const state = {
  userState: {
    loading: false,
    loadingIDP: false,
    userProfile: null,
    idpProfile: null,
    attendee: null,
  },
  summitState: {
    third_party_providers: [],
    allows_native_auth: true,
    allows_otp_auth: true,
    summit: { id: 73 },
  },
  settingState: {
    colorSettings: {},
    marketingPageSettings: {
      hero: { buttons: { registerButton: { display: true, text: "Register" } } },
    },
  },
};

const store = {
  getState: () => state,
  subscribe: () => () => {},
  dispatch: jest.fn((action) => action),
};

const renderModal = (props = {}) =>
  render(
    <Provider store={store}>
      <RegistrationModalComponent {...props} />
    </Provider>
  );

beforeEach(() => {
  jest.clearAllMocks();
  window.location.hash = "";
});

describe("RegistrationModalComponent", () => {
  it("refreshes the profile when the register button opens the modal", () => {
    renderModal();
    expect(refreshUserProfile).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Register"));

    expect(refreshUserProfile).toHaveBeenCalledTimes(1);
  });

  it("refreshes the profile when #registration=1 auto-opens the modal", () => {
    window.location.hash = "#registration=1";

    renderModal();

    expect(refreshUserProfile).toHaveBeenCalledTimes(1);
  });

  it("does not refresh on mount when nothing opens the modal", () => {
    renderModal({ ignoreAutoOpen: true });

    expect(refreshUserProfile).not.toHaveBeenCalled();
  });
});
