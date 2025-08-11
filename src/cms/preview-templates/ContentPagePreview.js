import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { MDXProvider } from "@mdx-js/react";
import { evaluateSync } from "@mdx-js/mdx";
import * as jsxRuntime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";

import ContentPageTemplate from "../../templates/content-page/template";
import shortcodes from "../../templates/content-page/shortcodes";

// normalize Decap asset -> URL
const toUrl = (asset) => {
  if (!asset) return "";
  if (typeof asset === "string") return asset;
  if (asset.url) return asset.url;
  if (typeof asset.toString === "function") return asset.toString();
  return "";
};

// replace relative image URLs with absolute ones
const transformContent = (mdx, getAsset) => {
  const imageRegex = /!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  return (mdx || "").replace(imageRegex, (m, alt, url) => {
    if (/^https?:\/\//i.test(url)) return m;
    const abs = toUrl(getAsset(url));
    return abs ? `![${alt}](${abs})` : m;
  });
};

const ContentPagePreview = ({ entry, getAsset }) => {
  const title = entry.getIn(["data", "title"]);
  const body = entry.getIn(["data", "body"]) || "";

  const mdxCode = useMemo(() => transformContent(body, getAsset), [body, getAsset]);

  // Compile MDX to a React component (synchronously for preview)
  const { default: Content } = useMemo(
      () =>
          evaluateSync(mdxCode, {
            ...jsxRuntime,
            remarkPlugins: [remarkGfm],
            rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["nofollow", "noopener", "noreferrer"] }]],
            // keep it simple in preview; avoid dynamic import
            useDynamicImport: false,
          }),
      [mdxCode]
  );

  return (
      <MDXProvider components={shortcodes}>
        <ContentPageTemplate title={title} content={<Content components={shortcodes} />} />
      </MDXProvider>
  );
};

ContentPagePreview.propTypes = {
  entry: PropTypes.shape({ getIn: PropTypes.func.isRequired }).isRequired,
  getAsset: PropTypes.func.isRequired,
};

export default ContentPagePreview;
