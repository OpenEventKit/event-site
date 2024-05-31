import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchEventTypeById} from "../../actions/fetch-entities-actions";
import {
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_SUMMIT_DATA_KEY,
    saveFile
} from "../../utils/dataUpdatesUtils";

/**
 * ActivityTypeSynchStrategy
 */
class ActivityTypeSynchStrategy extends AbstractSynchStrategy{

    async process(payload){

        console.log(`ActivityTypeSynchStrategy::process`, payload);

        const {entity_operator, entity_id} = payload;

        const entity = await fetchEventTypeById(this.summit.id, entity_id, this.accessToken);

        if (entity_operator === 'UPDATE') {
            if (!entity) return Promise.reject('ActivityTypeSynchStrategy::process entity not found.');

            // update summit
            this.summit.event_types = [...this.summit.event_types.filter(et => et.id !== entity_id), entity]

            // update events
            this.allEvents = this.allEvents.map(ev => {
                if (ev.type.id === entity_id) return ({...ev, type: entity});
                return ev;
            })


            // update files on cache
            console.log(`ActivityTypeSynchStrategy::process updating cache files`);

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

            console.log(`ActivityTypeSynchStrategy::process done`, res);

            return Promise.resolve(res);
        }
    }
}

export default ActivityTypeSynchStrategy;