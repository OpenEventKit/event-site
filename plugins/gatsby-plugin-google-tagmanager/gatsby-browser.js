const listOfMetricsSend = new Set();

const debounce = (fn, timeout) => {
  let timer = null;

  return (...args) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(fn, timeout, ...args);
  };
};

const sendWebVitals = (dataLayerName = "dataLayer") => {
  const win = window;

  const sendData = (data) => {
    if (listOfMetricsSend.has(data.name)) {
      return;
    }
    listOfMetricsSend.add(data.name);

    sendToGTM(data, win[dataLayerName]);
  };

  return import("web-vitals/base").then(({ getLCP, getFID, getCLS }) => {
    const debouncedCLS = debounce(sendData, 3000);
    // we don't need to debounce FID - we send it when it happens
    const debouncedFID = sendData;
    // LCP can occur multiple times so we debounce it
    const debouncedLCP = debounce(sendData, 3000);

    // With the true flag, we measure all previous occurrences too, in case we start listening too late.
    getCLS(debouncedCLS, true);
    getFID(debouncedFID, true);
    getLCP(debouncedLCP, true);
  });
};

const sendToGTM = ({ name, value, id }, dataLayer) => {
  // Log warning and return if dataLayer is undefined
  if (!dataLayer) {
    console.log("GTM dataLayer is undefined. Consent granted?");
    return;
  }

  dataLayer.push({
    event: "core-web-vitals",
    webVitalsMeasurement: {
      name: name,
      // The `id` value will be unique to the current page load. When sending
      // multiple values from the same page (e.g. for CLS), Google Analytics can
      // compute a total by grouping on this ID (note: requires `eventLabel` to
      // be a dimension in your report).
      id,
      // Google Analytics metrics must be integers, so the value is rounded.
      // For CLS the value is first multiplied by 1000 for greater precision
      // (note: increase the multiplier for greater precision if needed).
      value: Math.round(name === "CLS" ? value * 1000 : value)
    }
  });
};

export const onRouteUpdate = (_, pluginOptions) => {
  if (
    process.env.NODE_ENV === "production" ||
    pluginOptions.includeInDevelopment
  ) {
    // wrap inside a timeout to ensure the title has properly been changed
    setTimeout(() => {
      const data = pluginOptions.dataLayerName
        ? window[pluginOptions.dataLayerName]
        : window.dataLayer;

      // Log warning and return if dataLayer is undefined
      if (!data) {
        console.log("GTM dataLayer is undefined. Consent granted?");
        return;
      }

      const eventName = pluginOptions.routeChangeEventName
        ? pluginOptions.routeChangeEventName
        : "gatsby-route-change";

      data.push({ event: eventName });
    }, 50);
  }
};

export const onInitialClientRender = (_, pluginOptions) => {
  // we only load the polyfill in production so we can't enable it in development
  if (
    process.env.NODE_ENV === "production" &&
    pluginOptions.enableWebVitalsTracking
  ) {
    sendWebVitals(pluginOptions.dataLayerName);
  }
};
