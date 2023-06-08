import React, { useEffect, useState, useMemo } from "react"
import { navigate } from "gatsby"
import { connect } from "react-redux";
import URI from "urijs"
// these two libraries are client-side only
import LoginComponent from 'summit-registration-lite/dist/components/login';
import PasswordlessLoginComponent from 'summit-registration-lite/dist/components/login-passwordless';
import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";
import { doLogin, passwordlessStart } from 'openstack-uicore-foundation/lib/security/methods'
import { setPasswordlessLogin, setUserOrder, checkOrderData } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";
import { formatThirdPartyProviders } from "../utils/loginUtils";
import 'summit-registration-lite/dist/index.css';
import styles from '../styles/login-button.module.scss'
import PropTypes from 'prop-types'
import Link from "./Link";

import { PHASES } from "@utils/phasesUtils";
import { getDefaultLocation } from "@utils/loginUtils";
import { userHasAccessLevel, VirtualAccessLevel } from "../utils/authorizedGroups";

const LoginButton = ({
    getThirdPartyProviders,
    thirdPartyProviders,
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
    style = {},
    children = null,
}) => {
    const [isActive, setIsActive] = useState(false);
    const [initialEmailValue, setInitialEmailValue] = useState('');
    const [otpLogin, setOtpLogin] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [otpLength, setOtpLength] = useState(null);
    const [otpError, setOtpError] = useState(false);

    const hasVirtualBadge = useMemo(() =>
        userProfile ? userHasAccessLevel(userProfile.summit_tickets, VirtualAccessLevel) : false
        , [userProfile]);
    const defaultPath = getDefaultLocation(eventRedirect, hasVirtualBadge);

    useEffect(() => {
        const fragmentParser = new FragmentParser();
        setIsActive(fragmentParser.getParam('login'));
        const paramInitialEmailValue = fragmentParser.getParam('email');
        if (paramInitialEmailValue)
            setInitialEmailValue(paramInitialEmailValue);
    }, []);

    useEffect(() => {
        if (!thirdPartyProviders.length) getThirdPartyProviders();
    }, [thirdPartyProviders]);

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
        doLogin(getBackURL(), provider, null, initialEmailValue || null);
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
        getPasswordlessCode(email).then(({ response }) => {
            setOtpLength(response.otp_length);
            setOtpLogin(true);
        });
    }

    const loginComponentProps = {
        loginOptions: formatThirdPartyProviders(thirdPartyProviders),
        login: (provider) => onClickLogin(provider),
        getLoginCode: (email) => sendCode(email),
        allowsNativeAuth: allowsNativeAuth,
        allowsOtpAuth: allowsOtpAuth,
        initialEmailValue: initialEmailValue,
        title: 'Enter your email address to login with a one time code',
    };

    const passwordlessLoginProps = {
        email: userEmail,
        codeLength: otpLength,
        passwordlessLogin: (code) => loginPasswordless(code, userEmail).then(() => navigate(getBackURL(false))).catch((e) => console.log(e)),
        codeError: otpError,
        goToLogin: () => setOtpLogin(false),
        getLoginCode: (email) => sendCode(email),
    }

    const { loginButton } = marketingPageSettings.hero.buttons;

    const renderCustomChildren = (element) => {        
        
        const childrenArray = React.Children.toArray(element);
        const multipleButtons = childrenArray.length > 1;

        // if the component has 2 custom children (login, enter), check to display one or the other
        if (multipleButtons) {
            if (!isLoggedUser) {
                return React.cloneElement(childrenArray[0], { onClick: handleOpenPopup });
            } else if (isLoggedUser) {
                return React.cloneElement(childrenArray[1], { onClick: handleEnterEvent });
            }
        } else {
            // only 1 children element passed, render it always as default
            return React.cloneElement(element, { onClick: handleOpenPopup });
        }
    };

    return (
        <div style={style} className={styles.loginButtonWrapper}>
            {children ?
                renderCustomChildren(children)
                :
                !isLoggedUser ?
                    <button className={`${styles.button} button is-large`} onClick={handleOpenPopup}>
                        <i className={`fa fa-2x fa-edit icon is-large`} />
                        <b>{loginButton.text}</b>
                    </button>
                    :
                (isLoggedUser && summitPhase >= PHASES.DURING && hasVirtualBadge ?
                    <Link className={styles.link} to={defaultPath}>
                        <button className={`${styles.button} button is-large`}>
                            <i className={`fa fa-2x fa-sign-in icon is-large`} />
                            <b>Enter</b>
                        </button>
                    </Link>
                    :
                    null
                )
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
        thirdPartyProviders: summitState.third_party_providers,
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
})(LoginButton)

LoginButton.propTypes = {
    location: PropTypes.object.isRequired,
}
