import React from "react";
import styles from "./index.module.scss";

const FilterButton = ({ open, onClick }) => {
  const getLabel = () => {
    if (!open) {
      return (
        <>
          <i className="fa fa-filter" />
          {/* own element so page translators wrapping the text don't break the toggle */}
          <span>Filters</span>
        </>
      );
    } else {
      return <i className="fa fa-arrow-left" />;
    }
  };
  return (
    <button
      className={`${styles.filterButton} ${open ? styles.open : ""}`}
      onClick={onClick}
    >
      {getLabel()}
    </button>
  );
};

export default FilterButton;
