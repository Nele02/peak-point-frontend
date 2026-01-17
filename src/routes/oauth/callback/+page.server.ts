import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";

export const load = async ({ url, cookies }) => {
  // check if 2fa is required
  const twoFactorRequired = url.searchParams.get("twoFactorRequired");
  const tempToken = url.searchParams.get("tempToken");

  const email = url.searchParams.get("email");
  const name = url.searchParams.get("name");
  const _id = url.searchParams.get("_id");

  if (twoFactorRequired && tempToken && email && name && _id) {
    const challenge = {
      twoFactorRequired: true,
      tempToken,
      email,
      name,
      _id
    };

    cookies.set("pp-2fa", JSON.stringify(challenge), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: !dev,
      maxAge: 60 * 10
    });

    throw redirect(303, "/login/2fa");
  }

  // normal login path
  const token = url.searchParams.get("token");
  if (!token || !email || !name || !_id) {
    throw redirect(303, "/login");
  }

  const session = { token, email, name, _id };

  cookies.set("peak-user", JSON.stringify(session), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: !dev,
    maxAge: 60 * 60 * 24 * 7
  });

  throw redirect(303, "/dashboard");
};
