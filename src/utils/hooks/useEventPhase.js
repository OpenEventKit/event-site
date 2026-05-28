import { useClockSelector } from "openstack-uicore-foundation/lib/components/clock-context";
import { getEventPhase } from "../phasesUtils";

export const useEventPhase = (event) =>
  useClockSelector((nowUtc) => (event ? getEventPhase(event, nowUtc) : null));
