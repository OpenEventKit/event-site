import { useEffect, useState } from "react";
import { navigate, withPrefix } from "gatsby";
import URI from "urijs";
import { StyledSwal as Swal } from "@utils/alerts";
import { ERROR_TYPE_ERROR, ERROR_TYPE_VALIDATION, ERROR_TYPE_PAYMENT } from "summit-registration-lite/dist/utils/constants";

import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";
import { doLogin, passwordlessStart } from "openstack-uicore-foundation/lib/security/methods";
import { doLogout } from "openstack-uicore-foundation/lib/security/actions";

import useSiteSettings from "@utils/useSiteSettings";
import usePaymentSettings from "@utils/usePaymentSettings";
import useMarketingSettings, { MARKETING_SETTINGS_KEYS } from "@utils/useMarketingSettings";
import { getEnvVariable, SUMMIT_API_BASE_URL, OAUTH2_CLIENT_ID, SUPPORT_EMAIL, TENANT_ID } from "@utils/envVariables";
import { userHasAccessLevel, VIRTUAL_ACCESS_LEVEL } from "@utils/authorizedGroups";
import { validateIdentityProviderButtons, getAccessTokenSafely } from "@utils/loginUtils";
import { triggerTagManagerTrackEvent } from "@utils/eventTriggers";

const useRegistrationWidgetProps = ({
    // Redux state (from connect)
    summit,
    userProfile,
    idpProfile,
    attendee,
    colorSettings,
    loadingProfile,
    loadingIDP,
    availableThirdPartyProviders,
    allowsNativeAuth,
    allowsOtpAuth,
    // Redux actions (from connect)
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData,
    getUserProfile,
    getThirdPartyProviders,
    getExtraQuestions,
    checkRequireExtraQuestionsByAttendee,
    // Mode-specific
    backUrl,
    closeWidget,
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

    const onClickLogin = (provider) => {
        doLogin(URI.encode(backUrl), provider, null, null, null, getEnvVariable(TENANT_ID));
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

    return {
        apiBaseUrl: getEnvVariable(SUMMIT_API_BASE_URL),
        clientId: getEnvVariable(OAUTH2_CLIENT_ID),
        summitData: summit,
        profileData: idpProfile,
        marketingData: colorSettings,
        loginOptions: validateIdentityProviderButtons(siteSettings?.identityProviderButtons, availableThirdPartyProviders),
        loading: loadingProfile || loadingIDP,
        ticketOwned: userProfile?.summit_tickets?.length > 0,
        hasVirtualAccessLevel: userHasAccessLevel(userProfile?.summit_tickets, VIRTUAL_ACCESS_LEVEL),
        ownedTickets: attendee?.ticket_types || [],
        authUser: (provider) => onClickLogin(provider),
        getPasswordlessCode,
        loginWithCode: (code, email) => loginPasswordless(code, email).then(() => navigate(backUrl)),
        getAccessToken: getAccessTokenSafely,
        closeWidget,
        goToExtraQuestions: (attendeeId) => {
            navigate(`/a/extra-questions${attendeeId ? `/#attendee=${attendeeId}` : ''}`);
        },
        goToEvent: () => navigate("/a/"),
        goToMyOrders: () => navigate("/a/my-tickets"),
        onPurchaseComplete: (order) => {
            setUserOrder(order)
                .then(() => checkOrderData(order))
                .then(() => getUserProfile())
                .catch((e) => console.log("getUserProfile error"));
        },
        completedExtraQuestions: async (attendee) => {
            if (!attendee) return true;
            await getExtraQuestions(attendee?.id);
            return checkRequireExtraQuestionsByAttendee(attendee);
        },
        trackEvent: triggerTagManagerTrackEvent,
        inPersonDisclaimer,
        handleCompanyError: () => handleCompanyError,
        allowsNativeAuth,
        allowsOtpAuth,
        providerOptions: {
            fonts: [{ cssSrc: withPrefix("/fonts/fonts.css") }],
            style: { base: { fontFamily: `"Nunito Sans", sans-serif`, fontWeight: 300 } }
        },
        loginInitialEmailInputValue: initialEmailValue,
        authErrorCallback: (error) => {
            const fragment = window?.location?.hash;
            return navigate("/auth/logout", {
                state: {
                    backUrl: backUrl + (fragment || '')
                }
            });
        },
        allowPromoCodes,
        companyDDLPlaceholder,
        supportEmail: summit?.support_email || getEnvVariable(SUPPORT_EMAIL),
        initialOrderComplete1stParagraph,
        initialOrderComplete2ndParagraph,
        initialOrderCompleteButton,
        orderCompleteTitle,
        orderComplete1stParagraph,
        orderComplete2ndParagraph,
        orderCompleteButton,
        noAllowedTicketsMessage,
        showCompanyInput,
        showCompanyInputDefaultOptions,
        idpLogoLight: siteSettings?.idpLogo?.idpLogoLight?.publicURL,
        idpLogoDark: siteSettings?.idpLogo?.idpLogoDark?.publicURL,
        idpLogoAlt: siteSettings?.idpLogo?.idpLogoAlt,
        hidePostalCode: paymentSettings?.hidePostalCode,
        successfulPaymentReturnUrl: `${typeof window !== 'undefined' ? window.location.origin : ''}/a/my-tickets/`,
        onError: handleOnError,
    };
};

export default useRegistrationWidgetProps;
