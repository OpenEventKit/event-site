import { useState } from "react";
import { STATUS_CANCELLED, STATUS_UNASSIGNED } from "../../global/constants";
import { useSummitDetails } from "../summit/useSummitDetails";
import { getTicketRole } from "./getTicketRole";
import { getTicketStatusData } from "./getTicketStatusData";

export const useTicketDetails = ({ ticket, summit }) => {
    const {
        isPast,
        isStarted,
        isReassignable: isReassignDateValid,
        formattedDate,
        formattedReassignDate,
        daysUntilReassignDeadline
    } = useSummitDetails({ summit });
    const [showPopup, setShowPopup] = useState(false);

    if (!summit || !ticket) return null;

    const status = getTicketStatusData(ticket, isPast);
    const role = getTicketRole(ticket);
    const type = summit.ticket_types.find(type => type.id == ticket.ticket_type.id);

    const isActive = ticket.is_active && status.type !== STATUS_CANCELLED;
    const isUnassigned = status.type === STATUS_UNASSIGNED;
    const isRefundable = ticket.final_amount > 0 && ticket.final_amount > ticket.refunded_amount;

    const ticketAllowsReassign = ticket.ticket_type?.allows_to_reassign !== false && ticket.promo_code?.allows_to_reassign !== false;
    const isReassignable = isReassignDateValid && ticketAllowsReassign;

    const allowsDelegate = (ticket.ticket_type.allows_to_delegate || ticket.promo_code?.allows_to_delegate) && !isUnassigned && !ticket.owner?.manager?.id && !ticket.owner?.manager_id;

    const togglePopup = () => setShowPopup(!showPopup);

    const handleClick = () => {
        if (!isActive) return;

        togglePopup();
    };

    const handlePopupClose = () => togglePopup();

    return {
        status,
        role,
        type,
        isSummitPast: isPast,
        isSummitStarted: isStarted,
        isActive,
        isUnassigned,
        isReassignable,
        isRefundable,
        allowsDelegate,
        formattedDate,
        formattedReassignDate,
        daysUntilReassignDeadline,
        showPopup,
        setShowPopup,
        togglePopup,
        handleClick,
        handlePopupClose
    }
};