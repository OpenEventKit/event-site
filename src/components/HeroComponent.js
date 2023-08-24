import React, { useEffect } from 'react';
import { navigate } from 'gatsby';

const HeroComponent = ({ title, subtitle, event, redirectTo, options = {} }) => {

  useEffect(() => {
    if (redirectTo) setTimeout(() => navigate(redirectTo, options), 3000);
  }, [redirectTo]);

  return (
    <section className={`hero ${event ? 'talk__break' : 'is-fullheight'}`}>
      <div className="hero-body">
        <div className={`${event ? '' : 'container has-text-centered'}`}>
          <h1 className="title">{title}</h1>
          <h2 className="subtitle">{subtitle}</h2>
        </div>
      </div>
    </section>
  )
};

export default HeroComponent;