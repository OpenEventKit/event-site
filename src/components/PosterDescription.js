import React, { useCallback } from 'react';
import VoteButton from './poster-card/vote-button';

import { PHASES } from '../utils/phasesUtils';

import styles from '../styles/poster-components.module.scss';

const PosterDescription = ({ poster: { speakers, title, description, custom_order, track }, poster, votingPeriods, votingPeriodsPhases, votes, isVoted, toggleVote, votingAllowed }) => {

  const isDuringVotingPhase = useCallback((poster) => {
    const results = poster.track?.track_groups?.map(trackGroupId =>
      votingPeriodsPhases[trackGroupId] === PHASES.DURING
    );
    return results && results.length ? results.every(r => !!r) : false;
  }, [votingPeriodsPhases]);

  const canVote = useCallback((poster) => {
    const results = poster.track?.track_groups?.map(trackGroupId =>
      votingPeriods[trackGroupId]?.remainingVotes > 0
    );
    return results && results.length ? results.every(r => !!r) : false;
  }, [votingPeriods]);

  const formatSpeakers = (speakers) => {
    let formatedSpeakers = '';
    if (speakers && speakers.length > 0) {
      speakers.forEach((speaker, index) => {
        formatedSpeakers += `${speaker.first_name} ${speaker.last_name}`;
        if (speakers.length > index + 2) formatedSpeakers += ', ';
        if (speakers.length - 2 === index) formatedSpeakers += ' & ';
      });
    }
    return formatedSpeakers;
  }

  return (
    <div className={`columns talk ${styles.posterDescriptionContainer}`}>
      <div className="column is-full">
        <div className={styles.posterUpperText}>
          {track?.name && track?.color &&
            <span className={styles.track} style={{ backgroundColor: track.color }}>{track.name}</span>
          }
          <span className={styles.order}>
            {custom_order ? `#${custom_order}` : <>&nbsp;</>}
          </span>
          { votingAllowed && isDuringVotingPhase(poster) &&
          <VoteButton
            isVoted={isVoted}
            canVote={canVote(poster)}
            toggleVote={() => toggleVote(poster, !isVoted)}
            style={{ position: 'relative', marginLeft: 'auto' }}
          />
          }
        </div>
        <h1>
          <b>{title}</b>
        </h1>
        <div className="talk__speaker">
          {speakers && speakers?.length === 0 ?
            null
            :
            speakers?.length < 10 ?
              <div className="columns is-multiline is-mobile">
                {speakers.map((s, index) => {
                  return (
                    <div className="column is-one-third-desktop is-half-mobile talk__speaker-container" key={index}>
                      <img alt="" src={s.pic} />
                      <div>
                        {`${s.first_name} ${s.last_name}`}
                        <br />
                        {s.title && <span dangerouslySetInnerHTML={{ __html: s.title }} />}
                        {s.company && <><span> - </span><span dangerouslySetInnerHTML={{ __html: s.company }} /></>}
                      </div>
                    </div>
                  )
                })
                }
              </div>
              :
              <span className="talk__speaker--name">
                {formatSpeakers(speakers)}
              </span>
          }
          <br />
          <div className="talk__description" dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        <br />
      </div>
    </div>
  )
}

export default PosterDescription;