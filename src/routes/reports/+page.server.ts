import { peakService } from "$lib/services/peak-service";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent();

	if (session) {
		return {
			peaks: await peakService.getUserPeaks(session._id, session.token),
			categories: await peakService.getAllCategories(session.token)
		};
	}

	return { peaks: [], categories: [] };
};
