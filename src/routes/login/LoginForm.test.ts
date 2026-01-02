import { render, fireEvent } from "@testing-library/svelte";
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Session } from "$lib/types/peak-types";

vi.mock("$app/navigation", () => ({ goto: vi.fn() }));
vi.mock("$lib/services/peak-service", () => ({ peakService: { login: vi.fn() } }));

import { goto } from "$app/navigation";
import { peakService } from "$lib/services/peak-service";

import LoginForm from "./LoginForm.svelte";

const gotoMock = vi.mocked(goto);
const loginMock = vi.mocked(peakService.login);

describe("LoginForm", () => {
	beforeEach(() => {
		gotoMock.mockReset();
		loginMock.mockReset();
		localStorage.clear();
	});

	it("login success", async () => {
		const session: Session = { name: "Test User", token: "jwt-token", _id: "user-id" };
		loginMock.mockResolvedValueOnce(session);

		const { container, getByRole } = render(LoginForm);

		const email = container.querySelector("#email") as HTMLInputElement;
		const password = container.querySelector("#password") as HTMLInputElement;

		await fireEvent.input(email, { target: { value: "test@example.com" } });
		await fireEvent.input(password, { target: { value: "secret" } });

		await fireEvent.click(getByRole("button", { name: /log in/i }));

		expect(loginMock).toHaveBeenCalledWith("test@example.com", "secret");
		expect(gotoMock).toHaveBeenCalledWith("/peaks");
	});

	it("login invalid shows message", async () => {
		loginMock.mockResolvedValueOnce(null);

		const { container, getByRole, findByText } = render(LoginForm);

		const email = container.querySelector("#email") as HTMLInputElement;
		const password = container.querySelector("#password") as HTMLInputElement;

		await fireEvent.input(email, { target: { value: "bad@example.com" } });
		await fireEvent.input(password, { target: { value: "wrong" } });

		await fireEvent.click(getByRole("button", { name: /log in/i }));

		expect(await findByText("Invalid Credentials")).toBeInTheDocument();
		expect(email.value).toBe("");
		expect(password.value).toBe("");
	});
});
