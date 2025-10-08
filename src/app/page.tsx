import LandingPage from "./landing-page";
import { auth } from "@/lib/auth";
import { headers } from 'next/headers'
import { isGoogleUser } from '@/lib/auth-utils'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let isGoogle = false;
  let canChangePassword = true;

  if (session?.user?.id) {
    isGoogle = await isGoogleUser(session.user.id);
    canChangePassword = !isGoogle;
  }

  return <LandingPage canChangePassword={canChangePassword} isGoogleUser={isGoogle} />;
}