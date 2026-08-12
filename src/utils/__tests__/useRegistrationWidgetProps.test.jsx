/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, waitFor } from "@testing-library/react";

// onPurchaseComplete is the surface that must never show a stale profile: the
// user just bought a ticket and is looking at ownership state. Deleting the
// refresh from it revives the bug with everything else green.
import useRegistrationWidgetProps from "../useRegistrationWidgetProps";

jest.mock("@utils/useMarketingSettings", () => ({
  __esModule: true,
  default: () => ({ getSettingByKey: () => "" }),
  MARKETING_SETTINGS_KEYS: {},
}));
jest.mock("@utils/useSiteSettings", () => () => ({}));
jest.mock("@utils/usePaymentSettings", () => () => ({}));

let widgetProps;
const Probe = (props) => {
  widgetProps = useRegistrationWidgetProps(props);
  return null;
};

describe("onPurchaseComplete", () => {
  it("refreshes the profile after the order is stored and checked", async () => {
    const order = { id: 42 };
    const calls = [];
    const setUserOrder = jest.fn(() => { calls.push("setUserOrder"); return Promise.resolve(); });
    const checkOrderData = jest.fn(() => { calls.push("checkOrderData"); return Promise.resolve(); });
    const refreshUserProfile = jest.fn(() => { calls.push("refreshUserProfile"); return Promise.resolve(); });

    render(
      <Probe
        summit={{ id: 73 }}
        userProfile={null}
        idpProfile={null}
        attendee={null}
        colorSettings={{}}
        loadingProfile={false}
        loadingIDP={false}
        availableThirdPartyProviders={[]}
        allowsNativeAuth
        allowsOtpAuth
        setPasswordlessLogin={jest.fn()}
        setUserOrder={setUserOrder}
        checkOrderData={checkOrderData}
        refreshUserProfile={refreshUserProfile}
        getThirdPartyProviders={jest.fn()}
        getExtraQuestions={jest.fn()}
        checkRequireExtraQuestionsByAttendee={jest.fn()}
        backUrl="/"
        closeWidget={jest.fn()}
      />
    );

    widgetProps.onPurchaseComplete(order);

    await waitFor(() => expect(refreshUserProfile).toHaveBeenCalledTimes(1));
    expect(setUserOrder).toHaveBeenCalledWith(order);
    expect(checkOrderData).toHaveBeenCalledWith(order);
    // The refresh answers for the purchase, so it must run after the order
    // was stored and checked, not alongside them.
    expect(calls).toEqual(["setUserOrder", "checkOrderData", "refreshUserProfile"]);
  });
});
