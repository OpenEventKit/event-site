import * as React from "react";
import { navigate } from "gatsby";

/**
 * @param {boolean} isLoggedIn - Indicates whether the user is logged in.
 * @param {object} location - The location object from React Router.
 * @param {ReactNode} children - The children components to be rendered.
 * @returns {ReactNode|null} - Returns children if isLoggedIn is true, otherwise redirects to login.
 */
const WithAuthRoute = ({ isLoggedIn, location, children }) => {
  React.useEffect(() => {
    if (!isLoggedIn) {
      // Use navigate with state to redirect and add data to navigation state
      navigate("/#login=1", { state: { backUrl: `${location.pathname}` } });
    }
  }, [isLoggedIn, location.pathname]);

  return isLoggedIn ? children : null;
};

export default WithAuthRoute;
