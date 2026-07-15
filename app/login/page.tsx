import { Suspense } from "react";
import LoginClient from "@/components/login/LoginClient";

export const metadata = { title: "Login — Ophthalmology Suite" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
