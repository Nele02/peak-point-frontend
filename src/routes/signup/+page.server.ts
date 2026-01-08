import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { peakService } from "$lib/services/peak-service";

export const actions: Actions = {
	signup: async ({ request }) => {
		const form = await request.formData();

		const firstName = (form.get("firstName") as string) ?? "";
		const lastName = (form.get("lastName") as string) ?? "";
		const email = (form.get("email") as string) ?? "";
		const password = (form.get("password") as string) ?? "";

		if (!firstName || !lastName || !email || !password) {
			return fail(400, { message: "Please fill in all fields." });
		}

		const ok = await peakService.signup({ firstName, lastName, email, password });

		if (ok) {
			throw redirect(303, "/login");
		}

		return fail(400, { message: "Signup failed" });
	}
};
