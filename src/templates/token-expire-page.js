import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import URI from "urijs"
import { doLogin } from "openstack-uicore-foundation/lib/security/methods";
import { handleResetReducers } from "../actions/event-actions";
import Interstitial from "../components/Interstitial";
import { userHasAccessLevel, VIRTUAL_ACCESS_LEVEL } from "@utils/authorizedGroups";
import { getDefaultLocation } from "@utils/loginUtils";

export const TokenExpirePageTemplate = class extends React.Component {

  componentDidMount() {

    const { location, handleResetReducers, eventRedirect, userProfile } = this.props;

    if (window.authExpired === undefined) {
      window.authExpired = true

      // we store this calculation to use it later
      const hasVirtualBadge =
              userProfile ? userHasAccessLevel(userProfile.summit_tickets, VIRTUAL_ACCESS_LEVEL) : false;

      let defaultPath = getDefaultLocation(eventRedirect, hasVirtualBadge);
      let previousLocation = location.state?.backUrl && location.state.backUrl !== "/auth/expired" ? location.state.backUrl : defaultPath;
      let backUrl = URI.encode(previousLocation);

      setTimeout(() => {
        handleResetReducers();
        doLogin(backUrl);
      }, 1500);
    }
  }

  render() {
    return (
      <Interstitial title="Checking credentials..." />
    )
  }
}

TokenExpirePageTemplate.propTypes = {
  loggedUser: PropTypes.object,
  location: PropTypes.object,
  handleResetReducers: PropTypes.func
}

const TokenExpirePage = ({ loggedUser, location, handleResetReducers, userProfile, eventRedirect }) => {

  return (
    <TokenExpirePageTemplate
      loggedUser={loggedUser}
      location={location}
      handleResetReducers={handleResetReducers}
      eventRedirect={eventRedirect}
      userProfile={userProfile}
    />
  )

}

TokenExpirePage.propTypes = {
  loggedUser: PropTypes.object,
  location: PropTypes.object,
  handleResetReducers: PropTypes.func
}

const mapStateToProps = ({ loggedUserState, settingState, userState  }) => ({
  loggedUser: loggedUserState,
  // TODO: move to site settings i/o marketing page settings
  eventRedirect: settingState.marketingPageSettings.eventRedirect,
  userProfile: userState.userProfile
})

export default connect(mapStateToProps, { handleResetReducers })(TokenExpirePage);
