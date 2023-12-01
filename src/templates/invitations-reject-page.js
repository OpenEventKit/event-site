import React, { useEffect, useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import Layout from "../components/Layout";
import AttendanceTrackerComponent from "../components/AttendanceTrackerComponent";
import AccessTracker from "../components/AttendeeToAttendeeWidgetComponent";
import styles from "../styles/invitation-reject.module.scss";

const InvitationsRejectPage = ({ data, location }) => {
  const { invitationsRejectPageJson: { title, subTitle } } = data;

  return (
    <Layout location={location}>
      <div className={`container ${styles.container}`}>
        <div className={styles.wrapper}>
          <div>{title}</div>
          <div>{subTitle}</div>
          <button>SUBMIT</button>
        </div>
      </div>
      <AttendanceTrackerComponent />
      <AccessTracker />
    </Layout>
  );
};

InvitationsRejectPage.propTypes = {

};

export default InvitationsRejectPage;
