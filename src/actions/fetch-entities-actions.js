import URI from "urijs";
import SummitAPIRequest from "../utils/build-json/SummitAPIRequest";
import EventAPIRequest from "../utils/build-json/EventsAPIRequest";
import SpeakersAPIRequest from "../utils/build-json/SpeakersAPIRequest";

const etagCache = {};

const byLowerCase = toFind => value => toLowerCase(value) === toFind;
const toLowerCase = value => value.toLowerCase();
const getKeys = headers => Object.keys(headers);

const getHeaderCaseInsensitive = (headerName, headers = {}) => {
    const key = getKeys(headers).find(byLowerCase(headerName));
    return key ? headers[key] : undefined;
};

const fetchWithEtag = async (url, cacheKey) => {
    const headers = {};

    if (etagCache.hasOwnProperty(cacheKey)) {
        const { etag } = etagCache[cacheKey];
        if (etag) {
            headers['If-None-Match'] = etag;
        }
    }

    const res = await fetch(url, {
        method: 'GET',
        cache: "no-store",
        headers,
    });

    if (res.status === 304 && etagCache.hasOwnProperty(cacheKey)) {
        const { body } = etagCache[cacheKey];
        return body;
    }

    if (res.status === 200) {
        const data = await res.json();
        const responseETAG = getHeaderCaseInsensitive('etag', res.headers);
        if (responseETAG) {
            etagCache[cacheKey] = { etag: responseETAG, body: data };
        }
        return data;
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
    const cacheKey = apiUrlWithParams;

    return fetchWithEtag(apiUrlWithParams, cacheKey);
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
    const cacheKey = url;

    return fetchWithEtag(url, cacheKey);
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
    const cacheKey = url;

    return fetchWithEtag(url, cacheKey);
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
    const cacheKey = url;

    return fetchWithEtag(url, cacheKey);
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
    const cacheKey = apiUrlWithParams;

    return fetchWithEtag(apiUrlWithParams, cacheKey);
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
    const cacheKey = apiUrlWithParams;

    return fetchWithEtag(apiUrlWithParams, cacheKey);
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
    const relations = ['subtracks','subtracks.none'];
    const expand = ['subtracks']

    apiUrl.addQuery('fields', fields.join(','));
    apiUrl.addQuery('relations', relations.join(','));
    apiUrl.addQuery('expand', expand.join(','));

    const url = apiUrl.toString();
    const cacheKey = url;

    return fetchWithEtag(url, cacheKey);
}