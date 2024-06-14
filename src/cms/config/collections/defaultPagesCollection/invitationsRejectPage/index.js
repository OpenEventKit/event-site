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
      label: "Reject text",
      name: "rejectText",
      required: false,
      default: "To reject please click on the button below."
    }),
    stringField({
      label: "Reject Confirmation Text",
      name: "rejectedText",
      required: false,
      default: "Invitation has already been rejected."
    }),
    stringField({
      label: "Reject CTA label",
      name: "rejectCTALabel",
      required: false,
      default: "Reject Invitation"
    }),
    stringField({
      label: "Already Accepted Invitation Error",
      name: "alreadyAcceptedInvitationError",
      required: false,
      default: "This invitation has already been accepted. Please contact the event organizer if you feel this is an error."
    }),
    stringField({
      label: "Already Rejected Invitation Error",
      name: "alreadyRejectedInvitationError",
      required: false,
      default: "This invitation has already been declined. Please contact the event organizer if you feel this is an error."
    }),
  ]
};

export default invitationsRejectPage;
