import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import {
    GET_ATTENDEE_DATA, REQUEST_ATTENDEE_DATA
} from '../actions/extra-questions-actions';
import { RESET_STATE } from '../actions/base-actions-definitions';
import { UPDATE_EXTRA_QUESTIONS } from '../actions/user-actions';

const DEFAULT_STATE = {
    loading: false,
    attendee: null
}

const extraQuestionReducer = (state = DEFAULT_STATE, action) => {
    const { type, payload } = action;
    switch (type) {
        case RESET_STATE:
        case UPDATE_EXTRA_QUESTIONS:
        case LOGOUT_USER: {
            return DEFAULT_STATE;
        }
        case START_LOADING:
            return { ...state, loading: true };
        case STOP_LOADING:
            return { ...state, loading: false };
        case REQUEST_ATTENDEE_DATA: {
            return { ...state, attendee: null }
        }
        case GET_ATTENDEE_DATA: {
            const attendee = payload.response;
            return { ...state, attendee }
        }
        default:
            return state;
    }
};

export default extraQuestionReducer;
