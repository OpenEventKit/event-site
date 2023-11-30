import {
    getAccessToken,
    clearAccessToken,
} from 'openstack-uicore-foundation/lib/security/methods';

import {
    getRequest,
    createAction,
    startLoading,
    stopLoading,
} from 'openstack-uicore-foundation/lib/utils/actions';

import { customErrorHandler } from '../utils/customErrorHandler';

export const GET_ATTENDEE_DATA = 'GET_ATTENDEE_DATA';
export const REQUEST_ATTENDEE_DATA = 'REQUEST_ATTENDEE_DATA';

export const getAttendeeData = (attendeeId) => async (dispatch, getState) => {

    let accessToken;
    try {
      accessToken = await getAccessToken();
    } catch (e) {
      console.log('getAccessToken error: ', e);
      return Promise.reject();
    }
  
    let params = {
      access_token: accessToken,
      expand: 'tickets,tickets.owner,extra_questions'
    };    
  
    dispatch(startLoading());
  
    return getRequest(
      createAction(REQUEST_ATTENDEE_DATA),
      createAction(GET_ATTENDEE_DATA),
      `${window.API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/attendees/${attendeeId}/me`,
      customErrorHandler
    )(params)(dispatch)
      .then((payload) => {
        dispatch(stopLoading())
        return payload;
      })
      .catch((e) => {
        dispatch(stopLoading());
        console.log('ERROR: ', e);
        clearAccessToken();
        return (e);
      });
  }