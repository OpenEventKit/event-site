import React from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
import { getSrc } from "gatsby-plugin-image";
import { connect } from "react-redux";

import Layout from "../components/Layout";
import withOrchestra from "../utils/widgetOrchestra";

import AdvertiseComponent from "../components/AdvertiseComponent";
import LiteScheduleComponent from "../components/LiteScheduleComponent";
import UpcomingEventsComponent from "../components/UpcomingEventsComponent";
import DisqusComponent from "../components/DisqusComponent";
import LiveEventWidgetComponent from "../components/LiveEventWidgetComponent";
import SpeakersWidgetComponent from "../components/SpeakersWidgetComponent";
import SponsorComponent from "../components/SponsorComponent";
import Link from "../components/Link";
import AccessTracker, {
  AttendeesWidget,
} from "../components/AttendeeToAttendeeWidgetComponent";
import AttendanceTrackerComponent from "../components/AttendanceTrackerComponent";
import PageHeader from "../components/PageHeader";

import { getUserProfile } from "../actions/user-actions";

export const LobbyPageTemplate = class extends React.Component {

  constructor(props) {
    super(props);
    this.onEventChange = this.onEventChange.bind(this);
  }

  onEventChange(ev) {
    navigate(`/a/event/${ev.id}`);
  }

  onViewAllMyEventsClick() {
    navigate("/a/my-schedule")
  }

  render() {
    const {
      user,
      summit,
      data: {
        lobbyPageJson: {
          hero,
          centerColumn,
          liveNowFeaturedEventId,
          sponsorsWidgetButton
        }
      },
      lastDataSync
    } = this.props;

    return (
      <>
        { hero &&
        <PageHeader
          title={hero.title}
          subtitle={hero.subTitle}
          backgroundImageSrc={hero.background ? getSrc(hero.background.src) : null}
        />
        }
        <div className="px-5 py-5 mb-6">
          <div className="columns">
            <div className="column is-one-quarter">
              <h2><b>Community</b></h2>
              <SponsorComponent
                page="lobby"
                linkButton={sponsorsWidgetButton}
              />
              <AdvertiseComponent section="lobby" column="left"/>
            </div>
            <div className="column is-half">
              <h2><b>Today</b></h2>
              <LiveEventWidgetComponent
                id={`lobby_page_live_event_${lastDataSync}`}
                lastDataSync={lastDataSync}
                onlyPresentations={true}
                featuredEventId={liveNowFeaturedEventId}
                onEventClick={(ev) => this.onEventChange(ev)}
                style={{marginBottom: "15px"}}
              />
              <DisqusComponent
                page="lobby"
                summit={summit}
                className="disqus-container-lobby"
                title="Public conversation"
                skipTo="#upcoming-events"
              />
              <UpcomingEventsComponent
                id={`lobby_page_upcomming_events_${lastDataSync}`}
                lastDataSync={lastDataSync}
                title="Up Next"
                eventCount={4}
                renderEventLink={(event) => <Link to={`/a/event/${event.id}`}>{event.title}</Link>}
                allEventsLink={<Link to="/a/schedule">View all <span
                  className="sr-only">events</span></Link>}
              />
              {centerColumn?.speakers?.showTodaySpeakers &&
                <SpeakersWidgetComponent
                  title="Today's Speakers"
                  id={`home_page_today_speakers_${lastDataSync}`}
                  lastDataSync={lastDataSync}
                  bigPics={true}
                />
              }
              {centerColumn?.speakers?.showFeatureSpeakers &&
                <SpeakersWidgetComponent
                  title="Featured Speakers"
                  id={`lobby_page_featured_speakers_${lastDataSync}`}
                  lastDataSync={lastDataSync}
                  bigPics={false}
                  featured={true}
                  date={null}
                />
              }
              <AdvertiseComponent section="lobby" column="center"/>
            </div>
            <div className="column is-one-quarter pb-6">
              <h2><b>My Info</b></h2>
              <AccessTracker/>
              <AttendeesWidget user={user} summit={summit}/>
              <LiteScheduleComponent
                id={`lobby_page_lite_schedule_${lastDataSync}`}
                lastDataSync={lastDataSync}
                onEventClick={(ev) => this.onEventChange(ev)}
                onViewAllEventsClick={() => this.onViewAllMyEventsClick()}
                title="My Schedule"
                yourSchedule={true}
                showNav={true}
                eventCount={10}
                schedKey="my-schedule-main"
              />
              <AdvertiseComponent section="lobby" column="right"/>
            </div>
          </div>
        </div>
      </>
    )
  }
};

const OrchestedTemplate = withOrchestra(LobbyPageTemplate);

const LobbyPage = (
  {
    location,
    data,
    user,
    getUserProfile,
    summit,
    lastDataSync
  }
) => (
  <Layout location={location}>
    <AttendanceTrackerComponent sourceName="LOBBY"/>
    <OrchestedTemplate
      user={user}
      data={data}
      getUserProfile={getUserProfile}
      summit={summit}
      lastDataSync={lastDataSync}
    />
  </Layout>
);

LobbyPage.propTypes = {
  data: PropTypes.object,
  user: PropTypes.object,
  getUserProfile: PropTypes.func
};

LobbyPageTemplate.propTypes = {
  data: PropTypes.object,
  user: PropTypes.object,
  getUserProfile: PropTypes.func
};

const mapStateToProps = ({userState, summitState, settingState}) => ({
  user: userState,
  summit: summitState.summit,
  lastDataSync: settingState.lastDataSync
});

export default connect(mapStateToProps, {getUserProfile})(LobbyPage);
