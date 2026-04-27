import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import * as Sentry from "@sentry/react";
import { connect } from "react-redux";

import FragmentParser from "openstack-uicore-foundation/lib/utils/fragment-parser";

import { getUserProfile, setPasswordlessLogin, setUserOrder, checkOrderData, checkRequireExtraQuestionsByAttendee } from "../actions/user-actions";
import { getThirdPartyProviders } from "../actions/base-actions";
import { getExtraQuestions } from "../actions/summit-actions";

import IconButton from "./IconButton";
import iconButtonStyles from "./IconButton/styles.module.scss";
import { SentryFallbackFunction } from "./SentryErrorComponent";

import RegistrationModal from "summit-registration-lite/dist/components/registration-modal";
import "summit-registration-lite/dist/components/registration-modal.css";

import useRegistrationWidgetProps from "@utils/useRegistrationWidgetProps";

const RegistrationModalComponent = ({
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
    marketingPageSettings,
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData,
    getUserProfile,
    getThirdPartyProviders,
    getExtraQuestions,
    checkRequireExtraQuestionsByAttendee,
    children,
    ignoreAutoOpen
}) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const fragmentParser = new FragmentParser();
        if (!ignoreAutoOpen && fragmentParser.getParam("registration")) {
            setIsOpen(true);
        }
    }, [ignoreAutoOpen]);

    const handleOpenPopup = () => {
        setIsOpen(true);
    };

    const handleClosePopup = () => {
        setIsOpen(false);
    };

    const widgetProps = useRegistrationWidgetProps({
        summit, userProfile, idpProfile, attendee, colorSettings,
        loadingProfile, loadingIDP, availableThirdPartyProviders,
        allowsNativeAuth, allowsOtpAuth,
        setPasswordlessLogin, setUserOrder, checkOrderData,
        getUserProfile, getThirdPartyProviders, getExtraQuestions,
        checkRequireExtraQuestionsByAttendee,
        backUrl: '/#registration=1',
        closeWidget: handleClosePopup,
    });

    const { registerButton } = marketingPageSettings.hero.buttons;

    if (!summit) return null;

    return (
        <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: "Registration Modal"})}>
            {children ?
                React.cloneElement(children, { onClick: handleOpenPopup })
                :
                registerButton.display &&
                <IconButton
                    className={iconButtonStyles.register}
                    iconClass="fa fa-2x fa-edit"
                    buttonText={registerButton.text}
                    onClick={handleOpenPopup}
                    disabled={isOpen}
                />
            }
            {isOpen && <RegistrationModal {...widgetProps} />}
        </Sentry.ErrorBoundary>
    );
};

RegistrationModalComponent.defaultProps = {
    ignoreAutoOpen: false,
};

RegistrationModalComponent.propTypes = {
    ignoreAutoOpen: PropTypes.bool,
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
    marketingPageSettings: settingState.marketingPageSettings
});

export default connect(mapStateToProps, {
    setPasswordlessLogin,
    setUserOrder,
    checkOrderData,
    getUserProfile,
    getThirdPartyProviders,
    getExtraQuestions,
    checkRequireExtraQuestionsByAttendee
})(RegistrationModalComponent);
