import * as React from "react";
import * as ReactDOMServer from "react-dom/server";
import createEmotionServer from "@emotion/server/create-instance";
import createEmotionCache from "./src/utils/createEmotionCache";
import {
  HtmlAttributes,
  HeadComponents,
  PreBodyComponents
} from "./src/components/HeadComponents";
import ReduxWrapper from "./src/state/ReduxWrapper";
import wrapThemeProvider from "./src/utils/wrapThemeProvider";

// Polyfills for build environment
import "./src/utils/buildPolyfills";

const renderToStringWithEmotion = (bodyComponent) => {
  const cache = createEmotionCache();
  const { extractCriticalToChunks, constructStyleTagsFromChunks } = createEmotionServer(cache);

  const wrappedComponent = wrapThemeProvider({ element: ReduxWrapper({ element: bodyComponent }) });

  const html = ReactDOMServer.renderToString(wrappedComponent);
  const emotionChunks = extractCriticalToChunks(html);
  const emotionCss = constructStyleTagsFromChunks(emotionChunks);

  return { html, emotionCss };
};

export const replaceRenderer = ({
  bodyComponent,
  setHeadComponents,
  replaceBodyHTMLString
}) => {
  const { html, emotionCss } = renderToStringWithEmotion(bodyComponent);

  const emotionStyleTags = (
    <style
      key="emotion-style"
      dangerouslySetInnerHTML={{ __html: emotionCss }}
    />
  );

  setHeadComponents([emotionStyleTags]);
  replaceBodyHTMLString(html);
};

export const onRenderBody = ({
  setHtmlAttributes,
  setHeadComponents,
  setPreBodyComponents
}) => {
  setHtmlAttributes(HtmlAttributes);
  setHeadComponents(HeadComponents);
  setPreBodyComponents(PreBodyComponents);
};
