import {    
  stringField,
  objectField,
  imageWithAltField
} from "../../../fields";

import {
  EXPO_HALL_PAGE_FILE_PATH
} from "@utils/filePath";

const expoHallPage = {
  label: "Expo Hall Page",
  name: "expo-hall-page",
  file: EXPO_HALL_PAGE_FILE_PATH,
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
    })
  ]
};

export default expoHallPage;
  