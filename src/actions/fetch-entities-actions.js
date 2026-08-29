import URI from "urijs";
import SummitAPIRequest from "../utils/build-json/SummitAPIRequest";
import EventAPIRequest from "../utils/build-json/EventsAPIRequest";
import SpeakersAPIRequest from "../utils/build-json/SpeakersAPIRequest";

const etagCache = new Map();
const MAX_CACHE_SIZE = 100;

export const clearEtagCacheForUrl = (urlPattern) => {
    for (const key of etagCache.keys()) {
        if (key.includes(urlPattern)) {
            etagCache.delete(key);
        }
    }
};

const fetchWithEtag = async (url) => {
    const headers = {};

    if (etagCache.has(url)) {
        const { etag } = etagCache.get(url);
        if (etag) {
            headers['If-None-Match'] = etag;
        }
    }

    const res = await fetch(url, {
        method: 'GET',
        cache: "no-store",
        headers,
    });

    if (res.status === 304 && etagCache.has(url)) {
        const { body } = etagCache.get(url);
        return body;
    }

    if (res.status === 200) {
        const data = await res.json();
        const responseETAG = res.headers.get('etag');
        if (responseETAG) {
            if (etagCache.size >= MAX_CACHE_SIZE) {
                const oldest = etagCache.keys().next().value;
                etagCache.delete(oldest);
            }
            etagCache.set(url, { etag: responseETAG, body: data });
        }
        return data;
    }

    if (!res.ok) {
        console.error(`fetchWithEtag failed (${res.status}):`, url);
    }

    return null;
};

/**
 * @param summitId
 * @param eventId
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchEventById = async (summitId, eventId, accessToken = null) => {

    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/events/${eventId}/published`);
    if (accessToken) {
        apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}/events/${eventId}/published`);
        apiUrl.addQuery('access_token', accessToken);
    }

    const apiUrlWithParams = EventAPIRequest.build(apiUrl);
    return fetchWithEtag(apiUrlWithParams);
}

/**
 * @param summitId
 * @param eventId
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchStreamingInfoByEventId = async (summitId, eventId, accessToken) => {
    const apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}/events/${eventId}/published/streaming-info`);
    apiUrl.addQuery('access_token', accessToken);
    const url = apiUrl.toString();
    return fetchWithEtag(url);
}

/**
 * @param summitId
 * @param eventTypeId
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchEventTypeById = async (summitId, eventTypeId, accessToken = null) => {

    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/event-types/${eventTypeId}`);
    if (accessToken) {
        apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}/event-types/${eventTypeId}`);
        apiUrl.addQuery('access_token', accessToken);
    }

    const url = apiUrl.toString();
    return fetchWithEtag(url);
}

/**
 * @param summitId
 * @param locationId
 * @param expand
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchLocationById = async (summitId, locationId, expand, accessToken = null) => {

    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/locations/${locationId}`);
    if (accessToken) {
        apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}/locations/${locationId}`);
        apiUrl.addQuery('access_token', accessToken);
    }

    if (expand)
        apiUrl.addQuery('expand', expand);

    const url = apiUrl.toString();
    return fetchWithEtag(url);
}

/**
 * @param summitId
 * @param speakerId
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchSpeakerById = async (summitId, speakerId, accessToken = null) => {

    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/speakers/${speakerId}`);

    if (accessToken) {
        apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}/speakers/${speakerId}`);
        apiUrl.addQuery('access_token', accessToken);
    }

    const apiUrlWithParams = SpeakersAPIRequest.build(apiUrl);
    return fetchWithEtag(apiUrlWithParams);
}

/**
 * @param summitId
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchSummitById = async (summitId, accessToken = null) => {
    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}`);

    if (accessToken) {
        apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v1/summits/${summitId}`);
        apiUrl.addQuery('access_token', accessToken);
    }

    const apiUrlWithParams = SummitAPIRequest.build(apiUrl);
    return fetchWithEtag(apiUrlWithParams);
}

/**
 * @param summitId
 * @param trackId
 * @param accessToken
 * @returns {Promise<* | null>}
 */
export const fetchTrackById = async (summitId, trackId, accessToken = null) => {
    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/tracks/${trackId}`);

    const fields = [
        "id", "name", "code", "order", "parent_id", "color", "text_color",
        "subtracks.id", "subtracks.name", "subtracks.code", "subtracks.order",
        "subtracks.parent_id", "subtracks.color", "subtracks.text_color",
    ];
    const relations = ['subtracks', 'subtracks.none'];
    const expand = ['subtracks']

    apiUrl.addQuery('fields', fields.join(','));
    apiUrl.addQuery('relations', relations.join(','));
    apiUrl.addQuery('expand', expand.join(','));

    const url = apiUrl.toString();
    return fetchWithEtag(url);
}