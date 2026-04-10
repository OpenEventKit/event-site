import React from "react";
import { connect } from "react-redux";
import { navigate } from "gatsby";
import * as Sentry from "@sentry/react";
import NoSsr from "@mui/material/NoSsr";

import { SentryFallbackFunction } from "./SentryErrorComponent";
import RegistrationForm from "summit-registration-lite/dist/components/registration-form";
import "summit-registration-lite/dist/components/registration-form.css";

import { setPasswordlessLogin, setUserOrder, checkOrderData, getUserProfile, checkRequireExtraQuestionsByAttendee } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";
import { getExtraQuestions } from "../actions/summit-actions";

import useRegistrationWidgetProps from "@utils/useRegistrationWidgetProps";

const RegistrationFormShortcode = ({
    summit,
    userProfile,
    idpProfile,
    colorSettings,
    attendee,
    availableThirdPartyProviders,
    allowsNativeAuth,
    allowsOtpAuth,
    loadingProfile,
    loadingIDP,
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData,
    getUserProfile,
    getThirdPartyProviders,
    getExtraQuestions,
    checkRequireExtraQuestionsByAttendee
}) => {
    const backUrl = typeof window !== 'undefined' ? window.location.pathname : '/';

    const widgetProps = useRegistrationWidgetProps({
        summit, userProfile, idpProfile, attendee, colorSettings,
        loadingProfile, loadingIDP, availableThirdPartyProviders,
        allowsNativeAuth, allowsOtpAuth,
        setPasswordlessLogin, setUserOrder, checkOrderData,
        getThirdPartyProviders, getExtraQuestions, checkRequireExtraQuestionsByAttendee,
        backUrl,
        closeWidget: () => navigate("/"),
    });

    if (!summit) return null;

    return (
        <NoSsr>
            <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: "Registration Form"})}>
                <div className="summit-registration-lite">
                    <RegistrationForm {...widgetProps} />
                </div>
            </Sentry.ErrorBoundary>
        </NoSsr>
    );
};

const mapStateToProps = ({ userState, summitState, settingState }) => ({
    loadingProfile: userState.loading,
    loadingIDP: userState.loadingIDP,
    userProfile: userState.userProfile,
    idpProfile: userState.idpProfile,
    attendee: userState.attendee,
    availableThirdPartyProviders: summitState.third_party_providers,
    allowsNativeAuth: summitState.allows_native_auth,
    allowsOtpAuth: summitState.allows_otp_auth,
    summit: summitState.summit,
    colorSettings: settingState.colorSettings,
});

export default connect(mapStateToProps, {
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData,
    getUserProfile,
    getThirdPartyProviders,
    getExtraQuestions,
    checkRequireExtraQuestionsByAttendee
})(RegistrationFormShortcode);
