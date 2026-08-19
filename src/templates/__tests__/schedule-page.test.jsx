/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";

// Covers the schedule subset (event_ids) render branches added to schedule-page.js:
// the empty-subset message, the normal schedule+filters branch, and the scroll-ref
// guards that were previously unguarded and could crash once the filters wrapper
// stopped being unconditionally rendered.
import SchedulePage from "../schedule-page";

jest.mock("../../actions/schedule-actions", () => ({
  updateFiltersFromHash: jest.fn(() => ({ type: "TEST/NOOP" })),
  updateCustomEventIdsFromHash: jest.fn(() => ({ type: "TEST/NOOP" })),
  updateFilter: jest.fn(() => ({ type: "TEST/NOOP" })),
  clearFilters: jest.fn(() => ({ type: "TEST/NOOP" })),
  callAction: jest.fn(() => ({ type: "TEST/NOOP" })),
  deepLinkToEvent: jest.fn(),
}));
jest.mock("../../actions/base-actions", () => ({
  reloadScheduleData: jest.fn(() => ({ type: "TEST/NOOP" })),
}));
// phasesUtils.js pulls in useMarketingSettings.js, which has a module-scope `graphql`
// tagged template - that's only stripped out by Gatsby's babel plugin at build time,
// so it breaks under plain jest unless the module is mocked out.
jest.mock("@utils/useMarketingSettings", () => ({
  MARKETING_SETTINGS_KEYS: { summitDeltaStartTime: "summit_delta_start_time" },
}));
jest.mock(
  "@reach/router",
  () => ({
    useLocation: () => ({ pathname: "/a/schedule", hash: "" }),
  }),
  { virtual: true }
);
jest.mock("../../components/Layout", () => ({ children }) => <>{children}</>);
jest.mock("../../components/FullSchedule", () => () => <div data-testid="full-schedule" />);
jest.mock("../../components/ScheduleFilters", () => (props) => (
  <div data-testid="schedule-filters" data-event-ids={(props.allEvents || []).map((e) => e.id).join(",")} />
));
jest.mock("../../components/AttendanceTrackerComponent", () => () => null);
jest.mock("../../components/AttendeeToAttendeeWidgetComponent", () => () => null);
jest.mock("../../components/FilterButton", () => () => <button data-testid="filter-button" />);
jest.mock("../../pages/404", () => () => <div data-testid="not-found" />);

let capturedScrollProps = null;
jest.mock("../../components/PageScrollInspector", () => ({
  SCROLL_DIRECTION: { UP: "SCROLL_UP", DOWN: "SCROLL_DOWN" },
  PageScrollInspector: (props) => {
    capturedScrollProps = props;
    return null;
  },
}));

const makeState = (schedule) => ({
  summitState: { summit: { id: 1 } },
  clockState: { summit_phase: 2 },
  loggedUserState: { isLoggedUser: false },
  allSchedulesState: { schedules: [schedule] },
  settingState: { colorSettings: {}, staticJsonFilesBuildTime: null, lastDataSync: null },
});

const makeStore = (state) => ({
  getState: () => state,
  subscribe: () => () => {},
  dispatch: jest.fn((a) => a),
});

const baseSchedule = {
  key: "schedKey",
  filters: {},
  view: "calendar",
  timezone: "show",
  timeFormat: "12h",
  colorSource: "track",
};

const renderSchedulePage = (schedule) => {
  const store = makeStore(makeState(schedule));
  return render(
    <Provider store={store}>
      <SchedulePage schedKey="schedKey" location={{ pathname: "/a/schedule" }} />
    </Provider>
  );
};

beforeEach(() => {
  capturedScrollProps = null;
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

  it("renders the empty-subset message when customEventIds matches no event", () => {
    renderSchedulePage({
      ...baseSchedule,
      allEvents: [{ id: 1 }, { id: 2 }],
      events: [],
      customEventIds: [999],
    });

    expect(screen.getByText(/no sessions match this link/i)).toBeInTheDocument();
    expect(screen.queryByTestId("full-schedule")).not.toBeInTheDocument();
    expect(screen.queryByTestId("schedule-filters")).not.toBeInTheDocument();
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

  it("does not throw when the scroll callbacks fire without a mounted filters wrapper (empty-subset branch)", () => {
    renderSchedulePage({
      ...baseSchedule,
      allEvents: [{ id: 1 }, { id: 2 }],
      events: [],
      customEventIds: [999],
    });

    expect(capturedScrollProps).not.toBeNull();
    expect(() => capturedScrollProps.scrollDirectionChanged("SCROLL_UP")).not.toThrow();
    expect(() => capturedScrollProps.bottomReached(true)).not.toThrow();
  });
});
