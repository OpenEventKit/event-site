import {
  booleanField,
  numberField,
  stringField,
  objectField,
  imageWithAltField
} from "../../../fields";

import {
  LOBBY_PAGE_FILE_PATH
} from "@utils/filePath";

const lobbyPage = {
  label: "Lobby Page",
  name: "lobby-page",
  file: LOBBY_PAGE_FILE_PATH,
  fields: [
    objectField({
      label: "Hero",
      name: "hero",
      fields: [
        stringField({
          label: "Title",
          name: "title"
        }),
        stringField({
          label: "Subtitle",
          name: "subTitle",
          required: false
        }),
        imageWithAltField({
          label: "Background Image",
          name: "background"
        })
      ]
    }),
    objectField({
      label: "Center Column",
      name: "centerColumn",
      fields: [
        objectField({
          label: "Speakers",
          name: "speakers",
          fields: [
            booleanField({
              label: "Show Today Speakers",
              name: "showTodaySpeakers",
              default: false
            }),
            booleanField({
              label: "Show Feature Speakers",
              name: "showFeatureSpeakers",
              default: false
            })
          ]
        })
      ]
    }),
    numberField({
      label: "Live Event Widget - Featured Event",
      name: "liveNowFeaturedEventId",
      required: false
    })
  ]
};

export default lobbyPage;
