import * as React from "react";
import { Button as BaseButton } from "@mui/base";
import { styled } from "@mui/system";

const StyledButton = styled(BaseButton)({
  width: "100%",
  height: "5.5rem",
  color: "var(--color_input_text_color)",
  backgroundColor: "var(--color_input_background_color)",
  borderColor: "var(--color_input_border_color)",
  borderStyle: "solid",
  borderWidth: 1,
  borderRadius: 4,
  fontSize: "1.5rem",
  fontFamily: "var(--font_family)",
  justifyContent: "center",
  textAlign: "center",
  whiteSpace: "nowrap",
  padding: "calc(0.5em - 1px) 1em",
  display: "inline-flex",
  alignItems: "center",
  lineHeight: 1.5,
  ":disabled": {
    opacity: 0.65
  }
});

const Button = ({
  children,
  ...rest
}) => {
  return (
    <StyledButton 
      {...rest}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
