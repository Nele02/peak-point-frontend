import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("$app/navigation", () => ({ goto: vi.fn() }));
vi.mock("$lib/services/peak-service", () => ({ peakService: { signup: vi.fn() } }));

import { goto } from "$app/navigation";
import { peakService } from "$lib/services/peak-service";

import SignupForm from "./SignupForm.svelte";

const gotoMock = vi.mocked(goto);
const signupMock = vi.mocked(peakService.signup);

describe("SignupForm", () => {
	beforeEach(() => {
		gotoMock.mockReset();
		signupMock.mockReset();
	});

	it("signup success", async () => {
		signupMock.mockResolvedValueOnce(true);

		const { container, getByRole } = render(SignupForm);

		const firstName = container.querySelector('input[name="firstName"], #firstName') as HTMLInputElement | null;
		const lastName = container.querySelector('input[name="lastName"], #lastName') as HTMLInputElement | null;
		const email = container.querySelector("#email") as HTMLInputElement;
		const password = container.querySelector("#password") as HTMLInputElement;

		if (firstName) await fireEvent.input(firstName, { target: { value: "Nele" } });
		if (lastName) await fireEvent.input(lastName, { target: { value: "Magel" } });
		await fireEvent.input(email, { target: { value: "test@example.com" } });
		await fireEvent.input(password, { target: { value: "secret" } });

		await fireEvent.click(getByRole("button", { name: /sign up/i }));

		expect(signupMock).toHaveBeenCalledTimes(1);
		expect(gotoMock).toHaveBeenCalledWith("/login");
	});

	it("signup error shows message", async () => {
		signupMock.mockResolvedValueOnce(false);

		const { container, getByRole, findByText } = render(SignupForm);

		const email = container.querySelector("#email") as HTMLInputElement;
		const password = container.querySelector("#password") as HTMLInputElement;

		await fireEvent.input(email, { target: { value: "test@example.com" } });
		await fireEvent.input(password, { target: { value: "secret" } });

		await fireEvent.click(getByRole("button", { name: /sign up/i }));

		expect(await findByText("Error trying to sign up")).toBeInTheDocument();
		expect(gotoMock).not.toHaveBeenCalled();
	});
});
