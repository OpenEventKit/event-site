import CookieManagerProvider from "./CookieManagerProvider";

class CookieManager {
  static instance;

  constructor(provider, services) {
    if (CookieManager.instance) {
      return CookieManager.instance;
    }

    if (!(provider instanceof CookieManagerProvider)) {
      throw new Error("Provider must implement CookieManagerProvider interface");
    }

    this.provider = provider;
    this.services = services;
    this.provider.init(this.services);

    CookieManager.instance = this;
  }

  getConsents = () => this.provider.getConsents();

  show = () => this.provider.show();
}

export default CookieManager;
