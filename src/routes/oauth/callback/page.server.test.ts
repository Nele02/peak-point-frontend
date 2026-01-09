import { describe, it, expect, vi } from "vitest";
import type { Cookies } from "@sveltejs/kit";

vi.mock("$app/environment", () => ({
	dev: true
}));

import { load } from "./+page.server";


function createCookiesMock(): Cookies {
	return {
		get: vi.fn(),
		getAll: vi.fn(),
		set: vi.fn(),
		delete: vi.fn(),
		serialize: vi.fn()
	};
}

function makeUrl(query = ""): URL {
	return new URL(`http://localhost:5173/oauth/callback${query}`);
}

describe("OAuth callback page.server", () => {
	it("redirects to /login if required params are missing", async () => {
		const cookies = createCookiesMock();

		try {
			await load({ url: makeUrl(), cookies });
			expect.fail("Expected redirect to /login");
		} catch (e) {
			const redirect = e as { status: number; location: string };
			expect(redirect.status).toBe(303);
			expect(redirect.location).toBe("/login");
		}

		expect(cookies.set).not.toHaveBeenCalled();
	});

	it("sets peak-user cookie and redirects to /dashboard when params exist", async () => {
		const cookies = createCookiesMock();
		const url = makeUrl(
			"?token=abc&email=test%40example.com&name=OAuth%20User&_id=65f0c1"
		);

		try {
			await load({ url, cookies });
			expect.fail("Expected redirect to /dashboard");
		} catch (e) {
			const redirect = e as { status: number; location: string };
			expect(redirect.status).toBe(303);
			expect(redirect.location).toBe("/dashboard");
		}

		expect(cookies.set).toHaveBeenCalledTimes(1);

		const calls = (cookies.set as unknown as { mock: { calls: unknown[][] } }).mock.calls;
		const [cookieName, cookieValue, cookieOptions] = calls[0] as [
			string,
			string,
			{ path: string; httpOnly: boolean; sameSite: string }
		];

		expect(cookieName).toBe("peak-user");
		expect(cookieValue).toContain('"token":"abc"');
		expect(cookieValue).toContain('"email":"test@example.com"');
		expect(cookieValue).toContain('"name":"OAuth User"');
		expect(cookieValue).toContain('"_id":"65f0c1"');

		expect(cookieOptions.path).toBe("/");
		expect(cookieOptions.httpOnly).toBe(true);
		expect(cookieOptions.sameSite).toBe("strict");
	});
});
