import React, { useState, useEffect } from "react";
import CMS from "netlify-cms-app";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { List } from "immutable";

const StringControl = CMS.getWidget("string").control;
const SelectControl = CMS.getWidget("select").control;

const IdentityProviderParamControl = ({
  onChange,
  value,
  forID,
  classNameWrapper,
  setActiveStyle,
  setInactiveStyle,
  field
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await fetch(field.get("endpoint"));
        const data = await response.json();
        const fetchedOptions = data.third_party_identity_providers || [];
        
        setOptions(fetchedOptions.map(option => ({ label: option, value: option })));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching OpenID configuration:", error);
        setError(error);
        setLoading(false);
      }
    };

    fetchOptions();
  }, [field]);

  if (loading) {
    return <div>Loading options...</div>;
  }

  if (error || !Array.isArray(options) || options.length === 0) {
    return (
      <StringControl
        forID={forID}
        value={value || ""}
        onChange={onChange}
        classNameWrapper={classNameWrapper}
        setActiveStyle={setActiveStyle}
        setInactiveStyle={setInactiveStyle}
        field={field}
      />
    );
  }

  return (
    <SelectControl
      forID={forID}
      value={value || ""}
      onChange={onChange}
      classNameWrapper={classNameWrapper}
      setActiveStyle={setActiveStyle}
      setInactiveStyle={setInactiveStyle}
      field={field.set("options", List(options))}
    />
  );
};

IdentityProviderParamControl.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.node,
  forID: PropTypes.string.isRequired,
  classNameWrapper: PropTypes.string.isRequired,
  setActiveStyle: PropTypes.func.isRequired,
  setInactiveStyle: PropTypes.func.isRequired,
  field: ImmutablePropTypes.contains({
    endpoint: PropTypes.string.isRequired
  }).isRequired
};

export default IdentityProviderParamControl;
