import React, { useEffect } from 'react';
import { navigate } from 'gatsby';
import styles from '../styles/hero.scss'

const HeroComponent = ({ title, subtitle, event, redirectTo, options = {} }) => {

  useEffect(() => {
    //if (redirectTo) setTimeout(() => navigate(redirectTo, options), 3000);
  }, [redirectTo]);

  return (
    <section className={`hero is-fullheight ${event ? 'talk__break' : ''}`}>
      <div className="hero-body hero-component">
        <div className={`${event ? '' : 'container has-text-centered'}`}>
          <h1 className="title">{title}</h1>
          <h2 className="subtitle">{subtitle}</h2>
        </div>
      </div>
    </section>
  )
};

export default HeroComponent;