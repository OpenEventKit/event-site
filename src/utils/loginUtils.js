import { getAccessToken } from 'openstack-uicore-foundation/lib/security/methods'
import {
  AUTH_ERROR_MISSING_AUTH_INFO,
  AUTH_ERROR_MISSING_REFRESH_TOKEN,
  AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR
} from 'openstack-uicore-foundation/lib/security/constants'
import * as Sentry from '@sentry/react'
import {
  getEnvVariable,
  AUTHORIZED_DEFAULT_PATH
} from "./envVariables";
import { navigate } from "gatsby";
import { triggerLogoutEvent } from "@utils/eventTriggers";

export const onLogOut = (backUrl = null) => {
  triggerLogoutEvent();
  navigate("/auth/logout", {
    state: {
      backUrl: backUrl || window.location.pathname
    }
  });
}

export const getDefaultLocation = (
  eventRedirect,
  hasVirtualAccess = false
) => {
  const defaultRedirect = hasVirtualAccess ? "/a/" : "/";
  return eventRedirect ? `/a/event/${eventRedirect}` : getEnvVariable(AUTHORIZED_DEFAULT_PATH) ? getEnvVariable(AUTHORIZED_DEFAULT_PATH) : defaultRedirect;
}

const buttonPropertyMapping = {
  buttonColor: "button_color",
  buttonBorderColor: "button_border_color",
  providerLabel: "provider_label",
  providerParam: "provider_param",
  providerLogo: "provider_logo",
  providerLogoSize: "provider_logo_size"
};

const mapIdentityProviderButtonProperties = (button) => {
  const formattedButton = {};
  for (const key in button) {
    const mappedKey = buttonPropertyMapping[key] || key;
    formattedButton[mappedKey] = key === "providerLogo" ? button[key]?.publicURL : button[key];
  }
  return formattedButton;
};

/**
 * Validates identity provider buttons provided in CMS with those social providers available through IDP API.
 * Filters out invalid or disabled buttons.
 * @param {Array} indentityProviderButtons Array of identity provider buttons provided by CMS.
 * @param {Array} availableSocialProviders Array of available social providers provided by IDP API.
 * @returns {Array} Filtered array of identity provider buttons.
 */
export const validateIdentityProviderButtons = (
  identityProviderButtons,
  availableSocialProviders
) => {
  if (!identityProviderButtons || !availableSocialProviders) {
    return [];
  }
  const filteredButtons = identityProviderButtons
    .map(mapIdentityProviderButtonProperties)
    .filter(button =>
      // default identity provider has no providerParam set
      !button[buttonPropertyMapping.providerParam] ||
      availableSocialProviders.includes(button[buttonPropertyMapping.providerParam])
    );

  return filteredButtons;
};

export const getAccessTokenSafely = async () => {
  try {
    return await getAccessToken();
  } catch (e) {
    console.log("loginUtils::getAccessToken error: ", e);
    Sentry.captureException(e)
    onLogOut();
    return Promise.reject();
  }
};

// errors after which the session can't be recovered, retrying would only replay a dead refresh token
const UNRECOVERABLE_AUTH_ERRORS = [
  AUTH_ERROR_REFRESH_TOKEN_REQUEST_ERROR,
  AUTH_ERROR_MISSING_REFRESH_TOKEN,
  AUTH_ERROR_MISSING_AUTH_INFO
];

export const isUnrecoverableAuthError = (e) =>
  UNRECOVERABLE_AUTH_ERRORS.some((code) => e?.message?.startsWith(code));

// for widgets that get getAccessToken: logs out on an unrecoverable error, network errors are left to the widget
export const getAccessTokenOrLogOut = async () => {
  try {
    return await getAccessToken();
  } catch (e) {
    if (isUnrecoverableAuthError(e)) {
      onLogOut();
    }
    throw e;
  }
};
