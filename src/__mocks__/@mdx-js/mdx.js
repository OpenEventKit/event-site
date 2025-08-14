// __mocks__/@mdx-js/mdx.js
const React = require("react");
const { useMDXComponents } = require("@mdx-js/react");

// Minimal contract: evaluateSync returns a React component.
// We also support an error path when the source contains "BAD_MDX".
function evaluateSync(src /*, opts */) {
    if (src && src.includes("BAD_MDX")) {
        // Simulate a compile-time error so your try/catch logs + renders null
        throw new Error("Mock MDX compile error");
    }

    function Comp() {
        // Read provider-injected shortcodes/components (no need to render them)
        const components = useMDXComponents();
        const keys = components ? Object.keys(components) : [];

        return React.createElement(
            React.Fragment,
            null,
            React.createElement("div", { "data-testid": "mdx-source" }, src || ""),
            React.createElement("div", {
                "data-testid": "mdx-components",
                "data-components": keys.join(","),
            })
        );
    }

    return { default: Comp };
}

module.exports = { evaluateSync };
