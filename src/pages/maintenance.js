import React from "react";
import Interstitial from "../components/Interstitial";
import useSiteSettings from "@utils/useSiteSettings";

const MaintenancePage = () => {
  const { maintenanceMode: { title, subtitle } } = useSiteSettings();

  return (
    <Interstitial
      title={title}
      subtitle={subtitle}
    />
  );
};

export default MaintenancePage;
