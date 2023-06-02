import {
    hiddenField,
    stringField,
    listField,
    ncwFileRelationField,
    numberField,
    markdownField,
    objectField,
    imageField,
    booleanField,
    fileField
} from "../../../fields";

import {
    SPONSOR_DATA_FILE_PATH
} from "@utils/filePath";

const sponsors = {
    label: "Sponsors Tiers",
    name: "sponsors-tiers",
    file: SPONSOR_DATA_FILE_PATH,
    fields: [
        listField({
            label: "Tier Sponsors",
            name: "tierSponsors",
            summary: "{{tier[0].label}}",
            fields: [
                ncwFileRelationField({
                    label: "Tier",
                    name: "tier",
                    collection: "configurations",
                    file: "sponsorsTiers",
                    target_field: "tiers",
                    id_field: "id",
                    display_fields: "name"
                }),
                //     {label: "Sponsors", name: "sponsors", widget: list, fields: [
                listField({
                    label: "Sponsors",
                    name: "sponsors",
                    fields: [
                        stringField({
                            label: "Name",
                            name: "name"
                        }),
                        numberField({
                            label: "External ID",
                            name: "id"
                        }),
                        numberField({
                            label: "Sponsor ID",
                            name: "sponsorId",
                            required: false
                        }),
                        numberField({
                            label: "Company ID",
                            name: "companyId",
                            required: false
                        }),
                        numberField({
                            label: "Featured Event ID",
                            name: "featuredEventId",
                            required: false
                        }),
                        stringField({
                            label: "Title",
                            name: "title",
                            required: false
                        }),
                        markdownField({
                            label: "Intro",
                            name: "intro",
                            required: false
                        }),
                        stringField({
                            label: "Contact Email",
                            name: "email",
                            required: false
                        }),
                        stringField({
                            label: "Live Video Chat Link",
                            name: "chatLink",
                            required: false
                        }),
                        stringField({
                            label: "Marquee Text",
                            name: "marquee",
                            required: false
                        }),
                        stringField({
                            label: "Sponsor Color",
                            name: "sponsorColor",
                            required: false
                        }),
                        objectField({
                            label: "Logo",
                            name: "logo",
                            required: false,
                            fields: [
                                imageField({
                                    label: "File",
                                    name: "file",
                                    default: '',
                                    required: false
                                }),
                                stringField({
                                    label: "Alt",
                                    name: "alt",
                                    required: false
                                }),
                            ]
                        }),
                        objectField({
                            label: "Advertise Image",
                            name: "advertiseImage",
                            required: false,
                            fields: [
                                imageField({
                                    label: "File",
                                    name: "file",
                                    default: '',
                                    required: false
                                }),
                                stringField({
                                    label: "Alt",
                                    name: "alt",
                                    required: false
                                }),
                            ]
                        }),
                        stringField({
                            label: "External Link",
                            name: "externalLink",
                            required: false
                        }),
                        listField({
                            label: "Social Networks",
                            name: "socialNetworks",
                            fields: [
                                stringField({
                                    label: "Icon",
                                    name: "icon"
                                }),
                                stringField({
                                    label: "Link",
                                    name: "link"
                                }),
                                booleanField({
                                    label: "Display",
                                    name: "display",
                                    required: false
                                }),
                            ]
                        }),
                        objectField({

                            label: "Documents",
                            name: "documents",
                            fields: [
                                listField({
                                    label: "Slides",
                                    name: "slides",
                                    fields: [
                                        hiddenField({
                                            label: "Class Name",
                                            name: "class_name",
                                            default: "PresentationSlide"
                                        }),
                                        stringField({
                                            label: "Name",
                                            name: "name"
                                        }),
                                        numberField({
                                            label: "Order",
                                            name: "order"
                                        }),
                                        fileField({
                                            label: "Link",
                                            name: "link",
                                            default: "/documents/"
                                        })
                                    ]
                                }),
                                listField({
                                    label: "Links",
                                    name: "links",
                                    fields: [
                                        hiddenField({
                                            label: "Class Name",
                                            name: "class_name",
                                            default: "PresentationLink"
                                        }),
                                        stringField({
                                            label: "Name",
                                            name: "name"
                                        }),
                                        numberField({
                                            label: "Order",
                                            name: "order"
                                        }),
                                        stringField({
                                            label: "Link",
                                            name: "link",
                                        })
                                    ]
                                }),
                                listField({
                                    label: "Videos",
                                    name: "videos",
                                    fields: [
                                        hiddenField({
                                            label: "Class Name",
                                            name: "class_name",
                                            default: "PresentationVideo"
                                        }),
                                        stringField({
                                            label: "Name",
                                            name: "name"
                                        }),
                                        numberField({
                                            label: "Order",
                                            name: "order"
                                        }),
                                        stringField({
                                            label: "Link",
                                            name: "link",
                                        })
                                    ]
                                }),
                            ]
                        }),
                        listField({
                            label: "Ads",
                            name: "columnAds",
                            required: false,
                            fields: [
                                imageField({
                                    label: "Image",
                                    name: "image"
                                }),
                                stringField({
                                    label: "Alt",
                                    name: "alt",
                                    required: false
                                }),
                                stringField({
                                    label: "Button Text",
                                    name: "text",
                                    required: false
                                },),
                                stringField({
                                    label: "Link",
                                    name: "link",
                                    required: false
                                }),
                            ]
                        }),
                        booleanField({
                            label: "Uses Sponsor Page?",
                            name: "usesSponsorPage",
                            required: false
                        }),
                        objectField({
                            label: "Header Image",
                            name: "headerImage",
                            required: false,
                            fields: [
                                imageField({
                                    label: "File",
                                    name: "file",
                                    default: '',
                                    required: false
                                }),
                                stringField({
                                    label: "Alt",
                                    name: "alt",
                                    required: false
                                }),
                            ]
                        }),
                        objectField({
                            label: "Mobile Header Image",
                            name: "headerImageMobile",
                            required: false,
                            fields: [
                                imageField({
                                    label: "File",
                                    name: "file",
                                    default: '',
                                    required: false
                                }),
                                stringField({
                                    label: "Alt",
                                    name: "alt",
                                    required: false
                                }),
                            ]
                        }),
                        objectField({
                            label: "Side Image",
                            name: "sideImage",
                            required: false,
                            fields: [
                                imageField({
                                    label: "File",
                                    name: "file",
                                    default: '',
                                    required: false
                                }),
                                stringField({
                                    label: "Alt",
                                    name: "alt",
                                    required: false
                                }),
                            ]
                        }),
                        stringField({
                            label: "Video Header",
                            name: "headerVideo",
                            required: false
                        }),
                        booleanField({
                            label: "Show Logo in Event Page",
                            name: "showLogoInEventPage",
                            required: false,
                            default: true,
                        })
                    ]
                })
            ]
        })
    ]
}

export default sponsors;