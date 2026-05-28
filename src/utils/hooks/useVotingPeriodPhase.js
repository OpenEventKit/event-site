import { useClockSelector } from "openstack-uicore-foundation/lib/components/clock-context";
import { getVotingPeriodPhase } from "../phasesUtils";

export const useVotingPeriodPhase = (votingPeriod) =>
  useClockSelector((nowUtc) => (votingPeriod ? getVotingPeriodPhase(votingPeriod, nowUtc) : null));

const shallowEqualPhasesMap = (a, b) => {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  return keysA.every((k) => a[k] === b[k]);
};

export const useVotingPeriodsPhasesMap = (votingPeriods) =>
  useClockSelector(
    (nowUtc) => {
      const result = {};
      if (votingPeriods && nowUtc) {
        Object.entries(votingPeriods).forEach(([id, vp]) => {
          if (vp) result[id] = getVotingPeriodPhase(vp, nowUtc);
        });
      }
      return result;
    },
    shallowEqualPhasesMap
  );
