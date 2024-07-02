import { useEffect } from "react";
import EventEmitter from "../EventEmitter";

const eventEmitter = new EventEmitter();

const useEventListener = (eventName, callback, options) => {
  useEffect(() => {
    eventEmitter.on(eventName, callback, options);
    return () => {
      eventEmitter.off(eventName, callback, options);
    };
  }, [eventName, callback, options]);
};

export default useEventListener;
