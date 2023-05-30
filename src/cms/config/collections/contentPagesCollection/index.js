import {
  collectionDefaults
} from "../../patterns";

import {
  hiddenField,
  stringField,
  selectField,
  selectOption,
  markdownField
} from "../../fields";

import {
  CONTENT_PAGES_DIR_PATH
} from "@utils/filePath";

const USER_REQUIREMENTS = {
  none: "NONE",
  loggedIn: "LOGGED_IN",
  hasTicket: "HAS_TICKET"
};

const getUserRequirementsOptions = () =>
  Object.entries(USER_REQUIREMENTS).map(([key, value]) => selectOption({ label: value, value: value }));

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
      options: getUserRequirementsOptions()
    }),
    markdownField({
      label: "Body",
      name: "body"
    })
  ]
};

export {
  USER_REQUIREMENTS
};

export default contentPagesCollection;
