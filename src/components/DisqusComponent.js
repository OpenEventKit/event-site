import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import { DiscussionEmbed } from "disqus-react";
import { withMarketingSettings, MARKETING_SETTINGS_KEYS } from "@utils/useMarketingSettings";
import { getEnvVariable, DISQUS_SHORTNAME } from "@utils/envVariables";
import { getDisqusSSO } from "../actions/user-actions";
import PropTypes from "prop-types";

const DisqusComponent = ({summit, sponsor, event, disqusSSO, hideMobile, title, style, className, page, skipTo, ...props}) => {
  const [isMobile, setIsMobile] = useState(false);
  const shortname = getEnvVariable(DISQUS_SHORTNAME);
  const { auth: remoteAuthS3, public_key: apiKey } = disqusSSO || {};
  const almostTwoHours = 1000 * 60 * 60 * 1.9;

  useEffect(() => {
    // Resize Handler
    window.addEventListener('resize', onResize);
    setIsMobile(window.innerWidth <= 768);

    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  // check Disqus SSO on every render
  useEffect(() => {
    let disqusSsoInterval = null;

    if (shortname) {
      props.getDisqusSSO(shortname);

      // Edge case: if component has not rendered for more than 2hrs, we need to force a SSO token refresh.
      disqusSsoInterval = setInterval(() => {
        props.getDisqusSSO(shortname);
      }, almostTwoHours);
    }

    return () => {
      if (disqusSsoInterval) {
        clearInterval(disqusSsoInterval);
      }
    }
  });

  const onResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const getIdentifier = () => {
    const threadsBy = props.getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusThreadsBy) ?? "event";
    let identifier = null;

    if (event) {
      const eventExcludes = props.getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusExcludeEvents) ?? [];
      const trackExcludes = props.getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusExcludeTracks) ?? [];

      identifier = eventExcludes.includes(event.id) ? `summit/${summit.id}/event/${event.id}` : null;

      if (event.track && event.track.id) {
        identifier = trackExcludes.includes(event.track.id) ? `summit/${summit.id}/track/${event.track.id}` : null;
      }

      if (identifier === null) {
        switch (threadsBy) {
          case 'event':
            identifier = `summit/${summit.id}/event/${event.id}`;
            break;
          case 'track':
            identifier = event.track?.id ? `summit/${summit.id}/track/${event.track.id}` : `summit/${summit.id}/event/${event.id}`;
            break;
          case 'summit':
            identifier = `summit/${summit.id}`;
            break;
          default:
            identifier = null;
            break;
        }
      }
    } else if (sponsor) {
      identifier = `summit/${summit.id}/sponsor/${sponsor.id}`;
    }

    if (page) {
      identifier = threadsBy === 'summit' ? `summit/${summit.id}` : `summit/${summit.id}/${page}`;
    }

    return identifier;
  }

  const getTitle = () => {
    let suffix = '';
    const threadsBy = props.getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusThreadsBy) ?? "event";

    if (event) {
      const trackExcludes = props.getMarketingSettingByKey(MARKETING_SETTINGS_KEYS.disqusExcludeTracks) ?? [];
      if (event.track && event.track.id && (threadsBy === 'track' || trackExcludes.includes(event.track.id))) {
        suffix += ' - ';
        suffix += event.track.name;
      } else if (threadsBy === 'summit') {
      } else {
        suffix += ` - ${event.title}`
      }
    } else if (sponsor) {
      suffix += ` - Sponsor - ${sponsor.name}`
    } else if (page && threadsBy !== 'summit') {
      switch (page) {
        case 'lobby':
          suffix += ' - Lobby';
          break;
        case 'marketing-site':
          suffix += ' - Landing Page';
          break;
        default:
          break;
      }
    }
    return `${summit.name}${suffix}`;
  }

  if (!disqusSSO || (hideMobile !== null && hideMobile === isMobile)) {
    return null;
  }

  if (!remoteAuthS3 || !apiKey || !shortname) {
    let error = 'Disqus misconfiguration: ';
    if (!remoteAuthS3) error = ` ${error} ${!remoteAuthS3 ? 'SSO remoteAuthS3 missing' : ''}`;
    if (!apiKey) error = ` ${error} ${!apiKey ? 'SSO apiKey missing' : ''}`;
    // no error, fail silently
    // if (!shortname) error = ` ${error} ${!shortname ? 'DISQUS_SHORTNAME env var missing' : ''}`;
    return error;
  }

  const disqusConfig = {
    url: window.location.href,
    identifier: getIdentifier(),
    title: getTitle(),
    remoteAuthS3: remoteAuthS3,
    apiKey: apiKey
  };

  const sectionClass = className ? className : style || page === 'marketing-site' ? '' : 'disqus-container';

  return (
    <section aria-labelledby={title ? 'disqus-title' : ''} className={sectionClass} style={style}>
      <div className="disqus-header">
        {skipTo && <a className="sr-only skip-to-next" href={skipTo}>Skip to next section</a>}
        {title && <h2 id="disqus-title" className="title">{title}</h2>}
      </div>
      <DiscussionEmbed
        shortname={shortname}
        config={disqusConfig}
      />
    </section>
  );
};

const mapStateToProps = ({ summitState, userState }) => ({
  summit: summitState.summit,
  disqusSSO: userState.disqusSSO
});

DisqusComponent.propTypes = {
  event: PropTypes.object,
  sponsor: PropTypes.object,
  title: PropTypes.string,
  hideMobile: PropTypes.bool,
  page: PropTypes.string,
};

export default connect(mapStateToProps, { getDisqusSSO })(withMarketingSettings(DisqusComponent));
