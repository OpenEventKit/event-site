import { useClockSelector } from "openstack-uicore-foundation/lib/components/clock-context";

export const useClockMinute = () =>
  useClockSelector((nowUtc) => Math.floor((nowUtc ?? 0) / 60) * 60);
