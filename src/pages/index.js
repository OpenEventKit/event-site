import * as React from "react";
import { connect } from "react-redux";
import { graphql } from "gatsby";
import Seo from "../components/Seo";
import MarketingPageTemplate from "../templates/marketing-page-template";
import withRealTimeUpdates from "@utils/real_time_updates/withRealTimeUpdates";
import withFeedsWorker from "@utils/withFeedsWorker";

export const marketingPageQuery = graphql`
  query {
    marketingPageJson {
      hero {
        title
        subTitle
        date
        time
        background {
          src {
            childImageSharp {
              gatsbyImageData (
                quality: 100
                placeholder: BLURRED
                layout: FULL_WIDTH
              )
            }
          }
          alt
        }
        images {
          src {
            childImageSharp {
              gatsbyImageData (
                quality: 100
                placeholder: BLURRED
                layout: FULL_WIDTH
              )
            }
          }
          alt
        }
        buttons {
          registerButton {
            text
            display
          }
          loginButton {
            text
            display
          }
        }
      }
      countdown {
        display
        text
      }
      widgets {
        content {
          display
          body
        }
        schedule {
          title
          display
        }
        disqus {
          title
          display
        }
        image {
          title
          display
          image {
            src {
              childImageSharp {
                gatsbyImageData (
                  quality: 100
                  placeholder: BLURRED
                  layout: FULL_WIDTH
                )
              }
            }
            alt
          }
        }
      }
      masonry {
        display
        items {
          placement
          size
          images {
            src {
              childImageSharp {
                gatsbyImageData (
                  quality: 100
                  placeholder: BLURRED
                  layout: FULL_WIDTH
                )
              }
            }
            alt
            link
          }
        }
      }
      eventRedirect
    }
  }
`;

const MarketingPage = ({
  location,
  data,
  lastDataSync,
  summit,
  summitPhase,
  isLoggedUser,
}) => (
  <MarketingPageTemplate
    location={location}
    data={data}
    lastDataSync={lastDataSync}
    summit={summit}
    summitPhase={summitPhase}
    isLoggedUser={isLoggedUser}
  />
);

const mapStateToProps = ({
  settingState,
  summitState,
  clockState,
  loggedUserState
}) => ({
  lastDataSync: settingState.lastDataSync,
  summit: summitState.summit,
  summitPhase: clockState.summit_phase,
  isLoggedUser: loggedUserState.isLoggedUser,
});

export default connect(mapStateToProps, {
})(withFeedsWorker(withRealTimeUpdates(MarketingPage)));

export const Head = ({
  location
}) => <Seo location={location} />;

