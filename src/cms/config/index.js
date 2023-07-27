import configurationsCollection from "./collections/configurationsCollection";
import defaultPagesCollection from "./collections/defaultPagesCollection";
import contentPagesCollection from "./collections/contentPagesCollection";

const CMS_BACKEND_REPO = process.env.GATSBY_CMS_BACKEND_REPO;
const CMS_BACKEND_BRANCH = process.env.GATSBY_CMS_BACKEND_BRANCH ||  "main";

export const collections = [
  configurationsCollection,
  defaultPagesCollection,
  contentPagesCollection
];

const config = {
  backend: {
    name: "github",
    repo: CMS_BACKEND_REPO,
    branch: CMS_BACKEND_BRANCH,
    commit_messages: {
      create: "Create {{collection}} “{{slug}}”",
      update: "Update {{collection}} “{{slug}}”",
      delete: "Delete {{collection}} “{{slug}}”",
      uploadMedia: "[skip ci] Upload “{{path}}”",
      deleteMedia: "[skip ci] Delete “{{path}}”",
    }
  },
  // It is not required to set `load_config_file` if the `config.yml` file is
  // missing, but will improve performance and avoid a load error.
  load_config_file: false,
  media_folder: "static/img",
  public_folder: "/img",
  collections: collections
};

export default config;
