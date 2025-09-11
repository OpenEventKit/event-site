import settings from "content/site-settings/index.json";
import summitBuildJson from "data/summit.json";
import eventsBuildJson from "data/events.json";
import eventsIDXBuildJson from "data/events.idx.json";
import speakersBuildJson from "data/speakers.json";
import speakersIDXBuildJson from "data/speakers.idx.json";

import {
    bucket_getSummit,
    bucket_getEvents,
    bucket_getEventsIDX,
    bucket_getSpeakers,
    bucket_getSpeakersIDX
} from "../actions/update-data-actions";

import {
    SUMMIT_FILE_PATH,
    EVENTS_FILE_PATH,
    EVENTS_IDX_FILE_PATH,
    SPEAKERS_FILE_PATH,
    SPEAKERS_IDX_FILE_PATH
} from "../utils/filePath";

const isNonEmptyObject = (v) =>
    v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length > 0;

const isNonEmptyArray = (v) => Array.isArray(v) && v.length > 0;

const pick = (result, expect) => {
    if (!result || typeof result !== "object") {
        return {accepted: false, data: null, lastModified: 0};
    }
    const {file, lastModified} = result;
    const ok =
        expect === "object" ? isNonEmptyObject(file) :
            expect === "array" ? isNonEmptyArray(file) : false;

    return ok
        ? {accepted: true, data: file, lastModified: lastModified}
        : {accepted: false, data: null, lastModified: 0};
};

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = async ({data: {summitId, staticJsonFilesBuildTime}}) => {
    staticJsonFilesBuildTime = JSON.parse(staticJsonFilesBuildTime);

    console.log(`feeds worker running for ${summitId} ....`)
    const calls = [];

    // events
    let buildTime = staticJsonFilesBuildTime.find(e => e.file === EVENTS_FILE_PATH).build_time;

    calls.push(bucket_getEvents(summitId, buildTime));

    buildTime = staticJsonFilesBuildTime.find(e => e.file === EVENTS_IDX_FILE_PATH).build_time;
    calls.push(bucket_getEventsIDX(summitId, buildTime));

    // summit
    buildTime = staticJsonFilesBuildTime.find(e => e.file === SUMMIT_FILE_PATH).build_time;
    calls.push(bucket_getSummit(summitId, buildTime));

    //speakers
    buildTime = staticJsonFilesBuildTime.find(e => e.file === SPEAKERS_FILE_PATH).build_time;
    calls.push(bucket_getSpeakers(summitId, buildTime));

    buildTime = staticJsonFilesBuildTime.find(e => e.file === SPEAKERS_IDX_FILE_PATH).build_time;
    calls.push(bucket_getSpeakersIDX(summitId, buildTime));

    Promise.all(calls)
        .then((values) => {
            let lastModified = settings.lastBuild;
            let eventsData = values[0];
            let eventsIDXData = values[1];
            let summitData = values[2];
            let speakersData = values[3];
            let speakersIXData = values[4];

            // if null , then set the SSR content
            // summit
            const summitDataPicked = pick(summitData, "object");
            summitData = summitDataPicked.accepted && summitDataPicked.lastModified > lastModified ? summitDataPicked.data : summitBuildJson;
            // events
            const eventsDataPicked = pick(eventsData, "array");
            eventsData = eventsDataPicked.accepted && eventsDataPicked.lastModified > lastModified ? eventsDataPicked.data : eventsBuildJson;
            // events idx
            const eventsIDXDataPicked = pick(eventsIDXData, "object");
            eventsIDXData = eventsIDXDataPicked.accepted && eventsIDXDataPicked.lastModified > lastModified ? eventsIDXDataPicked.data : eventsIDXBuildJson;
            // speakers
            const speakersDataPicked = pick(speakersData, "array");
            speakersData = speakersDataPicked.accepted && speakersDataPicked.lastModified > lastModified ? speakersDataPicked.data : speakersBuildJson;
            // speakers idx
            const speakersIXDataPicked = pick(speakersIXData, "object");
            speakersIXData = speakersIXDataPicked.accepted && speakersIXDataPicked.lastModified > lastModified ? speakersIXDataPicked.data : speakersIDXBuildJson;


            /* eslint-disable-next-line no-restricted-globals */
            self.postMessage({
                eventsData, summitData, speakersData, eventsIDXData, speakersIXData, lastModified
            });
        });
};