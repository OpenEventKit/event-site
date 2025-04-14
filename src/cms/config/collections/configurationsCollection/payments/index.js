import {
  booleanField,
  fileField,
} from "../../../fields";

import {
  PAYMENTS_FILE_PATH,
  APPLE_PAY_DOMAIN_FILE_PATH,
  APPLE_PAY_DOMAIN_FILE_NAME
} from "@utils/filePath";

const payments = {
  label: "Payments",
  name: "payments",
  file: PAYMENTS_FILE_PATH,
  fields: [
    fileField({
      label: "Apply Pay Domain File",
      name: "applePayDomainFile",
      file: APPLE_PAY_DOMAIN_FILE_NAME,
      media_folder: APPLE_PAY_DOMAIN_FILE_PATH,
      public_folder: APPLE_PAY_DOMAIN_FILE_PATH,
    }),
    booleanField({
      label: "Hide Postal Code",
      name: "hidePostalCode",
      required: false,
    }),
  ],
};

export default payments;