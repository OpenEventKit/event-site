import * as React from "react";
import { Link as GatsbyLink } from "gatsby";
import Box from "@mui/material/Box";
// Since DOM elements <a> cannot receive activeClassName
// and partiallyActive, destructure the prop here and
// pass it only to GatsbyLink
const Link = ({ children, to, activeClassName, partiallyActive, ...other }) => {
  // Tailor the following test to your environment.
  // This example assumes that any internal link (intended for Gatsby)
  // will start with exactly one slash, and that anything else is external.
  const internal = /^\/(?!\/)/.test(to)
  // Use Gatsby Link for internal links, and <a> for others
  const email = /\S+@\S+\.\S+/.test(to);

  if (internal) {
    return (
      <GatsbyLink
        to={to}
        activeClassName={activeClassName}
        partiallyActive={partiallyActive}
        {...other}
      >
        {children}
      </GatsbyLink>
    );
  }
  if (email) {
    const href = /^mailto:/.test(to) ? to : `mailto:${to}`;
    return (
      <a href={href} {...other}>
        {children}
      </a>
    );
  }
  return (
    <a href={to} {...other} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

export const AnimatedLink = ({
  color = "white",
  hoverColor = "white",
  children,
  ...rest
}) => (
  <Box
    component={Link}
    sx={{
      position: "relative",
      color: color,
      "&:hover, &:focus": {
        color: hoverColor,
        textDecoration: "none",
        "&::before": {
          backgroundColor: hoverColor,
          transform: "scaleX(1)",
          transformOrigin: "left center"
        }
      },
      "&::before": {
        content: "\"\"",
        position: "absolute",
        left: 0,
        bottom: {
          xs: -0.5,
          md: -2
        },
        height: "0.5px",
        width: "100%",
        backgroundColor: color,
        transform: "scaleX(0)",
        transformOrigin: "right center",
        transition: "transform .45s cubic-bezier(0.86, 0, 0.07, 1)"
      }
    }}
    {...rest}
  >
    {children}
  </Box>
);

export default Link;
