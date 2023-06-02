import {
  collectionDefaults
} from "../../patterns";

import siteSettings from "./siteSettings";
import ads from "./ads";
import navbar from "./navbar";
import footer from "./footer";
import postersPages from "./postersPages";
import sponsorTiers from "./sponsorTiers";

const configurationsCollection = {
  ...collectionDefaults({
    label: "Configurations",
    name: "configurations"
  }),
  files: [
    siteSettings,
    ads,
    navbar,
    footer,
    postersPages,
    sponsorTiers
  ]
};

export default configurationsCollection;
