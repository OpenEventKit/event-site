import {
  booleanField,
  stringField,
  textField,
  imageField,
  selectField,
  selectOption,
  objectField
} from "../../../fields";

import {
  SITE_SETTINGS_FILE_PATH
} from "@utils/filePath";

const siteSettings = {
  label: "Site Settings",
  name: "site-settings",
  file: SITE_SETTINGS_FILE_PATH,
  fields: [
    objectField({
      label: "Site Metadata",
      name: "siteMetadata",
      fields: [
        stringField({
          label: "title",
          name: "title",
          required: false
        }),
        textField({
          label: "description",
          name: "description",
          required: false
        })
      ]
    }),
    objectField({
      label: "Favicons",
      name: "favicons",
      fields: [
        imageField({
          label: "Favicon 180x180",
          name: "favicon180",
          required: false
        }),
        imageField({
          label: "Favicon 32x32",
          name: "favicon32",
          required: false
        }),
        imageField({
          label: "Favicon 16x16",
          name: "favicon16",
          required: false
        })
      ]
    }),
    objectField({
      label: "Widgets",
      name: "widgets",
      fields: [
        objectField({
          label: "Chat",
          name: "chat",
          fields: [
            booleanField({
              label: "Show QA",
              name: "showQA",
              required: false,
              default: false
            }),
            booleanField({
              label: "Show Help",
              name: "showHelp",
              required: false, 
              default: false
            }),
            selectField({
              label: "Default Filter Criteria",
              name: "defaultScope",
              default: 'page',
              options: [
                selectOption({
                  label: "In this Room",
                  value: "page"
                }),
                selectOption({
                  label: "All Attendees",
                  value: "show"
                })
              ]
            })
          ]
        }),
        objectField({
          label: "Schedule",
          name: "schedule",
          fields: [
            booleanField({
              label: "Allow Clickable Behavior",
              name: "allowClick",
              required: false,
              default: true
            }),
          ]
        }),
      ]
    })
  ]
};

export default siteSettings;
