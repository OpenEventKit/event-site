import useCustomEvent from "./useCustomEvent";
import CustomEventManager from "./CustomEventManager";

export { useCustomEvent, CustomEventManager };

export const INIT_LOGOUT_EVENT = "site_logout";
export const ANALYTICS_TRACK_EVENT = "analytics_track_event";

export const triggerOnInitLogout = () => {
  CustomEventManager.dispatchEvent(INIT_LOGOUT_EVENT);
};

export const triggerAnalyticsTrackEvent = (eventName, eventParams) => {
  CustomEventManager.dispatchEvent(ANALYTICS_TRACK_EVENT, { eventName, eventParams });
};
