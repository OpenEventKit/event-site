import { useEffect } from "react";
import CustomEventManager from "./CustomEventManager";

const useCustomEvent = (eventName, callback) => {
  useEffect(() => {
    CustomEventManager.addEventListener(eventName, callback);
    return () => {
      CustomEventManager.removeEventListener(eventName, callback);
    };
  }, [eventName, callback]);
};

export default useCustomEvent;
