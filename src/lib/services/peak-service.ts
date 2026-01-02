import axios from "axios";
import type { Session, User } from "$lib/types/peak-types";

export const peakService = {
	baseUrl: "http://localhost:3000",

	async signup(user: User): Promise<boolean> {
		try {
			const response = await axios.post(`${this.baseUrl}/api/users`, user);
			return response.data.success === true;
		} catch (error) {
			console.log(error);
			return false;
		}
	},

	async login(email: string, password: string): Promise<Session | null> {
		try {
			const response = await axios.post(`${this.baseUrl}/api/users/authenticate`, { email, password });
			if (response.data.success) {
				axios.defaults.headers.common["Authorization"] = "Bearer " + response.data.token;
				const session: Session = {
					name: response.data.name,
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
	}
}