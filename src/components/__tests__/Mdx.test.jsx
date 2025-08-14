/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import Mdx from "../Mdx";

// Shortcode components for MDXProvider wiring check
const Button = ({ children }) => <button data-testid="shortcode-btn">{children}</button>;
const Link = ({ href, children }) => <a data-testid="shortcode-link" href={href}>{children}</a>;

const SHORTCODES = { Button, a: Link };

describe("<Mdx /> (minimal MDX mocks)", () => {
    let consoleErrorSpy;

    beforeEach(() => {
        consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
    });

    test("renders nothing when content is empty/null", () => {
        const { container, rerender } = render(<Mdx content={null} shortcodes={SHORTCODES} />);
        expect(container).toBeEmptyDOMElement();

        rerender(<Mdx content={""} shortcodes={SHORTCODES} />);
        expect(container).toBeEmptyDOMElement();
    });

    test("renders compiled component (shows raw content via mock)", () => {
        const mdx = "# Hello\n\nThis is **bold** text.";
        render(<Mdx content={mdx} shortcodes={{}} />);

        // From our mock, the compiled component renders a data-testid with the raw source
        const el = screen.getByTestId("mdx-source");
        expect(el).toHaveTextContent(/# Hello/);
        expect(el).toHaveTextContent(/This is \*\*bold\*\* text\./);
    });

    test("passes shortcodes via MDXProvider (keys visible to compiled component)", () => {
        render(<Mdx content={"anything"} shortcodes={SHORTCODES} />);

        // Our mock compiled component exposes the component keys in data-components
        const marker = screen.getByTestId("mdx-components");
        const keys = (marker.getAttribute("data-components") || "").split(",").filter(Boolean);

        expect(keys).toEqual(expect.arrayContaining(["Button", "a"]));
    });

    test("updates when content changes", () => {
        const first = "First content";
        const second = "Second content";
        const { rerender } = render(<Mdx content={first} shortcodes={{}} />);

        expect(screen.getByTestId("mdx-source")).toHaveTextContent(first);

        rerender(<Mdx content={second} shortcodes={{}} />);
        expect(screen.getByTestId("mdx-source")).toHaveTextContent(second);
    });

    test("invalid MDX triggers evaluateSync error and renders nothing", () => {
        const { container } = render(<Mdx content={"BAD_MDX"} shortcodes={{}} />);
        // Our component catches evaluateSync error; ensure it logged at least once
        expect(consoleErrorSpy).toHaveBeenCalled();
        expect(container).toBeEmptyDOMElement();
    });
});
