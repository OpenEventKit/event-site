import * as React from "react";
import { getSrc } from "gatsby-plugin-image";
import AuthComponent from "../AuthComponent";
import RegistrationModalComponent from "../RegistrationModalComponent";
import RegisterButton from "../RegisterButton";

import styles from "./styles.module.scss";

const ButtonGroup = ({ location, registerButton, loginButton }) => (
  <>
    {registerButton?.display && (
      <span className={styles.link}>
        <RegisterButton />
      </span>
    )}
    {registerButton?.display && (
      <span className={styles.link}>
        <RegistrationModalComponent location={location} />
      </span>
    )}
    {loginButton?.display && <AuthComponent location={location} />}
  </>
);

const MainColumn = ({ location, title, subTitle, date, time, buttons, backgroundSrc, fullWidth }) => {
  const backgroundImageStyle = backgroundSrc
    ? { backgroundImage: `url(${getSrc(backgroundSrc)})` }
    : {};
  return (
    <div className={`column ${!fullWidth ? "is-half" : ""} p-0 ${styles.mainColumn}`} style={backgroundImageStyle}>
      <div className={`hero-body ${styles.heroBody}`}>
        {title && <h1 className="title">{title}</h1>}
        {subTitle && <h2 className="subtitle">{subTitle}</h2>}
        {date && <h4>{date}</h4>}
        {time && <h4>{time}</h4>}
        <div className={styles.heroButtons}>
          <ButtonGroup {...buttons} location={location} />
        </div>
      </div>
    </div>
  );
};

export default MainColumn;
