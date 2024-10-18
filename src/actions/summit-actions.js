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

import URI from "urijs";

import { customErrorHandler } from '../utils/customErrorHandler';
import {getAccessTokenSafely} from "../utils/loginUtils";

export const GET_EXTRA_QUESTIONS = 'GET_EXTRA_QUESTIONS';

export const getExtraQuestions = (attendeeId = null) => async (dispatch, getState) => {

    dispatch(startLoading());

    const accessToken = await getAccessTokenSafely()
      .catch(() => {
          dispatch(stopLoading());
          return Promise.reject();
      });

    let apiUrl = URI(`${window.API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/attendees/${attendeeId ? attendeeId : 'me'}/allowed-extra-questions`);
    apiUrl.addQuery('expand', '*sub_question_rules,*sub_question,*values')
    apiUrl.addQuery('access_token', accessToken);
    apiUrl.addQuery('order', 'order');
    apiUrl.addQuery('page', 1);
    apiUrl.addQuery('per_page', 100);

    return getRequest(
        null,
        createAction(GET_EXTRA_QUESTIONS),
        `${apiUrl}`,
        customErrorHandler
    )({})(dispatch).then(() => {
        dispatch(stopLoading());
    }).catch(e => {
        console.log('ERROR: ', e);
        clearAccessToken();
        dispatch(stopLoading());
        return Promise.reject(e);
    });
}