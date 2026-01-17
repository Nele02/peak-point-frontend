import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { peakService } from "$lib/services/peak-service";

type SessionCookie = { token: string; _id: string; email: string; name: string };

export const load: PageServerLoad = async ({ cookies }) => {
	const raw = cookies.get("pp-2fa-setup");
	if (!raw) throw redirect(303, "/account");

	const setup = JSON.parse(raw) as { otpauthUrl: string };
	return { otpauthUrl: setup.otpauthUrl };
};

export const actions: Actions = {
	verify: async ({ request, cookies }) => {
		const rawSession = cookies.get("peak-user");
		if (!rawSession) throw redirect(303, "/login");
		const session = JSON.parse(rawSession) as SessionCookie;

		const data = await request.formData();
		const code = String(data.get("code") ?? "").trim();

		if (!code) return fail(400, { message: "Please enter the code from your authenticator app" });

		const res = await peakService.verify2faSetup(session.token, code);
		if (!res?.enabled) return fail(401, { message: "Wrong code - try again" });

		// show recovery codes once
		cookies.set("pp-2fa-recovery", JSON.stringify({ recoveryCodes: res.recoveryCodes }), {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: false,
			maxAge: 60 * 5
		});

		// clean setup cookie
		cookies.delete("pp-2fa-setup", { path: "/" });

		throw redirect(303, "/account/2fa-recovery");
	}
};
