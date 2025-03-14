import {isSummitEventDataUpdate, isSummitEventTypeDataUpdate} from "../../utils/dataUpdatesUtils";
import ActivitySynchStrategy from "../sync_strategies/activity_synch_strategy";
import VenueRoomSynchStrategy from "./venue_room_synch_strategy";
import SpeakerSynchStrategy from "./speaker_synch_strategy";
import SummitSynchStrategy from "./summit_synch_strategy";
import ActivityTypeSynchStrategy from "./activity_type_synch_strategy";
import TrackSynchStrategy from "./track_synch_strategy";
/**
 * SynchStrategyFactory
 */
class SynchStrategyFactory {

    /**
     * @param summit
     * @param allEvents
     * @param allIDXEvents
     * @param allSpeakers
     * @param allIDXSpeakers
     * @param accessToken
     * @param payload
     * @returns {null|*}
     */
    static build(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken, payload) {
        const {entity_type} = payload;
        if (isSummitEventDataUpdate(entity_type)) {
            return new ActivitySynchStrategy(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken);
        }
        if (isSummitEventTypeDataUpdate(entity_type)) {
            return new ActivityTypeSynchStrategy(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken);
        }
        if (entity_type === 'SummitVenueRoom') {
            return new VenueRoomSynchStrategy(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken);
        }
        if (entity_type === 'PresentationSpeaker') {
            return new SpeakerSynchStrategy(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken);
        }
        if (entity_type === 'Summit') {
            return new SummitSynchStrategy(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken);
        }
        if(entity_type === 'PresentationCategory'){
            return new TrackSynchStrategy(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken);
        }
        return null;
    }
}

export default SynchStrategyFactory;
