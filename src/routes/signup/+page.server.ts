import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { peakService } from "$lib/services/peak-service";

export const actions: Actions = {
  signup: async ({ request }) => {
    const data = await request.formData();

    const firstName = String(data.get("firstName") ?? "").trim();
    const lastName = String(data.get("lastName") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "").trim();

    if (!firstName)
      return fail(400, {
        message: "First name is required",
        values: { firstName, lastName, email }
      });
    if (!lastName)
      return fail(400, {
        message: "Last name is required",
        values: { firstName, lastName, email }
      });
    if (!email)
      return fail(400, { message: "Email is required", values: { firstName, lastName, email } });
    if (!password)
      return fail(400, { message: "Password is required", values: { firstName, lastName, email } });
    if (password.length < 6)
      return fail(400, {
        message: "Password length must be at least 6 characters",
        values: { firstName, lastName, email }
      });

    try {
      await peakService.signup({ firstName, lastName, email, password });
    } catch (e: unknown) {
      let msg = "Signup failed";

      if (typeof e === "object" && e !== null) {
        const obj = e as Record<string, unknown>;
        const response = obj.response as Record<string, unknown> | undefined;
        const respData = response?.data as Record<string, unknown> | undefined;
        const backendMsg = respData?.message;
        if (typeof backendMsg === "string" && backendMsg.trim().length > 0) msg = backendMsg;
      }

      return fail(400, { message: msg, values: { firstName, lastName, email } });
    }
    throw redirect(303, "/login");
  }
};
