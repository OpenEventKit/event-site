import * as klaro from "klaro";
import CookieManagerProvider from "../CookieManagerProvider";
import { triggerTagManagerTrackEvent } from "../../eventTriggers";

class KlaroProvider extends CookieManagerProvider {
  init = (services) => {
    /**
     * For api methods
     * @see https://github.com/klaro-org/klaro-js/blob/master/src/lib.js
     **/
    this.api = klaro;
    this.config = this.#formatConfig(services);
    this.consentManager = this.api.getManager(this.config);
  };

  getConsents = () => this.consentManager ? this.consentManager.consents : {};

  show = () => this.api.render(this.config);

  /**
   * @see https://klaro.org/docs/integration/annotated-configuration
   **/
  #formatConfig = (services) => ({
    acceptAll: true,
    hideLearnMore: true,
    translations: {
      en: {
        purposes: {
          analytics: "Analytics",
          marketing: "Marketing",
          styling: "Styling"
        },
        consentNotice: {
          description:
            "Hi! Could we please enable cookies for anonymous {purposes} to improve your user experience?"
        },
      }
    },
    services: services.map(service => ({
      name: service.name,
      title: service.title,
      description: service.description,
      purposes: service.purposes,
      required: service.required,
      cookies: service.cookies,
      onAccept: this.#handleAccept.bind(this, service),
      onDecline: this.#handleDecline.bind(this, service),
      onInit: service.onInit
    }))
  });

  #handleAccept = (service) => {
    if (service.name === "google-tag-manager") {
      const consents = this.getConsents();
      for (let k of Object.keys(consents)) {
        if (consents[k]) {
          let eventName = "klaro-" + k + "-accepted";
          triggerTagManagerTrackEvent(eventName);
        }
      }
    } else {
      let eventName = "klaro-" + service.name + "-accepted";
      triggerTagManagerTrackEvent(eventName);
    }

    if (service.onAccept) {
      service.onAccept();
    }
  };

  #handleDecline = (service) => {
    const eventName = "klaro-" + service.name + "-declined";
    triggerTagManagerTrackEvent(eventName);

    if (service.onDecline) {
      service.onDecline();
    }
  };
}

export default KlaroProvider;
