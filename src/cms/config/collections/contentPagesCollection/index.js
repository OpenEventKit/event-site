import { collectionDefaults } from "../../patterns";

import {
  hiddenField,
  stringField,
  selectField,
  markdownField
} from "../../fields";

import { CONTENT_PAGES_DIR_PATH } from "@utils/filePath";
import { USER_REQUIREMENTS } from "@utils/pageAccessConstants";

import { mapObjectToSelectOptions } from "../../utils";
import shortcodes from "../../../../templates/content-page/shortcodes";

const shortcodesHint = `Available shortcodes: ${Object.keys(shortcodes).map(name => `<${name} />`).join(", ")}`;

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
    stringField({
      label: "Slug",
      name: "slug",
      required: false,
      hint: "URL path for this page (e.g. registration). Leave empty to use the default path based on the title. Changing this will change the page URL."
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
      name: "body",
      hint: shortcodesHint
    })
  ]
};

export default contentPagesCollection;
