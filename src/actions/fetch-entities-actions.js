import URI from "urijs";
import SummitAPIRequest from "../utils/build-json/SummitAPIRequest";
import EventAPIRequest from "../utils/build-json/EventsAPIRequest";

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

    const speakers_fields = ['id', 'first_name', 'last_name', 'title', 'bio', 'member_id', 'pic', 'big_pic', 'company'];
    const current_attendance_fields = ['member_first_name', 'member_last_name', 'member_pic'];
    const first_level_fields = [
        "id",
        "created",
        "last_edited",
        "title",
        "description",
        "social_description",
        "start_date",
        "end_date",
        "location_id",
        "class_name",
        "allow_feedback",
        "avg_feedback_rate",
        "published_date",
        "head_count",
        "attendance_count",
        "current_attendance_count",
        "image",
        "level",
        "show_sponsors",
        "duration",
        "moderator_speaker_id",
        "problem_addressed",
        "attendees_expected_learnt",
        "to_record",
        "attending_media",
    ];
    apiUrl.addQuery('expand', 'slides, links, videos, media_uploads, type, track, track.allowed_access_levels, location, location.venue, location.floor, speakers, moderator, sponsors, current_attendance, groups, rsvp_template, tags');
    apiUrl.addQuery('relations', "speakers.badge_features,speakers.affiliations,speakers.languages,speakers.other_presentation_links,speakers.areas_of_expertise,speakers.travel_preferences,speakers.organizational_roles,speakers.all_presentations,speakers.all_moderated_presentations");
    apiUrl.addQuery('fields', `${first_level_fields.join(",")},speakers.${speakers_fields.join(",speakers.")},current_attendance.${current_attendance_fields.join(',current_attendance.')}`);
    return fetch(apiUrl.toString(), {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
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
    return fetch(apiUrl.toString(), {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
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

    return fetch(apiUrl.toString(), {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
}

/**
 *
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

    return fetch(apiUrl.toString(), {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
}

/**
 *
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

    const speakers_relations = [
        'badge_features',
        'affiliations',
        'languages',
        'other_presentation_links',
        'areas_of_expertise',
        'travel_preferences',
        'organizational_roles',
        'all_presentations',
        'all_moderated_presentations',
    ];

    const speakers_fields =
        ['id', 'first_name', 'last_name', 'title', 'bio', 'member_id', 'pic', 'big_pic', 'company'];

    apiUrl.addQuery('relations', speakers_relations.join(','));
    apiUrl.addQuery('fields', speakers_fields.join(','));

    return fetch(apiUrl.toString(), {
        method: 'GET',
        cache: "no-store",
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
}

/**
 *
 * @param summitId
 * @param accessToken
 * @returns {Promise<Response>}
 */
export const fetchSummitById = async (summitId, accessToken = null) => {
    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/v2/summits/${summitId}`);

    apiUrl.addQuery('access_token', accessToken);
    apiUrl.addQuery('t', Date.now());

    const apiUrlWithParams = SummitAPIRequest.build(apiUrl);

    return fetch(apiUrlWithParams, {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
}

/**
 * @param summitId
 * @param trackId
 * @param accessToken
 * @returns {Promise<* | null>}
 */
export const fetchTrackById = async (summitId, trackId, accessToken = null) => {
    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}/tracks/${trackId}`);

    const expand = [
        'subtracks',
    ]

    apiUrl.addQuery('expand', expand.join(','));

    return fetch(apiUrl.toString(), {
        method: 'GET'
    }).then(async (response) => {
        if (response.status === 200) {
            return await response.json();
        }
        return null;
    });
}
