import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { peakService } from "./peak-service";
import type { Session, User } from "$lib/types/peak-types";

vi.mock("axios", () => ({
	default: {
		post: vi.fn(),
		get: vi.fn(),
		defaults: {
			headers: {
				common: {} as Record<string, string>
			}
		}
	}
}));

type MockAxios = {
	post: ReturnType<typeof vi.fn>;
	get: ReturnType<typeof vi.fn>;
	defaults: { headers: { common: Record<string, string> } };
};

const mockedAxios = axios as unknown as MockAxios;

describe("peakService", () => {
	beforeEach(() => {
		mockedAxios.post.mockReset();
		mockedAxios.get.mockReset();
		mockedAxios.defaults.headers.common = {};
	});

	// signup

	it("signup returns true when API returns success=true", async () => {
		mockedAxios.post.mockResolvedValueOnce({
			data: { success: true }
		});

		const user: User = {
			firstName: "Test",
			lastName: "User",
			email: "test@example.com",
			password: "secret"
		};

		const result = await peakService.signup(user);

		expect(result).toBe(true);
		expect(mockedAxios.post).toHaveBeenCalledWith(`${peakService.baseUrl}/api/users`, user);
	});

	it("signup returns false when request fails", async () => {
		mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

		const user: User = {
			firstName: "Fail",
			lastName: "Case",
			email: "fail@example.com",
			password: "nope"
		};

		const result = await peakService.signup(user);

		expect(result).toBe(false);
	});

	// login

	it("login returns a session and sets axios Authorization header on success", async () => {
		mockedAxios.post.mockResolvedValueOnce({
			data: {
				success: true,
				name: "Test User",
				token: "jwt-token",
				_id: "user-id"
			}
		});

		const session = await peakService.login("test@example.com", "secret");

		const expected: Session = { name: "Test User", token: "jwt-token", _id: "user-id" };

		expect(session).toEqual(expected);
		expect(mockedAxios.post).toHaveBeenCalledWith(
			`${peakService.baseUrl}/api/users/authenticate`,
			{ email: "test@example.com", password: "secret" }
		);
		expect(mockedAxios.defaults.headers.common.Authorization).toBe("Bearer jwt-token");
	});

	it("login returns null when API call throws (e.g. 401)", async () => {
		mockedAxios.post.mockRejectedValueOnce(new Error("Unauthorized"));

		const session = await peakService.login("bad@example.com", "wrong");

		expect(session).toBeNull();
	});

	it("login returns null when success=false", async () => {
		mockedAxios.post.mockResolvedValueOnce({
			data: { success: false }
		});

		const session = await peakService.login("test@example.com", "secret");

		expect(session).toBeNull();
	});
});
