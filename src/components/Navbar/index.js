import * as React from "react";
import { useMemo } from "react";
import { connect } from "react-redux";
import { navigate } from "gatsby";
import NavbarTemplate from "./template";

import { userHasAccessLevel, VIRTUAL_ACCESS_LEVEL } from "@utils/authorizedGroups";
import { getDefaultLocation } from "@utils/loginUtils";

import { PHASES } from "@utils/phasesUtils";
import { USER_REQUIREMENTS, PAGE_RESTRICTIONS } from "@utils/pageAccessConstants";

import navbarContent from "content/navbar/index.json";

const Navbar = ({
  location,
  summitPhase,
  summit,
  isLoggedUser,
  isAuthorized,
  hasTicket,
  idpProfile,
  userProfile,
  eventRedirect
}) => {

  // we store this calculation to use it later
  const hasVirtualBadge = useMemo(() =>
    userProfile ? userHasAccessLevel(userProfile.summit_tickets, VIRTUAL_ACCESS_LEVEL) : false
  , [userProfile]);

  const hasSummitHallCheckedIn = userProfile ? userHasCheckedInBadge(userProfile.summit_tickets) : false;

  const defaultPath = getDefaultLocation(eventRedirect, hasVirtualBadge);

  const meetsUserRequirement = (userRequirement) => {
    switch (userRequirement) {
      case USER_REQUIREMENTS.none:
        return true;
      case USER_REQUIREMENTS.loggedIn:
        return isLoggedUser || isAuthorized;
      case USER_REQUIREMENTS.hasTicket:
        return hasTicket || isAuthorized;
      default:
        return false;
    }
  };

  const isCustomPage = (path) => {
    return !isMarketingPage(path) &&
           !isShowPage(path) &&
           !isProfilePage(path) &&
           !isMySchedulePage(path) &&
           !isExtraQuestionsPage(path);
  };

  const isMySchedulePage = (path) => path.startsWith("/a/my-schedule");

  const isProfilePage = (path) => path.startsWith("/a/profile");

  const isExtraQuestionsPage = (path) => path.startsWith("/a/extra-questions");

  const isMarketingPage = (path) => path === "/";

  const isLobbyPage = (path) => path === "/a" || path === "/a/";

  const isActivityPage = (path) => path.startsWith("/a/event");

  const isSponsorPage = (path) => path.startsWith("/a/sponsor");

  const isSchedulePage = (path) => path.startsWith("/a/schedule");

  const isShowPage = (path) => isLobbyPage(path) || isActivityPage(path) || isSponsorPage(path) || isSchedulePage(path);

  // we assume that all pages under /a/* requires auth except /a/schedule
  // item.userRequirement allows to mark specific pages that are not under /a/* pattern.
  const showItem = (item) => {
    // check if we have location defined, if so use the path name , else if window is defined use the window.location
    // as a fallback
    const currentPath = location ? location.pathname : (typeof window !== "undefined" ? window.location.pathname : "");

    const passPageRestriction = !item.pageRestriction ||
        item.link === currentPath || // if we are on the same page then show it
        item.pageRestriction.includes(PAGE_RESTRICTIONS.any) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.activity) && isActivityPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.marketing) && isMarketingPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.lobby) && isLobbyPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.show) && isShowPage(currentPath)) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.badge) && hasSummitHallCheckedIn) ||
        (item.pageRestriction.includes(PAGE_RESTRICTIONS.customPage) && isCustomPage(currentPath))
    ;

    return item.display &&
           meetsUserRequirement(item.userRequirement) &&
           (!item.showOnlyAtShowTime || summitPhase >= PHASES.DURING) &&
           passPageRestriction;
  };

  const handleLogoClick = () => navigate(isLoggedUser ? defaultPath : "/");

  const handleProfileIconClick = () => navigate("/a/profile");

  return (
    <NavbarTemplate
      items={navbarContent.items.filter(showItem)}
      summit={summit}
      logo={summit?.logo}
      onLogoClick={handleLogoClick}
      isLoggedUser={isLoggedUser}
      idpProfile={idpProfile}
      onProfileIconClick={handleProfileIconClick}
    />
  );
};

const mapStateToProps = ({
  clockState,
  settingState,
  summitState,
  loggedUserState,
  userState
}) => ({
  summit: summitState.summit,
  summitPhase: clockState.summit_phase,
  isLoggedUser: loggedUserState.isLoggedUser,
  isAuthorized: userState.isAuthorized,
  hasTicket: userState.hasTicket,
  idpProfile: userState.idpProfile,
  userProfile: userState.userProfile,
  // TODO: move to site settings i/o marketing page settings
  eventRedirect: settingState.marketingPageSettings.eventRedirect
});

export default connect(mapStateToProps, {})(Navbar);
