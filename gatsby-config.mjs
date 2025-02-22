import path, { dirname } from "path";
import dotenv from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import webpack from "webpack";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import rehypeMdxImportMedia from "rehype-mdx-import-media";

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
} catch (e) {
  console.log("Falling back to default site settings.")
}

const packageJson = require(path.resolve(__dirname, "package.json"));

const title = siteSettings?.siteMetadata?.title || process.env.GATSBY_METADATA_TITLE;
const description = siteSettings?.siteMetadata?.description || process.env.GATSBY_METADATA_DESCRIPTION;
const faviconAsset = siteSettings?.favicon?.asset;

const manifestPlugin = faviconAsset ? [
  {
    resolve: "gatsby-plugin-manifest",
    options: {
      name: title ?? packageJson.description,
      short_name: title ?? packageJson.description,
      start_url: "/",
      display: "minimal-ui",
      icon: path.join(SITE_SETTINGS_DIR_PATH, faviconAsset),
      include_favicon: true,
      ...description && { description }
    }
  }
] : [];

const googleTagManagerPlugin = process.env.GATSBY_GOOGLE_TAGMANAGER_ID ? [
  {
    resolve: require.resolve("./plugins/gatsby-plugin-google-tagmanager"),
    options: {
      id: process.env.GATSBY_GOOGLE_TAGMANAGER_ID,
      includeInDevelopment: true,
      // defer script tags loading to after consent is given
      // managed by Klaro cookie manager
      deferLoading: true
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
            maxWidth: 2048,
            linkImagesToOriginal: false,
            wrapperStyle: fluidResult => "margin-left: 0; margin-right: auto;"
          }
        }
      ],
      mdxOptions: {
        remarkPlugins: [
          // Add GitHub Flavored Markdown (GFM) support
          remarkGfm
        ],
        rehypePlugins: [
          rehypeExternalLinks,
          rehypeMdxImportMedia
        ]
      }
    }
  },
  {
    resolve: "gatsby-plugin-decap-cms",
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
         * Webpack removed automatic polyfills for these node APIs in v5,
         * so we need to patch them in the browser.
         * @see https://www.gatsbyjs.com/docs/reference/release-notes/migrating-from-v2-to-v3/#webpack-5-node-configuration-changed-nodefs-nodepath-
         * @see https://viglucci.io/how-to-polyfill-buffer-with-webpack-5
         */
        config.resolve = {
          ...config.resolve,
          fallback: {
            ...config.resolve.fallback,
            fs: false,
            assert: require.resolve("assert"),
            buffer: require.resolve("buffer/"),
            path: require.resolve("path-browserify"),
            "object.assign/polyfill": require.resolve("object.assign/polyfill")
          }
        };
        config.plugins = [
          ...config.plugins,
          new webpack.ProvidePlugin({
            process: "process",
            Buffer: ["buffer", "Buffer"]
          })
        ];
      }
    }
  },
  ...googleTagManagerPlugin
];

const siteMetadata = {
  title,
  description
};

export { siteMetadata, plugins };
