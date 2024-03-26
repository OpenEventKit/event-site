import AnalyticsProvider from "./AnalyticsProvider";
import GoogleTagManagerProvider from "./providers/GoogleTagManagerProvider";

class AnalyticsManager {
  constructor(analyticsProvider) {
    if (!(analyticsProvider instanceof AnalyticsProvider)) {
      throw new Error("An instance of AnalyticsProvider is required.");
    }
    this.analyticsProvider = analyticsProvider;
  }

  get provider() {
    return this.analyticsProvider;
  }

  trackEvent(eventName, eventParams) {
    this.analyticsProvider.trackEvent(eventName, eventParams);
  }
}

const googleTagManagerProvider = new GoogleTagManagerProvider();
const analyticsManager = new AnalyticsManager(googleTagManagerProvider);

export default analyticsManager;
