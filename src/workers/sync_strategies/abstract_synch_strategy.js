/**
 * AbstractSynchStrategy
 */
class AbstractSynchStrategy {

    /**
     * @param summit
     * @param allEvents
     * @param allIDXEvents
     * @param allSpeakers
     * @param allIDXSpeakers
     * @param accessToken
     * @param fetchStreamingInfo
     */
    constructor(summit, allEvents, allIDXEvents, allSpeakers, allIDXSpeakers, accessToken, fetchStreamingInfo = false) {
        this.summit = summit;
        this.allEvents = allEvents;
        this.allIDXEvents = allIDXEvents;
        this.allSpeakers = allSpeakers;
        this.allIDXSpeakers = allIDXSpeakers;
        this.accessToken = accessToken;
        this.fetchStreamingInfo = fetchStreamingInfo;
    }

    async process(payload){
        throw new Error('not implemented');
    }

}

export default AbstractSynchStrategy;