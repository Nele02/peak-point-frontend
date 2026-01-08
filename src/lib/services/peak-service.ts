import axios from "axios";
import qs from "qs";
import type { Category, Peak, Session, StoredImage, User } from "$lib/types/peak-types";

function setAuth(token: string) {
	axios.defaults.headers.common["Authorization"] = "Bearer " + token;
}

export const peakService = {
	baseUrl: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000",

	cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "",
	cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? "",

	// Auth

	async signup(user: User): Promise<boolean> {
		try {
			const response = await axios.post(`${this.baseUrl}/api/users`, user);
			return response.status === 201;
		} catch (error) {
			console.log(error);
			return false;
		}
	},

	async login(email: string, password: string): Promise<Session | null> {
		try {
			const response = await axios.post(`${this.baseUrl}/api/users/authenticate`, { email, password });

			if (response.data.success) {
				setAuth(response.data.token);

				const session: Session = {
					name: response.data.name,
					email: response.data.email,
					token: response.data.token,
					_id: response.data._id
				};

				return session;
			}
			return null;
		} catch (error) {
			console.log(error);
			return null;
		}
	},

	// Peaks

	async getUserPeaks(
		userId: string,
		token: string,
		params: { categoryIds?: string | string[] } = {}
	): Promise<Peak[]> {
		setAuth(token);
		const res = await axios.get(`${this.baseUrl}/api/users/${userId}/peaks`, {
			params,
			paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" })
		});
		return res.data;
	},

	async getPeakById(id: string, token: string): Promise<Peak> {
		setAuth(token);
		const res = await axios.get(`${this.baseUrl}/api/peaks/${id}`);
		return res.data;
	},

	async createPeak(payload: Partial<Peak>, token: string): Promise<Peak> {
		setAuth(token);
		const res = await axios.post(`${this.baseUrl}/api/peaks`, payload);
		return res.data;
	},

	async updatePeak(id: string, payload: Partial<Peak>, token: string): Promise<Peak> {
		setAuth(token);
		const res = await axios.put(`${this.baseUrl}/api/peaks/${id}`, payload);
		return res.data;
	},

	async deletePeak(id: string, token: string): Promise<void> {
		setAuth(token);
		await axios.delete(`${this.baseUrl}/api/peaks/${id}`);
	},

	// Categories

	async getAllCategories(token: string): Promise<Category[]> {
		setAuth(token);
		const res = await axios.get(`${this.baseUrl}/api/categories`);
		return res.data;
	},

	// Cloudinary Upload

	async uploadImages(files: FileList | File[]): Promise<StoredImage[]> {
		const list = Array.from(files);
		if (list.length === 0) return [];

		if (!this.cloudinaryCloudName || !this.cloudinaryUploadPreset) {
			throw new Error("Missing Cloudinary config (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET)");
		}

		const results: StoredImage[] = [];
		for (const file of list) {
			const img = await this.uploadSingleImage(file);
			results.push(img);
		}
		return results;
	},

	async uploadSingleImage(file: File): Promise<StoredImage> {
		const url = `https://api.cloudinary.com/v1_1/${this.cloudinaryCloudName}/upload`;

		const formData = new FormData();
		formData.append("file", file);
		formData.append("upload_preset", this.cloudinaryUploadPreset);

		const res = await fetch(url, { method: "POST", body: formData });
		if (!res.ok) throw new Error("Cloudinary upload failed");

		const data = await res.json();
		return { url: data.secure_url, publicId: data.public_id };
	}
};
