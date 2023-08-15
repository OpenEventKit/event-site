import {    
    stringField,
    imageField,
    objectField
  } from "../../../fields";
  
  import {
    EXPO_HALL_FILE_PATH
  } from "@utils/filePath";
  
  const expoHallSettings = {
    label: "Expo Hall Settings",
    name: "expo-hall",
    file: EXPO_HALL_FILE_PATH,
    fields: [
      objectField({
        label: "Expo Hall Header Image",
        name: "imageHeader",
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
        label: "Lobby Button",
        name: "lobbyButton",
        fields: [
          stringField({
            label: "Text",
            name: "text",
            required: false
          }),
          stringField({
            label: "Link",
            name: "link",
            required: false
          }),
        ]
      }),
    ]
  };
  
  export default expoHallSettings;
  