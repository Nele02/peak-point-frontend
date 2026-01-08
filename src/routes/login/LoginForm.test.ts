import { render } from "@testing-library/svelte";
import { describe, it, expect, vi } from "vitest";

vi.mock("$app/forms", () => ({
	enhance: () => ({ destroy() {} })
}));

import LoginForm from "./LoginForm.svelte";

describe("LoginForm", () => {
	it("renders a normal post form", () => {
		const { container, getByRole } = render(LoginForm);

		const form = container.querySelector("form") as HTMLFormElement;
		expect(form).toBeTruthy();
		expect(form.method.toLowerCase()).toBe("post");
		expect(form.getAttribute("action")).toBe("?/login");

		expect(getByRole("button", { name: /log in/i })).toBeInTheDocument();
	});

	it("does not show an error message by default", () => {
		const { queryByText } = render(LoginForm);

		expect(queryByText(/invalid credentials/i)).not.toBeInTheDocument();
	});
});
