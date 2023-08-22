import {
  collectionDefaults
} from "../../patterns";

import marketingPage from "./marketingPage";
import lobbyPage from "./lobbyPage";
import expoHallPage from "./expoHallPage";

const defaultPagesCollection = {
  ...collectionDefaults({
    label: "Default Pages",
    name: "default-pages"
  }),
  files: [
    marketingPage,
    lobbyPage,
    expoHallPage
  ]
};

export default defaultPagesCollection;
