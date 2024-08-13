import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import Dropdown from 'openstack-uicore-foundation/lib/components/inputs/dropdown'
import QRCode from "react-qr-code";

import Layout from '../components/Layout'
import withOrchestra from "../utils/widgetOrchestra";
import { userHasCheckedInBadge } from '../utils/authorizedGroups';

export const BadgePageTemplate = ({ user }) => {

    const hasBadgeChecked = userHasCheckedInBadge(user.summit_tickets);

    const [currentBadge, setCurrentBadge] = useState(null);
    const [userBadges, setUserBadges] = useState([]);
    const [badgesDDL, setBadgeDDL] = useState([]);

    useEffect(() => {
        setUserBadges(user.summit_tickets || []);
        const formattedTickets = user?.summit_tickets.map(e => ({ label: e.number, value: e.id }));
        setBadgeDDL(formattedTickets || []);
    }, []);

    useEffect(() => {
        const firstTicket = userBadges.find(e => e.qr_code);
        setCurrentBadge(firstTicket);
    }, [userBadges]);

    const handleBadgeChange = (ev) => {
        const { target: { value } } = ev;
        const newBadge = user.summit_tickets.find(e => e.id === value);
        setCurrentBadge(newBadge);
    }

    return (
        <div className="px-6 py-6 mb-6">
            {hasBadgeChecked &&
                <>
                    <h2>Badge QR</h2>
                    <div className="columns mt-5">
                        <div className={"column is-half"}>
                            <Dropdown
                                id="user_badges"
                                placeholder="User Badges"
                                value={currentBadge?.id}
                                onChange={handleBadgeChange}
                                options={badgesDDL}
                            />
                        </div>
                    </div>
                    <div className="columns mt-3">
                        <div className={"column is-half-desktop is-full-mobile"}>
                            {currentBadge &&
                                <QRCode
                                    size={256}
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                    value={currentBadge.qr_code}
                                    viewBox={`0 0 256 256`}
                                />
                            }
                        </div>
                    </div>
                </>
            }
        </div>
    )
};

const OrchestedTemplate = withOrchestra(BadgePageTemplate);

const BadgePage = (
    {
        location,
        user,
    }
) => {
    return (
        <Layout location={location}>
            <OrchestedTemplate
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