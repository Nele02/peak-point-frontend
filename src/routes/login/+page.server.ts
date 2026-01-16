import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { peakService } from "$lib/services/peak-service";

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "").trim();

    if (!email) return fail(400, { message: "Email is required", values: { email } });
    if (!password) return fail(400, { message: "Password is required", values: { email } });

    const session = await peakService.login(email, password);

    if (!session) {
      return fail(401, { message: "Invalid credentials", values: { email } });
    }

    cookies.set("peak-user", JSON.stringify(session), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false
    });

    throw redirect(303, "/peaks");
  }
};
