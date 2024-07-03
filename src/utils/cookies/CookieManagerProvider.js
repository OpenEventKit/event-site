class CookieManagerProvider {
  init = (services) => {
    throw new Error("Method 'init()' must be implemented.");
  };

  getConsents = () => {
    throw new Error("Method 'getConsents()' must be implemented.");
  };

  show = () => {
    throw new Error("Method 'show()' must be implemented.");
  };
}

export default CookieManagerProvider;
