import GoogleTagManagerProvider from "../tag-manager/providers/GoogleTagManagerProvider";
import { triggerTagManagerConsentEvent } from "../eventTriggers";

const googleTagManagerProvider = new GoogleTagManagerProvider();

const services = [
  {
    name: "google-tag-manager",
    title: "Google Tag Manager",
    purposes: ["marketing"],
    required: true,
    onInit: () => {
      triggerTagManagerConsentEvent("default", {
        "ad_storage": "denied",
        "analytics_storage": "denied",
        "ad_user_data": "denied",
        "ad_personalization": "denied"
      });
      googleTagManagerProvider.set("ads_data_redaction", true);
    }
  },
  {
    name: "google-analytics",
    title: "Google Analytics",
    purposes: ["analytics"],
    cookies: [/^_ga(_.*)?/],
    onAccept: () => {
      triggerTagManagerConsentEvent("update", { "analytics_storage": "granted" });
    },
    onDecline: () => {
      triggerTagManagerConsentEvent("update", { "analytics_storage": "denied" });
    }
  },
  {
    name: "google-ads",
    title: "Google Ads",
    purposes: ["marketing"],
    cookies: [],
    onAccept: () => {
      triggerTagManagerConsentEvent("update", {
        "ad_storage": "granted",
        "ad_user_data": "granted",
        "ad_personalization": "granted"
      });
    },
    onDecline: () => {
      triggerTagManagerConsentEvent("update", {
        "ad_storage": "denied",
        "ad_user_data": "denied",
        "ad_personalization": "denied"
      });
    }
  }
];

export default services;
