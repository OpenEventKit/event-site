import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Dropdown from 'openstack-uicore-foundation/lib/components/inputs/dropdown'
import QRCode from "react-qr-code";

import Layout from '../components/Layout'
import { userHasCheckedInBadge } from '../utils/authorizedGroups';

export const BadgePageTemplate = ({ user }) => {

    const hasBadgeChecked = userHasCheckedInBadge(user.summit_tickets);

    const [currentTicket, setCurrentTicket] = useState(null);
    const [userTickets, setUserTickets] = useState([]);
    const [badgesDDL, setBadgeDDL] = useState([]);

    useEffect(() => {
        setUserTickets(user.summit_tickets || []);
        const formattedTickets = user?.summit_tickets.map(e => ({ label: e.number, value: e.id }));
        setBadgeDDL(formattedTickets || []);
    }, []);

    useEffect(() => {
        const firstTicket = userTickets.find(e => e.qr_code);
        setCurrentTicket(firstTicket);
    }, [userTickets]);

    const handleTicketChange = (ev) => {
        const { target: { value } } = ev;
        const newTicket = user.summit_tickets.find(e => e.id === value);
        setCurrentTicket(newTicket);
    }

    return (
        <div className="px-6 py-6 mb-6">

            <h2>Badge QR</h2>
            <div className="columns mt-5">
                <div className={"column is-half"}>
                    <Dropdown
                        id="user_tickets"
                        placeholder="User Tickets"
                        value={currentTicket?.id}
                        onChange={handleTicketChange}
                        options={badgesDDL}
                    />
                </div>
            </div>
            <div className="columns mt-3">
                <div className={"column is-half-desktop is-full-mobile"}>
                    {currentTicket && currentTicket.badge.qr_code &&
                        <QRCode
                            size={256}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            value={currentTicket.badge.qr_code}
                            viewBox={`0 0 256 256`}
                        />
                    }
                </div>
            </div>
        </div>
    )
};

const BadgePage = (
    {
        location,
        user,
    }
) => {
    return (
        <Layout location={location}>
            <BadgePageTemplate
                user={user} />
        </Layout>
    )
};

BadgePage.propTypes = {
    user: PropTypes.object,
};

BadgePageTemplate.propTypes = {
    user: PropTypes.object
};

const mapStateToProps = ({ userState }) => ({
    user: userState.userProfile,
});

export default connect(mapStateToProps, {})(BadgePage);