import {
  booleanField,
  stringField,
  textField,
  imageField,
  selectField,
  selectOption,
  objectField,
  fileField
} from "../../../fields";

import {
  SITE_SETTINGS_FILE_PATH,
  CMS_FONT_FILE_PATH
} from "@utils/filePath";

const FONT_FORMATS = {
  truetype: "ttf",
  opentype: "otf",
  woff: "woff",
  woff2: "woff2",
  eot: "eot",
};

const getFontFormatOptions = () =>
  Object.entries(FONT_FORMATS).map(([key, value]) => selectOption({ label: value, value: value }));

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
      label: "Favicon",
      name: "favicon",
      fields: [
        imageField({
          label: "Image for favicon generation (squared, at least 512x512)",
          name: "asset",
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
              label: "Enabled?",
              name: "enabled",
              required: true,
              default: true
            }),
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
    }),
    objectField({
      label: "Site Font",
      name: "siteFont",
      fields: [
        textField({
          label: "Font Name",
          name: "fontFamily",
          required: false,
          default: "Nunito Sans"
        }),
        objectField({
          label: "Regular Font",
          name: "regularFont",
          fields: [
            fileField({
              label: "Font File",
              name: "fontFile",
              required: false,
              media_folder: CMS_FONT_FILE_PATH,
            }),
            selectField({
              label: "Font Format",
              name: "fontFormat",
              multiple: false,
              required: false,
              options: getFontFormatOptions()
            })
          ],
        }),
        objectField({
          label: "Bold Font",
          name: "boldFont",
          fields: [
            fileField({
              label: "Font File",
              name: "fontFile",
              media_folder: CMS_FONT_FILE_PATH,
              required: false,
            }),
            selectField({
              label: "Font Format",
              name: "fontFormat",
              multiple: false,
              required: false,
              options: getFontFormatOptions()
            })
          ],
        }),
      ]
    }),
  ]
};

export default siteSettings;
