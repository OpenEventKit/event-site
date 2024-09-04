import { collectionDefaults } from "../../patterns";

import {
  hiddenField,
  stringField,
  selectField,
  selectOption,
  markdownField
} from "../../fields";

import { CONTENT_PAGES_DIR_PATH } from "@utils/filePath";
import { USER_REQUIREMENTS } from "@utils/pageAccessConstants";

import { mapObjectToSelectOptions } from "../../utils";

const contentPagesCollection = {
  ...collectionDefaults({
    label: "Content Pages",
    name: "contentPages",
    editor: {
      preview: true
    }
  }),
  folder: CONTENT_PAGES_DIR_PATH,
  create: true,
  slug: "{{slug}}",
  fields: [
    hiddenField({
      label: "Template Key",
      name: "templateKey",
      default: "content-page"
    }),
    stringField({
      label: "Title",
      name: "title"
    }),
    selectField({
      label: "User Requirement",
      name: "userRequirement",
      multiple: false,
      default: USER_REQUIREMENTS.none,
      options: mapObjectToSelectOptions(USER_REQUIREMENTS)
    }),
    markdownField({
      label: "Body",
      name: "body"
    })
  ]
};

export default contentPagesCollection;
