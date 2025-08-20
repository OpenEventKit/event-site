// src/components/Mdx.jsx
import React, { useMemo } from "react";
import { evaluateSync } from "@mdx-js/mdx";
import * as jsxRuntime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
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
