import { useState, useEffect } from "react";
import useEventListener from "./useEventListener";

const useOrientation = () => {
  const [isPortrait, setIsPortrait] = useState(false);

  const checkOrientation = () => {
    const portrait = window.innerHeight > window.innerWidth;
    setIsPortrait(portrait);
  };

  useEffect(() => {
    checkOrientation();
  }, []);

  useEventListener("resize", checkOrientation);
  useEventListener("orientationchange", checkOrientation);

  return { isPortrait, isLandscape: !isPortrait };
};

export default useOrientation;