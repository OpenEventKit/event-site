import React from "react";
import { connect } from "react-redux";
import Interstitial from "../components/Interstitial";

const WithTicketRoute = ({ children, location, userProfile, hasTicket, isAuthorized }) => {
  const userIsAuthz = hasTicket || isAuthorized;

  const getTitle = () => {
    if (!userIsAuthz)
      return "Sorry. You don't have a ticket for this event.";
    if (!userProfile)
      return "Sorry. You are not authorized to view this session.";
  };

  if (!userIsAuthz || !userProfile) {
    return <Interstitial title={getTitle()} navigateTo={location.state?.previousUrl || "/"} />;
  }

  return children;
};

const mapStateToProps = ({ userState }) => ({
  userProfile: userState.userProfile,
  hasTicket: userState.hasTicket,
  isAuthorized: userState.isAuthorized
});

export default connect(mapStateToProps)(WithTicketRoute);
