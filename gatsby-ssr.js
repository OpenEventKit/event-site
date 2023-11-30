import * as React from "react";
import ReduxSSRWrapper from "./src/state/ReduxSSRWrapper";
import { 
  HtmlAttributes,
  HeadComponents,
  PreBodyComponents
} from "./src/components/HeadComponents";

import { JSDOM } from "jsdom";
import { XMLHttpRequest } from "xmlhttprequest";

export const wrapRootElement = ReduxSSRWrapper;

export const onRenderBody = ({
  setHtmlAttributes,
  setHeadComponents,
  setPreBodyComponents
}, pluginOptions) => {
  setHtmlAttributes(HtmlAttributes);
  setHeadComponents(HeadComponents);
  setPreBodyComponents(PreBodyComponents);
};

// build enabler polyfills
global.dom = new JSDOM("...");
global.window = dom.window;
global.document = dom.window.document;
global.navigator = global.window.navigator;
global.window.matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {}
});
global.window.window.requestAnimationFrame = () => {};
global.window.window.cancelAnimationFrame = () => {};
global.XMLHttpRequest = XMLHttpRequest;
