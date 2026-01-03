import axios from "axios";
import qs from "qs";
import type { Category, Peak, Session, StoredImage, User } from "$lib/types/peak-types";
import { currentCategories, currentPeaks, loggedInUser, sessionChecked } from "$lib/runes.svelte";

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
				const session: Session = {
					name: response.data.name,
					token: response.data.token,
					_id: response.data._id
				};

				this.saveSession(session, email);
				await this.refreshPeakInfo();
				return session;
			}
			return null;
		} catch (error) {
			console.log(error);
			return null;
		}
	},

	saveSession(session: Session, email: string) {
		Object.assign(loggedInUser, {
			email,
			name: session.name,
			token: session.token,
			_id: session._id
		});

		axios.defaults.headers.common["Authorization"] = "Bearer " + session.token;
		localStorage.setItem("peak", JSON.stringify(loggedInUser));
	},

	async restoreSession() {
		try {
			const saved = localStorage.getItem("peak");
			if (!saved) return;

			const session = JSON.parse(saved);

			Object.assign(loggedInUser, {
				email: session.email ?? "",
				name: session.name ?? "",
				token: session.token ?? "",
				_id: session._id ?? ""
			});

			if (loggedInUser.token) {
				axios.defaults.headers.common['Authorization'] = 'Bearer ' + loggedInUser.token;
			}
		} catch (e) {
			console.log('restoreSession failed', e);
			this.clearSession();
		} finally {
			sessionChecked.done = true;
		}
	},


	clearSession() {
		currentPeaks.peaks = [];
		currentCategories.categories = [];
		Object.assign(loggedInUser, { email: "", name: "", token: "", _id: "" });
		delete axios.defaults.headers.common["Authorization"];
		localStorage.removeItem("peak");
	},

	// Data refresh

	async refreshPeakInfo() {
		if (!loggedInUser.token || !loggedInUser._id) return;

		try {
			const [categories, peaks] = await Promise.all([
				this.getAllCategories(),
				this.getUserPeaks(loggedInUser._id)
			]);

			currentCategories.categories = categories;
			currentPeaks.peaks = peaks;
		} catch (e) {
			console.log("refreshPeakInfo failed", e);
			// IMPORTANT: propagate so pages can show an error instead of "No peaks"
			throw e;
		}
	},

	// Peaks

	async getUserPeaks(userId: string, params: { categoryIds?: string | string[] } = {}): Promise<Peak[]> {
		const res = await axios.get(`${this.baseUrl}/api/users/${userId}/peaks`, {
			params,
			paramsSerializer: (p) => qs.stringify(p, { arrayFormat: "repeat" })
		});
		return res.data;
	},

	async getPeakById(id: string) {
		const res = await axios.get(`${this.baseUrl}/api/peaks/${id}`);
		return res.data;
	},

	async createPeak(payload: Partial<Peak>): Promise<Peak> {
		const res = await axios.post(`${this.baseUrl}/api/peaks`, payload);
		return res.data;
	},

	async updatePeak(id: string, payload: Partial<Peak>): Promise<Peak> {
		const res = await axios.put(`${this.baseUrl}/api/peaks/${id}`, payload);
		return res.data;
	},

	async deletePeak(id: string): Promise<void> {
		await axios.delete(`${this.baseUrl}/api/peaks/${id}`);
	},

	// Categories

	async getAllCategories(): Promise<Category[]> {
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
			// eslint-disable-next-line no-await-in-loop
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
