import React from "react";
import PropTypes from "prop-types";
import MDX from "@mdx-js/runtime";
import ContentPageTemplate from "../../templates/content-page/template";
import shortcodes from "../../templates/content-page/shortcodes";

// function to transform content by replacing relative image URLs with absolute ones
const transformContent = (mdx, getAsset) => {
  // regex to identify Markdown image tags ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;

  return mdx.replace(imageRegex, (match, alt, url) => {
    // check if the URL is relative (does not start with http:// or https://)
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      const asset = getAsset(url);
      if (asset && asset.url) {
        return `![${alt}](${asset.url})`;
      }
    }
    return match; // return the original match if it's already an absolute URL
  });
};

// function to render transformed content with MDX
const renderContent = (mdx, getAsset) => (
  <MDX components={shortcodes}>
    {transformContent(mdx, getAsset)}
  </MDX>
);

const ContentPagePreview = ({ entry, getAsset }) => {
  const title = entry.getIn(["data", "title"]);
  const body = entry.getIn(["data", "body"]);
  return (
    <ContentPageTemplate
      title={title}
      content={renderContent(body, getAsset)}
    />
  );
};

ContentPagePreview.propTypes = {
  entry: PropTypes.shape({
    getIn: PropTypes.func.isRequired
  }).isRequired,
  getAsset: PropTypes.func.isRequired
};

export default ContentPagePreview;
