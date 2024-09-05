import {  
  booleanField
} from "../../../fields";

import {
  BADGE_QR_PAGE_FILE_PATH
} from "@utils/filePath";

const badgeQrPage = {
  label: "Badge QR Page",
  name: "badge-qr-page",
  file: BADGE_QR_PAGE_FILE_PATH,
  fields: [
    booleanField({
      label: "Enable Badge QR Page",
      name: "enabled",
      required: false      
    })
  ]
};

export default badgeQrPage;
  