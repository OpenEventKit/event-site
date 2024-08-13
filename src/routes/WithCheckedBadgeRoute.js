import React, {useEffect, useState, useMemo} from "react";
import {connect} from "react-redux";
import {navigate} from "gatsby";
import { userHasCheckedInBadge } from "../utils/authorizedGroups";

/**
 *
 * @param children
 * @param isLoggedIn
 * @param location
 * @param userProfile
 * @returns {JSX.Element|null|*}
 * @constructor
 */
const WithCheckedBadge = ({
   children,
   isLoggedIn,
   location,
   userProfile
}) => {

    const hasCheckedInBadge = userHasCheckedInBadge(userProfile.summit_tickets);

    if (!isLoggedIn) {
        navigate("/", {state: {backUrl: `${location.pathname}`,},});
        return null;
    }        

    // has no checked badge -> redirect
    if (!hasCheckedInBadge) {
        navigate("/", {state: {backUrl: `${location.pathname}`,},});
    }

    return children;
};

const mapStateToProps = ({userState}) => ({
    userProfile: userState.userProfile
});

export default connect(mapStateToProps, {})(WithCheckedBadge);
