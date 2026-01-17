import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import type { TwoFactorChallenge } from "$lib/types/peak-types";
import { peakService } from "$lib/services/peak-service";

export const load: PageServerLoad = async ({ cookies }) => {
	const raw = cookies.get("pp-2fa");
	if (!raw) throw redirect(303, "/login");
	return {};
};

export const actions: Actions = {
	verify: async ({ request, cookies }) => {
		const raw = cookies.get("pp-2fa");
		if (!raw) throw redirect(303, "/login");

		let challenge: TwoFactorChallenge;
		try {
			challenge = JSON.parse(raw) as TwoFactorChallenge;
		} catch {
			throw redirect(303, "/login");
		}

		const data = await request.formData();
		const code = String(data.get("code") ?? "").trim();
		const recoveryCode = String(data.get("recoveryCode") ?? "").trim();

		// validation
		if (!code && !recoveryCode) {
			return fail(400, { message: "Code is required" });
		}

		let session = null;

		if (recoveryCode) {
			session = await peakService.recovery2faLogin(challenge.tempToken, recoveryCode);
		} else {
			session = await peakService.verify2faLogin(challenge.tempToken, code);
		}

		if (!session) {
			return fail(401, { message: "Invalid code, try again" });
		}

		// clear temp cookie
		cookies.delete("pp-2fa", { path: "/" });

		// set normal session
		cookies.set("peak-user", JSON.stringify(session), {
			path: "/",
			httpOnly: true,
			sameSite: "lax",
			secure: false
		});

		throw redirect(303, "/dashboard");
	}
};
