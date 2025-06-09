import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as Sentry from "@sentry/react";
import { navigate, withPrefix } from "gatsby";
import { connect } from "react-redux";
import URI from "urijs";
import Swal from "sweetalert2";
import {ERROR_TYPE_ERROR, ERROR_TYPE_VALIDATION, ERROR_TYPE_PAYMENT} from "summit-registration-lite/dist/utils/constants";
import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";
import { doLogin, passwordlessStart, getAccessToken } from "openstack-uicore-foundation/lib/security/methods"
import { doLogout } from "openstack-uicore-foundation/lib/security/actions"
import { getUserProfile, setPasswordlessLogin, setUserOrder, checkOrderData } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";
import { checkRequireExtraQuestionsByAttendee } from "../actions/user-actions";
import { getExtraQuestions } from "../actions/summit-actions";

import IconButton from "./IconButton";
import iconButtonStyles from "./IconButton/styles.module.scss";

import { SentryFallbackFunction } from "./SentryErrorComponent";
// these two libraries are client-side only
import RegistrationLiteWidget from "summit-registration-lite/dist";
import "summit-registration-lite/dist/index.css";
import useSiteSettings from "@utils/useSiteSettings";
import usePaymentSettings from "@utils/usePaymentSettings";
import useMarketingSettings, { MARKETING_SETTINGS_KEYS }  from "@utils/useMarketingSettings";
import { getEnvVariable, SUMMIT_API_BASE_URL, OAUTH2_CLIENT_ID, REGISTRATION_BASE_URL, SUPPORT_EMAIL } from "@utils/envVariables";
import { userHasAccessLevel, VIRTUAL_ACCESS_LEVEL } from "@utils/authorizedGroups";
import { validateIdentityProviderButtons } from "@utils/loginUtils";
import { triggerTagManagerTrackEvent } from "@utils/eventTriggers";

const RegistrationLiteComponent = ({
   registrationProfile,
   userProfile,
   attendee,
   getThirdPartyProviders,
   availableThirdPartyProviders,
   getUserProfile,
   setPasswordlessLogin,
   setUserOrder,
   checkOrderData,
   loadingProfile,
   loadingIDP,
   summit,
   colorSettings,
   marketingPageSettings,
   allowsNativeAuth,
   allowsOtpAuth,
   checkRequireExtraQuestionsByAttendee,
   getExtraQuestions,
   children,
   ignoreAutoOpen
}) => {
    const [isActive, setIsActive] = useState(false);
    const [initialEmailValue, setInitialEmailValue] = useState("");

    useEffect(() => {
        const fragmentParser = new FragmentParser();
        if(!ignoreAutoOpen) {
            setIsActive(fragmentParser.getParam("registration"));
        }
        const paramInitialEmailValue = fragmentParser.getParam("email");
        if (paramInitialEmailValue)
            setInitialEmailValue(paramInitialEmailValue);
    }, []);

    useEffect(() => {
        if (!availableThirdPartyProviders.length) getThirdPartyProviders();
    }, [availableThirdPartyProviders]);

    const getBackURL = () => {
        let backUrl = "/#registration=1";
        return URI.encode(backUrl);
    };

    const handleOpenPopup = () => {
        const { registerButton } = marketingPageSettings.hero.buttons;
        if(registerButton?.externalRegistrationLink){
            window.location = registerButton.externalRegistrationLink;
            return;
        }
        setIsActive(true);
    }

    const onClickLogin = (provider) => {
        doLogin(getBackURL(), provider);
    };

    const handleCompanyError = () => {
        console.log("company error...")
        Swal.fire("ERROR", "Hold on. Your session expired!.", "error").then(() => {
            // save current location and summit slug, for further redirect logic
            window.localStorage.setItem("post_logout_redirect_path", new URI(window.location.href).pathname());
            doLogout();
        });
    }

    const getPasswordlessCode = (email) => {
        const params = {
            connection: "email",
            send: "code",
            redirect_uri: `${window.location.origin}/auth/callback`,
            email,
        };

        return passwordlessStart(params)
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
        // this is a basic implementation using swal
        const {type, msg, exception} = e;
        let icon = 'error';
        let title = 'ERROR';
        switch(type){
            case ERROR_TYPE_ERROR:
                icon = 'error';
                title = 'Error';
                break
            case ERROR_TYPE_VALIDATION:
                icon = 'warning';
                title = 'Warning'
                break;
            case ERROR_TYPE_PAYMENT:
                title = 'Payment Error'
                icon = 'warning';
                break;
            default:
                icon = 'error';
                title = 'Error';
                break;
        }
        Swal.fire(title, msg, icon)
    }

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

    const widgetProps = {
        apiBaseUrl: getEnvVariable(SUMMIT_API_BASE_URL),
        clientId: getEnvVariable(OAUTH2_CLIENT_ID),
        summitData: summit,
        profileData: registrationProfile,
        marketingData: colorSettings,
        loginOptions: validateIdentityProviderButtons(siteSettings?.identityProviderButtons, availableThirdPartyProviders),
        loading: loadingProfile || loadingIDP,
        // only show info if its not a recent purchase
        ticketOwned: userProfile?.summit_tickets?.length > 0,
        hasVIRTUAL_ACCESS_LEVEL: userHasAccessLevel(userProfile?.summit_tickets, VIRTUAL_ACCESS_LEVEL),
        ownedTickets: attendee?.ticket_types || [],
        authUser: (provider) => onClickLogin(provider),
        getPasswordlessCode: getPasswordlessCode,
        loginWithCode:  (code, email) =>  loginPasswordless(code, email).then( () =>  navigate("/#registration=1")),
        getAccessToken: getAccessToken,
        closeWidget:  () => {
            // reload user profile
            getUserProfile().catch((e) => console.log("getUserProfile error. Not logged in?"));
            setIsActive(false);
        },
        goToExtraQuestions: (attendeeId) => {
            navigate(`/a/extra-questions${attendeeId ? `/#attendee=${attendeeId}` : ''}`);
        },
        goToEvent: () => navigate("/a/"),
        goToRegistration: () => navigate(`${getEnvVariable(REGISTRATION_BASE_URL)}/a/${summit.slug}`),
        goToMyOrders: () => navigate("/a/my-tickets"),
        completedExtraQuestions: async (attendee) => {
            if (!attendee) return true;
            await getExtraQuestions(attendee?.id);
            return checkRequireExtraQuestionsByAttendee(attendee);
        },
        onPurchaseComplete: (order) => {
            // check if it"s necessary to update profile
            setUserOrder(order).then(()=> checkOrderData(order));
        },
        trackEvent: triggerTagManagerTrackEvent,
        inPersonDisclaimer: inPersonDisclaimer,
        handleCompanyError: () => handleCompanyError,
        allowsNativeAuth: allowsNativeAuth,
        allowsOtpAuth: allowsOtpAuth,
        providerOptions: {
            fonts: [{ cssSrc: withPrefix("/fonts/fonts.css") }],
            style: { base: { fontFamily: `"Nunito Sans", sans-serif`, fontWeight: 300 } }
        },
        loginInitialEmailInputValue: initialEmailValue,
        authErrorCallback: (error) => {
            // we have an auth Error, perform logout
            const fragment = window?.location?.hash;
            return navigate("/auth/logout", {
                state: {
                    backUrl: "/" + fragment
                }
            });
        },
        allowPromoCodes: allowPromoCodes,
        companyDDLPlaceholder: companyDDLPlaceholder,
        supportEmail: summit.support_email || getEnvVariable(SUPPORT_EMAIL),
        initialOrderComplete1stParagraph: initialOrderComplete1stParagraph,
        initialOrderComplete2ndParagraph: initialOrderComplete2ndParagraph,
        initialOrderCompleteButton: initialOrderCompleteButton,
        orderCompleteTitle: orderCompleteTitle,
        orderComplete1stParagraph: orderComplete1stParagraph,
        orderComplete2ndParagraph: orderComplete2ndParagraph,
        orderCompleteButton: orderCompleteButton,
        noAllowedTicketsMessage: noAllowedTicketsMessage,
        showCompanyInput: showCompanyInput,
        showCompanyInputDefaultOptions: showCompanyInputDefaultOptions,
        idpLogoLight: siteSettings?.idpLogo?.idpLogoLight?.publicURL,
        idpLogoDark: siteSettings?.idpLogo?.idpLogoDark?.publicURL,
        idpLogoAlt: siteSettings?.idpLogo?.idpLogoAlt,
        hidePostalCode: paymentSettings?.hidePostalCode,
        successfulPaymentReturnUrl: `${window.location.origin}/a/my-tickets/`,
        onError: handleOnError,
    };

    const { registerButton } = marketingPageSettings.hero.buttons;

    return (
        <>
            {children ?
                React.cloneElement(children, { onClick: handleOpenPopup })
                :
                registerButton.display &&
                <IconButton
                    className={iconButtonStyles.register}
                    iconClass="fa fa-2x fa-edit"
                    buttonText={registerButton.text}
                    onClick={handleOpenPopup}
                    disabled={isActive}
                />
            }
            <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: "Registration Lite"})}>
                {isActive && <RegistrationLiteWidget {...widgetProps} />}
            </Sentry.ErrorBoundary>
        </>
    )
};

RegistrationLiteComponent.defaultProps = {
    ignoreAutoOpen: false,
};

RegistrationLiteComponent.propTypes = {
    ignoreAutoOpen: PropTypes.bool,
};

const mapStateToProps = ({userState, summitState, settingState}) => ({
    registrationProfile: userState.idpProfile,
    userProfile: userState.userProfile,
    attendee: userState.attendee,
    loadingProfile: userState.loading,
    loadingIDP: userState.loadingIDP,
    availableThirdPartyProviders: summitState.third_party_providers,
    allowsNativeAuth: summitState.allows_native_auth,
    allowsOtpAuth: summitState.allows_otp_auth,
    summit: summitState.summit,
    colorSettings: settingState.colorSettings,
    marketingPageSettings: settingState.marketingPageSettings
});

export default connect(mapStateToProps, {
    getThirdPartyProviders,
    getUserProfile,
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData,
    checkRequireExtraQuestionsByAttendee,
    getExtraQuestions,
})(RegistrationLiteComponent);
