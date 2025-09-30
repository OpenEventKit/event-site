import React, { useEffect, useMemo, useState } from "react";
import { connect } from "react-redux";
import { Redirect } from "@gatsbyjs/reach-router";
import { useTranslation } from "react-i18next";
import AjaxLoader from 'openstack-uicore-foundation/lib/components/ajaxloader'
import Layout from "../components/Layout";
import { acceptRSVPInvitation, declineRSVPInvitation, getRSVPInvitation } from "../actions/user-actions";
import { getEventById } from "../actions/event-actions";
import styles from "../styles/rsvp-page.module.scss"
import { RSVP_STATUS, RSVP_CAPACITY } from "@utils/rsvpConstants";
import { Badge } from "react-bootstrap";
import "../i18n";

const RSVPPage = ({ location, rsvpInvitation, event, getRSVPInvitation, acceptRSVPInvitation, declineRSVPInvitation, getEventById }) => {

  const { t } = useTranslation();
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
    getRSVPInvitation(invitationToken, eventId)
      .then(() => getEventById(eventId))
      .finally(() => setIsLoading(false));
  }, [invitationToken, eventId]);

  const moderatorId = event?.moderator_speaker_id;
  const errorMessage = rsvpInvitation?.errorMessage;

  const handleConfirmRSVP = (isAccepted) => {
    setIsLoading(true);
    const action = isAccepted ? acceptRSVPInvitation : declineRSVPInvitation;
    return action(invitationToken, eventId).finally(() => setIsLoading(false));
  }

  if (!invitationToken || !eventId) {
    return <Redirect to="/" noThrow />;
  }

  return (
    <Layout location={location}>
      <AjaxLoader show={isLoading} size={120} />
      {!isLoading && (
        <div className={`container`}>
          {event ?
            (<>
              <h2>{t("rsvp_page.invite_message", { event: event?.title })} </h2>

              <br />

              <div dangerouslySetInnerHTML={{ __html: event?.description || "" }} />

              <br />

              {event?.speakers?.length > 0 &&
                <div>
                  <b>{t("rsvp_page.speakers")}</b>
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
                {errorMessage && (
                  <h3 dangerouslySetInnerHTML={{ __html: errorMessage }} />
                )}
                {rsvpInvitation?.status === RSVP_STATUS.rejected && (
                  <h4>{t("rsvp_page.decline_message")} </h4>
                )}
                {rsvpInvitation?.status === RSVP_STATUS.accepted && (
                  rsvpInvitation?.rsvp?.seat_type === RSVP_CAPACITY.waitlist ?
                    <h4>{t("rsvp_page.waitlist_message")} </h4>
                    :
                    <h4>{t("rsvp_page.confirm_message")} </h4>
                )}
                {rsvpInvitation?.status === RSVP_STATUS.pending && rsvpInvitation?.event?.rsvp_capacity !== RSVP_CAPACITY.full && (
                  <>
                    <button className="button is-large" onClick={() => handleConfirmRSVP(true)}>
                      {t("rsvp_page.accept_button")}
                    </button>
                    <button className="button is-large" onClick={() => handleConfirmRSVP(false)}>
                      {t("rsvp_page.decline_button")}
                    </button>
                  </>
                )
                }
                {rsvpInvitation?.status === RSVP_STATUS.pending && rsvpInvitation?.event?.rsvp_capacity === RSVP_CAPACITY.full && (
                  <h4>{t("rsvp_page.full_message")} </h4>
                )
                }
              </div>
            </>)
            :
            (
              <>
                <h3>Activity not found.</h3>
              </>
            )
          }
        </div>
      )}
    </Layout>
  );
};

const mapStateToProps = ({ userState, eventState }) => ({
  rsvpInvitation: userState.rsvpInvitation,
  event: eventState.event,
});

export default connect(mapStateToProps,
  {
    getRSVPInvitation,
    acceptRSVPInvitation,
    declineRSVPInvitation,
    getEventById
  }
)(RSVPPage);
