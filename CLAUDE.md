# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **@openeventkit/event-site**, a Gatsby 5-based JAMstack event management platform. It uses React 18, Redux for state management, and Decap CMS (formerly Netlify CMS) for content editing. The site handles event registration, scheduling, live streaming, sponsorships, and attendee networking.

## Commands

```bash
yarn                  # Install dependencies
yarn develop          # Dev server (cleans cache first, binds 0.0.0.0 with HTTPS)
yarn build            # Production build (10GB heap)
yarn test             # Jest tests
yarn format           # Prettier: trailing-comma es5, no-semi, single-quote
yarn gatsby-clean     # Clear Gatsby cache
yarn clean            # Remove node_modules, reinstall, clean cache
```

Node 20.x is required (see `.nvmrc`). The build needs high memory (8-10GB heap) due to the dependency tree.

Run a single test: `npx jest path/to/test.js`

## Architecture

### Data Flow at Build Time

`gatsby-node.js` fetches data from the Summit API at build time using OAuth2 client credentials. It pulls summit details, events, speakers, sponsors, and marketing settings, writing them to JSON files in `src/content/`. These JSON files are then sourced by Gatsby via `gatsby-source-filesystem` + `gatsby-transformer-json` and used to create pages.

### State Management

Redux store with redux-persist (localStorage). Key reducers: `user`, `clock`, `summit`, `schedules`, `presentations`, `events`, `speakers`, `sponsors`, `settings`, `extraQuestions`. The summit/schedules/presentations/events/speakers/sponsors reducers are blacklisted from persistence (fetched fresh at runtime).

Store setup is in `src/state/` with a custom middleware that appends user profile to dispatched actions.

### Authentication

OAuth2 flow via `openstack-uicore-foundation` library. Route guards implemented as HOCs:
- `withAuthRoute` — requires login
- `withAuthzRoute` — requires specific group membership
- `withTicketRoute` — requires ticket ownership

Auth callback pages in `src/pages/auth/`.

### Real-Time Updates

Uses Ably for real-time event data. Strategy configured via `GATSBY_REAL_TIME_UPDATES_STRATEGY` env var. Web Workers (`src/workers/`) handle background syncing for feeds and data. The `withRealTimeUpdates` HOC wires components to Ably channels.

### Page Templates

Dynamic pages are created in `gatsby-node.js` using templates from `src/templates/`. Key templates: event pages, schedule, speakers, sponsors, marketing pages, user profile/orders. MDX content pages are supported via `gatsby-plugin-mdx`.

### Component Patterns

- Functional components with hooks, connected to Redux via `connect()`
- SCSS modules (`.module.scss`) for component-scoped styles
- Bulma CSS framework for layout utilities
- MUI 5 for UI components; import icons from direct paths (not barrel imports)
- External widget packages for major features (schedule, speakers, registration, etc.)

### Styling

Bulma + SCSS modules + MUI. Build-time SCSS generation happens in `gatsby-node.js` — colors and fonts are fetched from the API and written to SCSS files (`src/utils/scssUtils.js`). Global styles in `src/styles/`.

### CMS

Decap CMS with manual initialization (`src/cms/`). Custom CMS widgets and preview templates. Content stored as JSON in `src/content/` and markdown/MDX files.

### Key Directories

- `src/actions/` — Redux thunk action creators (API calls, state updates)
- `src/reducers/` — Redux reducers
- `src/templates/` — Gatsby page templates
- `src/routes/` — Auth/authz route wrapper HOCs
- `src/content/` — JSON data files and CMS-managed content
- `src/utils/` — Helpers, API utilities, custom hooks (`src/utils/hooks/`)
- `src/utils/build-json/` — Build-time API request classes used by gatsby-node.js
- `src/workers/` — Web Workers for background sync
- `src/i18n/` — i18next language config

## Environment

Copy `env.template` to `.env.production` or `.env.development`. All client-side env vars are prefixed with `GATSBY_`. Key variables:
- `GATSBY_SUMMIT_API_BASE_URL` / `GATSBY_SUMMIT_ID` — Backend API and event ID
- `GATSBY_IDP_BASE_URL` / `GATSBY_OAUTH2_CLIENT_ID` — Auth configuration
- `GATSBY_ABLY_API_KEY` — Real-time updates
- `GATSBY_SUPABASE_URL` / `GATSBY_SUPABASE_KEY` — Database
- `GATSBY_SENTRY_DSN` — Error tracking

## Testing

Jest 29 with jsdom environment and `@testing-library/react`. Tests live in `__tests__/` directories or as `*.test.js` files. CSS/SCSS modules are mocked via `identity-obj-proxy`. MDX and remark plugins are mocked in `__mocks__/`.

## Deployment

Netlify (see `netlify.toml`). Production builds use Node 20.19.4 and Yarn 1.22.19.

## Dependency Notes

- `cross-fetch` is pinned to 3.1.8 via resolutions to fix a `@react-pdf/renderer` font loading issue
- `openstack-uicore-foundation` is the shared auth/API library — its utilities are used extensively throughout actions and components
- Use `yarn update-libs` to upgrade the suite of external widget packages
