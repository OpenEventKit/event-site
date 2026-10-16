import { createTransform } from "redux-persist";
import { getAuthInfo } from "openstack-uicore-foundation/lib/security/methods";

/**
 * userState persists so the profile paints without a fetch, but loading /
 * loadingIDP only describe requests the writing session had in flight. A
 * fetch interrupted by a reload leaves loading: true in localStorage;
 * rehydrated as-is, the widget shows a profile-loading state for a request
 * that no longer exists. Reset both on the way back in; the write path is
 * untouched, so storage already holding a stale true heals on next load.
 */
export const dropTransientUserFlags = createTransform(
  null,
  (state) => ({ ...state, loading: false, loadingIDP: false }),
  { whitelist: ["userState"] }
);

// any tab can overwrite the persisted login flag; the shared authInfo token decides it on load
export const deriveLoggedInFromAuthInfo = createTransform(
  null,
  (state) => ({ ...state, isLoggedUser: !!getAuthInfo() }),
  { whitelist: ["loggedUserState"] }
);
