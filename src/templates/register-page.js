import React from "react";
import { connect } from "react-redux";
import { navigate } from "gatsby";
import * as Sentry from "@sentry/react";

import Layout from "../components/Layout";
import Seo from "../components/Seo";
import { SentryFallbackFunction } from "../components/SentryErrorComponent";
import RegistrationForm from "summit-registration-lite/dist/components/registration-form";
import "summit-registration-lite/dist/components/registration-form.css";

import { setPasswordlessLogin, setUserOrder, checkOrderData, getUserProfile, checkRequireExtraQuestionsByAttendee } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";
import { getExtraQuestions } from "../actions/summit-actions";

import useRegistrationWidgetProps from "@utils/useRegistrationWidgetProps";

import styles from "../styles/register-page.module.scss";

const RegisterPage = ({
    location,
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
    const widgetProps = useRegistrationWidgetProps({
        summit, userProfile, idpProfile, attendee, colorSettings,
        loadingProfile, loadingIDP, availableThirdPartyProviders,
        allowsNativeAuth, allowsOtpAuth,
        setPasswordlessLogin, setUserOrder, checkOrderData,
        getThirdPartyProviders, getExtraQuestions, checkRequireExtraQuestionsByAttendee,
        backUrl: '/register',
        closeWidget: () => navigate("/"),
    });

    if (!summit) {
        return (
            <Layout location={location}>
                <div className={styles.registerPage}>
                    <p>Loading...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout location={location}>
            <div className={styles.registerPage}>
                <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: "Registration Form"})}>
                    <div className={`${styles.formContainer} summit-registration-lite`}>
                        <RegistrationForm {...widgetProps} />
                    </div>
                </Sentry.ErrorBoundary>
            </div>
        </Layout>
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
})(RegisterPage);

export const Head = ({ location }) => <Seo title="Register" location={location} />;
