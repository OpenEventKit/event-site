import path, { dirname } from "path";
import dotenv from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import remarkGfm from "remark-gfm";

const require = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: `.env.${process.env.NODE_ENV}`
});

const {
  STATIC_CONTENT_DIR_PATH,
  PAGES_DIR_PATH,
  CONTENT_PAGES_DIR_PATH,
  CONTENT_PAGES_PATH_NAME,
  SITE_SETTINGS_FILE_PATH,
  SITE_SETTINGS_DIR_PATH,
  MARKETING_SETTINGS_FILE_PATH
} = require("./src/utils/filePath");

let siteSettings = require(`./${SITE_SETTINGS_FILE_PATH}`);
try {
  siteSettings = require(path.resolve(SITE_SETTINGS_FILE_PATH));
}
catch (e) {
  console.log("Falling back to default site settings.")
}

const title = siteSettings?.siteMetadata?.title || process.env.GATSBY_METADATA_TITLE || "Event Site";
const description = siteSettings?.siteMetadata?.description || process.env.GATSBY_METADATA_DESCRIPTION || "Event Site";
const faviconAsset = siteSettings?.favicon?.asset;

const manifestPlugin = faviconAsset ? [
  {
    resolve: "gatsby-plugin-manifest",
    options: {
      name: title,
      short_name: title,
      description: description,
      start_url: "/",
      display: "minimal-ui",
      icon: path.join(SITE_SETTINGS_DIR_PATH, faviconAsset),
      include_favicon: true
    }
  }
] : [];

const googleTagManagerPlugin = process.env.GATSBY_GOOGLE_TAGMANAGER_ID ? [
  {
    resolve: "gatsby-plugin-google-tagmanager",
    options: {
      id: process.env.GATSBY_GOOGLE_TAGMANAGER_ID,
      includeInDevelopment: true
    }
  }
] : [];

const plugins = [
  ...manifestPlugin,
  {
    resolve: "gatsby-alias-imports",
    options: {
      aliases: {
        "@utils": `${__dirname}/src/utils`
      }
    }
  },
  {
    /**
     * Gatsby v4 uses ES Modules for importing cssModules by default.
     * Disabling this to avoid needing to update in all files and for compatibility
     * with other plugins/packages that have not yet been updated.
     * @see https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/#css-modules-are-imported-as-es-modules
     *
     * Also, since libSass was deprecated in October 2020, the Node Sass package has also been deprecated.
     * As such, we have migrated from Node Sass to Dart Sass in package.json.
     * @see https://www.gatsbyjs.com/plugins/gatsby-plugin-sass/#v300
     * @see https://sass-lang.com/blog/libsass-is-deprecated#how-do-i-migrate
     */
    resolve: "gatsby-plugin-sass",
    options: {
      cssLoaderOptions: {
        esModule: false,
        modules: {
          namedExport: false
        }
      }
    }
  },
  {
    // Add font assets before markdown or json files
    resolve: "gatsby-source-filesystem",
    options: {
      path: `${__dirname}/static/fonts`,
      name: "fonts"
    }
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      path: `${__dirname}/src/pages`,
      name: "pages"
    }
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      path: path.resolve(CONTENT_PAGES_DIR_PATH),
      name: "contentPages"
    }
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      path: path.resolve(STATIC_CONTENT_DIR_PATH),
      name: "content"
    }
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      path: path.resolve(MARKETING_SETTINGS_FILE_PATH),
      name: "marketingSettings"
    }
  },
  {
    resolve: "gatsby-plugin-page-creator",
    options: {
      path: path.resolve(PAGES_DIR_PATH),
      ignore: [`**/${CONTENT_PAGES_PATH_NAME}/**`],
    }
  },
  "gatsby-plugin-image",
  "gatsby-plugin-sharp",
  "gatsby-transformer-sharp",
  "gatsby-transformer-json",
  {
    resolve: "gatsby-plugin-mdx",
    options: {
      extensions: [".mdx", ".md"],
      gatsbyRemarkPlugins: [
        {
          resolve: "gatsby-remark-images",
          options: {
            // It's important to specify the maxWidth (in pixels) of
            // the content container as this plugin uses this as the
            // base for generating different widths of each image.
            maxWidth: 2048
          }
        }
      ],
      mdxOptions: {
        remarkPlugins: [
          // Add GitHub Flavored Markdown (GFM) support
          remarkGfm
        ]
      }
    }
  },
  {
    resolve: "gatsby-plugin-netlify-cms",
    options: {
      modulePath: `${__dirname}/src/cms/cms.js`,
      manualInit: true,
      enableIdentityWidget: false,
      customizeWebpackConfig: (config) => {
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
        config.module.rules = [
          ...config.module.rules.filter(
            (rule) => String(rule.test) !== String(jsTest)
          ),
          jsRule
        ];
         /**
         * Fixes Module not found: Error: Can"t resolve "path" bug.
         * Webpack 5 doesn"t include browser polyfills for node APIs by default anymore,
         * so we need to provide them ourselves.
         * @see https://github.com/postcss/postcss/issues/1509#issuecomment-772097567
         * @see https://github.com/gatsbyjs/gatsby/issues/31475
         * @see https://github.com/gatsbyjs/gatsby/issues/31179#issuecomment-844588682
         */
        config.resolve = {
          ...config.resolve,
          fallback: {
            ...config.resolve.fallback,
            path: require.resolve("path-browserify")
          }
        };
      }
    }
  },
  ...googleTagManagerPlugin,
  "gatsby-plugin-netlify", // make sure to keep it last in the array
];

const siteMetadata = {
  title,
  description
};

export { siteMetadata, plugins };
