import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";
import PeakToolbar from "./PeakToolbar.svelte";

describe("PeakToolbar", () => {
  it("shows selected count and triggers callbacks", async () => {
    const onToggle = vi.fn();
    const onApply = vi.fn();
    const onClear = vi.fn();

    render(PeakToolbar, {
      categories: [
        { _id: "c1", name: "Harz" },
        { _id: "c2", name: "Taunus" }
      ],
      selected: ["c2"],
      onToggle,
      onApply,
      onClear
    });

    expect(screen.getByText("1")).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: /Categories/i }));

    const checkboxes = screen.getAllByRole("checkbox");
    await fireEvent.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledWith("c1");

    await fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledOnce();

    await fireEvent.click(screen.getByRole("button", { name: /Categories/i }));
    await fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("renders no categories message when empty", async () => {
    render(PeakToolbar, { categories: [], selected: [] });

    await fireEvent.click(screen.getByRole("button", { name: /Categories/i }));
    expect(screen.getByText("No categories.")).toBeInTheDocument();
  });

  it("has a working new peak link", () => {
    render(PeakToolbar, { categories: [], selected: [] });

    const link = screen.getByRole("link", { name: /New Peak/i }) as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/peaks/new");
  });
});
