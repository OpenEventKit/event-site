import * as React from "react";
import Link from "./Link";

import { getFASocialIcons } from '../utils/helpers';

import footerContent from "content/footer/index.json";

import styles from "../styles/footer.module.scss";

const FooterMarketing = () => (
  <div className={styles.footerMarketing}>
    <div className={styles.legalItems}>
      {footerContent.legal.map((item, index) => {
        return (
          <Link to={item.link} className={styles.link} key={index}>
            <span className={styles.legalItem}>
              {item.title}
            </span>
          </Link>
        )
      })}
    </div>
    <div className={styles.socialNetworks}>
      {footerContent.social.networks.map((net, index) => (
        net.display &&
        <Link href={net.link} className={styles.link} key={index}>
          {getFASocialIcons(net.icon)}
        </Link>
      ))}
    </div>
  </div>
);

export default FooterMarketing;
