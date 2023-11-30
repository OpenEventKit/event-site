import * as React from "react";
import { Provider } from "react-redux";
import { storeWithoutPersistor } from "./store";

export default ({ element }) => (
  <Provider store={storeWithoutPersistor}>
    {element}
  </Provider>
);
