import URI from "urijs";
import { SPEAKER_MODERATOR_FIELDS } from "../utils/constants";

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
    apiUrl.addQuery('relations', "speakers.badge_features,speakers.affiliations,speakers.languages,speakers.other_presentation_links,speakers.areas_of_expertise,speakers.travel_preferences,speakers.organizational_roles");
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

    const documents_fields = ['display_on_site', 'name', 'order', 'class_name', 'type', 'public_url', 'link']
    const current_attendance_fields = ['member_first_name', 'member_last_name', 'member_pic'];
    const first_level_fields = [
        "id",
        "created",
        "start_date",
        "end_date",
        "title",
        "abstract",
        "description",
        "level",
        "image",
        "stream_thumbnail",
        "type", "type.id", "type.name",
        "location_id",
        "class_name",
        "allow_feedback",
        "head_count",
        "attendance_count",
        "current_attendance_count",
        "tags", "tags.id", "tags.tag",
        "location", "location.class_name", "location.name", "location.venue.name", "location.venue.floor",
        "track", "track.id", "track.name", "track.icon_url", "track.color", "track.text_color",
        "track_groups", "track_groups.id", "track_groups.name", "track_groups.parent_id", "track_groups.color", "track_groups.order", "track_groups.subtracks",
        "sponsors", "sponsors.id", "sponsors.name", "sponsors.logo",
        "to_record",
        "etherpad_link",
        "streaming_url",
        "streaming_type",
        "meeting_url",
        "current_attendance",
        "attendees_expected_learnt",
        "show_sponsors",
        "duration",
        "moderator_speaker_id",
    ];
    const fields = `
    ${first_level_fields.join(",")},
    speakers.${SPEAKER_MODERATOR_FIELDS.join(",speakers.")},
    current_attendance.${current_attendance_fields.join(',current_attendance.')}
    moderator.${SPEAKER_MODERATOR_FIELDS.join(",moderator.")},
    media_uploads.${documents_fields.join(",media_uploads.")}
    videos.${documents_fields.join(",videos.")}
    slides.${documents_fields.join(",slides.")}
    links.${documents_fields.join(",links.")}
    `;

    const expand = [
        'slides',
        'links',
        'videos',
        'media_uploads',
        'type',
        'track',
        'location',
        'location.venue',
        'location.floor',
        'speakers',
        'moderator',
        'sponsors',
        'tags',
        'current_attendance'
    ];

    const relations = [
        'speakers.badge_features',        
    ]

    apiUrl.addQuery('fields', fields.join(','));
    apiUrl.addQuery('expand', expand.join(','));
    apiUrl.addQuery('relations', relations.join(','));

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
        'all_presentations',
        'all_moderated_presentations',
    ]

    apiUrl.addQuery('relations', speakers_relations.join(","));

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
    let apiUrl = URI(`${process.env.GATSBY_SUMMIT_API_BASE_URL}/api/public/v1/summits/${summitId}`);

    const fields = [
        'id',
        'name',
        'start_date',
        'end_date',
        'time_zone_id',
        'time_zone_label',
        'tracks.id', 'tracks.name', 'tracks.code',
        'track_groups.id', 'track_groups.name', 'track_groups.tracks',
        'locations.id', 'locations.class_name', 'locations', 'locations.is_main',
        'secondary_logo',
        'slug',
        'payment_profiles',
        'support_email',
        'ticket_types.id',
        'ticket_types.name', 'ticket_types.created', 'ticket_types.cost',
        'start_showing_venues_date',
        'dates_with_events',
        'logo',
        'registration_allowed_refund_request_till_date',
        'allow_update_attendee_extra_questions',
        'is_virtual',
        'registration_disclaimer_mandatory',
        'registration_disclaimer_content',
        'reassign_ticket_till_date',
        'is_main',
        'title',
        'description',
        'badge_features_types',
        'time_zone'
    ];

    const relations = [
        'dates_with_events',
        'ticket_types.none',
        'tracks.none',
        'track_groups.none',
        'locations',
        'locations.none',
        'payment_profiles',
        'time_zone',
        'none'
    ]

    const expand = [
        'event_types',
        'badge_features_types',
        'tracks',
        'track_groups',
        'locations',
        'presentation_levels',
        'locations',
        'locations.rooms',
        'locations.floors',
        'order_extra_questions.values',
        'schedule_settings',
        'schedule_settings.filters',
        'schedule_settings.pre_filters',
        "ticket_types",
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

/**
 * @param summitId
 * @param trackId
 * @param accessToken
 * @returns {Promise<* | null>}
 */
export const fetchTrackById = async(summitId, trackId, accessToken = null) => {
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