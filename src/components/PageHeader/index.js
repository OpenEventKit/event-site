import * as React from "react";

import styles from "./index.module.scss";

const PageHeader = ({
  title,
  subtitle,
  backgroundImageSrc
}) => (
  <section className={styles.pageHeader}>
    <div className={styles.titles}>
      <h1>{title}</h1>
      <span class={styles.subtitle}>{subtitle}</span>
    </div>
    {backgroundImageSrc &&
      <div className={styles.image} style={{backgroundImage: `url(${backgroundImageSrc})`}}></div>
    }
  </section>
);

export default PageHeader;