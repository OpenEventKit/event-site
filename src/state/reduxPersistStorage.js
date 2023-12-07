/**
 * Create dummy storage on the server-side and wrapper for localStorage on the client-side.
 * @see https://github.com/rt2zz/redux-persist/issues/1208#issuecomment-658695446
 * @see https://stackoverflow.com/questions/57781527/how-to-solve-console-error-redux-persist-failed-to-create-sync-storage-falli
 * @see https://github.com/vercel/next.js/discussions/15687#discussioncomment-45319
 */

import createWebStorage from 'redux-persist/lib/storage/createWebStorage';

const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};

const storage = typeof window !== 'undefined' ? createWebStorage('local') : createNoopStorage();

export default storage;
