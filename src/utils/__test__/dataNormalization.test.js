/**
 * @jest-environment jsdom
 */
import React from "react";
import { normalizeData } from "../dataNormalization";

const testOrder = {
  "id": 43545,
  "created": 1713391444,
  "last_edited": 1713391444,
  "number": "ORDER_2023OCPGLOBALSUMMIT2023_662047548D72D773046574",
  "status": "Paid",
  "payment_method": "Online",
  "owner_first_name": "Sebastian",
  "owner_last_name": "Marcet",
  "owner_email": "test@gmail.com",
  "owner_company": "Tipit",
  "owner_company_id": 3496,
  "owner_id": 26391,
  "summit_id": 50,
  "currency": "USD",
  "currency_symbol": "$",
  "extra_questions": [],
  "tickets": [{
    "id": 50175,
    "created": 1713391444,
    "last_edited": 1713409486,
    "number": "TICKET_2023OCPGLOBALSUMMIT2023_6620475493A78111038846",
    "status": "Paid",
    "external_order_id": null,
    "external_attendee_id": null,
    "bought_date": 1713391485,
    "order_id": 43545,
    "promo_code_id": 0,
    "raw_cost": 900,
    "net_selling_cost": 900,
    "raw_cost_in_cents": 90000,
    "final_amount": 900,
    "final_amount_in_cents": 90000,
    "discount": 0,
    "discount_rate": 0,
    "discount_in_cents": 0,
    "refunded_amount": 0,
    "refunded_amount_in_cents": 0,
    "total_refunded_amount": 0,
    "total_refunded_amount_in_cents": 0,
    "currency": "USD",
    "currency_symbol": "$",
    "taxes_amount": 0,
    "taxes_amount_in_cents": 0,
    "is_active": true,
    "qr_code": "TICKET_2023OCPGLOBALSUMMIT2023|TICKET_2023OCPGLOBALSUMMIT2023_6620475493A78111038846|smarcet@gmail.com",
    "owner": {
      "id": 28608,
      "created": 1685574339,
      "last_edited": 1713409445,
      "summit_hall_checked_in": false,
      "summit_hall_checked_in_date": null,
      "summit_virtual_checked_in_date": null,
      "shared_contact_info": false,
      "member_id": 26391,
      "summit_id": 50,
      "first_name": "Sebastian",
      "last_name": "Marcet",
      "email": "test@gmail.com",
      "company": "Tipit",
      "company_id": 3496,
      "disclaimer_accepted_date": null,
      "disclaimer_accepted": false,
      "status": "Incomplete",
      "tickets": [50175],
      "presentation_votes": [],
      "votes_count": 0,
      "ticket_types": [{"type_id": 109, "qty": 1, "type_name": "Standard Ticket"}],
      "allowed_access_levels": [149],
      "allowed_features": [],
      "tags": [],
      "extra_questions": []
    },
    "badge": {
      "id": 50183,
      "created": 1713391444,
      "last_edited": 1713391444,
      "print_date": null,
      "qr_code": null,
      "is_void": false,
      "ticket_id": 50175,
      "printed_times": 0,
      "features": [],
      "print_excerpt": [],
      "type": {
        "id": 112,
        "created": 1685036153,
        "last_edited": 1685036153,
        "name": "General Attendee",
        "description": "This is for all in-person general attendees.  This Badge Type can have various Badge Features (icons/titles).  Badge Features may be dictated by promo codes or can be added manually by Admins. The badge needs a QR code for LR.  This badge needs T-Shirt Size Indicator from extra question answer (dots/dashes) on the design.",
        "template_content": "",
        "is_default": true,
        "summit_id": 50,
        "badge_features": [],
        "allowed_view_types": [49],
        "access_levels": [{
          "id": 149,
          "created": 1683216137,
          "last_edited": 1683216137,
          "name": "IN_PERSON",
          "description": "Allows in person show access.",
          "template_content": "",
          "is_default": true,
          "summit_id": 50
        }]
      }
    },
    "ticket_type": {
      "id": 109,
      "created": 1685036568,
      "last_edited": 1713391444,
      "name": "Standard Ticket",
      "description": "This is for general admission.  Needs QR Code on Badge.  Symposium included (first come, first served until capacity is met).  Early bird pricing ended 7/31/23.  In-Person Ticket: Standard, is on sale 8/1/23- 10/15/23",
      "external_id": null,
      "summit_id": 50,
      "cost": 900,
      "currency": "USD",
      "currency_symbol": "$",
      "quantity_2_sell": 10000,
      "max_quantity_per_order": 100,
      "sales_start_date": 1690873200,
      "sales_end_date": 1722581940,
      "badge_type_id": 112,
      "quantity_sold": 3289,
      "audience": "All",
      "applied_taxes": [],
      "sub_type": "Regular"
    },
    "applied_taxes": [],
    "refund_requests": []
  }]
};

describe("data normalization", () => {
  test("remove email from order data", () => {
    expect(testOrder.hasOwnProperty("owner_email")).toBeTruthy();
    expect(testOrder.tickets[0].owner.hasOwnProperty("email") ).toBeTruthy();
    const data = normalizeData(testOrder);
    expect(data.hasOwnProperty("owner_email")).toBeFalsy();
    expect(data.tickets[0].owner.hasOwnProperty("email") ).toBeFalsy();
  });
})

