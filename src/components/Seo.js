import * as React from "react";
import PropTypes from "prop-types";
import useSiteSettings from "@utils/useSiteSettings";
import { Helmet } from "react-helmet";
import { getSrc } from "gatsby-plugin-image";
import { getUrl } from "@utils/urlFormating";

const Seo = ({ title, description, location, children }) => {
  const {
    siteMetadata: {
      title: siteTitle,
      description: defaultDescription,
      image
    }
  } = useSiteSettings();
  const host = typeof window !== "undefined" ? window.location.host : null;
  const scheme = typeof window !== "undefined" ? window.location.protocol.replace(":", "") : "https";
  const { pathname } = location;
  const seo = {
    title: title ? `${siteTitle} - ${title}` : siteTitle,
    description: description || defaultDescription,
    url: getUrl(scheme, host, pathname),
    image: host && image ? getUrl(scheme, host, getSrc(image)) : null,
  };
  return (
    <Helmet>
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
    </Helmet>
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
