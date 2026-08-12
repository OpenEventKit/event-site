import { createTransform } from "redux-persist";

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
