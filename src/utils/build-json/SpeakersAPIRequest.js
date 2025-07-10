const BaseAPIRequest = require("./BaseAPIRequest");
class SpeakersAPIRequest extends BaseAPIRequest {
    static instance;

    constructor() {

        const primary_fields =
            ['id', 'first_name', 'last_name', 'title', 'bio', 'member_id', 'pic', 'big_pic', 'company'];

        const badge_features_fields = 
            ['badge_features.id', 'badge_features.image', 'badge_features.name'];

        const relations = [
            'badge_features',            
            'all_presentations',
            'all_moderated_presentations',
        ];

        const expands = [
            'badge_features'
        ];

        super(
            [
                ...primary_fields,
                ...badge_features_fields
            ],
            relations,
            expands
        );

        if (!SpeakersAPIRequest.instance) {
            SpeakersAPIRequest.instance = this;
        }
    }

    static getInstance() {
        if (!SpeakersAPIRequest.instance) {
            new SpeakersAPIRequest();
        }
        return SpeakersAPIRequest.instance;
    }

    static getParams(apiUrl) {
        const instance = SpeakersAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());
        return apiUrl.query(true);
    }

    static build(apiUrl) {
        const instance = SpeakersAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());

        return apiUrl.toString();
    }
}

module.exports = SpeakersAPIRequest;
