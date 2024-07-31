class EventEmitter extends EventTarget {
  static instance;

  constructor() {
    if (EventEmitter.instance) {
      return EventEmitter.instance;
    }
    super();
    EventEmitter.instance = this;
  }

  emit(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    this.dispatchEvent(event);
  }

  on(eventName, callback, options) {
    this.addEventListener(eventName, callback, options);
  }

  off(eventName, callback, options) {
    this.removeEventListener(eventName, callback, options);
  }
}

export default EventEmitter;