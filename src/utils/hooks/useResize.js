import { useCallback } from "react";
import useEventListener from "./useEventListener";

const useResize = (callback, options = { passive: true }) => {
  const handleResize = useCallback(() => {
    if (typeof callback === "function") {
      callback();
    }
  }, [callback]);

  useEventListener("resize", handleResize, options);
};

export default useResize;
