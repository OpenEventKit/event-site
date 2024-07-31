import TagManagerProvider from "./TagManagerProvider";
import EventEmitter from "../EventEmitter";
import { TAG_MANAGER_TRACK_EVENT, TAG_MANAGER_CONSENT_EVENT } from "../eventTriggers";
import { normalizeData } from "../dataNormalization";

const eventEmitter = new EventEmitter();

class TagManager {
  constructor() {
    this.providers = [];
    eventEmitter.on(TAG_MANAGER_TRACK_EVENT, this.handleTrackEvent.bind(this));
    eventEmitter.on(TAG_MANAGER_CONSENT_EVENT, this.handleConsentEvent.bind(this));
  }

  addProvider(provider) {
    if (!(provider instanceof TagManagerProvider)) {
      throw new Error("An instance of TagManagerProvider is required.");
    }
    this.providers.push(provider);
  }

  trackEvent = (eventName, eventParams) => {
    this.providers.forEach(provider => provider.trackEvent(eventName, normalizeData(eventParams)));
  }

  handleTrackEvent = (event) => {
    const { eventName, eventParams } = event.detail;
    this.trackEvent(eventName, eventParams);
  }

  consent = (consentArg, consentParams) => {
    this.providers.forEach(provider => provider.consent && provider.consent(consentArg, consentParams));
  }

  handleConsentEvent = (event) => {
    const { consentArg, consentParams } = event.detail;
    this.consent(consentArg, consentParams);
  }
}

export default TagManager;
