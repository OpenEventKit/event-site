import React, { useState } from "react";
import Link from "../Link";
import LogoutButton from "../LogoutButton";

import styles from "../../styles/navbar.module.scss";

const NavbarTemplate = ({
  items,
  logo,
  summit,
  isLoggedUser,
  idpProfile,
  onLogoClick,
  onProfileIconClick
}) => {
  const [active, setActive] = useState(false);

  const toggleHamburger = () => setActive(!active);

  const navBarActiveClass = active ? styles.isActive : "";

  const renderLogo = () => {
    if (!logo && !summit?.name) return null;

    const logoContent = logo ? <img src={logo} alt={summit?.name || "Logo"} /> : <h4>{summit.name}</h4>;

    return onLogoClick ? (
      <button className={`link ${styles.navbarItem}`} onClick={onLogoClick}>
        {logoContent}
      </button>
    ) : (
      <div className={styles.navbarItem}>{logoContent}</div>
    );
  };

  const renderProfileIcon = () => {
    if (!isLoggedUser || !idpProfile?.picture) return null;

    const profilePic = (
      <img alt={idpProfile?.name} className={styles.profilePic} src={idpProfile.picture} />
    );

    return onProfileIconClick ? (
      <div className={styles.navbarItem}>
        <button className="link" onClick={onProfileIconClick}>
          {profilePic}
        </button>
      </div>
    ) : (
      <div className={styles.navbarItem}>{profilePic}</div>
    );
  };

  return (
    <nav className={styles.navbar} role="navigation" aria-label="main navigation">
      <div className={styles.navbarBrand}>
        {renderLogo()}
        <button
          className={`link ${styles.navbarBurger} ${styles.burger} ${navBarActiveClass}`}
          aria-label="menu"
          aria-expanded="false"
          data-target="navbar"
          onClick={toggleHamburger}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      <div id="navbar" className={`${styles.navbarMenu} ${navBarActiveClass}`}>
        <div className={styles.navbarStart} />
        <div className={styles.navbarEnd}>
          {items?.map((item, index) => (
            <div className={styles.navbarItem} key={index}>
              <Link to={item.link} className={styles.link}>
                <span>{item.title}</span>
              </Link>
            </div>
          ))}
          {renderProfileIcon()}
          <LogoutButton styles={styles} isLoggedUser={isLoggedUser} />
        </div>
      </div>
    </nav>
  );
};

export default NavbarTemplate;
