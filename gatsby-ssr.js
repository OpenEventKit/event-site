import ReduxWrapper from "./src/state/ReduxWrapper";
import { 
  HtmlAttributes,
  HeadComponents,
  PreBodyComponents
} from "./src/components/HeadComponents";

// build enabler polyfills
import "./src/utils/buildPolyfills";

export const wrapRootElement = ReduxWrapper;

export const onRenderBody = ({
  setHtmlAttributes,
  setHeadComponents,
  setPreBodyComponents
}, pluginOptions) => {
  setHtmlAttributes(HtmlAttributes);
  setHeadComponents(HeadComponents);
  setPreBodyComponents(PreBodyComponents);
};
