import { JSDOM } from "jsdom";
import { XMLHttpRequest } from "xmlhttprequest";

const noop = () => {};

const matchMedia = () => ({
  matches: false,
  addListener: noop,
  removeListener: noop
});

const { window } = new JSDOM("...");

global.window = window;
global.window.matchMedia = matchMedia;
global.document = window.document;
global.navigator = window.navigator;
global.XMLHttpRequest = XMLHttpRequest;
