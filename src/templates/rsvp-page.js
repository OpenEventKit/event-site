import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Redirect } from "@gatsbyjs/reach-router";
import AjaxLoader from 'openstack-uicore-foundation/lib/components/ajaxloader'
import Layout from "../components/Layout";
import { acceptRSVPInvitation, declineRSVPInvitation, getRSVPInvitation } from "../actions/user-actions";

import styles from "../styles/rsvp-page.module.scss"
import { Badge } from "react-bootstrap";

const RSVPPage = ({ location, rsvpInvitation, getRSVPInvitation, acceptRSVPInvitation, declineRSVPInvitation }) => {

  const [isLoading, setIsLoading] = useState(true);

  const queryParams = useMemo(() => {
    const search = location?.search || "";
    const searchParams = new URLSearchParams(search);
    const k = searchParams.get("k");
    const eventId = searchParams.get("event_id");
    return {
      invitationToken: k ? k : null,
      eventId: eventId ? Number(eventId) : null,
    };
  }, [location?.search]);

  const { invitationToken, eventId } = queryParams;

  useEffect(() => {
    if (!invitationToken) return;
    getRSVPInvitation(invitationToken, eventId).finally(() => setIsLoading(false));
  }, [invitationToken, eventId]);

  const event = rsvpInvitation?.event;
  const moderatorId = rsvpInvitation?.event?.moderator_speaker_id;
  const errorMessage = rsvpInvitation?.errorMessage;

  const handleConfirmRSVP = (isAccepted) => {
    return isAccepted ? acceptRSVPInvitation(invitationToken, eventId) : declineRSVPInvitation(invitationToken, eventId);
  }

  if (!invitationToken || !eventId) {
    return <Redirect to="/" noThrow />;
  }

  return (
    <Layout location={location}>
      <AjaxLoader show={isLoading} size={120} />
      {!isLoading && (
        <div className={`container`}>
          {rsvpInvitation?.status === "Rejected" && (
            <h2>You declined your invite to RSVP {event?.title} </h2>
          )}
          {event ?
            (<>
              <h2>You have been invited to RSVP {event?.title} </h2>

              <br />

              <div dangerouslySetInnerHTML={{ __html: event?.description || "" }} />

              <br />

              {event?.speakers?.length > 0 &&
                <div>
                  <b>Speakers</b>
                  <div className={styles.speakerWrapper}>
                    {event.speakers.map((speaker) => {
                      const isModerator = speaker.id === moderatorId;
                      return (
                        <div className={styles.speaker}>
                          {speaker.pic && (
                            <div className={styles.picWrapper}>
                              <div className={styles.pic} style={{ backgroundImage: `url(${speaker.pic})` }} />
                            </div>
                          )}
                          <div className={styles.nameWrapper}>
                            <div className={styles.name}>
                              {speaker.first_name} {speaker.last_name} {isModerator && <Badge className={styles.moderator} pill>Moderator</Badge>}
                            </div>
                            {speaker.title &&
                              <div className={styles.job}>
                                <span>{speaker.title}</span>
                                {speaker.company && <span className={styles.company}> - {speaker.company}</span>}
                              </div>
                            }
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              }

              <div className={styles.buttonWrapper}>
                <button className="button is-large" onClick={() => handleConfirmRSVP(false)}>
                  NO, I will not attend.
                </button>
                <button className="button is-large" onClick={() => handleConfirmRSVP(true)}>
                  YES, I will attend
                </button>
              </div>
            </>)
            :
            (
              <>
                <h3 dangerouslySetInnerHTML={{ __html: errorMessage }} />
              </>
            )
          }
        </div>
      )}
    </Layout>
  );
};

const mapStateToProps = ({ userState }) => ({
  user: userState,
  rsvpInvitation: userState.rsvpInvitation
});

export default connect(mapStateToProps,
  {
    getRSVPInvitation,
    acceptRSVPInvitation,
    declineRSVPInvitation
  }
)(RSVPPage);
