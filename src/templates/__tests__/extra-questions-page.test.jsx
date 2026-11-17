/**
 * @jest-environment jsdom
 */
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { storeAuthInfo } from "openstack-uicore-foundation/lib/security/methods";

import { ExtraQuestionsPageTemplate } from "../extra-questions-page";
import { TICKET_ATTENDEE_KEYS as TicketKeys } from "@utils/ticketConstants";

jest.mock("../../actions/user-actions", () => ({ saveAttendeeQuestions: jest.fn() }));
jest.mock("../../actions/summit-actions", () => ({ getExtraQuestions: jest.fn() }));
jest.mock("../../actions/extra-questions-actions", () => ({ getAttendeeData: jest.fn() }));
jest.mock("../../components/Layout", () => ({ children }) => <>{children}</>);
jest.mock("../../components/Interstitial", () => () => null);

// A transferred ticket: the new owner has a name but no company yet.
const user = {
  summit_tickets: [
    { id: 1, owner: { email: "test@test.com", first_name: "Test", last_name: "User", company: null } }
  ]
};
const summit = { id: 73, registration_disclaimer_mandatory: false };

const renderPage = (saveAttendeeQuestions) =>
  render(
    <ExtraQuestionsPageTemplate
      user={user}
      summit={summit}
      extraQuestions={[]}
      attendee={null}
      attendeeId={null}
      saveAttendeeQuestions={saveAttendeeQuestions}
      someoneElseLoaded={null}
    />
  );

const companyInput = () => screen.getByLabelText("Company");

const settle = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

// Mimics Chrome / Edge "Translate this page": every text node is replaced by font > font.
const translatePage = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);
  }
  textNodes.forEach((node) => {
    const outer = document.createElement("font");
    const inner = document.createElement("font");
    inner.textContent = node.nodeValue;
    outer.appendChild(inner);
    node.replaceWith(outer);
  });
};

beforeAll(() => {
  Element.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  storeAuthInfo("access-token");
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ data: [] }) })
  );
});

describe("ExtraQuestionsPageTemplate company field", () => {
  it("saves a company the user typed and did not pick from the list", async () => {
    const saveAttendeeQuestions = jest.fn(() => Promise.resolve());
    renderPage(saveAttendeeQuestions);

    await act(async () => {
      fireEvent.change(companyInput(), { target: { value: "Palo Alto Networks" } });
    });
    await act(async () => {
      fireEvent.blur(companyInput());
    });
    await settle();
    await act(async () => {
      fireEvent.click(screen.getByText("Save and Continue"));
    });

    await waitFor(() => expect(saveAttendeeQuestions).toHaveBeenCalledTimes(1));
    expect(saveAttendeeQuestions.mock.calls[0][0][TicketKeys.company]).toEqual({ id: 0, name: "Palo Alto Networks" });
    expect(screen.queryByText("Required")).not.toBeInTheDocument();
  });

  it("shows a readable required message when the company is missing", async () => {
    const saveAttendeeQuestions = jest.fn(() => Promise.resolve());
    renderPage(saveAttendeeQuestions);

    await act(async () => {
      fireEvent.click(screen.getByText("Save and Continue"));
    });

    expect(await screen.findByText("Required")).toBeInTheDocument();
    expect(screen.queryByText("ticket_popup.edit_required")).not.toBeInTheDocument();
    expect(saveAttendeeQuestions).not.toHaveBeenCalled();
  });
});

describe("ExtraQuestionsPageTemplate save button", () => {
  it("swaps its label when the page is translated", async () => {
    let finishSave;
    const saveAttendeeQuestions = jest.fn(() => new Promise((resolve) => { finishSave = resolve; }));
    renderPage(saveAttendeeQuestions);

    await act(async () => {
      fireEvent.change(companyInput(), { target: { value: "Palo Alto Networks" } });
    });
    await act(async () => {
      fireEvent.blur(companyInput());
    });
    await settle();

    const saveButton = screen.getByRole("button", { name: "Save and Continue" });
    translatePage(saveButton);
    await act(async () => {
      fireEvent.click(saveButton);
    });
    await waitFor(() => expect(saveAttendeeQuestions).toHaveBeenCalledTimes(1));
    expect(saveButton).toHaveTextContent("Saving...");

    // the action resolves on both success and error (it alerts on its own), so the label swaps back
    translatePage(saveButton);
    await act(async () => {
      finishSave();
    });
    expect(saveButton).toHaveTextContent("Save and Continue");
  });
});
