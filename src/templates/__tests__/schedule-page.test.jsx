import React from "react";
import { render, screen } from "@testing-library/react";

import SchedulePage from "../schedule-page";
import { PHASES } from "../../utils/phasesUtils";

jest.mock("../../utils/withScheduleData", () => (Component) => Component);
jest.mock("../../actions/schedule-actions", () => ({ deepLinkToEvent: jest.fn() }));
// phasesUtils pulls in src/data/marketing-settings.json, a build-time artifact
// (gitignored, written by gatsby-node.js) that doesn't exist outside a real build.
jest.mock("../../utils/phasesUtils", () => ({ PHASES: { BEFORE: -1, DURING: 0, AFTER: 1 } }));

jest.mock("gatsby", () => ({
  navigate: jest.fn(),
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock("../../components/Layout", () => ({ children }) => <div>{children}</div>);
jest.mock("../../components/AttendanceTrackerComponent", () => () => null);
jest.mock("../../components/AttendeeToAttendeeWidgetComponent", () => () => null);
jest.mock("../../components/FilterButton", () => () => null);
jest.mock("../../pages/404", () => () => <div data-testid="not-found-page" />);

jest.mock("../../components/FullSchedule", () => () => <div data-testid="full-schedule" />);
jest.mock("../../components/ScheduleFilters", () => (props) => (
  <div data-testid="schedule-filters" data-event-ids={(props.allEvents || []).map((ev) => ev.id).join(",")} />
));

let mockCapturedScrollProps = null;
jest.mock("../../components/PageScrollInspector", () => {
  const actual = jest.requireActual("../../components/PageScrollInspector");
  return {
    ...actual,
    PageScrollInspector: (props) => {
      mockCapturedScrollProps = props;
      return null;
    },
  };
});

const baseSchedule = {
  key: "default",
  filters: {},
  view: "list",
  timezone: "UTC",
  timeFormat: "12h",
  colorSource: "type",
};

const defaultProps = {
  summit: { id: 1 },
  schedKey: "default",
  summitPhase: PHASES.DURING,
  isLoggedUser: false,
  location: { pathname: "/schedule" },
  colorSettings: {},
  updateFilter: jest.fn(),
  clearFilters: jest.fn(),
  callAction: jest.fn(),
  scheduleProps: {},
  allowClick: true,
  lastDataSync: null,
};

const renderSchedulePage = (scheduleState) => render(<SchedulePage {...defaultProps} scheduleState={scheduleState} />);

beforeEach(() => {
  mockCapturedScrollProps = null;
  jest.clearAllMocks();
});

describe("SchedulePage - custom event_ids subset", () => {
  it("renders the full schedule and filters when there is no custom subset", () => {
    renderSchedulePage({
      ...baseSchedule,
      allEvents: [{ id: 1 }, { id: 2 }],
      events: [{ id: 1 }, { id: 2 }],
      customEventIds: [],
    });

    expect(screen.getByTestId("full-schedule")).toBeInTheDocument();
    expect(screen.getByTestId("schedule-filters")).toBeInTheDocument();
    expect(screen.queryByText(/no sessions match this link/i)).not.toBeInTheDocument();
  });

  it("renders the empty-subset message and safely handles scroll callbacks when customEventIds matches no event", () => {
    renderSchedulePage({
      ...baseSchedule,
      allEvents: [{ id: 1 }, { id: 2 }],
      events: [],
      customEventIds: [999],
    });

    expect(screen.getByText(/no sessions match this link/i)).toBeInTheDocument();
    expect(screen.queryByTestId("full-schedule")).not.toBeInTheDocument();
    expect(screen.queryByTestId("schedule-filters")).not.toBeInTheDocument();

    expect(mockCapturedScrollProps).not.toBeNull();
    expect(() => mockCapturedScrollProps.scrollDirectionChanged("SCROLL_UP")).not.toThrow();
    expect(() => mockCapturedScrollProps.bottomReached(true)).not.toThrow();
  });

  it("scopes ScheduleFilters' allEvents to the subset and still renders the schedule when the subset matches", () => {
    renderSchedulePage({
      ...baseSchedule,
      allEvents: [{ id: 1 }, { id: 2 }, { id: 3 }],
      events: [{ id: 1 }],
      customEventIds: [1, 3],
    });

    expect(screen.getByTestId("full-schedule")).toBeInTheDocument();
    expect(screen.getByTestId("schedule-filters")).toHaveAttribute("data-event-ids", "1,3");
  });
});
