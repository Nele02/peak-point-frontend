import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import { peakService } from "./peak-service";
import type { Session, User } from "$lib/types/peak-types";

vi.mock("axios", () => ({
	default: {
		post: vi.fn(),
		get: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
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
	put: ReturnType<typeof vi.fn>;
	delete: ReturnType<typeof vi.fn>;
	defaults: { headers: { common: Record<string, string> } };
};

const mockedAxios = axios as unknown as MockAxios;

function mockLocalStorage() {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] ?? null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
}

describe("peakService", () => {
	beforeEach(() => {
		mockedAxios.post.mockReset();
		mockedAxios.get.mockReset();
		mockedAxios.put.mockReset();
		mockedAxios.delete.mockReset();
		mockedAxios.defaults.headers.common = {};

		const ls = mockLocalStorage();
		vi.stubGlobal("localStorage", {
			getItem: ls.getItem,
			setItem: ls.setItem,
			removeItem: ls.removeItem,
			clear: ls.clear
		});
	});

	// signup

	it("signup returns true when API returns 201", async () => {
		mockedAxios.post.mockResolvedValueOnce({
			status: 201,
			data: {}
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

		const refreshSpy = vi.spyOn(peakService, "refreshPeakInfo").mockResolvedValueOnce();

		const session = await peakService.login("test@example.com", "secret");

		const expected: Session = { name: "Test User", token: "jwt-token", _id: "user-id" };

		expect(session).toEqual(expected);
		expect(mockedAxios.post).toHaveBeenCalledWith(`${peakService.baseUrl}/api/users/authenticate`, {
			email: "test@example.com",
			password: "secret"
		});
		expect(mockedAxios.defaults.headers.common.Authorization).toBe("Bearer jwt-token");
		expect(refreshSpy).toHaveBeenCalledOnce();
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

	// peaks

	it("getUserPeaks calls user peaks api with query params", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: [{ name: "P1" }]
		});

		const result = await peakService.getUserPeaks("user-1", { categoryIds: ["c1", "c2"] });

		expect(Array.isArray(result)).toBe(true);
		expect(mockedAxios.get).toHaveBeenCalled();

		const [url, config] = mockedAxios.get.mock.calls[0];
		expect(url).toBe(`${peakService.baseUrl}/api/users/user-1/peaks`);
		expect(config.params.categoryIds).toEqual(["c1", "c2"]);
	});

	it("getPeakById success", async () => {
		mockedAxios.get.mockResolvedValueOnce({
			data: { _id: "p1", name: "Brocken" }
		});

		const result = await peakService.getPeakById("p1");

		expect(mockedAxios.get).toHaveBeenCalledWith(`${peakService.baseUrl}/api/peaks/p1`);
		expect(result._id).toBe("p1");
		expect(result.name).toBe("Brocken");
	});

	it("getPeakById throws when request fails", async () => {
		mockedAxios.get.mockRejectedValueOnce(new Error("Not found"));

		await expect(peakService.getPeakById("missing")).rejects.toThrow();
	});

	it("createPeak success", async () => {
		mockedAxios.post.mockResolvedValueOnce({
			data: { _id: "p1", name: "New Peak" }
		});

		const payload = { name: "New Peak", elevation: 10, lat: 1, lng: 2 };

		const created = await peakService.createPeak(payload);

		expect(mockedAxios.post).toHaveBeenCalledWith(`${peakService.baseUrl}/api/peaks`, payload);
		expect(created._id).toBe("p1");
		expect(created.name).toBe("New Peak");
	});

	it("createPeak throws when API call fails", async () => {
		mockedAxios.post.mockRejectedValueOnce(new Error("Bad request"));

		await expect(
			peakService.createPeak({ name: "", elevation: 0, lat: 0, lng: 0 })
		).rejects.toThrow();
	});

	it("deletePeak success", async () => {
		mockedAxios.delete.mockResolvedValueOnce({ status: 204 });

		await peakService.deletePeak("p1");

		expect(mockedAxios.delete).toHaveBeenCalledWith(`${peakService.baseUrl}/api/peaks/p1`);
	});

	it("deletePeak throws when API call fails", async () => {
		mockedAxios.delete.mockRejectedValueOnce(new Error("Forbidden"));

		await expect(peakService.deletePeak("p1")).rejects.toThrow();
	});





	// categories

	it("getAllCategories calls categories api", async () => {
		mockedAxios.get.mockResolvedValueOnce({ data: [{ _id: "c1", name: "Mountains" }] });

		const result = await peakService.getAllCategories();

		expect(result.length).toBe(1);
		expect(mockedAxios.get).toHaveBeenCalledWith(`${peakService.baseUrl}/api/categories`);
	});

	// cloudinary upload

	it("uploadSingleImage returns url + publicId from cloudinary response", async () => {
		peakService.cloudinaryCloudName = "demo";
		peakService.cloudinaryUploadPreset = "unsigned";

		const fetchMock = vi.fn().mockResolvedValueOnce({
			ok: true,
			json: async () => ({ secure_url: "https://img", public_id: "pid-1" })
		});

		global.fetch = fetchMock;

		const file = new File(["x"], "test.png", { type: "image/png" });
		const img = await peakService.uploadSingleImage(file);

		expect(img.url).toBe("https://img");
		expect(img.publicId).toBe("pid-1");
		expect(fetchMock).toHaveBeenCalled();
	});

	it("uploadImages throws when cloudinary config missing", async () => {
		peakService.cloudinaryCloudName = "";
		peakService.cloudinaryUploadPreset = "";

		const file = new File(["x"], "test.png", { type: "image/png" });

		await expect(peakService.uploadImages([file])).rejects.toThrow("Missing Cloudinary config");
	});
});
