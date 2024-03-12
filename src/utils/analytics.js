 import { AnalyticsBrowser } from "@segment/analytics-next";

 export const analytics = AnalyticsBrowser.load({ writeKey: process.env.GATSBY_SEGMENT_ANALYTICS_ID });