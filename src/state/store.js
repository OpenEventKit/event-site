import { applyMiddleware, compose, createStore } from "redux";
import { persistCombineReducers, persistStore } from "redux-persist";
import thunk from "redux-thunk";
import { doLogout } from "openstack-uicore-foundation/lib/security/actions";

import * as reducers from "../reducers";
import { persistConfig } from "./persistConfig";
import { onLogoutBroadcast } from "../utils/logoutBroadcast";

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
  const onRehydrateComplete = () => {};
  const persistor = persistStore(store, null, onRehydrateComplete);

  // another tab logged out and cleared authInfo: drop the logged in state here too, so it is not persisted again
  onLogoutBroadcast(() => {
    if (store.getState().loggedUserState?.isLoggedUser) {
      store.dispatch(doLogout());
    }
  });

  return { store, persistor };
})();
