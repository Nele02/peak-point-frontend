import type { PageServerLoad } from "./$types";
import { redirect } from "@sveltejs/kit";
import axios from "axios";
import { peakService } from "$lib/services/peak-service";

export const load: PageServerLoad = async ({ parent }) => {
	const { session } = await parent();
	if (!session) throw redirect(303, "/login");

	axios.defaults.headers.common["Authorization"] = "Bearer " + session.token;

	const [categories, peaks] = await Promise.all([
		peakService.getAllCategories(),
		peakService.getUserPeaks(session._id, {})
	]);

	return { categories, peaks };
};
