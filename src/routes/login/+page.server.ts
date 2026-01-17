import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { peakService } from "$lib/services/peak-service";
import type { TwoFactorChallenge } from "$lib/types/peak-types";

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "").trim();

    if (!email) return fail(400, { message: "Email is required", values: { email } });
    if (!password) return fail(400, { message: "Password is required", values: { email } });

    const result = await peakService.login(email, password);

    if (!result) {
      return fail(401, { message: "Invalid credentials", values: { email } });
    }

    // 2fa path
    if ((result as TwoFactorChallenge).twoFactorRequired) {
      const challenge = result as TwoFactorChallenge;

      cookies.set("pp-2fa", JSON.stringify(challenge), {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: false,
        maxAge: 60 * 10
      });

      throw redirect(303, "/login/2fa");
    }

    // normal login
    cookies.set("peak-user", JSON.stringify(result), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    throw redirect(303, "/dashboard");
  }
};
