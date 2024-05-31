import React from "react";
import PropTypes from "prop-types";

const imageStyles = {
  maxWidth: "100%",
  height: "auto"
};

const ResponsiveImage = ({ src, alt, maxWidth = "100%", padding = "0" }) => {
  const containerStyles = {
    maxWidth: maxWidth,
    padding: padding,
    display: "flex",
    justifyContent: "center"
  };
  return (
    <div style={containerStyles}>
      <img src={src} alt={alt} style={imageStyles} />
    </div>
  );
};

ResponsiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  maxWidth: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  padding: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default ResponsiveImage;
