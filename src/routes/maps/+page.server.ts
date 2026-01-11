import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import { peakService } from "$lib/services/peak-service";

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent();
	if (!session) throw redirect(303, "/login");

	const [peaks, categories] = await Promise.all([
		peakService.getUserPeaks(session._id, session.token, {}),
		peakService.getAllCategories(session.token)
	]);

	return { peaks, categories };
};
