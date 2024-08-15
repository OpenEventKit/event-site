import * as React from "react";
import { Router, Location } from "@reach/router";
import { connect } from "react-redux";
import EventPage from "../../templates/event-page";
import PostersPage from "../../templates/posters-page";
import SchedulePage from "../../templates/schedule-page";
import InvitationsRejectPage from "../../templates/invitations-reject-page";
import SponsorPage from "../../templates/sponsor-page";
import ExpoHallPage from "../../templates/expo-hall-page";
import FullProfilePage from "../../templates/full-profile-page";
import WithAuthzRoute from "../../routes/WithAuthzRoute";
import WithAuthRoute from "../../routes/WithAuthRoute";
import ExtraQuestionsPage from "../../templates/extra-questions-page";
import ShowOpenRoute from "../../routes/ShowOpenRoute";
import WithBadgeRoute from "../../routes/WithBadgeRoute";
import PosterDetailPage from "../../templates/poster-detail-page";
import MyTicketsPage from "../../templates/my-tickets-page";
import BadgePage from "../../templates/badge-page";
import withRealTimeUpdates from "../../utils/real_time_updates/withRealTimeUpdates";
import withFeedsWorker from "../../utils/withFeedsWorker";
import Seo from "../../components/Seo";
import Link from "../../components/Link";
import { titleFromPathname } from "../../utils/urlFormating";
import {graphql} from "gatsby";
import WithCheckedBadgeRoute from "../../routes/WithCheckedBadgeRoute";

const mySchedulePage = ({ location, summitPhase,isLoggedUser, user, allowClick, title, key }) => {
  return  <SchedulePage
    path="/my-schedule"
    location={location}
    summitPhase={summitPhase}
    isLoggedIn={isLoggedUser}
    user={user}
    scheduleProps={{
      title: title,
      showSync: true,
      showShare: false,             
      subtitle: <Link to={"/a/schedule"}>Show Schedule</Link>
    }}
    schedKey={key}
    allowClick={allowClick}
  />;
}

export const appQuery = graphql`
  query {
    invitationsRejectPageJson {
      title
      notFoundText
      rejectedText
      rejectText
      rejectCTALabel
      alreadyAcceptedInvitationError
      alreadyRejectedInvitationError
    }
    mySchedulePageJson {
      title
      key
      needsTicketAuthz
    }
    badgeQrPageJson {
      enabled
    }
  }
`;


const App = ({ isLoggedUser, user, summitPhase, allowClick = true, data }) => {

  const { mySchedulePageJson, badgeQrPageJson } = data;

  console.log("CHECK!", badgeQrPageJson);

  return (
    <Location>
      {({ location }) => (
        <Router basepath="/a" >
          <SchedulePage
            path="/schedule"
            location={location}
            schedKey="schedule-main"
            scheduleProps={{ subtitle:
              <Link to={"/a/my-schedule"}>Show My Schedule</Link>
            }}
            allowClick={allowClick}
          />
          <InvitationsRejectPage path="/invitations/reject/:invitationToken" location={location} data={data} />
          <WithAuthRoute path="/" isLoggedIn={isLoggedUser} location={location}>
            <MyTicketsPage path="/my-tickets" isLoggedIn={isLoggedUser} user={user} location={location} />
            <FullProfilePage path="/profile" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location} />
            <ExtraQuestionsPage path="/extra-questions" isLoggedIn={isLoggedUser} user={user} location={location} />
            { !mySchedulePageJson.needsTicketAuthz && mySchedulePage({location, summitPhase,isLoggedUser, user, allowClick, title:mySchedulePageJson.title, key: mySchedulePageJson.key }) }
            <WithAuthzRoute path="/" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location}>
                <PostersPage path="/posters" trackGroupId={0} location={location} />
                <PostersPage path="/posters/:trackGroupId" location={location} />
                <PosterDetailPage path="/poster/:presentationId/" isLoggedIn={isLoggedUser} user={user} location={location} />
                { mySchedulePageJson.needsTicketAuthz && mySchedulePage({location, summitPhase,isLoggedUser, user, allowClick, title: mySchedulePageJson.title, key: mySchedulePageJson.key }) }
                {badgeQrPageJson.enabled &&
                  <WithCheckedBadgeRoute path="/" isLoggedIn={isLoggedUser} user={user} location={location}>
                    <BadgePage path="/badge" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location} />
                  </WithCheckedBadgeRoute>
                }
                <ShowOpenRoute path="/" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location}>
                  <WithBadgeRoute path="/event/:eventId" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location}>
                    <EventPage path="/" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location} />
                  </WithBadgeRoute>
                  <SponsorPage path="/sponsor/:sponsorId" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location} />
                  <ExpoHallPage path="/sponsors/" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location} />
                </ShowOpenRoute>                
            </WithAuthzRoute>
          </WithAuthRoute>
        </Router>
      )}
    </Location>
  );
};

const mapStateToProps = ({ loggedUserState, userState, clockState, settingState, summitState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  summitPhase: clockState.summit_phase,
  user: userState,
  summitId: summitState?.summit?.id,
  lastBuild: settingState.lastBuild,
  summit: summitState?.summit,
  allowClick: settingState?.widgets?.schedule?.allowClick
});

export default connect(mapStateToProps, {})(withFeedsWorker(withRealTimeUpdates(App)));

export const Head = ({
  location
}) => (
  <Seo
    title={titleFromPathname(location.pathname)}
    location={location}
  />
);
