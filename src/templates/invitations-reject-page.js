import React, {useEffect, useState, useCallback, useRef} from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Layout from "../components/Layout";
import AttendanceTrackerComponent from "../components/AttendanceTrackerComponent";
import AccessTracker from "../components/AttendeeToAttendeeWidgetComponent";
import {getInvitation, rejectInvitation} from "../actions/user-actions";

import styles from "../styles/invitation-reject.module.scss";

const InvitationsRejectPage = ({data, location, invitationToken, invitation, loading, ...props}) => {
  const [loaded, setLoaded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const {invitationsRejectPageJson: {title, subTitle}} = data;
  const titleStr = title || "Reject invitation"
  const subtitleStr = subTitle || "To reject please click on the button below."

  useEffect(() => {
    setLoaded(false);
    if (invitationToken) {
      props.getInvitation(invitationToken)
        .finally(() => {
          setLoaded(true)
        });
    }
  }, []);

  const rejectInvitation = () => {
    setRejecting(true);
    props.rejectInvitation(invitationToken)
      .finally(() => {
        setRejecting(false);
      });
  }

  const getMessage = () => {
    if (!invitationToken) {
      return (
        <>
          <h1>Invitation</h1>
          <div>Missing invitation token.</div>
        </>
      );
    }
    else if (loaded) {
      if (!invitation) {
        return (
          <>
            <h1>Invitation</h1>
            <div>Invitation not found.</div>
          </>
        );
      } else {
        if (invitation.status === 'Rejected') {
          return (
            <>
              <h1>Invitation</h1>
              <div>Invitation has already been rejected.</div>
            </>
          )
        } else {
          return (
            <>
              <h1>{titleStr}</h1>
              <div>{subtitleStr}</div>
              <button className="button is-large" onClick={rejectInvitation} disabled={rejecting}>
                Reject Invitation
              </button>
            </>
          )
        }

      }
    } else {
      return null;
    }
  }


  return (
    <Layout location={location}>
      <div className={`container ${styles.container}`}>
        <div className={styles.wrapper}>
          {getMessage()}
        </div>
      </div>
      <AttendanceTrackerComponent/>
      <AccessTracker/>
    </Layout>
  );
};

InvitationsRejectPage.propTypes = {
  invitationToken: PropTypes.string.isRequired
};

const mapStateToProps = ({userState, globalState}) => ({
  invitation: userState.invitation,
  loading: globalState?.loading
});

export default connect(
  mapStateToProps, {
    getInvitation,
    rejectInvitation
  })(InvitationsRejectPage);
