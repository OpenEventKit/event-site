import AnalyticsProvider from "./AnalyticsProvider";
import { CustomEventManager, ANALYTICS_TRACK_EVENT } from "../customEvents";
import { normalizeData } from "@utils/dataNormalization";

class AnalyticsManager {
  constructor(analyticsProvider) {
    if (!(analyticsProvider instanceof AnalyticsProvider)) {
      throw new Error("An instance of AnalyticsProvider is required.");
    }
    this.analyticsProvider = analyticsProvider;
    CustomEventManager.addEventListener(ANALYTICS_TRACK_EVENT, this.handleTrackEvent.bind(this));
  }

  get provider() {
    return this.analyticsProvider;
  }

  handleTrackEvent = (event) => {
    const { eventName, eventParams } = event.detail;
    this.trackEvent(eventName, eventParams);
  }

  trackEvent = (eventName, eventParams) => {
    this.analyticsProvider.trackEvent(eventName, normalizeData(eventParams));
  }
}

export default AnalyticsManager;
