import type { LayoutServerLoad } from "./$types";
import type { Session } from "$lib/types/peak-types";

export const load: LayoutServerLoad = ({ cookies, depends }) => {
	// Damit invalidate/Neuladen sauber funktioniert
	depends("app:session");

	const cookieStr = cookies.get("peak-user");

	if (!cookieStr) {
		return { session: null };
	}

	try {
		const session = JSON.parse(cookieStr) as Session;
		return { session };
	} catch {
		// kaputtes Cookie -> wie ausgeloggt behandeln
		return { session: null };
	}
};
