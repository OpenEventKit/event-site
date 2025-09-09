import AbstractSynchStrategy from "./abstract_synch_strategy";
import {fetchTrackById} from "../../actions/fetch-entities-actions";
import {
    BUCKET_EVENTS_DATA_KEY,
    BUCKET_EVENTS_IDX_DATA_KEY,
    BUCKET_SUMMIT_DATA_KEY,
    saveFile
} from "../../utils/dataUpdatesUtils";
import moment from "moment-timezone";
import {rebuildIndex} from "../../utils/arrayUtils";

/**
 * TrackSynchStrategy
 */
class TrackSynchStrategy extends AbstractSynchStrategy {


    _normalizeTracks(tracks) {
        const base = Array.isArray(tracks) ? tracks : [];
        return base.map(t => ({
            ...t,
            subtracks: Array.isArray(t?.subtracks) ? t.subtracks : []
        }));
    }

    _touchSummitTimestamp() {
        this.summit = {
            ...this.summit,
            timestamp: moment().unix(),
        };
    }

    _stripEntityEverywhere(tracks, entityId) {
        return this._normalizeTracks(tracks)
            .filter(t => t.id !== entityId) // remove it from top level ...
            // then remove it from subtracks
            .map(t => ({ ...t, subtracks: t.subtracks.filter(st => st?.id !== entityId) }));
    }

    async _persistAll() {
        this._touchSummitTimestamp();
        const localNowUtc = Date.now();

        await Promise.all([
            saveFile(this.summit.id, BUCKET_EVENTS_DATA_KEY, this.allEvents, localNowUtc),
            saveFile(this.summit.id, BUCKET_SUMMIT_DATA_KEY, this.summit, localNowUtc),
            saveFile(this.summit.id, BUCKET_EVENTS_IDX_DATA_KEY, this.allIDXEvents, localNowUtc),
        ]);
    }

    _result(payload, entity) {
        return {
            payload,
            entity: entity,
            summit: this.summit,
            eventsData: this.allEvents,
            allIDXEvents: this.allIDXEvents,
            allSpeakers: this.allSpeakers,
            allIDXSpeakers: this.allIDXSpeakers
        };
    }

    _upsertIntoParentSubtracks(tracks, parentId, entity) {
        if (parentId === entity.id) {
            console.warn(`TrackSynchStrategy::_upsertIntoParentSubtracks ignored self-parent for ${entity.id}`);
            return tracks;
        }

        let found = false;
        const normalizedEntity = { ...entity, subtracks: Array.isArray(entity.subtracks) ? entity.subtracks : [] };
        const next = tracks.map(t => {
            if (t.id !== parentId) return t;
            // found the parent
            found = true;
            // get current idx if exists as subtrack ...
            const idx = t.subtracks.findIndex(st => st?.id === entity.id);
            const subtracks = idx === -1
                ? [...t.subtracks, { ...normalizedEntity }] // not found it as subtrack .. then add it
                : t.subtracks.map(st => (st?.id === entity.id ? { ...st, ...normalizedEntity } : st));// else update it
            return { ...t, subtracks };
        });
        if (!found) {
            console.warn(`TrackSynchStrategy::_upsertIntoParentSubtracks parent ${parentId} not found for track ${entity.id}`);
        }
        return next;
    }

    async _handleUpsert(entity, payload) {
        // remove it from top level and subtracks
        let tracks = this._stripEntityEverywhere(this.summit?.tracks, entity.id);
        // top level re insert
        const normalizedEntity = { ...entity, subtracks: Array.isArray(entity.subtracks) ? entity.subtracks : [] };
        tracks.push(normalizedEntity)

        if (entity.parent_id > 0) {
            // re insert or update it
            tracks = this._upsertIntoParentSubtracks(tracks, entity.parent_id, entity);
        }

        // update summit racks

        this.summit = { ...this.summit, tracks };

        // update events
        this.allEvents = this.allEvents.map(ev => {
            if (ev?.track?.id === entity.id) return ({...ev, track: entity});
            return ev;
        })

        // Rebuild index to keep positions in sync
        this.allIDXEvents = rebuildIndex(this.allEvents);
        // Persist
        try {
            console.log("TrackSynchStrategy::process updating cache files (upsert)");
            await this._persistAll();
        } catch (e) {
            console.error(e);
        }

        return this._result(payload, entity);
    }

    async _handleDelete(entityId, payload) {
        console.log(
            `TrackSynchStrategy::_handleDelete delete track ${entityId}`
        );
        // remove track from top level / childs
        let tracks = this._stripEntityEverywhere(this.summit?.tracks, entityId);
        // clean orphan childs ...
        tracks = tracks.map(t => (t?.parent_id === entityId ? { ...t, parent_id: 0 } : t));

        this.summit = {
            ...this.summit,
            tracks: [...tracks],
        };

        // update events remove events with that track
        this.allEvents = this.allEvents.filter(ev => ev.track?.id !== entityId);
        // Rebuild index to keep positions in sync
        this.allIDXEvents = rebuildIndex(this.allEvents);
        // Persist
        try {
            console.log("TrackSynchStrategy::_handleDelete updating cache files (delete)");
            await this._persistAll();
        } catch (e) {
            console.error(e);
        }

        // No entity on delete/unpublish
        return this._result(payload, null);
    }

    async process(payload) {

        console.log(`TrackSynchStrategy::process`, payload);

        const {entity_operator, entity_id} = payload;

        switch (entity_operator) {
            case 'INSERT':
            case 'UPDATE':{
                const entity = await fetchTrackById(this.summit.id, entity_id, this.accessToken);
                if (!entity) return Promise.reject('TrackSynchStrategy::process entity not found.');
                return this._handleUpsert(entity, payload);
            }
            case 'DELETE':{
                return this._handleDelete(entity_id, payload);
            }
        }

        const msg = `TrackSynchStrategy::process unknown entity_operator '${entity_operator}'`;
        console.warn(msg);
        throw new Error(msg);
    }
}

export default TrackSynchStrategy;
