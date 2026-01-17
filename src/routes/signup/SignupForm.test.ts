import { render } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";

vi.mock("$app/forms", () => ({
  enhance: () => ({ destroy() {} })
}));

import SignupForm from "./SignupForm.svelte";

describe("SignupForm", () => {
  it("renders a normal post form", () => {
    const { container, getByRole } = render(SignupForm, { props: { form: undefined } });

    const form = container.querySelector("form") as HTMLFormElement;
    expect(form).toBeTruthy();
    expect(form.method.toLowerCase()).toBe("post");
    expect(form.getAttribute("action")).toBe("?/signup");

    expect(getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("shows message if form has one", () => {
    const { getByText } = render(SignupForm, { props: { form: { message: "Signup failed" } } });

    expect(getByText("Signup failed")).toBeInTheDocument();
  });

  it("has login redirect link", () => {
    const { container } = render(SignupForm, { props: {} });

    const link = container.querySelector('a[href="/login"]');
    expect(link).toBeTruthy();
  });

});
