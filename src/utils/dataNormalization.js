import _ from "lodash";

const FIRST_NAME_KEY = "first_name";
const LAST_NAME_KEY = "last_name";
const EMAIL_KEY = "email";
const OWNER_FIRST_NAME_KEY = `owner_${FIRST_NAME_KEY}`;
const OWNER_LAST_NAME_KEY = `owner_${LAST_NAME_KEY}`;
const OWNER_EMAIL_KEY = `owner_${EMAIL_KEY}`;
const QR_CODE_KEY = "qr_code";

const excludeKeys = [
  FIRST_NAME_KEY,
  LAST_NAME_KEY,
  EMAIL_KEY,
  OWNER_FIRST_NAME_KEY,
  OWNER_LAST_NAME_KEY,
  OWNER_EMAIL_KEY,
  QR_CODE_KEY,
];

const deepOmit = (obj, keysToOmit) => {
  let keysToOmitIndex =  _.keyBy(Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit] ); // create an index object of the keys that should be omitted

  const omitFromObject = (obj) => { // the inner function which will be called recursively
    return _.transform(obj, function(result, value, key) { // transform to a new object
      if (key in keysToOmitIndex) { // if the key is in the index skip it
        return;
      }
      result[key] = _.isObject(value) ? omitFromObject(value) : value; // if the key is an object run it through the inner function - omitFromObject
    })
  }

  return omitFromObject(obj); // return the inner function result
}

export const normalizeData = (data) => deepOmit(data, excludeKeys);
