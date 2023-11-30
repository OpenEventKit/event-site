import * as React from "react";
import PropTypes from "prop-types";
import useSiteMetadata from "@utils/useSiteMetadata";
import useSiteSettings from "@utils/useSiteSettings";
import { getSrc } from "gatsby-plugin-image";
import { buildUrl } from "@utils/urlFormating";
import { getEnvVariable, SITE_URL } from "@utils/envVariables";

const Seo = ({ title, description, location, children }) => {
  const {
    title: siteTitle,
    description: defaultDescription
  } = useSiteMetadata();
  const {
    siteMetadata: {
      image
    }
  } = useSiteSettings();

  const siteUrl = getEnvVariable(SITE_URL);
  const siteUrlInfo = siteUrl ? new URL(siteUrl) : null;
  const scheme = siteUrlInfo ? siteUrlInfo.protocol.replace(":", "") : "https";
  const host = siteUrlInfo ? siteUrlInfo.host : null;
  const { pathname } = location;

  const seo = {
    title: title ? `${siteTitle} - ${title}` : siteTitle,
    description: description || defaultDescription,
    url: buildUrl(scheme, host, pathname),
    image: host && image ? buildUrl(scheme, host, getSrc(image)) : null,
  };
  return (
    <>
      {seo.title && <title>{seo.title}</title>}
      {seo.description && <meta name="description" content={seo.description} />}
      {seo.url && <meta property="og:url" content={seo.url} />}
      <meta property="og:type" content="website" />
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && <meta property="og:description" content={seo.description} />}
      {seo.image && <meta property="og:image" content={seo.image} />}
      {seo.image && <meta name="twitter:card" content="summary_large_image" />}
      {host && <meta property="twitter:domain" content={host} />}
      {seo.url && <meta property="twitter:url" content={seo.url} />}
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && <meta name="twitter:description" content={seo.description} />}
      {seo.image && <meta name="twitter:image" content={seo.image} />}
      {children}
    </>
  );
};

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.node
};

export default Seo;
