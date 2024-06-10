import { useEffect, useCallback } from "react";

const useResize = (callback, options = { passive: true }) => {
  const handleResize = useCallback(() => {
    if (typeof callback === "function") {
      callback();
    }
  }, [callback]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize, options);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);
};

export default useResize;
