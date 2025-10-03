"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import LoginPage from "@/components/auth/LoginPage";

export default function Home() {
  const router = useRouter();
  const { user, userType } = useAppStore();

  useEffect(() => {
    if (user) {
      if (userType === "admin") {
        router.push("/admin");
      } else if (userType === "client" && user.id) {
        router.push(`/client/${user.id}`);
      }
    }
  }, [user, userType, router]);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <LoginPage />
    </main>
  );
}
