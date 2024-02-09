import CMS from "netlify-cms-app";
import config from "./config";

import "./cms-utils";

import { Widget as FileRelationWidget } from "@ncwidgets/file-relation";
import { Widget as IdWidget } from "@ncwidgets/id";

import IdentityProviderParamControl from "./widgets/IdentityProviderParamControl";
import ContentPagePreview from "./preview-templates/ContentPagePreview";

CMS.init({ config });

CMS.registerWidget(IdWidget);
CMS.registerWidget(FileRelationWidget);

CMS.registerWidget("identityProviderParam", IdentityProviderParamControl);
CMS.registerPreviewTemplate("contentPages", ContentPagePreview);