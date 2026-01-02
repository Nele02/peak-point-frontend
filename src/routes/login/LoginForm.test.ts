import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "$lib/types/peak-types";

vi.mock("$app/navigation", () => ({ goto: vi.fn() }));
vi.mock("$lib/services/peak-service", () => ({ peakService: { login: vi.fn() } }));
vi.mock("$lib/runes.svelte", () => ({
	loggedInUser: { email: "", name: "", token: "", _id: "" }
}));

import { goto } from "$app/navigation";
import { peakService } from "$lib/services/peak-service";
import { loggedInUser } from "$lib/runes.svelte";

import LoginForm from "./LoginForm.svelte";

const gotoMock = vi.mocked(goto);
const loginMock = vi.mocked(peakService.login);

function getInputs(container: HTMLElement): { email: HTMLInputElement; password: HTMLInputElement } {
	const password = container.querySelector('input[type="password"]') as HTMLInputElement | null;
	if (!password) throw new Error("Password input not found (input[type=password]).");

	const emailByType = container.querySelector('input[type="email"]') as HTMLInputElement | null;
	if (emailByType) return { email: emailByType, password };

	const text = container.querySelector('input[type="text"], input:not([type])') as HTMLInputElement | null;
	if (!text) throw new Error("Email input not found (type=email or text).");

	return { email: text, password };
}

describe("LoginForm", () => {
	beforeEach(() => {
		gotoMock.mockReset();
		loginMock.mockReset();
		localStorage.clear();

		loggedInUser.email = "";
		loggedInUser.name = "";
		loggedInUser.token = "";
		loggedInUser._id = "";
	});

	it("login success", async () => {
		const session: Session = { name: "Test User", token: "jwt-token", _id: "user-id" };
		loginMock.mockResolvedValueOnce(session);

		const { container, getByRole } = render(LoginForm);
		const { email, password } = getInputs(container);

		await fireEvent.input(email, { target: { value: "test@example.com" } });
		await fireEvent.input(password, { target: { value: "secret" } });

		await fireEvent.click(getByRole("button", { name: /log in/i }));

		expect(loginMock).toHaveBeenCalledWith("test@example.com", "secret");
		expect(localStorage.peak).toBe(JSON.stringify(loggedInUser));
		expect(gotoMock).toHaveBeenCalledWith("/peaks");
	});

	it("login invalid shows message", async () => {
		loginMock.mockResolvedValueOnce(null);

		const { container, getByRole, findByText } = render(LoginForm);
		const { email, password } = getInputs(container);

		await fireEvent.input(email, { target: { value: "bad@example.com" } });
		await fireEvent.input(password, { target: { value: "wrong" } });

		await fireEvent.click(getByRole("button", { name: /log in/i }));

		expect(await findByText("Invalid Credentials")).toBeInTheDocument();
		expect(email.value).toBe("");
		expect(password.value).toBe("");
	});
});
