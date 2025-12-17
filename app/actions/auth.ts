"use server";

import { signIn } from "@/lib/auth";

export async function loginAction(email: string, password: string) {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    return { success: !result?.error, error: result?.error || null };
  } catch (error) {
    console.error("Login action error:", error);
    return { success: false, error: "An error occurred" };
  }
}

