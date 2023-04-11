import settings from "../content/site-settings/index.json";
import summitBuildJson from "../data/summit.json";
import eventsBuildJson from "../data/events.json";
import eventsIDXBuildJson from "../data/events.idx.json";
import speakersBuildJson from "../data/speakers.json";
import speakersIDXBuildJson from "../data/speakers.idx.json";

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
      if (summitData && summitData?.file){
        if(summitData.lastModified > lastModified)
          lastModified = summitData.lastModified;
        summitData = summitData.file;
      }
      else
        summitData = summitBuildJson;
      // events
      if (eventsData && eventsData?.file){
        if(eventsData.lastModified > lastModified)
          lastModified = eventsData.lastModified;
        eventsData = eventsData.file;
      }
      else
        eventsData = eventsBuildJson;
      // events idx
      if (eventsIDXData && eventsIDXData?.file){
        if(eventsIDXData.lastModified > lastModified)
          lastModified = eventsIDXData.lastModified;
        eventsIDXData = eventsIDXData.file;
      }
      else
        eventsIDXData = eventsIDXBuildJson;
      // speakers
      if (speakersData && speakersData?.file){
        if(speakersData.lastModified > lastModified)
          lastModified = speakersData.lastModified;
        speakersData = speakersData.file;
      }
      else
        speakersData = speakersBuildJson;
      // speakers idx
      if (speakersIXData && speakersIXData?.file){
        if(speakersIXData.lastModified > lastModified)
          lastModified = speakersIXData.lastModified;
        speakersIXData = speakersIXData.file;
      }
      else
        speakersIXData = speakersIDXBuildJson;

      /* eslint-disable-next-line no-restricted-globals */
      self.postMessage({
        eventsData, summitData, speakersData, eventsIDXData, speakersIXData, lastModified
      });
    });
};