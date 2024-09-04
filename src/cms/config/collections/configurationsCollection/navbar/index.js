import {
  booleanField,
  stringField,
  selectField,
  selectOption,
  listField
} from "../../../fields";

import { NAVBAR_FILE_PATH } from "@utils/filePath";
import { USER_REQUIREMENTS, PAGE_RESTRICTIONS } from "@utils/pageAccessConstants";

import { mapObjectToSelectOptions } from "../../../utils";

const navbar = {
  label: "Navbar",
  name: "navbar",
  file: NAVBAR_FILE_PATH,
  fields: [
    listField({
      label: "Navbar",
      name: "items",
      fields: [
        stringField({
          label: "Title",
          name: "title"
        }),
        stringField({
          label: "Link",
          name: "link"
        }),
        booleanField({
          label: "Display?",
          name: "display",
          required: false
        }),
        selectField({
          label: "User Requirement",
          name: "userRequirement",
          multiple: false,
          default: USER_REQUIREMENTS.none,
          options: mapObjectToSelectOptions(USER_REQUIREMENTS)
        }),
        selectField({
          label: "Show only on Page",
          name: "pageRestriction",
          multiple: true,
          default: [PAGE_RESTRICTIONS.any],
          options: mapObjectToSelectOptions(PAGE_RESTRICTIONS)
        }),
        booleanField({
          label: "Show only at Show Time?",
          name: "showOnlyAtShowTime",
          required: false,
          default: false
        })
      ]
    })
  ]
};

export default navbar;
