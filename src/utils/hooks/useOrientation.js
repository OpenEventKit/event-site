import { useState, useEffect } from "react";

const useOrientation = () => {
  const getOrientation = () => window.innerHeight > window.innerWidth;
  
  const [isPortrait, setIsPortrait] = useState(getOrientation());

  useEffect(() => {
    const checkOrientation = () => {
      const portrait = getOrientation();
      setIsPortrait(portrait);
    };

    // Check on mount
    checkOrientation();

    // Add event listeners
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return { isPortrait, isLandscape: !isPortrait };
};

export default useOrientation;