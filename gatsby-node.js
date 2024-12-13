const axios = require("axios");
const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const {
  createFilePath
} = require("gatsby-source-filesystem");
const SentryWebpackPlugin = require("@sentry/webpack-plugin");
const { ClientCredentials } = require("simple-oauth2");

const myEnv = require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`,
});

const {
  REQUIRED_DIR_PATHS,
  DEFAULT_COLORS_FILE_PATH,
  COLORS_FILE_PATH,
  COLORS_SCSS_FILE_PATH,
  SITE_SETTINGS_FILE_PATH,
  SUMMIT_FILE_PATH,
  EVENTS_FILE_PATH,
  EVENTS_IDX_FILE_PATH,
  SPEAKERS_FILE_PATH,
  SPEAKERS_IDX_FILE_PATH,
  VOTEABLE_PRESENTATIONS_FILE_PATH,
  MARKETING_SETTINGS_FILE_PATH,
  MAINTENANCE_PATH_NAME,
  CONTENT_PAGES_PATH_NAME,
  SPONSORS_FILE_PATH,
  FONTS_SCSS_FILE_PATH
} = require("./src/utils/filePath");

const {
  generateAndWriteScssFile,
  generateFontScssFile,
  generateColorsScssFile
} = require("./src/utils/scssUtils");

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

  const speakers_fields = ['id', 'first_name', 'last_name', 'title', 'bio','member_id','pic', 'big_pic', 'company', 'featured'];
  const documents_fields = ['display_on_site', 'name', 'order', 'class_name', 'type', 'public_url', 'link']
  const current_attendance_fields = ['member_first_name', 'member_last_name', 'member_pic'];
  const first_level_fields = [
    "id",
    "created",
    "start_date",
    "end_date",
    "title",
    "abstract",
    "description",
    "level" ,
    "image",
    "stream_thumbnail",
    "type", "type.id", "type.name",
    "location_id",
    "class_name",
    "allow_feedback",
    "head_count",
    "attendance_count",
    "current_attendance_count",
    "tags", "tags.id", "tags.tag",
    "location", "location.class_name", "location.name", "location.venue.name", "location.venue.floor", 
    "track", "track.id", "track.name",  "track.icon_url",  "track.color", "track.text_color", 
    "track_groups", "track_groups.id", "track_groups.name", "track_groups.parent_id", "track_groups.color", "track_groups.order", "track_groups.subtracks",
    "sponsors", "sponsors.id", "sponsors.name",  "sponsors.logo", 
    "to_record",
    "etherpad_link",
    "streaming_url",
    "streaming_type",
    "meeting_url",
    "current_attendance",
    "attendees_expected_learnt",
    "show_sponsors",
    "duration",
    "moderator_speaker_id",
  ];
  const fields =  `
    ${first_level_fields.join(",")},
    speakers.${speakers_fields.join(",speakers.")},
    current_attendance.${current_attendance_fields.join(',current_attendance.')}
    moderator.${speakers_fields.join(",moderator.")},
    media_uploads.${documents_fields.join(",media_uploads.")}
    videos.${documents_fields.join(",videos.")}
    slides.${documents_fields.join(",slides.")}
    links.${documents_fields.join(",links.")}
    `;
  const params = {
    access_token: accessToken,
    per_page: 50,
    page: 1,
    expand: 'slides,links,videos,media_uploads,type,track,location,location.venue,location.floor,speakers,moderator,sponsors,tags,current_attendance',
    relations: 'speakers.badge_features,speakers.all_presentations,speakers.all_moderated_presentations',
    fields: fields,
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
        filter: "is_published==1",
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


  const speakers_fields =
    ['id', 'first_name', 'last_name', 'title', 'bio','member_id','pic', 'big_pic', 'company', 'featured'];

  const params = {
    access_token: accessToken,
    per_page: 30,
    page: 1,
    relations: 'none',
    fields: speakers_fields.join(',')
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

const SSR_getSummit = async (baseUrl, summitId, accessToken) => {

  const summit_fields = [
    "id",
    "name",
    "start_date",
    "end_date",
    "time_zone_id",
    "time_zone_label",
    "tracks.id","tracks.name","tracks.code",
    "track_groups.id","track_groups.name","track_groups.tracks",
    "locations.id","locations.class_name","locations","locations.is_main",
    "secondary_logo",
    "slug",
    "payment_profiles",
    "support_email",
    "ticket_types.id",
    "ticket_types.name","ticket_types.created","ticket_types.cost",
    "start_showing_venues_date",
    "dates_with_events",
    "logo",
    "registration_allowed_refund_request_till_date",
    "allow_update_attendee_extra_questions",
    "is_virtual",
    "registration_disclaimer_mandatory",
    "registration_disclaimer_content",
    "reassign_ticket_till_date",
    "is_main",    
    "title",
    "description",
    "badge_features_types",
    "time_zone"]

  const summit_relations = ["dates_with_events","ticket_types.none","es","tracks.none","track_groups.none","locations","locations.none","payment_profiles","time_zone","none"]

  const params = {
    access_token: accessToken,    
    expand: "event_types," +
      "badge_features_types," +
      "tracks," +
      "track_groups," +
      "presentation_levels," +
      "locations," +
      "locations.rooms," +
      "locations.floors," +
      "order_extra_questions.values," +
      "schedule_settings," +
      "schedule_settings.filters," +
      "schedule_settings.pre_filters,"+
      "ticket_types",
    fields: summit_fields.join(','),
    relations: summit_relations.join(','),
    t: Date.now()
  };

  return await axios.get(
    `${baseUrl}/api/v2/summits/${summitId}`,
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
    expand: "slides,links,videos,media_uploads,type,track,track.allowed_access_levels,location,location.venue,location.floor,speakers,moderator,sponsors,current_attendance,groups,rsvp_template,tags",
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
  let   marketingSettings = await SSR_getMarketingSettings(process.env.GATSBY_MARKETING_API_BASE_URL, summitId);
  const siteSettings = fs.existsSync(SITE_SETTINGS_FILE_PATH) ? JSON.parse(fs.readFileSync(SITE_SETTINGS_FILE_PATH)) : {};
  const colors = fs.existsSync(COLORS_FILE_PATH) ? JSON.parse(fs.readFileSync(COLORS_FILE_PATH)) : require(`./${DEFAULT_COLORS_FILE_PATH}`);

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

  const FileType = "FILE";
  // extract colors from marketing settings
  marketingSettings = marketingSettings.map(entry => {
    if (entry.key.startsWith("color_")) colors[entry.key] = entry.value;
    if (entry.type === FileType) return { ...entry, value: entry.file };
    return { ...entry };
  });

  // create required directories
  REQUIRED_DIR_PATHS.forEach(dirPath => {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  fs.writeFileSync(MARKETING_SETTINGS_FILE_PATH, JSON.stringify(marketingSettings), "utf8");

  // write colors json used to set runtime colors in gatsby-browser
  fs.writeFileSync(COLORS_FILE_PATH, JSON.stringify(colors), "utf8");

  // generate and write colors SCSS file used by built styles
  generateAndWriteScssFile(generateColorsScssFile, colors, COLORS_SCSS_FILE_PATH);

  if (siteSettings.siteFont) {
    // generate and write font SCSS file used by built styles
    generateAndWriteScssFile(generateFontScssFile, siteSettings.siteFont, FONTS_SCSS_FILE_PATH);
  }

  // summit
  const summit = await SSR_getSummit(summitApiBaseUrl, summitId, accessToken);
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
  siteSettings.staticJsonFilesBuildTime = fileBuildTimes;
  siteSettings.lastBuild = Date.now();

  fs.writeFileSync(SITE_SETTINGS_FILE_PATH, JSON.stringify(siteSettings), "utf8");
};

exports.createSchemaCustomization = async ({ actions, reporter, getNodeAndSavePathDependency }) => {
  const { createFieldExtension, createTypes } = actions;
  createFieldExtension({
    name: "resolveImages",
    extend: () => ({
      async resolve(source, args, context, info) {
        const content = source[info.fieldName];
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        let match;
        let transformedContent = content;
        while ((match = imageRegex.exec(content)) !== null) {
          const [, alt, url] = match;
          if (url.startsWith("http://") || url.startsWith("https://")) {
            continue;
          }
          const node = await context.nodeModel.findOne({
            type: "File",
            query: { filter: { base: { eq: url } } }
          });
          if (!node) {
            reporter.warn(`File node not found for ${url}`);
            continue;
          }
          const absolutePath = path.resolve(node.dir, url);
          if (!fs.existsSync(absolutePath)) {
            reporter.warn(`File not found at path ${absolutePath}`);
            continue;
          }
          const details = getNodeAndSavePathDependency(node.id, context.path);
          const fileName = `${node.internal.contentDigest}/${details.base}`;
          const publicStaticDir = path.join(process.cwd(), "public", "static");
          const publicPath = path.join(publicStaticDir, fileName);
          if (!fs.existsSync(publicPath)) {
            try {
              await fs.copy(details.absolutePath, publicPath, { dereference: true });
            } catch (err) {
              reporter.panic(`Error copying file from ${details.absolutePath} to ${publicPath}: ${err.message}`);
              continue;
            }
          }
          transformedContent = transformedContent.replace(url, `/static/${fileName}`);
        }
        return transformedContent;
      }
    })
  });
  // TODO: improve typeDefs to allow theme override
  const typeDefs = require("./src/cms/config/collections/typeDefs");
  createTypes(typeDefs);
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;
  if (node.internal.type === "Mdx") {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: "slug",
      node,
      value
    })
  }
};

exports.createPages = async ({ actions, graphql }) => {
  const { createPage, createRedirect } = actions;

  const siteSettings = fs.existsSync(SITE_SETTINGS_FILE_PATH) ? JSON.parse(fs.readFileSync(SITE_SETTINGS_FILE_PATH)) : {};
  const maintenanceMode = siteSettings.maintenanceMode ?? { enabled: false };
  const maintenancePath = `/${MAINTENANCE_PATH_NAME}/`;

  if (maintenanceMode.enabled) {
    // create a catch all redirect
    createRedirect({
      fromPath: "/*",
      toPath: maintenancePath,
      isPermanent: false,
      statusCode: 302
    });
    // end execution, dont create any page from md/mdx
    return;
  } else {
    createRedirect({
      fromPath: maintenancePath,
      toPath: "/",
      isPermanent: false,
      statusCode: 302
    });
  }

  const result = await graphql(`
    {
      allMdx {
        nodes {
          id
          fields {
            slug
          }
          frontmatter {
            templateKey
          }
          internal {
            contentFilePath
          }
        }
      }
    }
  `);

  if (result.errors) {
    result.errors.forEach((e) => console.error(e.toString()));
    return Promise.reject(result.errors);
  }

  const nodes = result.data.allMdx.nodes;

  nodes.forEach((node) => {
    const { id, fields: { slug }, frontmatter: { templateKey }, internal: { contentFilePath } } = node;
    const template = require.resolve(`./src/templates/${String(templateKey)}`);
    // remove content pages namespace from path
    const path = slug.replace(`${CONTENT_PAGES_PATH_NAME}`, "/");
    const page = {
      path: path,
      component: `${template}?__contentFilePath=${contentFilePath}`,
      context: { id }
    };
    createPage(page);
  });
};

exports.onCreatePage = async ({ page, actions }) => {
  const { deletePage } = actions;

  const siteSettings = fs.existsSync(SITE_SETTINGS_FILE_PATH) ? JSON.parse(fs.readFileSync(SITE_SETTINGS_FILE_PATH)) : {};
  const maintenanceMode = siteSettings.maintenanceMode ?? { enabled: false };
  const maintenancePath = `/${MAINTENANCE_PATH_NAME}/`;

  const shouldDeletePage = (maintenanceMode.enabled && page.path !== maintenancePath) ||
                           (!maintenanceMode.enabled && page.path === maintenancePath);

  if (shouldDeletePage) {
    deletePage(page);
  }
};

exports.onCreateWebpackConfig = ({
  actions,
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
        fs: false,
        assert: require.resolve("assert"),
        buffer: require.resolve("buffer/"),
        path: require.resolve("path-browserify"),
        stream: require.resolve("stream-browserify"),
        "object.assign/polyfill": require.resolve("object.assign/polyfill")
      },
      // allows content and data imports to correctly resolve when theming
      modules: [
        path.resolve("src")
      ]
    },
    // devtool: "source-map",
    plugins: [
      new webpack.ProvidePlugin({
        process: "process",
        Buffer: ["buffer", "Buffer"]
      }),
      // upload source maps only if we have an sentry auth token and we are at production
      ...("GATSBY_SENTRY_AUTH_TOKEN" in process.env && process.env.NODE_ENV === "production") ? [
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
            }
          ],
          // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
          // and needs the `project:releases` and `org:read` scopes
          authToken: process.env.GATSBY_SENTRY_AUTH_TOKEN,
          // Optionally uncomment the line below to override automatic release name detection
          release: process.env.GATSBY_SENTRY_RELEASE,
        })
      ] : []
    ]
  });
};
