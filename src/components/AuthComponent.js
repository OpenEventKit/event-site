import React, { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
import { connect } from "react-redux";
import URI from "urijs";

import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";
import { doLogin, passwordlessStart } from "openstack-uicore-foundation/lib/security/methods";
import { setPasswordlessLogin, setUserOrder, checkOrderData } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";

// these two libraries are client-side only
import LoginComponent from "summit-registration-lite/dist/components/login";
import PasswordlessLoginComponent from "summit-registration-lite/dist/components/login-passwordless";
import "summit-registration-lite/dist/components/login.css";
import "summit-registration-lite/dist/components/login-passwordless.css";
import IconButton from "./IconButton";
import Link from "./Link";

import { getDefaultLocation, validateIdentityProviderButtons } from "@utils/loginUtils";
import { userHasAccessLevel, VIRTUAL_ACCESS_LEVEL } from "@utils/authorizedGroups";
import useSiteSettings from "@utils/useSiteSettings";
import { PHASES } from "@utils/phasesUtils";
import { getEnvVariable, TENANT_ID } from "@utils/envVariables";

import styles from "../styles/auth-component.module.scss";

const AuthComponent = ({
    getThirdPartyProviders,
    availableThirdPartyProviders,
    setPasswordlessLogin,
    summit,
    marketingPageSettings,
    allowsNativeAuth,
    allowsOtpAuth,
    isLoggedUser,
    summitPhase,
    userProfile,
    eventRedirect,
    location,
    ignoreAutoOpen,
    style = {},
    renderLoginButton = null,
    renderEnterButton = null
}) => {
    const [isActive, setIsActive] = useState(false);
    const [initialEmailValue, setInitialEmailValue] = useState('');
    const [otpLogin, setOtpLogin] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [otpLength, setOtpLength] = useState(null);
    const [otpLifeTime, setOtpLifeTime] = useState(null);
    const [otpError, setOtpError] = useState(false);

    const hasVirtualBadge = useMemo(() =>
        userProfile ? userHasAccessLevel(userProfile.summit_tickets, VIRTUAL_ACCESS_LEVEL) : false
        , [userProfile]);
    const defaultPath = getDefaultLocation(eventRedirect, hasVirtualBadge);

    useEffect(() => {
        const fragmentParser = new FragmentParser();
        if(!ignoreAutoOpen) {
            // to show the login dialog check if we are already logged or not
            setIsActive(fragmentParser.getParam('login') && !isLoggedUser);
        }
        const paramInitialEmailValue = fragmentParser.getParam('email');
        if (paramInitialEmailValue)
            setInitialEmailValue(paramInitialEmailValue);
    }, []);

    useEffect(() => {
        if (!availableThirdPartyProviders.length) getThirdPartyProviders();
    }, [availableThirdPartyProviders]);

    const getBackURL = (encode = true) => {
        let backUrl = location.state?.backUrl
            ? location.state.backUrl
            : '/';
        const fragmentParser = new FragmentParser();
        const paramBackUrl = fragmentParser.getParam('backurl');
        if (paramBackUrl)
            backUrl = paramBackUrl;
        return encode ? URI.encode(backUrl) : backUrl;
    };

    const onClickLogin = (provider) => {
        doLogin(getBackURL(), provider, null, initialEmailValue || null, null, getEnvVariable(TENANT_ID));
    };

    const handleClosePopup = () => {
        setIsActive(false);
        setOtpLogin(false);
        setOtpError(false);
    }

    const handleOpenPopup = () => {
        setIsActive(true);
        setOtpLogin(false);
        setOtpError(false);
    }

    const handleEnterEvent = () => {
        navigate(defaultPath);
    }

    const getPasswordlessCode = (email) => {
        const backUrl = getBackURL(true)
        const params = {
            connection: "email",
            send: "code",
            redirect_uri: `${window.location.origin}/auth/callback?BackUrl${backUrl}`,
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

        return setPasswordlessLogin(params).then((res) => {
            return res;
        }).catch((e) => {
            console.log(e);
            setOtpError(true);
            return Promise.reject("Invalid OTP");
        })
    };

    const sendCode = (email) => {
        setUserEmail(email);
        setOtpLifeTime(0);
        return getPasswordlessCode(email).then(({ response }) => {
            setOtpLength(response.otp_length);
            setOtpLifeTime(response.otp_lifetime)
            setOtpLogin(true);
        }).catch((err) => {
            const errorMessage = err.response?.body?.error || err.message;
            return Promise.reject(new Error(errorMessage));
        })
    }

    const siteSettings = useSiteSettings();

    const loginComponentProps = {
        loginOptions: validateIdentityProviderButtons(siteSettings?.identityProviderButtons, availableThirdPartyProviders),
        login: (provider) => onClickLogin(provider),
        getLoginCode: (email) => sendCode(email),
        allowsNativeAuth: allowsNativeAuth,
        allowsOtpAuth: allowsOtpAuth,
        initialEmailValue: initialEmailValue,
        title: 'Sign in using the email associated with your account:',
        summitData: summit,
    };

    const passwordlessLoginProps = {
        email: userEmail,
        codeLength: otpLength,
        codeLifeTime: otpLifeTime,
        passwordlessLogin: (code) => loginPasswordless(code, userEmail).then(() => {
            // close popup and then navigate bc its its the same origin page
            // it would not reload and closed the popup automatically
            handleClosePopup();
            navigate(getBackURL(false))
        }).catch((e) => console.log(e)),
        codeError: otpError,
        goToLogin: () => setOtpLogin(false),
        getLoginCode: (email) => sendCode(email),
        idpLogoLight: siteSettings?.idpLogo?.idpLogoLight?.publicURL,
        idpLogoDark: siteSettings?.idpLogo?.idpLogoDark?.publicURL,
        idpLogoAlt: siteSettings?.idpLogo?.idpLogoAlt
    }

    const { loginButton } = marketingPageSettings.hero.buttons;

    const defaultLoginButton = () => (
        <IconButton
            iconClass="fa fa-2x fa-edit"
            buttonText={loginButton.text}
            onClick={handleOpenPopup}
        />
    );

    const defaultEnterButton = () => (
        <Link
            to={defaultPath}
        >
            <IconButton
                iconClass="fa fa-2x fa-sign-in"
                buttonText="Enter"
            />
        </Link>
    );

    // Determine if we should show any button
    const showLoginButton = !isLoggedUser;
    const showEnterButton = isLoggedUser && summitPhase >= PHASES.DURING && hasVirtualBadge;

    // Don't render wrapper if no button to show and modal not active
    if (!showLoginButton && !showEnterButton && !isActive) {
        return null;
    }

    return (
        <div style={style} className={styles.authComponent}>
            {showLoginButton ?
                renderLoginButton ? renderLoginButton(handleOpenPopup) : defaultLoginButton()
                :
                showEnterButton ?
                    renderEnterButton ? renderEnterButton(handleEnterEvent) : defaultEnterButton()
                    :
                    null
            }
            {isActive &&
                <div id={`${styles.modal}`} className="modal is-active">
                    <div className="modal-background"></div>
                    <div className={`${styles.modalContent} modal-content`}>
                        <div className={`${styles.outerWrapper} summit-registration-lite`}>
                            <div className={styles.innerWrapper}>
                                <div className={styles.title}>
                                    <span>{summit.name}</span>
                                    <i className="fa fa-close" aria-label="close" onClick={handleClosePopup}></i>
                                </div>
                                {!otpLogin && <LoginComponent {...loginComponentProps} />}
                                {otpLogin && <PasswordlessLoginComponent {...passwordlessLoginProps} />}
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    )
};

const mapStateToProps = ({ userState, summitState, settingState, clockState, loggedUserState }) => {
    return ({
        loadingProfile: userState.loading,
        loadingIDP: userState.loadingIDP,
        availableThirdPartyProviders: summitState.third_party_providers,
        allowsNativeAuth: summitState.allows_native_auth,
        allowsOtpAuth: summitState.allows_otp_auth,
        summit: summitState.summit,
        colorSettings: settingState.colorSettings,
        userProfile: userState.userProfile,
        marketingPageSettings: settingState.marketingPageSettings,
        summitPhase: clockState.summit_phase,
        isLoggedUser: loggedUserState.isLoggedUser,
        // TODO: move to site settings i/o marketing page settings
        eventRedirect: settingState.marketingPageSettings.eventRedirect
    })
};

export default connect(mapStateToProps, {
    getThirdPartyProviders,
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData
})(AuthComponent)

AuthComponent.defaultProps = {
    ignoreAutoOpen: false,
}

AuthComponent.propTypes = {
    location: PropTypes.object.isRequired,
    ignoreAutoOpen: PropTypes.bool,
}
