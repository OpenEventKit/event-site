import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const TemplateWrapper = ({
  children,
  location,
  marketing
}) => {
  return (
    <div id="container">
      <a className="sr-only skip-to-content" href="#content-wrapper">Skip to content</a>
      <Navbar location={location} />
      <main id="content-wrapper">{children}</main>
      <Footer marketing={marketing} />
    </div>
  )
};

export default TemplateWrapper;
