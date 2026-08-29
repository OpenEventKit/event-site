// src/components/Mdx.jsx
import React, { useMemo } from "react";
import { evaluateSync } from "@mdx-js/mdx";
import * as jsxRuntime from "react/jsx-runtime";
// remark-gfm v4 is required for evaluateSync (runtime MDX compilation).
// Build-time gatsby-plugin-mdx uses remark-gfm v3 (aliased as "remark-gfm")
// due to mdast-util-to-hast v10 incompatibility with v4's table AST nodes.
// See: https://github.com/gatsbyjs/gatsby/issues/38789
import remarkGfm from "remark-gfm-4";
import rehypeExternalLinks from "rehype-external-links";
import { MDXProvider, useMDXComponents } from "@mdx-js/react";

const Mdx = ({ content, shortcodes }) => {
    const Comp = useMemo(() => {
        if (!content) return null;
        try {
            const mod = evaluateSync(content, {
                // MDX runtime needs the React jsx runtime symbols:
                ...jsxRuntime,
                remarkPlugins: [remarkGfm],
                rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["nofollow","noopener","noreferrer"] }]],
                // Wire MDX context so MDXProvider / components prop actually work:
                useMDXComponents
                // development: process.env.NODE_ENV !== "production",
            });
            return mod.default; // <-- this is the React component
        } catch (err) {
            console.error("MDX evaluate error:", err);
            return null;
        }
    }, [content]);

    if (!Comp) return null;

    return (
        <MDXProvider components={shortcodes}>
            <Comp />
        </MDXProvider>
    );

};

export default Mdx;
