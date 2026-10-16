import { applyMiddleware, compose, createStore } from "redux";
import { persistCombineReducers, persistStore } from "redux-persist";
import thunk from "redux-thunk";

import * as reducers from "../reducers";
import { persistConfig } from "./persistConfig";
import { getAuthInfo } from "openstack-uicore-foundation/lib/security/methods";
import { getUserProfile } from "../actions/user-actions";

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
    // logged in (per authInfo) but another tab persisted an empty profile: load it once
    const { loggedUserState, userState } = store.getState();
    if (loggedUserState?.isLoggedUser && !userState?.userProfile) {
      store.dispatch(getUserProfile());
    }
  };
  const persistor = persistStore(store, null, onRehydrateComplete);

  // another tab logged in or out (or its token refresh failed): reload when this tab no longer matches the shared token
  if (typeof window !== "undefined") {
    window.addEventListener("storage", ({ key }) => {
      // null = localStorage.clear() on logout
      if (key !== "authInfo" && key !== null) return;
      const hasAuthInfo = !!getAuthInfo();
      if (!!store.getState().loggedUserState?.isLoggedUser === hasAuthInfo) return;
      persistor.pause();
      // login: resume the page the login redirect came from (WithAuthRoute keeps it in the history state)
      const backUrl = window.history.state?.backUrl;
      if (hasAuthInfo && backUrl) window.location.replace(backUrl);
      else window.location.reload();
    });
  }

  return { store, persistor };
})();
