import { initLogOut, getAccessToken } from 'openstack-uicore-foundation/lib/security/methods'
import * as Sentry from '@sentry/react'
import {
  getEnvVariable,
  AUTHORIZED_DEFAULT_PATH
} from "./envVariables";

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
    console.log("getAccessToken error: ", e);
    Sentry.captureException(e)
    initLogOut();
    return Promise.reject();
  }
};
