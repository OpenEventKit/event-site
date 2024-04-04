class CustomEventManager {
  static dispatchEvent = (eventName, eventData, target = window) => {
    if (typeof target !== "undefined") {
      const event = new CustomEvent(eventName, { detail: eventData });
      target.dispatchEvent(event);
    }
  };

  static addEventListener = (eventName, callback, target = window) => {
    if (typeof target !== "undefined") {
      target.addEventListener(eventName, callback);
    }
  };

  static removeEventListener = (eventName, callback, target = window) => {
    if (typeof target !== "undefined") {
      target.removeEventListener(eventName, callback);
    }
  };
}

export default CustomEventManager;
