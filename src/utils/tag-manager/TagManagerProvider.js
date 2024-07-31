class TagManagerProvider {
  trackEvent = (eventName, eventParams) => {
    throw new Error("trackEvent method must be implemented");
  }
}

export default TagManagerProvider;
