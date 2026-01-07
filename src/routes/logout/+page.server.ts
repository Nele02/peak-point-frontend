export const load = async ({ cookies }) => {
	cookies.delete("peak-user", { path: "/" });
};
