import {
    getRequest,
    postRequest,
    putRequest,
    deleteRequest,
    putFile,
    createAction,
    startLoading,
    stopLoading,
} from 'openstack-uicore-foundation/lib/utils/actions';

import { putOnLocalStorage, getFromLocalStorage } from 'openstack-uicore-foundation/lib/utils/methods';

import {
    clearAccessToken,
    passwordlessLogin,
    initLogOut
} from 'openstack-uicore-foundation/lib/security/methods';

import QuestionsSet from 'openstack-uicore-foundation/lib/utils/questions-set'
import Swal from 'sweetalert2';
import axios from "axios";
import {navigate} from 'gatsby';
import {customErrorHandler, customBadgeHandler, voidErrorHandler, customRSVPHandler} from '../utils/customErrorHandler';
import {getEnvVariable, SUMMIT_API_BASE_URL, SUMMIT_ID} from "../utils/envVariables";
import expiredToken from "../utils/expiredToken";
import { getAccessTokenSafely } from "../utils/loginUtils";

import * as Sentry from "@sentry/react";

export const GET_DISQUS_SSO = 'GET_DISQUS_SSO';
export const GET_USER_PROFILE = 'GET_USER_PROFILE';
export const START_LOADING_PROFILE = 'START_LOADING_PROFILE';
export const STOP_LOADING_PROFILE = 'STOP_LOADING_PROFILE';
export const UPDATE_PASSWORD = 'UPDATE_PASSWORD';
export const SET_AUTHORIZED_USER = 'SET_AUTHORIZED_USER';
export const SET_USER_TICKET = 'SET_USER_TICKET';
export const UPDATE_PROFILE_PIC = 'UPDATE_PROFILE_PIC';
export const UPDATE_EXTRA_QUESTIONS = 'UPDATE_EXTRA_QUESTIONS';
export const START_LOADING_IDP_PROFILE = 'START_LOADING_IDP_PROFILE';
export const STOP_LOADING_IDP_PROFILE = 'STOP_LOADING_IDP_PROFILE';
export const GET_IDP_PROFILE = 'GET_IDP_PROFILE';
export const UPDATE_IDP_PROFILE = 'UPDATE_IDP_PROFILE';
export const SCAN_BADGE = 'SCAN_BADGE';
export const SCAN_BADGE_SUCCESS = 'SCAN_BADGE_SUCCESS';
export const SCAN_BADGE_ERROR = 'SCAN_BADGE_ERROR';
export const ADD_TO_SCHEDULE = 'ADD_TO_SCHEDULE';
export const REMOVE_FROM_SCHEDULE = 'REMOVE_FROM_SCHEDULE';
export const SCHEDULE_SYNC_LINK_RECEIVED = 'SCHEDULE_SYNC_LINK_RECEIVED';
export const SET_USER_ORDER = 'SET_USER_ORDER';
export const CAST_PRESENTATION_VOTE_REQUEST = 'CAST_PRESENTATION_VOTE_REQUEST';
export const CAST_PRESENTATION_VOTE_RESPONSE = 'CAST_PRESENTATION_VOTE_RESPONSE';
export const UNCAST_PRESENTATION_VOTE_REQUEST = 'UNCAST_PRESENTATION_VOTE_REQUEST';
export const UNCAST_PRESENTATION_VOTE_RESPONSE = 'UNCAST_PRESENTATION_VOTE_RESPONSE';
export const TOGGLE_PRESENTATION_VOTE = 'TOGGLE_PRESENTATION_VOTE';
export const GET_EXTRA_QUESTIONS = 'GET_EXTRA_QUESTIONS';
export const TICKET_OWNER_CHANGED = 'TICKET_OWNER_CHANGED';
export const REQUEST_INVITATION = 'REQUEST_INVITATION';
export const RECEIVE_INVITATION = 'RECEIVE_INVITATION';
export const REJECT_INVITATION = 'REJECT_INVITATION';
export const RSVP_CONFIRMED = 'RSVP_CONFIRMED';
export const RSVP_CANCELLED = 'RSVP_CANCELLED';
export const REQUEST_RSVP_INVITATION = 'REQUEST_RSVP_INVITATION';
export const RECEIVE_RSVP_INVITATION = 'RECEIVE_RSVP_INVITATION';
export const RSVP_INVITATION_ERROR = 'RSVP_INVITATION_ERROR';
export const RSVP_INVITATION_ACCEPTED = 'RSVP_INVITATION_ACCEPTED';
export const RSVP_INVITATION_REJECTED = 'RSVP_INVITATION_REJECTED';
const DISQUS_SSO_EXPIRATION = "DISQUS_SSO_EXPIRATION";

// shortName is the unique identifier assigned to a Disqus site.
export const getDisqusSSO = (shortName) => async (dispatch, getState) => {
    const {userState: {disqusSSO}} = getState();
    const almostTwoHours = 1000 * 60 * 60 * 1.9;
    const disqusSsoExpiration = parseInt(getFromLocalStorage(DISQUS_SSO_EXPIRATION)) || 0;

    if (disqusSSO && disqusSsoExpiration > Date.now()) return;

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    return getRequest(
        null,
        createAction(GET_DISQUS_SSO),
        `${window.IDP_BASE_URL}/api/v1/sso/disqus/${shortName}/profile?access_token=${accessToken}`,
        customErrorHandler
    )({})(dispatch)
        .then(() => {
            putOnLocalStorage(DISQUS_SSO_EXPIRATION, Date.now() + almostTwoHours)
        })
        .catch(e => {
            console.log('ERROR: ', e);
            Sentry.captureException(e)
            clearAccessToken();
            return Promise.reject(e);
        });
}

export const getUserProfile = () => async (dispatch) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
        fields: 'rsvp.event_id,rsvp.seat_type,rsvp_invitations.event_id,rsvp_invitations.status',
        expand:
            'groups,summit_tickets,summit_tickets.ticket_type,summit_tickets.owner,summit_tickets.owner.presentation_votes,' +
            'summit_tickets.owner.extra_questions,summit_tickets.badge,summit_tickets.badge.features,summit_tickets.badge.type,' +
            'summit_tickets.badge.type.access_levels,summit_tickets.badge.type.features,favorite_summit_events,feedback,' +
            'schedule_summit_events,rsvp,rsvp.answers,rsvp_invitations'
    };

    return getRequest(
        createAction(START_LOADING_PROFILE),
        createAction(GET_USER_PROFILE),
        `${window.SUMMIT_API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/members/me`,
        customErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(createAction(STOP_LOADING_PROFILE)());
        return dispatch(getIDPProfile()).then(() => dispatch(getScheduleSyncLink()));
    }).catch((e) => {
        console.log('ERROR: ', e);
        dispatch(createAction(STOP_LOADING_PROFILE)());
        clearAccessToken();
        Swal.fire('Error', "There was an error at Login Flow. Please retry.", "warning");
        initLogOut();
        return (e);
    });
}

export const getIDPProfile = () => async (dispatch) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
        expand: 'groups'
    };

    return getRequest(
        createAction(START_LOADING_IDP_PROFILE),
        createAction(GET_IDP_PROFILE),
        `${window.IDP_BASE_URL}/api/v1/users/me`,
        customErrorHandler
    )(params)(dispatch)
        .then(() => dispatch(createAction(STOP_LOADING_IDP_PROFILE)()))
        .catch((e) => {
            console.log('ERROR: ', e);
            dispatch(createAction(STOP_LOADING_IDP_PROFILE)())
            clearAccessToken();
            return (e);
        });
}

export const requireExtraQuestions = () => (dispatch, getState) => {
    const {userState: {userProfile}} = getState();

    const owner = userProfile?.summit_tickets[0]?.owner || null;
    // if user does not have an attendee then we dont require extra questions
    if (!owner) return false;
    return dispatch(checkRequireExtraQuestionsByAttendee(owner));
}

export const checkRequireExtraQuestionsByAttendee = (attendee) => (dispatch, getState) => {

    const {summitState: {summit, extra_questions}} = getState();
    if (!attendee.first_name || !attendee.last_name || !attendee.company || !attendee.email) return true;
    const disclaimer = summit.registration_disclaimer_mandatory ? attendee.disclaimer_accepted : true;
    if (!disclaimer) return true;
    if (extra_questions?.length > 0) {
        const qs = new QuestionsSet(extra_questions, attendee.extra_questions || []);
        return !qs.completed();
    }
    return false;
}

export const scanBadge = (sponsorId) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
    };

    return postRequest(
        createAction(SCAN_BADGE),
        createAction(SCAN_BADGE_SUCCESS),
        `${window.SUMMIT_API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/sponsors/${sponsorId}/user-info-grants/me`,
        null,
        customBadgeHandler,
        // entity
    )(params)(dispatch)
        .then((payload) => {
            let msg = 'Thanks for sharing your info!';
            Swal.fire("Success", msg, "success");
            return (payload)
        })
        .catch(e => {
            console.log('ERROR: ', e);
            dispatch(createAction(SCAN_BADGE_ERROR)(e));
            clearAccessToken();
            return (e);
        });
}

export const addToSchedule = (event) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    const url = `${getEnvVariable(SUMMIT_API_BASE_URL)}/api/v1/summits/${getEnvVariable(SUMMIT_ID)}/members/me/schedule/${event.id}`;

    return axios.post(
        url, {access_token: accessToken}
    ).then(() => {
        dispatch(createAction(ADD_TO_SCHEDULE)(event));
        return event;
    }).catch(e => {
        console.log('ERROR: ', e);
        Sentry.captureException(e)
        return e;
    });
};

export const removeFromSchedule = (event) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    const url = `${getEnvVariable(SUMMIT_API_BASE_URL)}/api/v1/summits/${getEnvVariable(SUMMIT_ID)}/members/me/schedule/${event.id}`;

    return axios.delete(
        url, {data: {access_token: accessToken}}
    ).then(() => {
        dispatch(createAction(REMOVE_FROM_SCHEDULE)(event));
        return event;
    }).catch(e => {
        console.log('ERROR: ', e);
        Sentry.captureException(e)
        return e;
    });
};

/************************************** RSVP **************************************************************************/

export const rsvpToEvent = (event) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    const url = `${getEnvVariable(SUMMIT_API_BASE_URL)}/api/v1/summits/${getEnvVariable(SUMMIT_ID)}/events/${event.id}/rsvp`;

    return axios.post(
        url, {
            access_token: accessToken,
            fields: 'event_id,seat_type',
            relations: 'none',
        }
    ).then((payload) => {
        const {data: rsvp} = payload;
        dispatch(createAction(RSVP_CONFIRMED)(rsvp));
        dispatch(createAction(ADD_TO_SCHEDULE)(event));
        return rsvp;
    }).catch(e => {
        console.log('ERROR: ', e);
        Swal.fire('Error', "There was an error at RSVP. Please retry.", "warning");
        Sentry.captureException(e)
        return e;
    });
};

export const cancelRSVP = (event) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    const url = `${getEnvVariable(SUMMIT_API_BASE_URL)}/api/v1/summits/${getEnvVariable(SUMMIT_ID)}/events/${event.id}/unrsvp`;

    return axios.delete(
        url, {data: {
            access_token: accessToken,
            relations: 'none',
            fields: 'id',
        }}
    ).then(() => {
        dispatch(createAction(RSVP_CANCELLED)(event));
        dispatch(createAction(REMOVE_FROM_SCHEDULE)(event));
        return event;
    }).catch(e => {
        console.log('ERROR: ', e);
        Swal.fire('Error', "There was an error at UnRSVP. Please retry.", "warning");
        Sentry.captureException(e)
        return e;
    });
};

/************************************** RSVP **************************************************************************/

export const rsvpToEvent = (event) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    const url = `${getEnvVariable(SUMMIT_API_BASE_URL)}/api/v1/summits/${getEnvVariable(SUMMIT_ID)}/events/${event.id}/rsvp`;

    return axios.post(
        url, { access_token: accessToken }
    ).then(() => {
        dispatch(createAction(RSVP_CONFIRMED)(event));
        return event;
    }).catch(e => {
        console.log('ERROR: ', e);
        clearAccessToken();
        return e;
    });
};

export const cancelRSVP = (event) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    const url =`${getEnvVariable(SUMMIT_API_BASE_URL)}/api/v1/summits/${getEnvVariable(SUMMIT_ID)}/events/${event.id}/unrsvp`;

    return axios.delete(
        url, { data: { access_token: accessToken } }
    ).then(() => {
        dispatch(createAction(RSVP_CANCELLED)(event));
        return event;
    }).catch(e => {
        console.log('ERROR: ', e);
        clearAccessToken();
        return e;
    });
};

export const castPresentationVote = (presentation) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    const params = {
        access_token: accessToken,
    };

    const errorHandler = (err) => (dispatch, state) => {
        const {status, response: {text}} = err;
        if (status === 412) {
            if (text.includes('already vote')) {
                // 'confirm' as local vote
                dispatch(createAction(TOGGLE_PRESENTATION_VOTE)({presentation, isVoted: true}));
            } else if (text.includes('Max. allowed votes') ||
                text.includes('Member is not an attendee') ||
                // Voting Period for track group is closed
                text.includes('is closed')) {
                // need to revert button state
                // first 'confirm' as local vote
                dispatch(createAction(TOGGLE_PRESENTATION_VOTE)({presentation, isVoted: true}));
                // inmediately remove vote
                dispatch(createAction(TOGGLE_PRESENTATION_VOTE)({presentation, isVoted: false, reverting: true}));
            }
        } else {
            console.log('castPresentationVote error code: ', status, text);
        }
    };

    return postRequest(
        createAction(CAST_PRESENTATION_VOTE_REQUEST),
        createAction(CAST_PRESENTATION_VOTE_RESPONSE),
        `${getEnvVariable('SUMMIT_API_BASE_URL')}/api/v1/summits/${getEnvVariable(SUMMIT_ID)}/presentations/${presentation.id}/attendee-votes`,
        {},
        errorHandler,
        {presentation}
    )(params)(dispatch).catch((e) => {
        console.log('ERROR: ', e);
        clearAccessToken();
        // need to revert button state
        // first 'confirm' as local vote
        dispatch(createAction(TOGGLE_PRESENTATION_VOTE)({presentation, isVoted: true}));
        // inmediately remove vote
        dispatch(createAction(TOGGLE_PRESENTATION_VOTE)({presentation, isVoted: false, reverting: true}));
        return e;
    });
};

export const uncastPresentationVote = (presentation) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    const params = {
        access_token: accessToken,
    };

    const errorHandler = (err) => (dispatch, state) => {
        const {status, response: {text}} = err;
        if (status === 412 && text.includes('Vote not found')) {
            // tried removing a vote not longer present in api
            // confirming removal
            dispatch(createAction(TOGGLE_PRESENTATION_VOTE)({presentation, isVoted: false}));
        } else {
            console.log('uncastPresentationVote error code: ', status, text);
        }
    };

    return deleteRequest(
        createAction(UNCAST_PRESENTATION_VOTE_REQUEST),
        createAction(UNCAST_PRESENTATION_VOTE_RESPONSE)({presentation}),
        `${getEnvVariable('SUMMIT_API_BASE_URL')}/api/v1/summits/${getEnvVariable(SUMMIT_ID)}/presentations/${presentation.id}/attendee-votes`,
        {},
        errorHandler,
        {presentation}
    )(params)(dispatch).catch((e) => {
        console.log('ERROR: ', e);
        clearAccessToken();
        return e;
    });
};

export const updateProfilePicture = (pic) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
    };

    dispatch(createAction(START_LOADING_IDP_PROFILE)());

    putFile(
        null,
        createAction(UPDATE_PROFILE_PIC),
        `${window.IDP_BASE_URL}/api/v1/users/me/pic`,
        pic,
        {},
        customErrorHandler,
    )(params)(dispatch)
        .then(() => dispatch(getIDPProfile()))
        .catch((e) => {
            console.log('ERROR: ', e);
            dispatch(createAction(STOP_LOADING_IDP_PROFILE)())
            clearAccessToken();
            return e;
        });
}

export const updateProfile = (profile) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
    };

    dispatch(createAction(START_LOADING_IDP_PROFILE)());

    putRequest(
        null,
        createAction(UPDATE_IDP_PROFILE),
        `${window.IDP_BASE_URL}/api/v1/users/me`,
        profile,
        customErrorHandler
    )(params)(dispatch)
        .then(() => dispatch(getIDPProfile()))
        .catch((e) => {
            console.log('ERROR: ', e);
            dispatch(createAction(STOP_LOADING_IDP_PROFILE)());
            clearAccessToken();
            return e;
        });
}

export const updatePassword = (password) => async (dispatch) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
    };

    return putRequest(
        createAction(START_LOADING_IDP_PROFILE),
        createAction(UPDATE_PASSWORD),
        `${window.IDP_BASE_URL}/api/v1/users/me`,
        password,
        customErrorHandler
    )(params)(dispatch)
        .then(() => {
            dispatch(createAction(STOP_LOADING_IDP_PROFILE)());
            let msg = 'Password Updated';
            Swal.fire("Success", msg, "success");
        })
        .catch((e) => {
            console.log('ERROR: ', e);
            dispatch(createAction(STOP_LOADING_IDP_PROFILE)())
            clearAccessToken();
            return e;
        });
}

export const saveAttendeeQuestions = (values, ticketId = null) => async (dispatch, getState) => {

    const {userState: {userProfile: {summit_tickets}}} = getState();

    const normalizedEntity = {...values};

    if (!values.attendee_company.id) {
        normalizedEntity['attendee_company'] = values.attendee_company.name;
    } else {
        delete (normalizedEntity['attendee_company']);
        normalizedEntity['attendee_company_id'] = values.attendee_company.id;
    }

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
        expand: 'owner, owner.extra_questions'
    };

    dispatch(startLoading());

    return putRequest(
        null,
        createAction(UPDATE_EXTRA_QUESTIONS),
        `${window.API_BASE_URL}/api/v1/summits/all/orders/all/tickets/${ticketId ? ticketId : summit_tickets[0].id}`,
        normalizedEntity,
        customErrorHandler
    )(params)(dispatch).then(() => {
        dispatch(stopLoading());
        Swal.fire('Success', "Thank you, information saved", "success");
        dispatch(getUserProfile());
        navigate('/')
    }).catch(e => {
        dispatch(stopLoading());
        Swal.fire('Error', "Error saving your Attendee info. Please retry.", "warning");
        clearAccessToken();
        return e;
    });
};

/**
 * @param params
 * @returns {function(*, *): *}
 */
export const setPasswordlessLogin = (params) => (dispatch, getState) => {
    return dispatch(passwordlessLogin(params))
        .then((res) => {
            return dispatch(getUserProfile()).then(() => res);
        }).catch((e) => {
            console.log(e);
            return Promise.reject(e);
        })
}

export const getScheduleSyncLink = () => async (dispatch) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
    };

    return postRequest(
        null,
        createAction(SCHEDULE_SYNC_LINK_RECEIVED),
        `${window.SUMMIT_API_BASE_URL}/api/v1/summits/${window.SUMMIT_ID}/members/me/schedule/shareable-link`,
        null,
        customErrorHandler,
    )(params)(dispatch).catch((e) => {
        console.log('ERROR: ', e);
        clearAccessToken();
        return e;
    });
};

export const setUserOrder = (order) => (dispatch) => Promise.resolve().then(() => {
    return dispatch(createAction(SET_USER_ORDER)(order));
})

export const checkOrderData = (order) => (dispatch, getState) => {
    if (!order) return;

    const {userState: {idpProfile: {company, given_name, family_name, email}}} = getState();
    const {owner_company, owner_first_name, owner_last_name, owner_email} = order || {};

    // only change data if I am the order owner
    if (owner_email === email && (owner_company !== company || owner_first_name !== given_name || owner_last_name !== family_name)) {
        const newProfile = {
            first_name: owner_first_name,
            last_name: owner_last_name,
            company: owner_company
        };
        dispatch(updateProfile(newProfile));
    }
}

export const ticketOwnerChange = (ticket) => async (dispatch) => {
    return dispatch(createAction(TICKET_OWNER_CHANGED)(ticket));
}

/**
 * Peform virtual checking at show time for the current attendee
 * @param attendee
 * @returns {function(*=, *): *}
 */
export const doVirtualCheckIn = (attendee) => async (dispatch, getState) => {

    const accessToken = await getAccessTokenSafely()
        .catch(() => {
            dispatch(stopLoading());
            return Promise.reject();
        });

    let params = {
        access_token: accessToken,
    };

    return putRequest(
        null,
        createAction(UPDATE_EXTRA_QUESTIONS),
        `${window.API_BASE_URL}/api/v1/summits/${attendee.summit_id}/attendees/${attendee.id}/virtual-check-in`,
        {},
        voidErrorHandler
    )(params)(dispatch).catch((e) => {
        console.log('ERROR: ', e);
        clearAccessToken();
        return e;
    });
};

/**
 * Get invitation by token to allow reject
 * @param token
 * @returns {function(*=, *): *}
 */
export const getInvitation = (token) => async (dispatch) => {
    dispatch(startLoading());
    return getRequest(
        createAction(REQUEST_INVITATION),
        createAction(RECEIVE_INVITATION),
        `${window.API_BASE_URL}/api/public/v1/summits/${window.SUMMIT_ID}/registration-invitations/${token}`,
        null
    )({})(dispatch)
        .finally(() => dispatch(stopLoading()));
}

/**
 * Reject invitation by token
 * @param token
 * @returns {function(*=, *): *}
 */
export const rejectInvitation = (token) => async (dispatch) => {
    dispatch(startLoading());
    return deleteRequest(
        null,
        createAction(REJECT_INVITATION),
        `${window.API_BASE_URL}/api/public/v1/summits/${window.SUMMIT_ID}/registration-invitations/${token}/reject`,
        {},
        null
    )({})(dispatch)
        .finally(() => dispatch(stopLoading()));
}


export const getRSVPInvitation = (token, eventId) => async (dispatch) => {
  let params = {
    fields: "status,event_id",
    relations: "none"
  };

  return getRequest(
    createAction(REQUEST_RSVP_INVITATION),
    createAction(RECEIVE_RSVP_INVITATION),
    `${window.API_BASE_URL}/api/public/v1/summits/${window.SUMMIT_ID}/events/${eventId}/rsvp-invitations/${token}`,
    null,
  )(params)(dispatch)
    .catch(({ err }) => {
      let code = err.status;
      let msg = '';
      switch (code) {
        case 401:
          console.log('authErrorHandler 401 - re login');
          expiredToken(err);
          break;
        case 404:
          msg = "";
          if (err.response.body && err.response.body.message) msg = err.response.body.message;
          else if (err.response.error && err.response.error.message) msg = err.response.error.message;
          else msg = err.message;
          dispatch(createAction(RSVP_INVITATION_ERROR)({ errorMessage: msg }))
          break;
        case 412:
          for (var [key, value] of Object.entries(err.response.body.errors)) {
            if (isNaN(key)) {
              msg += key + ': ';
            }
            msg += value + '<br>';
          }
          dispatch(createAction(RSVP_INVITATION_ERROR)({ errorMessage: msg }))
          break;
        default:
          dispatch(createAction(RSVP_INVITATION_ERROR)({ errorMessage: "Internal Error. Please contact support " }))
          break;
      }
    })
    .finally(() => dispatch(stopLoading()));
}

export const acceptRSVPInvitation = (token, eventId) => async (dispatch) => {

  let params = {
    expand: "rsvp",
    fields: "status,event_id,rsvp.seat_type,rsvp.event_id",
    relations: "event.none,rsvp.none"
  };

  return putRequest(
    null,
    createAction(RSVP_INVITATION_ACCEPTED),
    `${window.API_BASE_URL}/api/public/v1/summits/${window.SUMMIT_ID}/events/${eventId}/rsvp-invitations/${token}/accept`,
    null,
    customRSVPHandler
  )(params)(dispatch)
    .catch((err) => console.log("ERROR: ", err))
    .finally(() => dispatch(stopLoading()));
}

export const declineRSVPInvitation = (token, eventId) => async (dispatch) => {
  let params = {
    fields: "status,event_id",
    relations: "event.none"
  };

  return deleteRequest(
    null,
    createAction(RSVP_INVITATION_REJECTED),
    `${window.API_BASE_URL}/api/public/v1/summits/${window.SUMMIT_ID}/events/${eventId}/rsvp-invitations/${token}/decline`,
    null,
    customRSVPHandler
  )(params)(dispatch)
    .catch((err) => console.log("ERROR: ", err))
    .finally(() => dispatch(stopLoading()));
}