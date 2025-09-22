import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchSummitById} from "../../actions/fetch-entities-actions";
import {
    BUCKET_SUMMIT_DATA_KEY,
    saveFile
} from "../../utils/dataUpdatesUtils";
import moment from "moment-timezone";

/**
 * SummitSynchStrategy
 */
class SummitSynchStrategy extends AbstractSynchStrategy {

    async process(payload) {

        console.log(`SummitSynchStrategy::process`, payload);

        const {entity_operator} = payload;

        let entity = await fetchSummitById(this.summit.id, this.accessToken);

        let eventsData = [...this.allEvents];

        if (entity_operator === 'UPDATE') {
            if (!entity) return Promise.reject('SummitSynchStrategy::process entity not found.');

            // Update summit timestamp
            entity = {
                ...entity,
                timestamp: moment().unix(),
            };

            // update files on cache
            console.log(`SummitSynchStrategy::process updating cache files`);

            try {
                const localNowUtc = Date.now();

                await saveFile(this.summit.id, BUCKET_SUMMIT_DATA_KEY, entity, localNowUtc);


            } catch (e) {
                console.log(e);
            }

            let res = {
                payload,
                entity,
                summit: entity,
                eventsData,
                allIDXEvents: this.allIDXEvents,
                allSpeakers: this.allSpeakers,
                allIDXSpeakers: this.allIDXSpeakers
            };

            console.log(`SummitSynchStrategy::process done`, res);

            return Promise.resolve(res);

        }

        // Unknown op
        const msg = `SummitSynchStrategy::process unknown entity_operator '${entity_operator}'`;
        console.warn(msg);
        throw new Error(msg);
    }
}

export default SummitSynchStrategy;