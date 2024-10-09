import React from "react";
import { connect } from "react-redux";
import Clock from "openstack-uicore-foundation/lib/components/clock";
import { updateClock } from "../actions/clock-actions";

const ClockComponent = ({
  active,
  summit,
  updateClock
}) => {
  if (!active || !summit) return null;
  return (
    <Clock onTick={(timestamp) => updateClock(timestamp)} timezone={summit.time_zone_id} />
  );
}

export default connect(null, { updateClock })(ClockComponent);
