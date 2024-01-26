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
  const {invitationsRejectPageJson: {title, notFoundText, rejectedText, rejectText, rejectCTALabel}} = data;
  const titleStr = title || "Reject invitation"
  const rejectStr = rejectText || "To reject please click on the button below."
  const rejectCTA = rejectCTALabel || "Reject"
  const notFoundStr = notFoundText || "Invitation not found."
  const rejectedStr = rejectedText || "Invitation has already been rejected."

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
          <div>Missing token.</div>
        </>
      );
    }
    else if (loaded) {
      if (!invitation) {
        return (
          <>
            <div>{notFoundStr}</div>
          </>
        );
      } else {
        if (invitation.status === 'Rejected') {
          return (
            <>
              <div>{rejectedStr}</div>
            </>
          )
        } else {
          return (
            <>
              <div>{rejectStr}</div>
              <button className="button is-large" onClick={rejectInvitation} disabled={rejecting}>
                {rejectCTA}
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
          <h1>{titleStr}</h1>
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
