import { render, screen } from "@testing-library/svelte";
import { describe, it, expect } from "vitest";
import PeakCard from "./PeakCard.svelte";

describe("PeakCard", () => {
  it("renders peak name and elevation", () => {
    render(PeakCard, {
      peak: {
        _id: "p1",
        name: "Brocken",
        elevation: 1141,
        lat: 51.8,
        lng: 10.6,
        images: [],
        categories: [{ _id: "c1", name: "Harz" }]
      }
    });

    expect(screen.getByText("Brocken")).toBeInTheDocument();
    expect(screen.getByText("1141")).toBeInTheDocument();
    expect(screen.getByText("Harz")).toBeInTheDocument();
  });

  it("handles category names when categories are strings", () => {
    render(PeakCard, {
      peak: {
        _id: "p1",
        name: "Peak",
        elevation: 100,
        lat: 1,
        lng: 2,
        images: [],
        categories: ["Alps", "Rocky"]
      }
    });

    expect(screen.getByText("Alps")).toBeInTheDocument();
    expect(screen.getByText("Rocky")).toBeInTheDocument();
  });

  it("shows carousel only when images exist", () => {
    render(PeakCard, {
      peak: {
        _id: "p1",
        name: "Photo Peak",
        elevation: 500,
        lat: 50,
        lng: 8,
        images: [{ url: "https://img/1", publicId: "1" }]
      }
    });

    expect(screen.getByRole("img", { name: "Photo Peak photo 1" })).toBeInTheDocument();
  });

  it("hides edit button when showEdit=false", () => {
    render(PeakCard, {
      peak: { _id: "p1", name: "A", elevation: 1, lat: 0, lng: 0, images: [] },
      showEdit: false
    });

    expect(screen.queryByRole("link", { name: /Edit/i })).toBeNull();
  });
});
