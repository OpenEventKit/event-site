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
      default: "Reject Invitation"
    }),
    stringField({
      label: "Not found text",
      name: "notFoundText",
      required: false,
      default: "Invitation not found."
    }),
    stringField({
      label: "Rejected text",
      name: "rejectedText",
      required: false,
      default: "Invitation has already been rejected."
    }),
    stringField({
      label: "Reject text",
      name: "rejectText",
      required: false,
      default: "To reject please click on the button below."
    }),
    stringField({
      label: "Reject CTA label",
      name: "rejectCTALabel",
      required: false,
      default: "Reject Invitation"
    }),
  ]
};

export default invitationsRejectPage;
  