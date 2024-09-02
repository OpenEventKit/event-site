import * as React from "react";
import { IconButton as BaseIconButton } from "@mui/material";
import { styled } from "@mui/system";

const IconButtonStyled = styled(BaseIconButton)(({ theme }) => ({
  color: "var(--color_background_dark)",
  fontSize: "2.5rem",
  borderRadius: 4,
  "&:hover": {
    backgroundColor: "transparent"
  },
  "& .MuiTouchRipple-root span": {
    backgroundColor: "transparent",
    borderRadius: 4,
    animation: "none"
  }
}))

const IconButton = ({
  children,
  ...rest
}) => {
  return (
    <IconButtonStyled 
      {...rest}
    >
      {children}
    </IconButtonStyled>
  );
};

export default IconButton;
