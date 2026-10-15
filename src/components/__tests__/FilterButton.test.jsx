/**
 * @jest-environment jsdom
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import FilterButton from "../FilterButton";

// Mimics Chrome / Edge "Translate this page": every text node is replaced by font > font.
const translatePage = (root) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  while (walker.nextNode()) {
    if (walker.currentNode.nodeValue.trim()) textNodes.push(walker.currentNode);
  }
  textNodes.forEach((node) => {
    const outer = document.createElement("font");
    const inner = document.createElement("font");
    inner.textContent = node.nodeValue;
    outer.appendChild(inner);
    node.replaceWith(outer);
  });
};

describe("FilterButton", () => {
  it("keeps toggling when the page is translated", () => {
    const { container, rerender } = render(<FilterButton open={false} onClick={jest.fn()} />);

    translatePage(container);
    expect(() => rerender(<FilterButton open onClick={jest.fn()} />)).not.toThrow();
    expect(screen.queryByText("Filters")).not.toBeInTheDocument();
    expect(container.querySelector(".fa-arrow-left")).toBeInTheDocument();

    translatePage(container);
    expect(() => rerender(<FilterButton open={false} onClick={jest.fn()} />)).not.toThrow();
    expect(screen.getByText("Filters")).toBeInTheDocument();
    expect(container.querySelector(".fa-arrow-left")).not.toBeInTheDocument();
  });
});
