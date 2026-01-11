import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import ImageCarousel from "./ImageCarousel.svelte";

describe("ImageCarousel", () => {
  it("renders single image without navigation buttons", () => {
    render(ImageCarousel, {
      images: [{ url: "https://img/1", publicId: "1" }],
      peakName: "Brocken",
      max: 10
    });

    expect(screen.getByRole("img", { name: "Brocken photo 1" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next image" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Previous image" })).toBeNull();
  });

  it("navigates next/previous for multiple images", async () => {
    render(ImageCarousel, {
      images: [
        { url: "https://img/1", publicId: "1" },
        { url: "https://img/2", publicId: "2" }
      ],
      peakName: "Brocken",
      max: 10
    });

    expect(screen.getByRole("img", { name: "Brocken photo 1" })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: "Next image" }));
    expect(screen.getByRole("img", { name: "Brocken photo 2" })).toBeInTheDocument();

    await fireEvent.click(screen.getByRole("button", { name: "Previous image" }));
    expect(screen.getByRole("img", { name: "Brocken photo 1" })).toBeInTheDocument();
  });

  it("respects max images", () => {
    render(ImageCarousel, {
      images: [
        { url: "https://img/1", publicId: "1" },
        { url: "https://img/2", publicId: "2" },
        { url: "https://img/3", publicId: "3" }
      ],
      peakName: "Peak",
      max: 2
    });

    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });
});
