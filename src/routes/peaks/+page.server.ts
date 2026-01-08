import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { peakService } from "$lib/services/peak-service";

export const load: PageServerLoad = async ({ parent, url }) => {
	const { session } = await parent();
	if (!session) throw redirect(303, "/login");

	const categoryIds = url.searchParams.getAll("categoryIds");

	const params =
		categoryIds.length > 0 ? { categoryIds } : {};

	const [categories, peaks] = await Promise.all([
		peakService.getAllCategories(session.token),
		peakService.getUserPeaks(session._id, session.token, params)
	]);

	return {
		categories,
		peaks,
		selectedCategoryIds: categoryIds
	};
};
