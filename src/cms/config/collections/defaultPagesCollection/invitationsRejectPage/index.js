import {stringField} from "../../../fields";

import {
  INVITATIONS_REJECT_PAGE_FILE_PATH
} from "@utils/filePath";

const invitationsRejectPage = {
  label: "Invitations Reject Page",
  name: "invitations-reject-page",
  file: INVITATIONS_REJECT_PAGE_FILE_PATH,
  fields: [
    stringField({
      label: "Title",
      name: "title",
      default: "REJECTED thank you"
    }),
    stringField({
      label: "Subtitle",
      name: "subTitle",
      required: false
    }),
  ]
};

export default invitationsRejectPage;
  