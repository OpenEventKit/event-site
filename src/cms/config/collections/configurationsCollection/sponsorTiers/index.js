import {
  stringField,
  selectField,
  selectOption,
  buttonField,
  objectField,
  listField,
  imageField,
  booleanField,
  ncwIdField
} from "../../../fields";


import {
  SPONSOR_TIERS_FILE_PATH
} from "@utils/filePath";

const tiers = {
  label: "Sponsors Tiers",
  name: "sponsors-tiers",
  file: SPONSOR_TIERS_FILE_PATH,
  fields: [
    listField({
      label: "Tiers",
      name: "tiers",
      fields: [
        stringField({
          label: "Tier",
          name: "name"
        }),
        stringField({
          label: "Widget Title",
          name: "widgetTitle",
          required: false,
        }),
        ncwIdField({
          label: "ID",
          name: "id"
        }),
        objectField({
          label: "Badge",
          name: "badge",
          required: false,
          fields: [
            imageField({
              label: "File",
              name: "file",
              required: false
            }),
            stringField({
              label: "Alt",
              name: "alt",
              required: false
            })
          ]
        }),
        objectField({
          label: "Lobby",
          name: "lobby",
          fields: [
            selectField({
              label: "Lobby Template",
              name: "lobbyTemplate",
              required: false,
              default: 'small-images',
              options: [
                selectOption({
                  label: "Big Images",
                  value: "big-images"
                }),
                selectOption({
                  label: "Small Images",
                  value: "small-images"
                }),
                selectOption({
                  label: "Horizontal Images",
                  value: "horizontal-images"
                }),
                selectOption({
                  label: "Carousel",
                  value: "carousel"
                })
              ]
            }),
            booleanField({
              label: "Display",
              name: "display",
              required: false,
              default: false
            })
          ]
        }),
        objectField({
          label: "Sponsor Page",
          name: "sponsorPage",
          fields: [
            selectField({
              label: "Sponsor Page Template",
              name: "sponsorTemplate",
              required: false,
              default: 'small-header',
              options: [
                selectOption({
                  label: "Big Header",
                  value: "big-header"
                }),
                selectOption({
                  label: "Small Header",
                  value: "small-header"
                }),
              ]
            }),
            objectField({
              label: "Widgets",
              name: "widgets",
              fields: [
                booleanField({
                  label: "Disqus",
                  name: "disqus",
                  required: false,
                  default: false
                }),
                booleanField({
                  label: "Live Event",
                  name: "liveEvent",
                  required: false,
                  default: false
                }),
                booleanField({
                  label: "Schedule",
                  name: "schedule",
                  required: false,
                  default: false
                }),
                booleanField({
                  label: "Banner",
                  name: "banner",
                  required: false,
                  default: false
                })
              ]
            })
          ]
        }),
        selectField({
          label: "In Event Template",
          name: "eventTemplate",
          required: false,
          default: 'small-images',
          options: [
            selectOption({
              label: "Big Images",
              value: "big-images"
            }),
            selectOption({
              label: "Small Images",
              value: "small-images"
            }),
            selectOption({
              label: "Horizontal Images",
              value: "horizontal-images"
            })
          ]
        })
      ]
    }),
    objectField({
      label: "Expo Hall Header Image",
      name: "imageHeader",
      required: false,
      fields: [
        imageField({
          label: "File",
          name: "file",
          required: false
        }),
        stringField({
          label: "Alt",
          name: "alt",
          required: false
        })
      ]
    }),
    buttonField({
      label: "Lobby Button",
      name: "lobbyButton",
    })
  ]
};

export default tiers;
