import storage from "redux-persist/lib/storage";
import { dropTransientUserFlags } from "./persistTransforms";

// Get from process.env because window is not set yet
const clientId = process.env.GATSBY_OAUTH2_CLIENT_ID;
const summitID = process.env.GATSBY_SUMMIT_ID;

export const persistConfig = {
  key: `root_${clientId}_${summitID}`,
  storage,
  transforms: [dropTransientUserFlags],
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
