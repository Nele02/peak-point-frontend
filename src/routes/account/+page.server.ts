import { redirect } from "@sveltejs/kit";
import type { PageServerLoad, Actions } from "./$types";
import { peakService } from "$lib/services/peak-service";
import { fail } from "@sveltejs/kit";

type SessionCookie = { token: string; _id: string; email: string; name: string };

export const load: PageServerLoad = async ({ cookies }) => {
  const raw = cookies.get("peak-user");
  if (!raw) throw redirect(303, "/login");

  let session: SessionCookie;
  try {
    session = JSON.parse(raw) as SessionCookie;
  } catch {
    cookies.delete("peak-user", { path: "/" });
    throw redirect(303, "/login");
  }

  const user = await peakService.getUser(session._id, session.token);

  return { user };
};

export const actions: Actions = {
  enable2fa: async ({ cookies }) => {
    const raw = cookies.get("peak-user");
    if (!raw) throw redirect(303, "/login");

    const session = JSON.parse(raw) as SessionCookie;

    const setup = await peakService.setup2fa(session.token);
    if (!setup?.otpauthUrl) return fail(400, { message: "Could not start 2FA setup" });

    // store url in a cookie to show QR
    cookies.set("pp-2fa-setup", JSON.stringify({ otpauthUrl: setup.otpauthUrl }), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 60 * 10
    });

    throw redirect(303, "/account/2fa-setup");
  }
};
