import { useMemo } from "react";
import { evaluateSync } from "@mdx-js/mdx";
import * as jsxRuntime from "react/jsx-runtime";
import remarkGfm from "remark-gfm";
import rehypeExternalLinks from "rehype-external-links";
import { MDXProvider } from "@mdx-js/react";


const Mdx = ({ content, shortcodes }) => {
    const mdxContent = useMemo(() => {
        if ( !content) return null;
        try {
            const { default: Comp } = evaluateSync(content, {
                ...jsxRuntime,
                remarkPlugins: [remarkGfm],
                rehypePlugins: [[rehypeExternalLinks, { target: "_blank", rel: ["nofollow","noopener","noreferrer"] }]],
                useDynamicImport: false, // ensure no async imports in runtime content
            });
            return Comp;
        } catch (err) {
            console.error("MDX evaluate error:", err);
            return null;
        }
    }, [content]);

    return <MDXProvider components={shortcodes}>{mdxContent}</MDXProvider>;
}

export default Mdx;