
import Link from "./Link";
import Box from "@mui/material/Box";

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
  
  export default AnimatedLink;
  