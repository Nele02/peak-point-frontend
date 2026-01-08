import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { peakService } from "$lib/services/peak-service";

export const load: PageServerLoad = async ({ parent, params }) => {
	const { session } = await parent();
	if (!session) throw redirect(303, "/login");

	const [categories, peak] = await Promise.all([
		peakService.getAllCategories(session.token),
		peakService.getPeakById(params.id, session.token)
	]);

	return { categories, peak };
};
