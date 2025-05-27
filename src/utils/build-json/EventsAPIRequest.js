const BaseAPIRequest = require("./BaseAPIRequest");

const SPEAKER_MODERATOR_FIELDS = ['id', 'first_name', 'last_name', 'title', 'bio', 'member_id', 'pic', 'big_pic', 'company', 'featured'];
const DOCUMENTS_FIELDS = ['display_on_site', 'name', 'order', 'class_name', 'type', 'public_url', 'link'];
const CURRENT_ATTENDANCE_FIELDS = ['member_first_name', 'member_last_name', 'member_pic'];

class EventAPIRequest extends BaseAPIRequest {
    static instance;

    constructor() {
        const primary_fields = [
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
            "location_id",
            "class_name",
            "allow_feedback",
            "head_count",
            "attendance_count",
            "current_attendance_count",
            "to_record",
            "etherpad_link",
            "streaming_url",
            "streaming_type",
            "meeting_url",
            "current_attendance",
            "attendees_expected_learnt",
            "show_sponsors",
            "duration",
        ];

        const type_fields = ["type.id", "type.name", "type.allows_publishing_dates", "type.color"];
        const tags_fields = ["tags.id", "tags.tag"];
        const location_fields = ["location.id", "location.class_name", "location.name", "location.venue.name", "location.floor.name"];
        const track_fields = ["track.id", "track.name", "track.icon_url", "track.color", "track.text_color", "track.parent_id"];
        const track_groups_fields = ["track_groups.id", "track_groups.name", "track_groups.parent_id", "track_groups.color", "track_groups.order"];
        const speakers_badge_feature_fields = ["speakers.badge_features.id", "speakers.badge_features.name", "speakers.badge_features.image"];
        const sponsors_fields = ["sponsors.id", "sponsors.name", "sponsors.logo"];

        const fields_from_constants = `
            speakers.${SPEAKER_MODERATOR_FIELDS.join(",speakers.")},
            current_attendance.${CURRENT_ATTENDANCE_FIELDS.join(',current_attendance.')},
            moderator.${SPEAKER_MODERATOR_FIELDS.join(",moderator.")},
            media_uploads.${DOCUMENTS_FIELDS.join(",media_uploads.")},
            videos.${DOCUMENTS_FIELDS.join(",videos.")},
            slides.${DOCUMENTS_FIELDS.join(",slides.")},
            links.${DOCUMENTS_FIELDS.join(",links.")}
        `;

        const speakers_relations = ["speakers.badge_features", "speakers.all_presentations", "speakers.all_moderated_presentations"];

        const track_relations = ["track.track_groups"];

        const locations_relations = ["location.venue.none,location.floor.none"];

        const relations = [
            ...track_relations,
            ...speakers_relations,
            ...locations_relations,
            "none"
        ];

        const speakers_expand = ["speakers.badge_features"];

        const location_expand = ["location.venue", "location.floor"];

        const track_expand = [
            "track.subtracks",
            "track.allowed_access_levels",
        ]

        const expands = [
            "slides",
            "links",
            "videos",
            "media_uploads",
            "type",
            "track",
            "location",
            "speakers",
            "moderator",
            "sponsors",
            "tags",
            "current_attendance",
            ...track_expand,
            ...speakers_expand,
            ...location_expand
        ];

        super(
            [
                ...primary_fields,
                ...type_fields,
                ...tags_fields,
                ...location_fields,
                ...track_fields,
                ...track_groups_fields,
                ...sponsors_fields,
                ...fields_from_constants.trim().split(","),
                ...speakers_badge_feature_fields
            ],
            relations,
            expands
        );

        if (!EventAPIRequest.instance) {
            EventAPIRequest.instance = this;
        }
    }

    static getInstance() {
        if (!EventAPIRequest.instance) {
            new EventAPIRequest();
        }
        return EventAPIRequest.instance;
    }

    static getParams(apiUrl) {
        const instance = EventAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());
        return apiUrl.query(true);
    }

    static build(apiUrl) {
        const instance = EventAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());

        return apiUrl.toString();
    }
}

module.exports = EventAPIRequest;
