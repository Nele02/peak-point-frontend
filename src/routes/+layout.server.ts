import type { Session } from "$lib/types/peak-types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ cookies }) => {
	const cookieStr = cookies.get("peak-user") as string;
	if (cookieStr) {
		const session = JSON.parse(cookieStr) as Session;
		return { session };
	}
};
