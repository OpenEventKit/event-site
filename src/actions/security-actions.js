import { getEnvVariable, HASH_SANITIZE_TOKENS } from "@utils/envVariables";

export const sanitizeHash = () => (dispatch, getState) => {
  const { userState: { isAuthorized } } = getState();

  if (!isAuthorized) {
    const tokens = getEnvVariable(HASH_SANITIZE_TOKENS)?.split(",") ?? [];

    if (tokens.length > 0) {
      const url = new URL(window.location.href);
      let fragment = url.hash;
      let shouldUpdate = false;

      tokens.forEach(token => {
        if (fragment.includes(`${token}=`)) {
          shouldUpdate = true;
          fragment = fragment
            .split("&")
            .filter(fragmentToken => !fragmentToken.includes(`${token}=`))
            .join("&")
            .replace("#&", "#")
            .replace("#?", "#")
            .replace("#", "");
        }
      });

      if (shouldUpdate) {
        window.history.replaceState({}, "", `${url.pathname}${fragment ? `#${fragment}` : ""}`);
      }
    }
  }
};
