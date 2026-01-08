import React from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
import { connect } from "react-redux";

import IconButton from "./IconButton";
import iconButtonStyles from "./IconButton/styles.module.scss";

/**
 * RegisterButton - Button that navigates to /register page
 *
 * This component provides a registration button that:
 * - Checks for external registration links and redirects if configured
 * - Otherwise navigates to the internal /register page
 * - Can wrap custom children elements with onClick handler
 */
const RegisterButton = ({
   marketingPageSettings,
   children,
}) => {
    const handleClick = () => {
        const { registerButton } = marketingPageSettings.hero.buttons;
        if (registerButton?.externalRegistrationLink) {
            window.location = registerButton.externalRegistrationLink;
            return;
        }
        // Navigate to dedicated registration page
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
