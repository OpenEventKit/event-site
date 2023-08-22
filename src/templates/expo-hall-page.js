import React from "react";
import { getSrc } from "gatsby-plugin-image";
import Layout from "../components/Layout";
import SponsorComponent from "../components/SponsorComponent";
import AttendanceTrackerComponent from "../components/AttendanceTrackerComponent";
import AccessTracker from "../components/AttendeeToAttendeeWidgetComponent";

import styles from "../styles/expo-hero.module.scss";

const ExpoHallPage = ({
  data,
  location,
  imageHeader
}) => {
  const { expoHallPageJson: { hero } } = data;
  const style = hero?.background ? { backgroundImage: `url(${getSrc(hero.background.src)})` } : {};
  return (
    <Layout location={location}>
      <AttendanceTrackerComponent />
      <AccessTracker />
      { hero && (hero.background || hero.title || hero.subTitle) &&
      <section className="hero is-large sponsors-header" style={style}>
        <div className="hero-body">
          <div className={styles.heroContainer}>
            <h1 className={styles.title}>
              {hero.title}
            </h1>
            <span className={styles.subtitle}>
              {hero.subTitle}
            </span>
          </div>
        </div>
      </section>
      }    
      <section className="section px-6 py-6">
        <SponsorComponent />
      </section>
    </Layout>
  )
};

export default ExpoHallPage;
