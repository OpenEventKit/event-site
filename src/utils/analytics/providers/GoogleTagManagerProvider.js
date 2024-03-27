import AnalyticsProvider from "../AnalyticsProvider";
import { getEnvVariable, GOOGLE_TAGMANAGER_ID } from "@utils/envVariables";

class GoogleTagManagerProvider extends AnalyticsProvider {
  constructor() {
    super();
    if (!getEnvVariable(GOOGLE_TAGMANAGER_ID)) {
      console.warn("GoogleTagManagerProvider: GOOGLE_TAGMANAGER_ID environment variable is not set. Tracking will be disabled.");
    }
    this.dataLayer = (typeof window !== 'undefined' && window.dataLayer) || [];
  }

  gtag() {
    this.dataLayer.push(arguments);
  };

  trackEvent = (eventName, eventParams) => {
    this.gtag("event", eventName, eventParams);
  };

  config = (targetId, additionalConfig) => {
    this.gtag("config", targetId, additionalConfig);
  };

  set = (parameters) => {
    this.gtag("set", parameters);
  };

  get = (target, fieldName, callback) => {
    this.gtag("get", target, fieldName, callback);
  };

  consent = (consentArg, consentParams) => {
    this.gtag("consent", consentArg, consentParams);
  };
}

export default GoogleTagManagerProvider;
