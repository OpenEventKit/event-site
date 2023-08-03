const axios = require("axios");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const { createFilePath } = require("gatsby-source-filesystem");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");

const { ClientCredentials } = require("simple-oauth2");
const URI = require("urijs");
const sizeOf = require("image-size");

const myEnv = require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const {
  REQUIRED_DIR_PATHS,
  DEFAULT_COLORS_FILE_PATH,
  COLORS_FILE_PATH,
  SITE_SETTINGS_FILE_PATH,
  LOBBY_PAGE_FILE_PATH,
  SUMMIT_FILE_PATH,
  EVENTS_FILE_PATH,
  EVENTS_IDX_FILE_PATH,
  SPEAKERS_FILE_PATH,
  SPEAKERS_IDX_FILE_PATH,
  VOTEABLE_PRESENTATIONS_FILE_PATH,
  MARKETING_SETTINGS_FILE_PATH,
  MAINTENANCE_FILE_PATH,
  SPONSORS_FILE_PATH
} = require("./src/utils/filePath");

const fileBuildTimes = [];

const getAccessToken = async (config, scope) => {
  const client = new ClientCredentials(config);

  try {
    return await client.getToken({ scope });
  } catch (error) {
    console.log("Access Token error", error);
  }
};

const SSR_GetRemainingPages = async (endpoint, params, lastPage) => {
  // create an array with remaining pages to perform Promise.All
  const pages = [];
  for (let i = 2; i <= lastPage; i++) {
    pages.push(i);
  }

  let remainingPages = await Promise.all(pages.map(pageIdx => {
    return axios.get(endpoint ,
        { params : {
            ...params,
            page: pageIdx
          }
        }).then(({ data }) => data);
  }));

  return remainingPages.sort((a, b,) =>   a.current_page - b.current_page ).map(p => p.data).flat();
}

const SSR_getMarketingSettings = async (baseUrl, summitId) => {

  const endpoint = `${baseUrl}/api/public/v1/config-values/all/shows/${summitId}`;

  const params = {
    per_page: 100,
    page: 1
  };

  return await axios.get(endpoint, { params }).then(async ({data}) => {

    console.log(`SSR_getMarketingSettings then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)

    let remainingPages = await SSR_GetRemainingPages(endpoint, params, data.last_page);

    return [...data.data, ...remainingPages];

  }).catch(e => console.log("ERROR: ", e));
};

const SSR_getEvents = async (baseUrl, summitId, accessToken) => {

  const endpoint = `${baseUrl}/api/v1/summits/${summitId}/events/published`;

  const params = {
    access_token: accessToken,
    per_page: 50,
    page: 1,
    expand: "slides, links, videos, media_uploads, type, track, track.subtracks, track.allowed_access_levels, location, location.venue, location.floor, speakers, moderator, sponsors, current_attendance, groups, rsvp_template, tags",
  }

  return await axios.get(endpoint, { params }).then(async ({data}) => {

    console.log(`SSR_getEvents then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)

    let remainingPages = await SSR_GetRemainingPages(endpoint, params, data.last_page);

    return [...data.data, ...remainingPages];

  }).catch(e => console.log("ERROR: ", e));
};

const SSR_getSponsors = async (baseUrl, summitId, accessToken) => {

  const endpoint = `${baseUrl}/api/v1/summits/${summitId}/sponsors`;

  const params = {
        access_token: accessToken,
        per_page: 50,
        page: 1,
        expand: 'company,sponsorship,sponsorship.type',
  }

  return await axios.get(endpoint, { params }).then(async ({data}) => {

    console.log(`SSR_getSponsors then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)

    let remainingPages = await SSR_GetRemainingPages(endpoint, params, data.last_page);

    return [...data.data, ...remainingPages];

  }).catch(e => console.log('ERROR: ', e));
};

const SSR_getSponsorCollections = async (allSponsors, baseUrl, summitId, accessToken) => {

  const params = {
        access_token: accessToken,
        per_page: 50,
        page: 1,
  }

  const getSponsorCollection = async (endpoint, params) => await axios.get(endpoint, { params }).then(async ({data}) => {
    console.log(`SSR_getSponsorCollection then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)
    let remainingPages = await SSR_GetRemainingPages(endpoint, params, data.last_page);
    return [...data.data, ...remainingPages];
  }).catch(e => console.log('ERROR: ', e));

  const sponsorsWithCollections = await Promise.all(allSponsors.map(async (sponsor) => {
    console.log(`Collections for ${sponsor.company.name}...`);
    const ads = await getSponsorCollection(`${baseUrl}/api/v1/summits/${summitId}/sponsors/${sponsor.id}/ads`, params);
    const materials = await getSponsorCollection(`${baseUrl}/api/v1/summits/${summitId}/sponsors/${sponsor.id}/materials`, params);
    const social_networks = await getSponsorCollection(`${baseUrl}/api/v1/summits/${summitId}/sponsors/${sponsor.id}/social-networks`, params);
    return ({...sponsor, ads, materials, social_networks})
  }));

  return sponsorsWithCollections;
};

const SSR_getSpeakers = async (baseUrl, summitId, accessToken, filter = null) => {

  const params = {
    access_token: accessToken,
    per_page: 30,
    page: 1,
  };

  const endpoint = `${baseUrl}/api/v1/summits/${summitId}/speakers/on-schedule`;

  if (filter) {
    params["filter[]"] = filter;
  }

  return await axios.get(
      endpoint,
    { params }
  )
    .then(async ({data}) => {
      console.log(`SSR_getSpeakers then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)

      let remainingPages = await SSR_GetRemainingPages(endpoint, params, data.last_page);

      return [ ...data.data, ...remainingPages];
    })
    .catch(e => console.log("ERROR: ", e));
};

const SSR_getSummit = async (baseUrl, summitId) => {

  const params = {
    expand: "event_types,tracks, tracks.subtracks,track_groups,presentation_levels,locations.rooms,locations.floors,order_extra_questions.values,schedule_settings,schedule_settings.filters,schedule_settings.pre_filters",
    t: Date.now()
  };

  return await axios.get(
    `${baseUrl}/api/public/v1/summits/${summitId}`,
    { params }
  )
    .then(({ data }) => data)
    .catch(e => console.log("ERROR: ", e));
};

const SSR_getVoteablePresentations = async (baseUrl, summitId, accessToken) => {

  const endpoint = `${baseUrl}/api/v1/summits/${summitId}/presentations/voteable`;

  const params = {
    access_token: accessToken,
    per_page: 50,
    page: 1,
    filter: "published==1",
    expand: "slides, links, videos, media_uploads, type, track, track.allowed_access_levels, location, location.venue, location.floor, speakers, moderator, sponsors, current_attendance, groups, rsvp_template, tags",
  };

  return await axios.get(endpoint,
    { params }).then(async ({data}) => {

    console.log(`SSR_getVoteablePresentations  then data.current_page ${data.current_page} data.last_page ${data.last_page} total ${data.total}`)

    let remainingPages = await SSR_GetRemainingPages(endpoint, params, data.last_page);

    return [...data.data, ...remainingPages];
  })
    .catch(e => console.log("ERROR: ", e));
};

exports.onPreBootstrap = async () => {

  console.log("onPreBootstrap");

  const summitId = process.env.GATSBY_SUMMIT_ID;
  const summitApiBaseUrl = process.env.GATSBY_SUMMIT_API_BASE_URL;
  const marketingSettings = await SSR_getMarketingSettings(process.env.GATSBY_MARKETING_API_BASE_URL, summitId);
  const colorSettings = fs.existsSync(COLORS_FILE_PATH) ? JSON.parse(fs.readFileSync(COLORS_FILE_PATH)) : require(`./${DEFAULT_COLORS_FILE_PATH}`);
  const globalSettings = fs.existsSync(SITE_SETTINGS_FILE_PATH) ? JSON.parse(fs.readFileSync(SITE_SETTINGS_FILE_PATH)) : {};
  const lobbyPageSettings = fs.existsSync(LOBBY_PAGE_FILE_PATH) ? JSON.parse(fs.readFileSync(LOBBY_PAGE_FILE_PATH)) : {};

  const config = {
    client: {
      id: process.env.GATSBY_OAUTH2_CLIENT_ID_BUILD,
      secret: process.env.GATSBY_OAUTH2_CLIENT_SECRET_BUILD
    },
    auth: {
      tokenHost: process.env.GATSBY_IDP_BASE_URL,
      tokenPath: process.env.GATSBY_OAUTH_TOKEN_PATH
    },
    options: {
      authorizationMethod: "header"
    }
  };

  const accessToken = await getAccessToken(config, process.env.GATSBY_BUILD_SCOPES).then(({ token }) => token.access_token);

  // extract colors from marketing settings
  marketingSettings.map(({ key, value }) => {
    if (key.startsWith("color_")) colorSettings[key] = value;
  });

  // create required directories
  REQUIRED_DIR_PATHS.forEach(dirPath => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  fs.writeFileSync(MARKETING_SETTINGS_FILE_PATH, JSON.stringify(marketingSettings), "utf8");
  fs.writeFileSync(COLORS_FILE_PATH, JSON.stringify(colorSettings), "utf8");
  fs.writeFileSync(LOBBY_PAGE_FILE_PATH, JSON.stringify(lobbyPageSettings), "utf8");

  // summit
  const summit = await SSR_getSummit(summitApiBaseUrl, summitId);
  fileBuildTimes.push({
    "file": SUMMIT_FILE_PATH,
    "build_time": Date.now()
  });
  fs.writeFileSync(SUMMIT_FILE_PATH, JSON.stringify(summit), "utf8");

  // Show Events
  const allEvents = await SSR_getEvents(summitApiBaseUrl, summitId, accessToken);
  fileBuildTimes.push({
    "file": EVENTS_FILE_PATH,
    "build_time": Date.now()
  });
  console.log(`allEvents ${allEvents.length}`);

  fs.writeFileSync(EVENTS_FILE_PATH, JSON.stringify(allEvents), "utf8");

  const allEventsIDX = {};
  allEvents.forEach((e, index) => allEventsIDX[e.id] = index);

  fileBuildTimes.push({
    "file": EVENTS_IDX_FILE_PATH,
    "build_time": Date.now()
  });
  fs.writeFileSync(EVENTS_IDX_FILE_PATH, JSON.stringify(allEventsIDX), "utf8");


  // Show Speakers
  const allSpeakers = await SSR_getSpeakers(summitApiBaseUrl, summitId, accessToken);
  console.log(`allSpeakers ${allSpeakers.length}`);
  fileBuildTimes.push({
    "file": SPEAKERS_FILE_PATH,
    "build_time": Date.now()
  });

  fs.writeFileSync(SPEAKERS_FILE_PATH, JSON.stringify(allSpeakers), "utf8");

  const allSpeakersIDX = {};
  allSpeakers.forEach((e, index) => allSpeakersIDX[e.id] = index);
  fileBuildTimes.push({
    "file": SPEAKERS_IDX_FILE_PATH,
    "build_time": Date.now()
  });
  fs.writeFileSync(SPEAKERS_IDX_FILE_PATH, JSON.stringify(allSpeakersIDX), "utf8");

  // Show Sponsors
  const allSponsors = await SSR_getSponsors(summitApiBaseUrl, summitId, accessToken);
  console.log(`allSponsors ${allSponsors.length}`);
  const sponsorsWithCollections  = await SSR_getSponsorCollections(allSponsors, summitApiBaseUrl, summitId, accessToken);
  fileBuildTimes.push({
    "file": SPONSORS_FILE_PATH,
    "build_time": Date.now()
  });
  fs.writeFileSync(SPONSORS_FILE_PATH, JSON.stringify(sponsorsWithCollections), 'utf8');

  // Voteable Presentations
  const allVoteablePresentations = await SSR_getVoteablePresentations(summitApiBaseUrl, summitId, accessToken);
  console.log(`allVoteablePresentations ${allVoteablePresentations.length}`);
  fileBuildTimes.push({
    "file":VOTEABLE_PRESENTATIONS_FILE_PATH,
    "build_time": Date.now()
  });
  fs.writeFileSync(VOTEABLE_PRESENTATIONS_FILE_PATH, JSON.stringify(allVoteablePresentations), "utf8");

  // setting build times
  globalSettings.staticJsonFilesBuildTime = fileBuildTimes;
  globalSettings.lastBuild = Date.now();

  fs.writeFileSync(SITE_SETTINGS_FILE_PATH, JSON.stringify(globalSettings), "utf8");
};

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions;
  // TODO: improve typeDefs to allow theme override
  const typeDefs = require("./src/cms/config/collections/typeDefs");
  createTypes(typeDefs);
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  if (node.internal.type === "MarkdownRemark") {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: "slug",
      node,
      value,
    })
  }
};

exports.createPages = ({ actions, graphql }) => {
  const { createPage, createRedirect } = actions;

  const maintenanceMode = fs.existsSync(MAINTENANCE_FILE_PATH) ?
    JSON.parse(fs.readFileSync(MAINTENANCE_FILE_PATH)) : { enabled: false };

  // create a catch all redirect
  if (maintenanceMode.enabled) {
    createRedirect({
      fromPath: "/*",
      toPath: "/maintenance/"
    });
  }

  return graphql(`
    {
      allMarkdownRemark(limit: 1000) {
        edges {
          node {
            id
            fields {
              slug
            }
            frontmatter {
              templateKey
            }
          }
        }
      }
    }
  `).then((result) => {
    const {
      errors,
      data: {
        allMarkdownRemark: {
          edges
        }
      }
    } = result;

    if (errors) {
      errors.forEach((e) => console.error(e.toString()));
      return Promise.reject(errors);
    }

    edges.forEach((edge) => {
      const { id, fields, frontmatter: { templateKey } } = edge.node;

      var slug = fields.slug;
      if (slug.match(/content-pages/)) {
        slug = slug.replace("/content-pages/", "/");
      }

      const page = {
        path: slug,
        component: require.resolve(
          `./src/templates/${String(templateKey)}.js`
        ),
        context: {
          id,
        },
      };

      // dont create pages if maintenance mode enabled
      // gatsby disregards redirect if pages created for path
      if (maintenanceMode.enabled && !page.path.match(/maintenance/)) return;

      createPage(page);
    });
  });
};

exports.onCreateWebpackConfig = ({
  actions,
  plugins,
  loaders,
  getConfig
}) => {
  const config = getConfig();
  const jsTestString = "\\.(js|mjs|jsx|ts|tsx)$";
  const jsTest = new RegExp(jsTestString);
  const jsRule = config.module.rules.find(
    (rule) => String(rule.test) === String(jsTest)
  );
  // is it running standalone? or is it running as a module/package?
  const standalone = __dirname === path.resolve();
  if (!standalone) {
    /**
     * Force transpiliation of solution js files; required for theming.
     * @see https://www.gatsbyjs.com/docs/how-to/custom-configuration/add-custom-webpack-config/#modifying-the-babel-loader
     */
    const solutionJsTest = new RegExp(`${__dirname}(.*)${jsTestString}`);
    const jsRuleInclude = jsRule.include;
    jsRule.include = (modulePath) => {
      if (solutionJsTest.test(modulePath)) return true;
      return jsRuleInclude(modulePath);
    }
  }
  actions.setWebpackConfig({
    module: {
      rules: [
        jsRule
      ]
    },
    resolve: {
      /**
       * Webpack removed automatic polyfills for these node APIs in v5,
       * so we need to patch them in the browser.
       * @see https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/#webpack-5-node-configuration-changed-nodefs-nodepath-
       * @see https://viglucci.io/how-to-polyfill-buffer-with-webpack-5
       */
      fallback: {
        path: require.resolve("path-browserify"),
        stream: require.resolve("stream-browserify"),
        buffer: require.resolve("buffer/")
      },
      // allows content and data imports to correctly resolve when theming
      modules: [path.resolve("src")]
    },
    // devtool: "source-map",
    plugins: [
      plugins.define({
        "global.GENTLY": false,
        "global.BLOB": false
      }),
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
      // ignore unused jsdom dependency
      new webpack.IgnorePlugin({
        resourceRegExp: /canvas/,
        contextRegExp: /jsdom$/
      }),
      // upload source maps only if we have an sentry auth token and we are at production
      ...("GATSBY_SENTRY_AUTH_TOKEN" in process.env && process.env.NODE_ENV === "production") ?[
          new SentryWebpackPlugin({
        org: process.env.GATSBY_SENTRY_ORG,
        project: process.env.GATSBY_SENTRY_PROJECT,
        ignore: ["app-*", "polyfill-*", "framework-*", "webpack-runtime-*", "~partytown"],
        // Specify the directory containing build artifacts
        include: [
            {
              paths: ["src","public",".cache"],
              urlPrefix: "~/",
            },
            {
              paths: ["node_modules/upcoming-events-widget/dist"],
              urlPrefix: "~/node_modules/upcoming-events-widget/dist",
            },
            {
              paths: ["node_modules/summit-registration-lite/dist"],
              urlPrefix: "~/node_modules/summit-registration-lite/dist",
            },
            {
              paths: ["node_modules/full-schedule-widget/dist"],
              urlPrefix: "~/node_modules/full-schedule-widget//dist",
            },
            {
              paths: ["node_modules/schedule-filter-widget/dist"],
              urlPrefix: "~/node_modules/schedule-filter-widget/dist",
            },
            {
              paths: ["node_modules/lite-schedule-widget/dist"],
              urlPrefix: "~/node_modules/lite-schedule-widget/dist",
            },
            {
              paths: ["node_modules/live-event-widget/dist"],
              urlPrefix: "~/node_modules/live-event-widget/dist",
            },
            {
              paths: ["node_modules/attendee-to-attendee-widget/dist"],
              urlPrefix: "~/node_modules/attendee-to-attendee-widget/dist",
            },
            {
              paths: ["node_modules/openstack-uicore-foundation/lib"],
              urlPrefix: "~/node_modules/openstack-uicore-foundation/lib",
            },
            {
              paths: ["node_modules/speakers-widget/dist"],
              urlPrefix: "~/node_modules/speakers-widget/dist",
            },
        ],
        // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
        // and needs the `project:releases` and `org:read` scopes
        authToken: process.env.GATSBY_SENTRY_AUTH_TOKEN,
        // Optionally uncomment the line below to override automatic release name detection
        release: process.env.GATSBY_SENTRY_RELEASE,
      })]:[],
    ]
  });
};
