import React, { useEffect } from "react";
import { navigate } from "gatsby";
import { Box, Typography } from "@mui/material";

const containerStyles = (contained) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  width: "100%",
  height: contained ? "100%" : "100vh"
});

const titleStyle = {
  color: "var(--color_text_dark)",
  fontFamily: "var(--font_family)",
  fontSize: "2rem",
  fontWeight: 600,
  lineHeight: 1.125,
};

const subtitleStyle = {
  color: "var(--color_text_dark)",
  fontFamily: "var(--font_family)",
  fontSize: "1.25rem",
  fontWeight: 400,
  lineHeight: 1.25,
};

const Interstitial = ({
  children,
  title,
  subtitle,
  navigateTo,
  navigateOptions = {},
  timeout = 3000,
  contained = false
}) => {
  useEffect(() => {
    if (navigateTo) {
      const timer = setTimeout(() => navigate(navigateTo, navigateOptions), timeout);
      return () => clearTimeout(timer);
    }
  }, [navigateTo, navigateOptions, timeout]);

  return (
    <Box sx={containerStyles(contained)}>
      {children ? (
        children
      ) : (
        <Box sx={{ width: "100%", textAlign: "center" }}>
          <Typography sx={titleStyle} gutterBottom>
            {title}
          </Typography>
          <Typography sx={subtitleStyle}>{subtitle}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default Interstitial;
