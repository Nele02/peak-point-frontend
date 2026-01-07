import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { peakService } from "$lib/services/peak-service";

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent();
	if (!session) throw redirect(303, "/login");

	const categories = await peakService.getAllCategories(session.token);
	return { categories };
};
