import React from "react";
import HeroComponent from "../components/HeroComponent";
import useSiteSettings from "@utils/useSiteSettings";

import "../styles/bulma.scss";

const MaintenancePage = () => {
  const { maintenanceMode: { title, subtitle } } = useSiteSettings();

  return (
    <HeroComponent
      title={title}
      subtitle={subtitle}
    />
  );
};

export default MaintenancePage;
