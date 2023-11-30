import { applyMiddleware, compose, createStore, combineReducers } from "redux";
import { persistCombineReducers, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import thunk from "redux-thunk";

import * as reducers from "../reducers";

// Get from process.env because window is not set yet
const clientId = process.env.GATSBY_OAUTH2_CLIENT_ID;
const summitID = process.env.GATSBY_SUMMIT_ID;

const config = {
  key: `root_${clientId}_${summitID}`,
  storage,
  blacklist: [
    // this will be not saved to persistent storage see
    // https://github.com/rt2zz/redux-persist#blacklist--whitelist
    "summitState",
    "allSchedulesState",
    "presentationsState",
    "eventState",
    "speakerState",
    "sponsorState",
  ],
};

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

// Create store without persistor
export const storeWithoutPersistor = createStore(
    combineReducers(states),
    enhancer
);

// Create store with persistor
export const { store, persistor } = (() => {
  const persistedReducers = persistCombineReducers(config, states);

  const store = createStore(persistedReducers, enhancer);
  const onRehydrateComplete = () => {};
  const persistor = persistStore(store, null, onRehydrateComplete);

  return { store, persistor };
})();
