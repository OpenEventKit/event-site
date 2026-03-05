import Swal from "sweetalert2";
import { doLogin } from 'openstack-uicore-foundation/lib/security/methods'
import URI from "urijs"
import { savePendingAction } from "./schedule";
import { getEnvVariable, TENANT_ID } from "@utils/envVariables";

const swalCustomClass = {
    container: 'swal-wrapper',
    title: 'swal-title',
    icon: 'swal-icon',
    content: 'swal-body',
    confirmButton: 'swal-confirm',
    cancelButton: 'swal-cancel',
};

export const StyledSwal = Swal.mixin({
    customClass: swalCustomClass
});

// Simple notifications
export const alertSuccess = (title, message) => StyledSwal.fire(title, message, 'success');
export const alertError = (title, message) => StyledSwal.fire(title, message, 'error');
export const alertWarning = (title, message) => StyledSwal.fire(title, message, 'warning');

// Confirmation dialog with callback
export const confirmAction = (title, html, confirmLabel, onConfirm, cancelLabel = 'Dismiss') => {
    StyledSwal.fire({
        title,
        html,
        icon: 'question',
        iconHtml: '!',
        showCancelButton: true,
        confirmButtonText: confirmLabel,
        cancelButtonText: cancelLabel,
        width: '400px',
        reverseButtons: true,
    }).then((result) => {
        if (result.value) {
            onConfirm();
        }
    })
};

export const needsLogin = (action, msg = null) => {
    const defaultMessage = "Please log in to add sessions to My Schedule.";
    const login = () => {
        let backUrl = window?.location?.href ?? '/a';
        let encodedBackUrl = URI.encode(backUrl);
        if (action) savePendingAction(action);
        return doLogin(encodedBackUrl, null, null, null, null, getEnvVariable(TENANT_ID));
    }
    confirmAction('Login', msg || defaultMessage, 'Login', login, 'OK');
};
