import { useEffect, useRef, useState } from "react";
import { PHASES } from "../phasesUtils";

const formatDate = (epochSeconds) => new Date(epochSeconds * 1000).toLocaleDateString("en-US");
const formatTime = (epochSeconds) => new Date(epochSeconds * 1000).toLocaleTimeString("en-US");

const votingEndedMessage = (vp) =>
  `Voting has ended. ${vp.name} does not allow for votes after ${formatDate(vp.endDate)} ${formatTime(vp.endDate)}`;

const maxVotesMessage = (vp) =>
  `You've reached your maximum votes. ${vp.name} only allows for ${vp.maxAttendeeVotes} votes per attendee`;

export const useVotingPeriodNotifications = ({
  trackGroups,
  votingPeriods,
  votingPeriodsPhases,
  votedTrackGroups,
  onVotedTrackGroupsHandled,
  pushNotification,
}) => {
  const [notifiedOnLoad, setNotifiedOnLoad] = useState(false);
  const [notifiedMaxVotesOnLoad, setNotifiedMaxVotesOnLoad] = useState(false);
  const previousPhasesRef = useRef(votingPeriodsPhases);

  useEffect(() => {
    const previousPhases = previousPhasesRef.current;
    const allLoaded = trackGroups.length && trackGroups.every((tg) => votingPeriods[tg] !== undefined);
    if (!allLoaded) return;

    // Initial-load phase notification (BEFORE or AFTER on first observable load).
    if (!notifiedOnLoad) {
      trackGroups.forEach((tg) => {
        const vp = votingPeriods[tg];
        const phase = votingPeriodsPhases[tg];
        if (phase === PHASES.BEFORE) {
          pushNotification(`Voting has not begun. ${vp.name} will allow for votes starting on ${formatDate(vp.startDate)} ${formatTime(vp.startDate)}`);
          setNotifiedOnLoad(true);
        } else if (phase === PHASES.AFTER) {
          pushNotification(votingEndedMessage(vp));
          setNotifiedOnLoad(true);
        }
      });
    }

    // Phase transitions (BEFORE->DURING, DURING->AFTER).
    const previousAllLoaded = trackGroups.every((tg) => previousPhases[tg] !== undefined);
    if (previousAllLoaded) {
      trackGroups.forEach((tg) => {
        const vp = votingPeriods[tg];
        const prev = previousPhases[tg];
        const next = votingPeriodsPhases[tg];
        if (prev === PHASES.BEFORE && next === PHASES.DURING) {
          pushNotification(`Voting has now begun! You are allowed ${vp.maxAttendeeVotes} votes in ${vp.name}`);
        } else if (prev === PHASES.DURING && next === PHASES.AFTER) {
          pushNotification(votingEndedMessage(vp));
        }
      });
    }

    // Max-votes notification.
    if (!notifiedMaxVotesOnLoad) {
      trackGroups.forEach((tg) => {
        const vp = votingPeriods[tg];
        if (votingPeriodsPhases[tg] === PHASES.DURING && vp.remainingVotes === 0) {
          pushNotification(maxVotesMessage(vp));
          setNotifiedMaxVotesOnLoad(true);
        }
      });
    } else if (votedTrackGroups?.length && votedTrackGroups.every((tg) => votingPeriods[tg] !== undefined)) {
      votedTrackGroups.forEach((tg) => {
        const vp = votingPeriods[tg];
        if (votingPeriodsPhases[tg] === PHASES.DURING && vp.remainingVotes === 0) {
          pushNotification(maxVotesMessage(vp));
          onVotedTrackGroupsHandled?.();
        }
      });
    }

    previousPhasesRef.current = votingPeriodsPhases;
  }, [trackGroups, votingPeriods, votingPeriodsPhases, votedTrackGroups]);
};
