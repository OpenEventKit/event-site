import React from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
import { connect } from "react-redux";

import IconButton from "./IconButton";
import iconButtonStyles from "./IconButton/styles.module.scss";
import { REGISTRATION_MODE } from "@utils/registrationConstants";
import useSiteSettings from "@utils/useSiteSettings";

const RegisterButton = ({
   marketingPageSettings,
   children,
}) => {
    const siteSettings = useSiteSettings();
    const registration = siteSettings?.registration;
    const mode = registration?.registrationMode || REGISTRATION_MODE.modal;

    const handleClick = () => {
        if (mode === REGISTRATION_MODE.link && registration?.registrationLink) {
            const url = registration.registrationLink;
            const isInternal = /^\/(?!\/)/.test(url);
            if (isInternal) {
                navigate(url);
            } else {
                window.location = url;
            }
            return;
        }
        navigate("/register");
    }

    const { registerButton } = marketingPageSettings.hero.buttons;

    if (children) {
        return React.cloneElement(children, { onClick: handleClick });
    }

    if (!registerButton.display) return null;

    return (
        <IconButton
            className={iconButtonStyles.register}
            iconClass="fa fa-2x fa-edit"
            buttonText={registerButton.text}
            onClick={handleClick}
        />
    );
};

RegisterButton.propTypes = {
    children: PropTypes.node,
};

const mapStateToProps = ({ settingState }) => ({
    marketingPageSettings: settingState.marketingPageSettings
});

export default connect(mapStateToProps)(RegisterButton);
