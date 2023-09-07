import expiredToken from './expiredToken';
import { stopLoading } from "openstack-uicore-foundation/lib/utils/actions";
import Swal from 'sweetalert2';

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
      for (let [key, value] of Object.entries(err.response.body.errors)) {
        if (isNaN(key)) {
          msg += key + ': ';
        }
        msg += value + '<br>';
      }      
      Swal.fire("Validation error", msg, "warning");
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

      Swal.fire("Not Found", msg, "warning");

      break;
    case 412:
      for (var [key, value] of Object.entries(err.response.body.errors)) {
        if (isNaN(key)) {
          msg += key + ': ';
        }

        msg += value + '<br>';
      }
      Swal.fire("Validation error", msg, "warning");
      break;
    default:
      break;
  }
}