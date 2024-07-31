import {
  collectionDefaults
} from "../../patterns";

import marketingPage from "./marketingPage";
import lobbyPage from "./lobbyPage";
import expoHallPage from "./expoHallPage";
import invitationsRejectPage from "./invitationsRejectPage";
import mySchedulePage from "./mySchedulePage";

const defaultPagesCollection = {
  ...collectionDefaults({
    label: "Default Pages",
    name: "default-pages"
  }),
  files: [
    marketingPage,
    lobbyPage,
    expoHallPage,
    invitationsRejectPage,
    mySchedulePage
  ]
};

export default defaultPagesCollection;
