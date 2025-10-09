import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchEventById, fetchStreamingInfoByEventId} from "../../actions/fetch-entities-actions";
import {insertSorted, intCheck, rebuildIndex} from "../../utils/arrayUtils";
import {
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SPEAKERS_DATA_KEY,
    BUCKET_SPEAKERS_IDX_DATA_KEY,
    BUCKET_SUMMIT_DATA_KEY,
    saveFile
} from "../../utils/dataUpdatesUtils";
import moment from "moment-timezone";

/**
 * ActivitySynchStrategy
 */
class ActivitySynchStrategy extends AbstractSynchStrategy{

    _removeEventById(entity_id, eventsData){
        // was deleted ( un - published)
        // try to get from index
        const idx = this.allIDXEvents[entity_id] ?? -1;
        console.log(`ActivitySynchStrategy::_removeEventById unpublished presentation ${entity_id} idx ${idx}`);

        // Remove from array and index
        const pruned = eventsData.filter(e => e.id !== entity_id);
        delete this.allIDXEvents[entity_id];
        return pruned;
    }

    _touchSummitTimestamp() {
        this.summit = {
            ...this.summit,
            timestamp: moment().unix(),
        };
    }

    /** Standard result payload + log */
    _result(payload, entity, eventsData) {
        const res = {
            payload,
            entity: entity,
            summit: this.summit,
            eventsData,
            allIDXEvents: this.allIDXEvents,
            allSpeakers: this.allSpeakers,
            allIDXSpeakers: this.allIDXSpeakers,
        };
        console.log("ActivitySynchStrategy::process done", res);
        return res;
    }

    async _persistAll(eventsData) {
        this._touchSummitTimestamp();
        const localNowUtc = Date.now();

        await Promise.all([
            saveFile(this.summit.id, BUCKET_SUMMIT_DATA_KEY, this.summit, localNowUtc),
            saveFile(this.summit.id, BUCKET_EVENTS_DATA_KEY, eventsData, localNowUtc),
            saveFile(this.summit.id, BUCKET_EVENTS_IDX_DATA_KEY, this.allIDXEvents, localNowUtc),
            saveFile(this.summit.id, BUCKET_SPEAKERS_DATA_KEY, this.allSpeakers, localNowUtc),
            saveFile(this.summit.id, BUCKET_SPEAKERS_IDX_DATA_KEY, this.allIDXSpeakers, localNowUtc),
        ]);
    }

    async _handleDeleteOrUnpublish(entityId, payload, eventsData) {
        console.log(
            `ActivitySynchStrategy::_handleDeleteOrUnpublish delete/unpublish presentation ${entityId}`
        );

        // Remove and rebuild index
        const newEventsData = this._removeEventById(entityId, eventsData);
        this.allIDXEvents = rebuildIndex(newEventsData);

        // Persist
        try {
            console.log("ActivitySynchStrategy::_handleDeleteOrUnpublish updating cache files (delete)");
            await this._persistAll(newEventsData);
        } catch (e) {
            console.error(e);
        }

        // No entity on delete/unpublish
        return this._result(payload, null, newEventsData);
    }

    /** Insert/update a single person (speaker/moderator) into arrays + index */
    _upsertSpeaker(person) {
        if (!person) return;
        const idx = this.allIDXSpeakers[person.id] ?? -1;
        if (idx === -1 || !this.allSpeakers[idx]) {
            this.allSpeakers.push(person);
            this.allIDXSpeakers[person.id] = this.allSpeakers.length - 1;
        } else {
            this.allSpeakers[idx] = person;
        }
    }

    /** Apply speakers & moderator coming from an entity */
    _applyPeopleFromEntity(entity) {
        if (Array.isArray(entity?.speakers)) {
            for (const s of entity.speakers) this._upsertSpeaker(s);
        }
        if (entity?.moderator) this._upsertSpeaker(entity.moderator);
    }

    async _handleUpsert(entity, payload, eventsData) {
        console.log("ActivitySynchStrategy::process upsert", { id: entity?.id });

        // Entity is published or updated

        // Remove any existing version of this event
        const without = eventsData.filter(e => e.id !== entity.id);

        // Re-insert the updated entity into sorted position

        this.allIDXEvents[entity.id] = insertSorted(without, entity, (a, b) => {
            if (a.start_date === b.start_date) {
                if (a.end_date === b.end_date) {
                    return intCheck(a.id, b.id);
                }
                return intCheck(a.end_date, b.end_date);
            }
            return intCheck(a.start_date, b.start_date);
        });

        // Rebuild full index for safety/consistency
        this.allIDXEvents = rebuildIndex(without);


        // Update speakers & moderator
        this._applyPeopleFromEntity(entity);

        // Persist
        try {
            console.log("ActivitySynchStrategy::process updating cache files (upsert)");
            await this._persistAll(without);
        } catch (e) {
            console.error(e);
        }


        return this._result(payload, entity, without);
    }

    async process(payload){

        console.log(`ActivitySynchStrategy::process`, payload);

        const {entity_operator, entity_id} = payload;

        let eventsData = [...this.allEvents];

        switch (entity_operator) {
            case 'INSERT':
            case 'UPDATE':{
                let entity = await fetchEventById(this.summit.id, entity_id, this.accessToken);
                if(this.accessToken && this.fetchStreamingInfo) {
                    const streaming_info = await fetchStreamingInfoByEventId(this.summit.id, entity_id, this.accessToken);
                    if(streaming_info) entity = {...entity, ...streaming_info};
                }

                if(!entity){
                    // was deleted ( un - published)
                    return this._handleDeleteOrUnpublish(entity_id, payload, eventsData);
                }
                // Normal upsert flow
                return this._handleUpsert(entity, payload, eventsData);
            }
            case 'DELETE':{
                // was hard deleted
                return this._handleDeleteOrUnpublish(entity_id, payload, eventsData);
            }
        }

        // Unknown op
        const msg = `ActivitySynchStrategy::process unknown entity_operator '${entity_operator}'`;
        console.warn(msg);
        throw new Error(msg);
    }
}

export default ActivitySynchStrategy;
