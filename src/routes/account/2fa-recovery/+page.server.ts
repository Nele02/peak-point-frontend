import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ cookies }) => {
  const raw = cookies.get("pp-2fa-recovery");
  if (!raw) throw redirect(303, "/account");

  const data = JSON.parse(raw) as { recoveryCodes: string[] };
  return { recoveryCodes: data.recoveryCodes };
};

export const actions: Actions = {
  done: async ({ cookies }) => {
    cookies.delete("pp-2fa-recovery", { path: "/" });
    throw redirect(303, "/account");
  }
};
