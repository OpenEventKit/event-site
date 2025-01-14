import {
    getRequest,
    createAction,
    stopLoading,
    startLoading,
} from 'openstack-uicore-foundation/lib/utils/actions';
import { clearAccessToken } from 'openstack-uicore-foundation/lib/security/methods';
import { getAccessTokenSafely } from '../utils/loginUtils';

import { customErrorHandler } from '../utils/customErrorHandler';

import {LOGOUT_USER} from "openstack-uicore-foundation/lib/security/actions";
import {
    GET_EVENT_DATA,
    GET_EVENT_DATA_ERROR,
    GET_EVENT_STREAMING_INFO,
    SET_EVENT_LAST_UPDATE,
} from './event-actions-definitions';

export const handleResetReducers = () => (dispatch) => {
    dispatch(createAction(LOGOUT_USER)({}));
};

export const setEventLastUpdate = (lastUpdate) => (dispatch) => {
    dispatch(createAction(SET_EVENT_LAST_UPDATE)(lastUpdate));
}

/**
 * @param eventId
 * @returns {(function(*, *): Promise<*>)|*}
 */
export const getEventById = (
    eventId
) => async (dispatch, getState) => {

    dispatch(startLoading());
    // if we have it on the reducer , provide that first
    let {allSchedulesState: {allEvents}} = getState();
    const event = allEvents.find(ev => ev.id === parseInt(eventId));

    if (event) {
        dispatch(stopLoading());
        dispatch(createAction(GET_EVENT_DATA)({event}));
        const res = { response: event, err: null };
        return Promise.resolve(res);
    }
    // then refresh from api

    const accessToken = await getAccessTokenSafely()
      .catch(() => {
            dispatch(stopLoading());
            console.log('REJECTING PROMISE AFTER STOP LOADING')
            return Promise.reject();
      });

    let params = {
        access_token: accessToken,
        expand: 'slides, links, videos, media_uploads, type, track, track.allowed_access_levels, location, location.venue, location.floor, speakers, moderator, sponsors, current_attendance, groups, rsvp_template, tags'
    };

    return getRequest(
        null,
        createAction(GET_EVENT_DATA),
        `${window.SUMMIT_API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/events/${eventId}/published`,
        customErrorHandler,
        {},
        true)
    (params)(dispatch).then((payload) => {
        dispatch(stopLoading());
        return payload
    }).catch(e => {
        dispatch(stopLoading());
        dispatch(createAction(GET_EVENT_DATA_ERROR)(e));
        console.log('ERROR: ', e);
        clearAccessToken();
        return (e);
    });
};

/**
 * @param eventId
 * @param checkLocal
 * @returns {(function(*, *): Promise<*>)|*}
 */
export const getEventStreamingInfoById = (
    eventId
) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely()
      .catch(() => {
          dispatch(stopLoading());
          return Promise.reject();
      });

    let params = {
        access_token: accessToken
    };

    return getRequest(
        null,
        createAction(GET_EVENT_STREAMING_INFO),
        `${window.SUMMIT_API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/events/${eventId}/published/streaming-info`,
        customErrorHandler,
        {},
        true)
    (params)(dispatch).then((payload) => {
        return payload
    }).catch(e => {
        dispatch(createAction(GET_EVENT_DATA_ERROR)(e));
        console.log('ERROR: ', e);
        clearAccessToken();
        return (e);
    });
};
