import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchSpeakerById} from "../../actions/fetch-entities-actions";
import {
    BUCKET_SUMMIT_DATA_KEY,
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SPEAKERS_DATA_KEY,
    BUCKET_SPEAKERS_IDX_DATA_KEY,
    saveFile
} from "../../utils/dataUpdatesUtils";

import {rebuildIndex, getIndexedItem} from "../../utils/arrayUtils";
import moment from "moment-timezone";

/**
 * SpeakerSynchStrategy
 */
class SpeakerSynchStrategy extends AbstractSynchStrategy {
    async process(payload) {

        console.log(`SpeakerSynchStrategy::process`, payload);

        const {entity_operator, entity_id} = payload;

        if (entity_operator !== 'UPDATE') return;

        const entity = await fetchSpeakerById(this.summit.id, entity_id, this.accessToken);

        if (!entity) return Promise.reject('SpeakerSynchStrategy::process entity not retrieved.');

        let eventsData = [...this.allEvents];

        // Remove speaker and re-insert
        this.allSpeakers = this.allSpeakers.filter(s => s.id !== entity_id);
        this.allSpeakers.push(entity);
        this.allIDXSpeakers = rebuildIndex(this.allSpeakers);

        // Update events where speaker is listed
        for (const eventId of entity.all_presentations || []) {
            const res = getIndexedItem(this.allIDXEvents, eventsData, eventId);
            if (!res || !Array.isArray(res.item.speakers)) {
                console.log(`SpeakerSynchStrategy::process: event ${eventId} not found or invalid`);
                continue;
            }

            const updatedSpeakers = res.item.speakers.map(s =>
                s.id === entity.id ? entity : s
            );

            eventsData[res.idx] = {
                ...res.item,
                speakers: updatedSpeakers,
            };
        }

        // Update events where speaker is moderator
        for (const eventId of entity.all_moderated_presentations || []) {
            const res = getIndexedItem(this.allIDXEvents, eventsData, eventId);
            if (!res) {
                console.log(`SpeakerSynchStrategy::process: moderator event ${eventId} not found`);
                continue;
            }

            eventsData[res.idx] = {
                ...res.item,
                moderator: entity,
            };
        }

        // Update summit timestamp
        this.summit = {
            ...this.summit,
            timestamp: moment().unix(),
        };

        // update files on cache
        console.log(`SpeakerSynchStrategy::process updating cache files`);

        try {
            const localNowUtc = Date.now();

            await saveFile(this.summit.id, BUCKET_SUMMIT_DATA_KEY, this.summit, localNowUtc);

            await saveFile(this.summit.id, BUCKET_EVENTS_DATA_KEY, eventsData, localNowUtc);

            await saveFile(this.summit.id, BUCKET_EVENTS_IDX_DATA_KEY, this.allIDXEvents, localNowUtc);

            await saveFile(this.summit.id, BUCKET_SPEAKERS_DATA_KEY, this.allSpeakers, localNowUtc);

            await saveFile(this.summit.id, BUCKET_SPEAKERS_IDX_DATA_KEY, this.allIDXSpeakers, localNowUtc);

        } catch (e) {
            console.log(e);
        }

        let res = {
            payload,
            entity,
            summit: this.summit,
            eventsData,
            allIDXEvents: this.allIDXEvents,
            allSpeakers: this.allSpeakers,
            allIDXSpeakers: this.allIDXSpeakers
        };

        console.log(`SpeakerSynchStrategy::process done`, res);

        return Promise.resolve(res);

    }

}

export default SpeakerSynchStrategy;
