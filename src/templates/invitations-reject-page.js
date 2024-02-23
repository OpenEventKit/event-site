import React, {useEffect, useState } from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import Layout from "../components/Layout";
import AttendanceTrackerComponent from "../components/AttendanceTrackerComponent";
import AccessTracker from "../components/AttendeeToAttendeeWidgetComponent";
import {getInvitation, rejectInvitation} from "../actions/user-actions";

import styles from "../styles/invitation-reject.module.scss";

const InvitationsRejectPage = ({data, location, invitationToken, invitation, loading, ...props}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [rejecting, setRejecting] = useState(false);
  const {invitationsRejectPageJson: {title, notFoundText, rejectedText, rejectText, rejectCTALabel, alreadyAcceptedInvitationError, alreadyRejectedInvitationError}} = data;
  const titleStr = title || "Reject invitation"
  const rejectStr = rejectText || "To reject please click on the button below."
  const rejectCTA = rejectCTALabel || "Reject"
  const notFoundStr = notFoundText || "Invitation not found."
  const rejectedStr = rejectedText || "Invitation has already been rejected."

  const invitationErrorhandler = (e) => {
    const { res } = e;
    let code = res.status;
    switch(code){
        case 404:
            setError(notFoundStr)
            break;
        case 412: {
            const response = res?.body;
            let apiErrors = '';
            response.errors.forEach(val => apiErrors += val + '\n');
            switch (response.code) {
                case 1:
                    apiErrors = alreadyAcceptedInvitationError || apiErrors;
                    break;
                case 2:
                    apiErrors = alreadyRejectedInvitationError || apiErrors;
                    break;
            }
            setError(apiErrors);
        }
        break;
    }
  }

  useEffect(() => {
    setLoaded(false);
    if (invitationToken) {
      props.getInvitation(invitationToken)
          .catch(invitationErrorhandler)
          .finally(() => {
            setLoaded(true)
          });
    }
  }, []);

  const rejectInvitation = () => {
    setRejecting(true);
    props.rejectInvitation(invitationToken)
        .catch(invitationErrorhandler)
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

      if (!loaded) return null;

      if (!invitation) {
          return (
            <>
                <div>{error}</div>
            </>
          );
      }

      if (invitation.status === 'Rejected') {
          return (
              <>
                  <div>{rejectedStr}</div>
              </>
          )
      }

      if (invitation.status === 'Pending') {
          return (
              <>
                  <div>{rejectStr}</div>
                  <button className="button is-large" onClick={rejectInvitation} disabled={rejecting}>
                      {rejectCTA}
                  </button>
              </>
          )
      }

      return null;
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
