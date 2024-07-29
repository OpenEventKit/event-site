import {
  booleanField,
  stringField
} from "../../../fields";

import {
  MY_SCHEDULE_PAGE_FILE_PATH
} from "@utils/filePath";

const mySchedulePage = {
  label: "My Schedule Page",
  name: "my-schedule-page",
  file: MY_SCHEDULE_PAGE_FILE_PATH,
  fields: [
    stringField({
      label: "Title",
      name: "title",
      default: "My Schedule",
      required: true
    }),
    stringField({
      label: "Key",
      name: "key",
      default: "my-schedule-main",
      required: true
    }),
    booleanField({
      label: "Needs Ticket Permission?",
      name: "needsTicketAuthz",
      required: true,
      default: false
    })
  ]
};

export default mySchedulePage;
