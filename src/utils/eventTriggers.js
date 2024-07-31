import EventEmitter from "./EventEmitter";

export const INIT_LOGOUT_EVENT = "site_logout";
export const TAG_MANAGER_TRACK_EVENT = "tag_manager_track_event";
export const TAG_MANAGER_CONSENT_EVENT = "tag_manager_consent_event";

const eventEmitter = new EventEmitter();

export const triggerLogoutEvent = () => {
  eventEmitter.emit(INIT_LOGOUT_EVENT);
};

export const triggerTagManagerTrackEvent = (eventName, eventParams) => {
  eventEmitter.emit(TAG_MANAGER_TRACK_EVENT, { eventName, eventParams });
};

export const triggerTagManagerConsentEvent = (consentArg, consentParams) => {
  eventEmitter.emit(TAG_MANAGER_CONSENT_EVENT, { consentArg, consentParams });
};
