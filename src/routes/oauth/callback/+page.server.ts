import { dev } from "$app/environment";
import { redirect } from "@sveltejs/kit";

export const load = async ({ url, cookies }) => {
	const token = url.searchParams.get("token");
	const email = url.searchParams.get("email");
	const name = url.searchParams.get("name");
	const _id = url.searchParams.get("_id");

	if (!token || !email || !name || !_id) {
		throw redirect(303, "/login");
	}

	const session = { token, email, name, _id };

	cookies.set("peak-user", JSON.stringify(session), {
		path: "/",
		httpOnly: true,
		sameSite: "strict",
		secure: !dev,
		maxAge: 60 * 60 * 24 * 7
	});

	throw redirect(303, "/dashboard");
};
