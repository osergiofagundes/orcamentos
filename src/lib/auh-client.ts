import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Client-side: use current origin
    return window.location.origin
  }
  // Server-side: use environment variable or default
  return process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
}

export const authClient = createAuthClient({
    baseURL: getBaseURL(),
})