import CookieManagerProvider from "./CookieManagerProvider";

class CookieManager {
  constructor(provider, services) {
    if (!(provider instanceof CookieManagerProvider)) {
      throw new Error("Provider must implement CookieManagerProvider interface");
    }
    this.provider = provider;
    this.services = services;
    this.provider.init(this.services)
  }

  getConsents = () => this.provider.getConsents();
}

export default CookieManager;
