import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchTrackById} from "../../actions/fetch-entities-actions";
import {
  BUCKET_EVENTS_DATA_KEY,
  BUCKET_SUMMIT_DATA_KEY,
  saveFile
} from "../../utils/dataUpdatesUtils";
import moment from "moment-timezone";
/**
 * TrackSynchStrategy
 */
class TrackSynchStrategy extends AbstractSynchStrategy{

  async process(payload){

    console.log(`TrackSynchStrategy::process`, payload);

    const {entity_operator, entity_id} = payload;

    const entity = await fetchTrackById(this.summit.id, entity_id, this.accessToken);

    if (entity_operator === 'UPDATE') {
      if (!entity) return Promise.reject('TrackSynchStrategy::process entity not found.');

      // update summit

      this.summit = {
        ...this.summit,
        timestamp : moment().unix(),
        tracks : this.summit.tracks.map(t => {
          if(t?.id === entity_id) return {...t, ...entity};

          return {...t, subtracks: t.subtracks.map(st => {
              if(st?.id === entity_id) return {...st, ...entity};
              return st;
            })};
        })
      };
      // update events
      this.allEvents = this.allEvents.map(ev => {
        if (ev?.track?.id === entity_id) return ({...ev, track: entity});
        return ev;
      })

      // update files on cache
      console.log(`TrackSynchStrategy::process updating cache files`);

      try {
        const localNowUtc = Date.now();

        await saveFile(this.summit.id, BUCKET_EVENTS_DATA_KEY, this.allEvents, localNowUtc);
        await saveFile(this.summit.id, BUCKET_SUMMIT_DATA_KEY, this.summit, localNowUtc);

      }
      catch (e){
        console.log(e);
      }

      let res = {
        payload,
        entity,
        summit : this.summit,
        eventsData: this.allEvents,
        allIDXEvents : this.allIDXEvents,
        allSpeakers : this.allSpeakers,
        allIDXSpeakers : this.allIDXSpeakers
      };

      console.log(`TrackSynchStrategy::process done`, res);

      return Promise.resolve(res);
    }
  }
}

export default TrackSynchStrategy;
