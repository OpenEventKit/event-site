import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchEventById, fetchStreamingInfoByEventId} from "../../actions/fetch-entities-actions";
import {insertSorted, intCheck, rebuildIndex} from "../../utils/arrayUtils";
import {
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SPEAKERS_DATA_KEY, BUCKET_SPEAKERS_IDX_DATA_KEY,
    BUCKET_SUMMIT_DATA_KEY,
    saveFile
} from "../../utils/dataUpdatesUtils";
import moment from "moment-timezone";

/**
 * ActivitySynchStrategy
 */
class ActivitySynchStrategy extends AbstractSynchStrategy{

    async process(payload){

        console.log(`ActivitySynchStrategy::process`, payload);

        const {entity_operator, entity_id} = payload;

        let entity = await fetchEventById(this.summit.id, entity_id, this.accessToken);
        if(this.accessToken) {
            const streaming_info = await fetchStreamingInfoByEventId(this.summit.id, entity_id, this.accessToken);
            if(streaming_info) entity = {...entity, ...streaming_info};
        }

        let eventsData = [...this.allEvents];

        if (entity_operator === 'UPDATE') {

            if(!entity){
                // was deleted ( un - published)
                // try to get from index
                const idx = this.allIDXEvents[entity_id] ?? -1;
                console.log(`ActivitySynchStrategy::process unpublished presentation ${entity_id} idx ${idx}`);

                if(idx === -1)
                    return Promise.reject('ActivitySynchStrategy::process unpublished idx === -1.'); // does not exists on index ...
                // Remove from array and index
                eventsData = eventsData.filter(e => e.id !== entity_id);
                delete this.allIDXEvents[entity_id];
            }
            else {
                // Entity is published or updated

                // Remove any existing version of this event
                eventsData = eventsData.filter(e => e.id !== entity.id);

                // Re-insert the updated entity into sorted position

                this.allIDXEvents[entity.id] = insertSorted(eventsData, entity, (a, b) => {
                    if (a.start_date === b.start_date) {
                        if (a.end_date === b.end_date) {
                            return intCheck(a.id, b.id);
                        }
                        return intCheck(a.end_date, b.end_date);
                    }
                    return intCheck(a.start_date, b.start_date);
                });

                // Rebuild the full event index to be safe

                this.allIDXEvents = rebuildIndex(this.allIDXEvents);

                // Update speakers
                if (entity.speakers) {
                    console.log(`ActivitySynchStrategy::process updating speakers`, entity.speakers);
                    for (const speaker of entity.speakers) {
                        const idx = this.allIDXSpeakers[speaker.id] ?? -1;
                        if (idx === -1 || !this.allSpeakers[idx]) {
                            console.log(`ActivitySynchStrategy::process speaker does not exists, inserting it at end`, speaker);
                            this.allSpeakers.push(speaker);
                            this.allIDXSpeakers[speaker.id] = this.allSpeakers.length - 1;
                        } else {
                            console.log(`ActivitySynchStrategy::process updating speaker at idx ${idx}`, speaker);
                            this.allSpeakers[idx] = speaker;
                        }
                    }
                }

                // Update moderator
                if (entity.moderator) {
                    console.log(`ActivitySynchStrategy::process updating moderator`, entity.moderator);
                    const idx = this.allIDXSpeakers[entity.moderator.id] ?? -1;
                    if (idx === -1 || !this.allSpeakers[idx]) {
                        console.log(`ActivitySynchStrategy::process moderator does not exists, inserting it at end`, entity.moderator);
                        this.allSpeakers.push(entity.moderator);
                        this.allIDXSpeakers[entity.moderator.id] = this.allSpeakers.length - 1;
                    } else {
                        console.log(`ActivitySynchStrategy::process updating moderator at idx ${idx}`, entity.moderator);
                        this.allSpeakers[idx] = entity.moderator;
                    }
                }

            }

            // update files on cache
            console.log(`ActivitySynchStrategy::process updating cache files`);

            // Update summit timestamp to trigger data reload downstream
            this.summit = {
                ...this.summit,
                timestamp: moment().unix(),
            };
            // Persist everything
            try {
                const localNowUtc = Date.now();

                await saveFile(this.summit.id, BUCKET_SUMMIT_DATA_KEY, this.summit, localNowUtc);
                await saveFile(this.summit.id, BUCKET_EVENTS_DATA_KEY, eventsData, localNowUtc);
                await saveFile(this.summit.id, BUCKET_EVENTS_IDX_DATA_KEY, this.allIDXEvents, localNowUtc);
                await saveFile(this.summit.id, BUCKET_SPEAKERS_DATA_KEY, this.allSpeakers, localNowUtc);
                await saveFile(this.summit.id, BUCKET_SPEAKERS_IDX_DATA_KEY, this.allIDXSpeakers, localNowUtc);
            } catch (e) {
                console.error(e);
            }

            const res = {
                payload,
                entity,
                summit: this.summit,
                eventsData,
                allIDXEvents: this.allIDXEvents,
                allSpeakers: this.allSpeakers,
                allIDXSpeakers: this.allIDXSpeakers,
            };

            console.log(`ActivitySynchStrategy::process done`, res);

            return Promise.resolve(res);
        }
    }
}

export default ActivitySynchStrategy;
