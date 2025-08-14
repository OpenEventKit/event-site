// __mocks__/@mdx-js/react.js
const React = require("react");

const Ctx = React.createContext({});

function MDXProvider({ components = {}, children }) {
    return React.createElement(Ctx.Provider, { value: components }, children);
}

function useMDXComponents(local) {
    const ctx = React.useContext(Ctx);
    return local || ctx || {};
}

module.exports = { MDXProvider, useMDXComponents };
