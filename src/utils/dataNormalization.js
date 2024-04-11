import { maskData } from "data-guardian";

const FIRST_NAME_KEY = "first_name";
const LAST_NAME_KEY = "last_name";

const excludeKeys = [FIRST_NAME_KEY, LAST_NAME_KEY];

const maskingConfig = {
  keyCheck: (key) => excludeKeys.some(excludeKey => key.includes(excludeKey))
};

export const normalizeData = (data) => maskData(data, maskingConfig);
