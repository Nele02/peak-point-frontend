import axios from "axios";
import type { Session, User } from "$lib/types/peak-types";
import { loggedInUser } from '$lib/runes.svelte';

export const peakService = {
	baseUrl: "http://localhost:3000",

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
			const response = await axios.post(`${this.baseUrl}/api/users/authenticate`, {
				email,
				password
			});
			if (response.data.success) {
				axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.token;
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

	async refreshPeakInfo() {
		// Implementation for refreshing peak information goes here
		if (loggedInUser.token) {
			console.log("Refreshing peak information for user:", loggedInUser.name);
		}
	},


	saveSession(session: Session, email: string) {
		loggedInUser.email = email;
		loggedInUser.name = session.name;
		loggedInUser.token = session.token;
		loggedInUser._id = session._id;
		localStorage.peak = JSON.stringify(loggedInUser);
	},

	async restoreSession() {
		const savedLoggedInUser = localStorage.peak;
		if (savedLoggedInUser) {
			const session = JSON.parse(savedLoggedInUser);
			loggedInUser.email = session.email;
			loggedInUser.name = session.name;
			loggedInUser.token = session.token;
			loggedInUser._id = session._id;
		}
		await this.refreshPeakInfo();
	},

	clearSession() {
		// currentPeaks.peaks = [];
		loggedInUser.email = "";
		loggedInUser.name = "";
		loggedInUser.token = "";
		loggedInUser._id = "";
		localStorage.removeItem("peak");
	},
}