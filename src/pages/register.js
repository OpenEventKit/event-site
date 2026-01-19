import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { navigate, withPrefix } from "gatsby";
import URI from "urijs";
import Swal from "sweetalert2";
import * as Sentry from "@sentry/react";
import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";
import { doLogin, doLogout, passwordlessStart } from "openstack-uicore-foundation/lib/security/methods";

import Layout from "../components/Layout";
import Seo from "../components/Seo";
import { SentryFallbackFunction } from "../components/SentryErrorComponent";
import RegistrationForm from "summit-registration-lite/dist/components/registration-form";
import "summit-registration-lite/dist/components/registration-form.css";

import { setPasswordlessLogin, setUserOrder, checkOrderData, getUserProfile, checkRequireExtraQuestionsByAttendee } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";
import { getExtraQuestions } from "../actions/summit-actions";

import useSiteSettings from "@utils/useSiteSettings";
import usePaymentSettings from "@utils/usePaymentSettings";
import useMarketingSettings, { MARKETING_SETTINGS_KEYS } from "@utils/useMarketingSettings";
import { getEnvVariable, SUMMIT_API_BASE_URL, OAUTH2_CLIENT_ID, REGISTRATION_BASE_URL, SUPPORT_EMAIL, TENANT_ID } from "@utils/envVariables";
import { userHasAccessLevel, VIRTUAL_ACCESS_LEVEL } from "@utils/authorizedGroups";
import { validateIdentityProviderButtons, getAccessTokenSafely } from "@utils/loginUtils";
import { triggerTagManagerTrackEvent } from "@utils/eventTriggers";
import { ERROR_TYPE_ERROR, ERROR_TYPE_VALIDATION, ERROR_TYPE_PAYMENT } from "summit-registration-lite/dist/utils/constants";

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
    const [initialEmailValue, setInitialEmailValue] = useState('');

    useEffect(() => {
        const fragmentParser = new FragmentParser();
        const paramInitialEmailValue = fragmentParser.getParam('email');
        if (paramInitialEmailValue) {
            setInitialEmailValue(paramInitialEmailValue);
        }
    }, []);

    useEffect(() => {
        if (!availableThirdPartyProviders.length) getThirdPartyProviders();
    }, [availableThirdPartyProviders]);

    const getBackURL = () => {
        return URI.encode('/register');
    };

    const onClickLogin = (provider) => {
        doLogin(getBackURL(), provider, null, null, null, getEnvVariable(TENANT_ID));
    };

    const handleCompanyError = () => {
        console.log("company error...")
        Swal.fire("ERROR", "Hold on. Your session expired!.", "error").then(() => {
            window.localStorage.setItem("post_logout_redirect_path", new URI(window.location.href).pathname());
            doLogout();
        });
    };

    const getPasswordlessCode = (email) => {
        const params = {
            connection: "email",
            send: "code",
            redirect_uri: `${window.location.origin}/auth/callback`,
            email,
        };
        return passwordlessStart(params);
    };

    const loginPasswordless = (code, email) => {
        const params = {
            connection: "email",
            otp: code,
            email
        };
        return setPasswordlessLogin(params);
    };

    const handleOnError = (e) => {
        const { type, msg } = e;
        let icon = 'error';
        let title = 'ERROR';
        switch (type) {
            case ERROR_TYPE_ERROR:
                icon = 'error';
                title = 'Error';
                break;
            case ERROR_TYPE_VALIDATION:
                icon = 'warning';
                title = 'Warning';
                break;
            case ERROR_TYPE_PAYMENT:
                title = 'Payment Error';
                icon = 'warning';
                break;
            default:
                icon = 'error';
                title = 'Error';
                break;
        }
        Swal.fire(title, msg, icon);
    };

    const { getSettingByKey } = useMarketingSettings();

    const inPersonDisclaimer = getSettingByKey(MARKETING_SETTINGS_KEYS.registrationInPersonDisclaimer);
    const allowPromoCodes = !!Number(getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteAllowPromoCodes));
    const companyDDLPlaceholder = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteCompanyDDLPlaceholder);
    const showCompanyInputDefaultOptions = !!Number(getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteShowCompanyInputDefaultOptions));
    const showCompanyInput = !!Number(getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteShowCompanyInput));
    const initialOrderComplete1stParagraph = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteInitialOrderComplete1stParagraph);
    const initialOrderComplete2ndParagraph = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteInitialOrderComplete2ndParagraph);
    const initialOrderCompleteButton = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteInitialOrderCompleteButton);
    const orderCompleteTitle = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteOrderCompleteTitle);
    const orderComplete1stParagraph = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteOrderComplete1stParagraph);
    const orderComplete2ndParagraph = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteOrderComplete2ndParagraph);
    const orderCompleteButton = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteOrderCompleteButton);
    const noAllowedTicketsMessage = getSettingByKey(MARKETING_SETTINGS_KEYS.regLiteNoAllowedTicketsMessage);

    const siteSettings = useSiteSettings();
    const paymentSettings = usePaymentSettings();

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
                    <RegistrationForm
                        apiBaseUrl={getEnvVariable(SUMMIT_API_BASE_URL)}
                        clientId={getEnvVariable(OAUTH2_CLIENT_ID)}
                        summitData={summit}
                        profileData={idpProfile}
                        marketingData={colorSettings}
                        loginOptions={validateIdentityProviderButtons(siteSettings?.identityProviderButtons, availableThirdPartyProviders)}
                        loading={loadingProfile || loadingIDP}
                        ticketOwned={userProfile?.summit_tickets?.length > 0}
                        hasVirtualAccessLevel={userHasAccessLevel(userProfile?.summit_tickets, VIRTUAL_ACCESS_LEVEL)}
                        ownedTickets={attendee?.ticket_types || []}
                        authUser={(provider) => onClickLogin(provider)}
                        getPasswordlessCode={getPasswordlessCode}
                        loginWithCode={(code, email) => loginPasswordless(code, email).then(() => navigate("/register"))}
                        getAccessToken={getAccessTokenSafely}
                        closeWidget={() => navigate("/")}
                        goToExtraQuestions={(attendeeId) => {
                            navigate(`/a/extra-questions${attendeeId ? `/#attendee=${attendeeId}` : ''}`);
                        }}
                        goToEvent={() => navigate("/a/")}
                        goToMyOrders={() => navigate("/a/my-tickets")}
                        onPurchaseComplete={(order) => {
                            setUserOrder(order).then(() => checkOrderData(order));
                        }}
                        completedExtraQuestions={async (attendee) => {
                            if (!attendee) return true;
                            await getExtraQuestions(attendee?.id);
                            return checkRequireExtraQuestionsByAttendee(attendee);
                        }}
                        trackEvent={triggerTagManagerTrackEvent}
                        inPersonDisclaimer={inPersonDisclaimer}
                        handleCompanyError={() => handleCompanyError}
                        allowsNativeAuth={allowsNativeAuth}
                        allowsOtpAuth={allowsOtpAuth}
                        providerOptions={{
                            fonts: [{ cssSrc: withPrefix("/fonts/fonts.css") }],
                            style: { base: { fontFamily: `"Nunito Sans", sans-serif`, fontWeight: 300 } }
                        }}
                        loginInitialEmailInputValue={initialEmailValue}
                        authErrorCallback={(error) => {
                            const fragment = window?.location?.hash;
                            return navigate("/auth/logout", {
                                state: {
                                    backUrl: "/register" + fragment
                                }
                            });
                        }}
                        allowPromoCodes={allowPromoCodes}
                        companyDDLPlaceholder={companyDDLPlaceholder}
                        supportEmail={summit.support_email || getEnvVariable(SUPPORT_EMAIL)}
                        initialOrderComplete1stParagraph={initialOrderComplete1stParagraph}
                        initialOrderComplete2ndParagraph={initialOrderComplete2ndParagraph}
                        initialOrderCompleteButton={initialOrderCompleteButton}
                        orderCompleteTitle={orderCompleteTitle}
                        orderComplete1stParagraph={orderComplete1stParagraph}
                        orderComplete2ndParagraph={orderComplete2ndParagraph}
                        orderCompleteButton={orderCompleteButton}
                        noAllowedTicketsMessage={noAllowedTicketsMessage}
                        showCompanyInput={showCompanyInput}
                        showCompanyInputDefaultOptions={showCompanyInputDefaultOptions}
                        idpLogoLight={siteSettings?.idpLogo?.idpLogoLight?.publicURL}
                        idpLogoDark={siteSettings?.idpLogo?.idpLogoDark?.publicURL}
                        idpLogoAlt={siteSettings?.idpLogo?.idpLogoAlt}
                        hidePostalCode={paymentSettings?.hidePostalCode}
                        successfulPaymentReturnUrl={`${window.location.origin}/a/my-tickets/`}
                        onError={handleOnError}
                    />
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
