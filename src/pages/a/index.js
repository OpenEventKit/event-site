import * as React from "react";
import { graphql } from "gatsby";
import { Router, Location } from "@reach/router";
import { connect } from "react-redux";
import LobbyPage from "../../templates/lobby-page";
import WithAuthzRoute from "../../routes/WithAuthzRoute";
import WithAuthRoute from "../../routes/WithAuthRoute";
import ShowOpenRoute from "../../routes/ShowOpenRoute";
import withRealTimeUpdates from "../../utils/real_time_updates/withRealTimeUpdates";
import withFeedsWorker from "../../utils/withFeedsWorker";
import Seo from "../../components/Seo";

export const lobbyPageQuery = graphql`
  query {
    lobbyPageJson {
      hero {
        title
        subTitle
        background {
          src {
            childImageSharp {
              gatsbyImageData (
                quality: 100
                placeholder: BLURRED
              )
            }
          }
          alt
        }
      }
      centerColumn {
        speakers {
          showTodaySpeakers
          showFeatureSpeakers
        }
      }
      liveNowFeaturedEventId
      sponsorsWidgetButton {
        text
        link
      }
    }
  }
`;

const App = ({ data, isLoggedUser, user, summitPhase }) => {
  return (
    <Location>
      {({ location }) => (
      <Router basepath="/a" >
        <WithAuthRoute path="/" isLoggedIn={isLoggedUser} location={location}>
          <WithAuthzRoute path="/" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location}>
            <ShowOpenRoute path="/" summitPhase={summitPhase} isLoggedIn={isLoggedUser} user={user} location={location}>
              <LobbyPage path="/" data={data} isLoggedIn={isLoggedUser} user={user} location={location} />
            </ShowOpenRoute>
          </WithAuthzRoute>
        </WithAuthRoute>
      </Router>
      )}
    </Location>
  );
};

const mapStateToProps = ({ loggedUserState, userState, clockState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  summitPhase: clockState.summit_phase,
  user: userState
});

export default connect(mapStateToProps, {})(withFeedsWorker(withRealTimeUpdates(App)));

export const Head = ({
  location
}) => (
  <Seo
    title={"Lobby"}
    location={location}
  />
);
