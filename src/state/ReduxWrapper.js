import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store";
import { RESET_STATE } from "../actions/base-actions-definitions";

const onBeforeLift = () => {
  const params = new URLSearchParams(window.location.search);
  const flush = params.has("flushState");

  if (flush) {
    store.dispatch({ type: RESET_STATE, payload: null });
  }
};

const ReduxWrapper = ({ children }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <Provider store={store}>
      {isClient ? (
        <PersistGate onBeforeLift={onBeforeLift} persistor={persistor}>
          {children}
        </PersistGate>
      ) : (
        children
      )}
    </Provider>
  );
};

export default ({ element }) => <ReduxWrapper>{element}</ReduxWrapper>;
