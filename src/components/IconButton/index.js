import * as React from "react";
import styles from "./styles.module.scss";

const IconButton = ({
  className = "",
  iconClass = "",
  buttonText,
  onClick = () => {},
  disabled = false
}) => (
  <button
    className={`button is-large mt-5 ${styles.button} ${className}`}
    onClick={onClick}
    disabled={disabled}
  >
    <i className={`icon ${iconClass}`} />
    <b>{buttonText}</b>
  </button>
);

export default IconButton;
