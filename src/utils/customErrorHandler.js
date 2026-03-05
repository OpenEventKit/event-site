import expiredToken from './expiredToken';
import { alertWarning } from '@utils/alerts';
import {RSVP_INVITATION_ERROR} from "../actions/user-actions";
import {
    createAction,
    stopLoading,
} from 'openstack-uicore-foundation/lib/utils/actions';


export const customErrorHandler = (err, res) => (dispatch, state) => {
  let code = err.status;
  dispatch(stopLoading());
  let msg = '';
  switch (code) {
    case 401:
      console.log('authErrorHandler 401 - re login');
      expiredToken(err);
      break;
    case 412:
      const errors = err?.response?.body?.errors;
      if(errors) {
        for (let [key, value] of Object.entries(errors)) {
          if (isNaN(key)) {
            msg += key + ': ';
          }
          msg += value + '<br>';
        }
      } else {
        msg = 'There was a problem with our server, please contact admin.';
      }
      alertWarning("Validation error", msg);
      break;
    default:
      break;
  }
}

export const voidErrorHandler = (err, res) => (dispatch, state) => {
  let code = err.status;
  dispatch(stopLoading());
  let msg = '';
  switch (code) {
    case 401:
      console.log('authErrorHandler 401 - re login');
      expiredToken(err);
      break;
    default:
      break;
  }
}

export const customBadgeHandler = (err, res) => (dispatch, state) => {
  let code = err.status;
  dispatch(stopLoading());
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

      alertWarning("Not Found", msg);

      break;
    case 412:
      for (var [key, value] of Object.entries(err.response.body.errors)) {
        if (isNaN(key)) {
          msg += key + ': ';
        }

        msg += value + '<br>';
      }
      alertWarning("Validation error", msg);
      break;
    default:
      break;
  }
}

export const customRSVPHandler = (err, res) => (dispatch, state) => {
  let code = err.status;
  dispatch(stopLoading());
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
}