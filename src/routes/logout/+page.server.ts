import { redirect } from "@sveltejs/kit";

export const load = async ({ cookies }) => {
	cookies.delete("peak-user", { path: "/" }); // cookie-name ggf. anpassen
	throw redirect(303, "/login");
};
