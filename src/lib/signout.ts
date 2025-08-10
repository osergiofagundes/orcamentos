import { authClient } from "@/lib/auh-client";

export async function signOut() {
  await authClient.signOut();
  window.location.href = "/signin";
}
