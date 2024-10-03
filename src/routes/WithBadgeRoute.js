import React, {useEffect} from "react";
import { connect } from "react-redux";
import { isAuthorizedBadge } from "../utils/authorizedGroups";
import HeroComponent from "../components/HeroComponent";
import {getEventById, getEventStreamingInfoById} from "../actions/event-actions";
import { isMuxVideo } from "../utils/videoUtils";
import {navigate} from "gatsby";

const WithBadgeRoute = ({ children, location, eventId, event, loading, userProfile, hasTicket, isAuthorized, getEventById, getEventStreamingInfoById }) => {
  // if user is Authorized then bypass the badge checking
  const hasBadgeForEvent = isAuthorized || (eventId && userProfile && isAuthorizedBadge(event, userProfile.summit_tickets));
  const userIsAuthz = hasTicket || isAuthorized;
  const needsToLoadEvent = parseInt(eventId) && parseInt(eventId) !== parseInt(event?.id);

  const getTitle = () => {
    if (!userIsAuthz)
      return "Sorry. You don't have a ticket for this event.";
    if (!eventId || !userProfile)
      return "Sorry. You are not authorized to view this session.";
    if (!hasBadgeForEvent)
      return "Sorry. You need a special badge to view this session.";
  };

  useEffect(() => {
    if (event === null || parseInt(eventId) !== parseInt(event.id)) {
      getEventById(eventId).then((res) => {
        const { response, err }  = res;
        // check error
        if(err && err?.status === 404){
           navigate('/a/schedule');
        }
        if(response && response?.stream_is_secure && isMuxVideo(response?.streaming_url)){
          getEventStreamingInfoById(eventId)
        }
      }).catch(err => {
        console.log(err);
      });
    }
  }, [eventId, getEventById, event, getEventStreamingInfoById]);

  if (loading || needsToLoadEvent) {
    return <HeroComponent title="Loading event" />;
  }

  if (!userIsAuthz || !hasBadgeForEvent) {
    return <HeroComponent title={getTitle()} redirectTo={location.state?.previousUrl || "/"}/>;
  }

  return children;
};

const mapStateToProps = ({ userState, eventState }) => ({
  userProfile: userState.userProfile,
  hasTicket: userState.hasTicket,
  isAuthorized: userState.isAuthorized,
  event: eventState.event,
  loading: eventState.loading,
});

export default connect(mapStateToProps, {getEventById, getEventStreamingInfoById})(WithBadgeRoute);
