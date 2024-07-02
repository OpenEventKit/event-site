import * as Sentry from "@sentry/gatsby";
import { RewriteFrames as RewriteFramesIntegration } from "@sentry/integrations";
import ReduxWrapper from "./src/state/ReduxWrapper";
import CookieManager from "./src/utils/cookies/CookieManager";
import KlaroProvider from "./src/utils/cookies/providers/KlaroProvider";
import cookieServices from "./src/utils/cookies/services";
import TagManager from "./src/utils/tag-manager/TagManager";
import GoogleTagManagerProvider from "./src/utils/tag-manager/providers/GoogleTagManagerProvider";
import smoothscroll from "smoothscroll-polyfill";
import "what-input";

// import bulma framwork
import "./src/styles/bulma.scss";
// import base styles
import "./src/styles/style.scss";
// import global fontawesome
import "./src/utils/fontAwesome";

import colors from "data/colors.json";
import marketingSettings from "data/marketing-settings.json";

export const wrapRootElement = ReduxWrapper;

export const onClientEntry = () => {
  // smooth scroll polyfill needed for Safari
  smoothscroll.polyfill();

  // Initialize TagManager and add GoogleTagManagerProvider
  const tagManager = new TagManager();
  const googleTagManagerProvider = new GoogleTagManagerProvider();
  tagManager.addProvider(googleTagManagerProvider);

  // Initialize Cookie Manager with Klaro provider
  const klaroProvider = new KlaroProvider();
  const cookieManager = new CookieManager(klaroProvider, cookieServices);

  // Apply colors
  Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
    document.documentElement.style.setProperty(`--${key}50`, `${value}50`);
  });
  // set theme
  const themeSetting = marketingSettings.find(ms => ms.key === "EVENT_SITE_COLOR_SCHEME");
  const theme = themeSetting?.value || "LIGHT";
  document.documentElement.setAttribute("data-theme", theme);

  // init sentry
  const GATSBY_SENTRY_DSN = process.env.GATSBY_SENTRY_DSN;
  if (GATSBY_SENTRY_DSN) {
    console.log("INIT SENTRY ....");
    // sentry init
    Sentry.init({
      dsn: GATSBY_SENTRY_DSN,
      tracesSampleRate: process.env.GATSBY_SENTRY_TRACE_SAMPLE_RATE,
      beforeSend(event) {
        // Modify the event here
        console.log('before send...', event)
        return event;
      },
      release: process.env.GATSBY_SENTRY_RELEASE,
      integrations: [
        new RewriteFramesIntegration({
          iteratee: (frame) => {
            // @see https://github.com/getsentry/sentry-javascript/blob/f46f5660114ee625af6e4db895565ae4a36558ae/packages/integrations/src/rewriteframes.ts#L70
            // rewrite frames to remove the dynamic hash version to match the abs_path
            if (!frame.filename) {
              return frame;
            }
            const isComponentFrame = /component---src-pages-(\w*)-js(-\w*).js/.test(frame.filename);
            if (isComponentFrame) {
              frame.filename = frame.filename.replace(/(component---src-pages-(\w*)-js)(-\w*).js$/, '$1.js');
            }
            const isAppFrame = /app(-\w*).js/.test(frame.filename);
            if (isAppFrame) {
              frame.filename = frame.filename.replace(/app(-\w*).js$/, 'app.js');
            }
            return frame;
          }
        }),
        new Sentry.Replay()
      ],
    });
    window.Sentry = Sentry;
  }
};