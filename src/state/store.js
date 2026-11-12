import { applyMiddleware, compose, createStore } from "redux";
import { persistCombineReducers, persistStore } from "redux-persist";
import thunk from "redux-thunk";

import * as reducers from "../reducers";
import { persistConfig } from "./persistConfig";
import { getAuthInfo } from "openstack-uicore-foundation/lib/security/methods";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";

const states = {
  loggedUserState: reducers.loggedUserReducer,
  settingState: reducers.settingReducer,
  userState: reducers.userReducer,
  clockState: reducers.clockReducer,
  summitState: reducers.summitReducer,
  allSchedulesState: reducers.allSchedulesReducer,
  presentationsState: reducers.presentationsReducer,
  eventState: reducers.eventReducer,
  speakerState: reducers.speakerReducer,
  sponsorState: reducers.sponsorReducer,
  extraQuestionState: reducers.extraQuestionsReducer,
};

const appendLoggedUser = ({ getState }) => (next) => (action) => {
  const { userState: { userProfile } } = getState();
  action.userProfile = userProfile;
  return next(action);
};

const composeEnhancers = typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    : compose;

const enhancer = composeEnhancers(applyMiddleware(appendLoggedUser, thunk));

// Create store with persistor
export const { store, persistor } = (() => {
  const persistedReducers = persistCombineReducers(persistConfig, states);

  const store = createStore(persistedReducers, enhancer);
  const onRehydrateComplete = () => {
    // no shared token: drop the previous session's profile, isAuthorized and hasTicket too
    if (!getAuthInfo() && store.getState().userState?.userProfile) {
      store.dispatch({ type: LOGOUT_USER, payload: {} });
    }
  };
  const persistor = persistStore(store, null, onRehydrateComplete);

  if (typeof window !== "undefined") {
    // logged in here, but another tab cleared the shared token (logout, failed refresh or a re-auth still at the IDP)
    const hasStaleLogin = () => !!store.getState().loggedUserState?.isLoggedUser && !getAuthInfo();
    // wait for focus: a re-auth in another tab has usually restored the token by the time the user comes back
    const reloadIfStaleLogin = () => {
      if (!document.hasFocus() || !hasStaleLogin()) return;
      persistor.pause();
      window.location.reload();
    };
    window.addEventListener("storage", ({ key }) => {
      // null = localStorage.clear() on logout
      if (key === "authInfo" || key === null) reloadIfStaleLogin();
    });
    window.addEventListener("focus", reloadIfStaleLogin);
  }

  return { store, persistor };
})();
