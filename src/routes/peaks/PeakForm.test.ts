import { render, screen, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import PeakForm from "./PeakForm.svelte";

describe("PeakForm", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("submits with edited values", async () => {
    const onSubmit = vi.fn();

    render(PeakForm, {
      title: "New Peak",
      peak: { name: "", elevation: 0, lat: 0, lng: 0, images: [], categories: [] },
      categories: [{ _id: "c1", name: "Harz" }],
      onSubmit
    });

    await fireEvent.input(screen.getByLabelText(/name/i), { target: { value: "Brocken" } });
    await fireEvent.input(screen.getByLabelText(/elevation/i), { target: { value: "1141" } });
    await fireEvent.input(screen.getByLabelText(/lat/i), { target: { value: "51.808" } });
    await fireEvent.input(screen.getByLabelText(/lng/i), { target: { value: "10.618" } });

    await fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    const [peakArg, filesArg] = onSubmit.mock.calls[0];
    expect(peakArg.name).toBe("Brocken");
    expect(Number(peakArg.elevation)).toBe(1141);
    expect(Array.isArray(filesArg)).toBe(true);
  });

  it("shows checked categories when peak has category objects", () => {
    render(PeakForm, {
      title: "Edit Peak",
      peak: {
        name: "Test",
        elevation: 1,
        lat: 0,
        lng: 0,
        images: [],
        categories: [{ _id: "c1", name: "Harz" }]
      },
      categories: [
        { _id: "c1", name: "Harz" },
        { _id: "c2", name: "Alps" }
      ],
      onSubmit: vi.fn()
    });

    const boxes = screen.getAllByRole("checkbox") as HTMLInputElement[];
    expect(boxes[0].checked).toBe(true);
    expect(boxes[1].checked).toBe(false);
  });

  it("adds new files and can remove them", async () => {
    const onSubmit = vi.fn();

    render(PeakForm, {
      title: "New Peak",
      peak: { name: "", elevation: 0, lat: 0, lng: 0, images: [], categories: [] },
      categories: [],
      onSubmit
    });

    const input = screen.getByLabelText("Images (max 10)") as HTMLInputElement;
    const f1 = new File(["x"], "a.png", { type: "image/png" });
    const f2 = new File(["y"], "b.png", { type: "image/png" });

    await fireEvent.change(input, { target: { files: [f1, f2] } });
    expect(screen.getByText(/Selected: 2 \/ 10/i)).toBeInTheDocument();

    const removeButtons = screen.getAllByRole("button", { name: "Remove" });
    await fireEvent.click(removeButtons[0]);

    expect(screen.getByText(/Selected: 1 \/ 10/i)).toBeInTheDocument();
  });
});
