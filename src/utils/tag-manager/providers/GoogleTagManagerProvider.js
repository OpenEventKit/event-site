import TagManagerProvider from "../TagManagerProvider";
import { getEnvVariable, GOOGLE_TAGMANAGER_ID } from "@utils/envVariables";

class GoogleTagManagerProvider extends TagManagerProvider {
  static instance;

  constructor() {
    if (GoogleTagManagerProvider.instance) {
      return GoogleTagManagerProvider.instance;
    }
    super();
    if (!getEnvVariable(GOOGLE_TAGMANAGER_ID)) {
      console.warn("GoogleTagManagerProvider: GOOGLE_TAGMANAGER_ID environment variable is not set. Tracking will be disabled.");
    }
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      this.dataLayer = window.dataLayer;
    } else {
      this.dataLayer = [];
    }
    GoogleTagManagerProvider.instance = this;
  }

  #gtag() {
    this.dataLayer.push(arguments);
  };

  trackEvent = (eventName, eventParams) => {
    this.#gtag("event", eventName, eventParams);
  };

  config = (targetId, additionalConfig) => {
    this.#gtag("config", targetId, additionalConfig);
  };

  set = (parameters) => {
    this.#gtag("set", parameters);
  };

  get = (target, fieldName, callback) => {
    this.#gtag("get", target, fieldName, callback);
  };

  consent = (consentArg, consentParams) => {
    this.#gtag("consent", consentArg, consentParams);
  };
}

export default GoogleTagManagerProvider;
