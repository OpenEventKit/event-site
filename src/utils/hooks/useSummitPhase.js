import { useSelector } from "react-redux";
import { useClockSelector } from "openstack-uicore-foundation/lib/components/clock-context";
import { getSummitPhase } from "../phasesUtils";

export const useSummitPhase = () => {
  const summit = useSelector((state) => state.summitState.summit);
  return useClockSelector((nowUtc) => getSummitPhase(summit, nowUtc));
};
