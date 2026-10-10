import {
  ACCESS_TOKEN_SKEW_TIME,
  getAccessToken,
  getAuthInfo,
} from "openstack-uicore-foundation/lib/security/methods";

export const MAX_REFRESH_DELAY_MS = 10000;

// True when getAccessToken() would call the IDP. Mirrors the refresh trigger of
// the private _getAccessToken in openstack-uicore-foundation 4.2.34
// (src/components/security/methods.js:330-341), which uicore does not export:
// recheck it on any uicore version bump.
const wouldRefreshAtIdp = (authInfo) => {
  if (!authInfo) return false;
  const { accessToken, expiresIn, accessTokenUpdatedAt } = authInfo;
  const elapsedSecs = Math.floor(Date.now() / 1000) - accessTokenUpdatedAt;
  return accessToken == null || elapsedSecs >= expiresIn - ACCESS_TOKEN_SKEW_TIME;
};

let pending = null;

/**
 * Same result as getAccessToken(), but a tab whose token is expired or about
 * to expire first waits a random 0-10 s, so the refreshes triggered by one
 * real-time push do not reach the IDP in the same second. Calls made while a
 * delay or refresh is pending share it, so they resolve in call order.
 */
export const getAccessTokenWithRefreshSpread = () => {
  if (pending) return pending;

  const run = (async () => {
    if (wouldRefreshAtIdp(getAuthInfo())) {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * MAX_REFRESH_DELAY_MS)
      );
    }
    return getAccessToken();
  })();

  pending = run;
  // registered before any caller's handlers, so callers resume with pending cleared
  const release = () => {
    if (pending === run) pending = null;
  };
  run.then(release, release);

  return run;
};
