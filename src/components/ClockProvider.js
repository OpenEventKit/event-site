import React from "react";
import { useSelector } from "react-redux";
import { ClockProvider as UICoreClockProvider } from "openstack-uicore-foundation/lib/components/clock-context";

const ClockProvider = ({ children }) => {
  const summit = useSelector((state) => state.summitState.summit);
  return (
    <UICoreClockProvider
      timezone={summit?.time_zone_id || "UTC"}
      now={Math.round(Date.now() / 1000)}
    >
      {children}
    </UICoreClockProvider>
  );
};

export default ClockProvider;
