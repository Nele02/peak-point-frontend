import { dev } from "$app/environment";
import { peakService } from "$lib/services/peak-service";
import { redirect } from "@sveltejs/kit";

export const actions = {
	login: async ({ request, cookies }) => {
		const form = await request.formData();
		const email = form.get("email") as string;
		const password = form.get("password") as string;

		if (email === "" || password === "") {
			throw redirect(307, "/login");
		}

		const session = await peakService.login(email, password);

		if (session) {
			const userJson = JSON.stringify(session);
			cookies.set("peak-user", userJson, {
				path: "/",
				httpOnly: true,
				sameSite: "strict",
				secure: !dev,
				maxAge: 60 * 60 * 24 * 7
			});
			throw redirect(303, "/dashboard");
		} else {
			throw redirect(307, "/login");
		}
	}
};
