class AnalyticsProvider {
  trackEvent(eventName, eventParams) {
    throw new Error("trackEvent method must be implemented");
  }
}

export default AnalyticsProvider;
