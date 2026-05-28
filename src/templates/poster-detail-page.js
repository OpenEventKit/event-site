import React, { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { navigate } from 'gatsby';

import Layout from "../components/Layout";
import Interstitial from '../components/Interstitial';
import DisqusComponent from '../components/DisqusComponent';
import VideoComponent from '../components/VideoComponent';
import PosterButton from '../components/PosterButton';
import PosterDescription from '../components/PosterDescription';
import PosterLiveSession from '../components/PosterLiveSession';
import PosterNavigation from '../components/PosterNavigation';
import PosterImage from '../components/PosterImage';
import PosterGrid from '../components/poster-grid';
import DocumentsComponent from '../components/DocumentsComponent';
import AdvertiseComponent from '../components/AdvertiseComponent';
import Etherpad from '../components/Etherpad';
import NotificationHub from '../components/notification-hub';

import AttendanceTrackerComponent from '../components/AttendanceTrackerComponent';
import AccessTracker, { AttendeesWidget } from '../components/AttendeeToAttendeeWidgetComponent';

import { getAllVoteablePresentations, getPresentationById, setInitialDataset } from '../actions/presentation-actions';
import { castPresentationVote, uncastPresentationVote } from '../actions/user-actions';

import { isAuthorizedBadge } from '../utils/authorizedGroups';
import { useVotingPeriodsPhasesMap } from '@utils/hooks/useVotingPeriodPhase';
import { useVotingPeriodNotifications } from '@utils/hooks/useVotingPeriodNotifications';

import useMarketingSettings, { MARKETING_SETTINGS_KEYS } from "@utils/useMarketingSettings";

export const PosterDetailPage = ({
  location,
  presentationId,
  setInitialDataset,
  getAllVoteablePresentations,
  getPresentationById,
  loading,
  summit,
  user,
  isAuthorized,
  attendee,
  allPosters,
  recommendedPosters,
  votingPeriods,
  votes,
  castPresentationVote,
  uncastPresentationVote
}) => {

  const [{ poster, posterTrackGroups, posterViewable }, setPosterState] = useState({
    poster: null,
    posterTrackGroups: [],
    posterViewable: false
  });

  const [votedPosterTrackGroups, setVotedPosterTrackGroups] = useState([]);

  const votingPeriodsPhases = useVotingPeriodsPhasesMap(votingPeriods);

  const notificationRef = useRef(null);

  const pushNotification = useCallback((notification) => {
    return notificationRef.current?.(notification);
  }, [notificationRef]);

  const toggleVote = useCallback((presentation, isVoted) => {
    setVotedPosterTrackGroups(presentation.track?.track_groups);
    isVoted ? castPresentationVote(presentation) : uncastPresentationVote(presentation);
  }, []);

  useEffect(() => {
    if (!allPosters.length) setInitialDataset().then(() => getAllVoteablePresentations());
  }, []);

  useEffect(() => {
    getPresentationById(presentationId).then(presentation => {
      setPosterState({
        poster: presentation,
        posterTrackGroups: presentation.track?.track_groups ?? [],
        posterViewable: isAuthorized || isAuthorizedBadge(presentation, user.userProfile.summit_tickets)
      });
    }).catch(e => console.log(e));
  }, [presentationId]);

  useVotingPeriodNotifications({
    trackGroups: posterTrackGroups,
    votingPeriods,
    votingPeriodsPhases,
    votedTrackGroups: votedPosterTrackGroups,
    onVotedTrackGroupsHandled: () => setVotedPosterTrackGroups([]),
    pushNotification,
  });

  const { getSettingByKey } = useMarketingSettings();

  if (loading) return <Interstitial title="Loading poster" contained />;

  if (!poster) return <Interstitial title="Poster not found" contained />;

  if (!posterViewable) {
    return <Interstitial title={"Sorry. You need a special badge to view this poster."} navigateTo={location.state?.previousUrl || "/a/"} contained />;
  }

  const mediaUpload = poster.media_uploads?.find((e) => e?.media_upload_type?.name === 'Poster');

  const activityCtaText = getSettingByKey(MARKETING_SETTINGS_KEYS.activityCtaText);

  return (
    <>
      <AttendanceTrackerComponent
        key={`att-tracker-${poster.id}`}
        sourceId={poster.id}
        sourceName="POSTER"
      />
      <section
        className="section px-0 py-0"
        style={{ marginBottom: !poster.streaming_url ? 0 : '' }}
      >
        <div className="columns is-gapless">
          <div className="column is-three-quarters px-0 py-0" style={{ position: 'relative' }}>
            {poster.streaming_url &&
              <>
                <VideoComponent
                  url={poster.streaming_url}
                  title={poster.title}
                  namespace={summit.name}
                  autoPlay={true}
                />
                <PosterButton mediaUpload={mediaUpload} />
              </>
            }
            {!poster.streaming_url &&
              <>
                <PosterImage mediaUpload={mediaUpload} />
                <PosterButton mediaUpload={mediaUpload} />
              </>
            }
          </div>
          <div
            className="column is-hidden-mobile"
            style={{
              position: "relative",
              borderBottom: "1px solid #d3d3d3",
            }}
          >
            <DisqusComponent
              hideMobile={true}
              event={poster}
              title="Public Conversation"
            />
          </div>
        </div>
      </section>
      <section className="section px-0 pt-5 pb-0">
        <div className="columns mx-0 my-0">
          <div className="column is-three-quarters is-full-mobile">
            <div className="px-5 py-0">
              <PosterDescription
                poster={poster}
                votingAllowed={!!attendee}
                votingPeriods={votingPeriods}
                votingPeriodsPhases={votingPeriodsPhases}
                votes={votes}
                isVoted={!!votes.find(v => v.presentation_id === poster.id)}
                toggleVote={toggleVote}
              />
            </div>
            <div className="px-5 py-0">
              <PosterNavigation allPosters={allPosters} poster={poster} />
              <div className="mt-6 mb-5 mx-0"><h4>More like this</h4></div>
              <PosterGrid
                posters={recommendedPosters}
                votingAllowed={!!attendee}
                votingPeriods={votingPeriods}
                votingPeriodsPhases={votingPeriodsPhases}
                votes={votes}
                toggleVote={toggleVote}
                showDetailPage={(posterId) => navigate(`/a/poster/${posterId}`)}
              />
            </div>
            <div className="is-hidden-tablet">
              <DisqusComponent
                hideMobile={false}
                event={poster}
                title="Public Conversation"
              />
            </div>
            {poster.etherpad_link && (
              <div className="column is-three-quarters">
                <Etherpad
                  className="talk__etherpad"
                  etherpad_link={poster.etherpad_link}
                  userName={user.userProfile.first_name}
                />
              </div>
            )}
          </div>
          <div className="column px-5 py-0 is-one-quarter is-full-mobile">
            {poster.meeting_url && <PosterLiveSession poster={poster} ctaText={activityCtaText} />}
            <DocumentsComponent event={poster} />
            <AccessTracker />
            <AttendeesWidget user={user} event={poster} summit={summit} />
            <AdvertiseComponent section="event" column="right" />
          </div>
        </div>
        <NotificationHub children={(add) => { notificationRef.current = add }} />
      </section>
    </>
  );
};

const PosterDetailPageTemplate = ({
  location,
  presentationId,
  setInitialDataset,
  getAllVoteablePresentations,
  getPresentationById,
  loading,
  summit,
  user,
  isAuthorized,
  attendee,
  allPosters,
  recommendedPosters,
  votingPeriods,
  votes,
  castPresentationVote,
  uncastPresentationVote,
  activityCtaText
}) => {
  return (
    <Layout location={location}>
      <PosterDetailPage
        location={location}
        presentationId={presentationId}
        setInitialDataset={setInitialDataset}
        getAllVoteablePresentations={getAllVoteablePresentations}
        getPresentationById={getPresentationById}
        loading={loading}
        summit={summit}
        user={user}
        isAuthorized={isAuthorized}
        attendee={attendee}
        allPosters={allPosters}
        recommendedPosters={recommendedPosters}
        votingPeriods={votingPeriods}
        votes={votes}
        castPresentationVote={castPresentationVote}
        uncastPresentationVote={uncastPresentationVote}
        activityCtaText={activityCtaText}
      />
    </Layout>
  );
};

const posterDetailPageTemplatePropTypes = {
  location: PropTypes.object,
  presentationId: PropTypes.string,
  setInitialDataset: PropTypes.func,
  getAllVoteablePresentations: PropTypes.func,
  getPresentationById: PropTypes.func,
  loading: PropTypes.bool,
  summit: PropTypes.object,
  user: PropTypes.object,
  isAuthorized: PropTypes.bool,
  attendee: PropTypes.object,
  allPosters: PropTypes.array,
  recommendedPosters: PropTypes.array,
  votingPeriods: PropTypes.object,
  votes: PropTypes.array,
  castPresentationVote: PropTypes.func,
  uncastPresentationVote: PropTypes.func
};

PosterDetailPage.propTypes = posterDetailPageTemplatePropTypes;
PosterDetailPageTemplate.propTypes = posterDetailPageTemplatePropTypes;

const mapStateToProps = ({ userState, summitState, presentationsState, settingState }) => ({
  loading: presentationsState.voteablePresentations.loading,
  summit: summitState.summit,
  user: userState,
  isAuthorized: userState.isAuthorized,
  attendee: userState.attendee,
  allPosters: presentationsState.voteablePresentations.allPresentations,
  recommendedPosters: presentationsState.voteablePresentations.recommendedPresentations,
  votingPeriods: presentationsState.votingPeriods,
  votes: userState.attendee?.presentation_votes ?? []
});

export default connect(mapStateToProps, {
  getPresentationById,
  setInitialDataset,
  getAllVoteablePresentations,
  castPresentationVote,
  uncastPresentationVote
})(PosterDetailPageTemplate);