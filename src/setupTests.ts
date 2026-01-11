import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

vi.spyOn(console, "log").mockImplementation(() => {});

if (!HTMLFormElement.prototype.requestSubmit) {
  HTMLFormElement.prototype.requestSubmit = function () {
    this.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
  };
}
