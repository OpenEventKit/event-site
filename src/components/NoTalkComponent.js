import React from "react"
import HeroComponent from './HeroComponent'
import { epochToMomentTimeZone } from "openstack-uicore-foundation/lib/utils/methods";
import { PHASES } from '../utils/phasesUtils';

const NoTalkComponent = ({ event, currentEventPhase, summit }) => {

  const { class_name, start_date, title } = event;
  const { time_zone_id } = summit;

  return (
    <div className={`columns talk px-3 py-3`}>
      <HeroComponent
        title={title}
        subtitle={
          class_name !== 'Presentation' ?
            'Next session will start soon...'
            :
              (currentEventPhase === PHASES.AFTER || currentEventPhase === PHASES.DURING) && !event.streaming_url ?
              'Session is over. Recording will be available soon.'
              :
                 currentEventPhase < PHASES.DURING || !event.streaming_url ?
                `This session will be available on ${epochToMomentTimeZone(start_date, time_zone_id).format('MMMM D hh:mm A (z)')}`
                :
                ''
        }
        event={true}
      />
    </div>
  )
};

export default NoTalkComponent;