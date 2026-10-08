/**
 * @jest-environment jsdom
 */
import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";

import FullSchedule from "../FullSchedule";

const mockSchedule = jest.fn(() => null);
jest.mock("full-schedule-widget/dist", () => (props) => mockSchedule(props));
jest.mock("full-schedule-widget/dist/index.css", () => ({}));
jest.mock("@utils/useMarketingSettings", () => ({
  __esModule: true,
  default: () => ({ getSettingByKey: () => null }),
  MARKETING_SETTINGS_KEYS: {},
}));
jest.mock("../../actions/schedule-actions", () => ({
  callAction: jest.fn(() => ({ type: "TEST/NOOP" })),
  getShareLink: jest.fn(() => ""),
}));

const link = "https://summit.example/api/public/v1/summits/1/members/me/schedule/abc/ics";

const renderWithProfile = (userProfile) => {
  const state = { userState: { userProfile }, settingState: { colorSettings: {} } };
  const store = { getState: () => state, subscribe: () => () => {}, dispatch: jest.fn((a) => a) };
  render(
    <Provider store={store}>
      <FullSchedule />
    </Provider>
  );
  return mockSchedule.mock.calls.at(-1)[0].userProfile;
};

describe("FullSchedule userProfile", () => {
  beforeEach(() => mockSchedule.mockClear());

  it("hands the widget the link string when persisted state holds the share info object", () => {
    // Profiles persisted before the reducer fix still carry the serialized
    // PersonalCalendarShareInfo; the widget only builds the sync link from a string.
    const userProfile = { id: 10, schedule_shareable_link: { id: 5, link, cid: "abc" } };
    expect(renderWithProfile(userProfile).schedule_shareable_link).toBe(link);
  });

  it("passes a profile that already holds the string through untouched", () => {
    // The widget re-derives its events whenever the userProfile reference changes.
    const userProfile = { id: 10, schedule_shareable_link: link };
    expect(renderWithProfile(userProfile)).toBe(userProfile);
  });
});
