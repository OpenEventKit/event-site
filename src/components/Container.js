import * as React from "react";

const Container = ({ className, children }) => (
  <div className={`${className ?? ""}`}>
    {children}
  </div>
);

export default Container;