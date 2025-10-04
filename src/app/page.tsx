"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import LoginPage from "@/components/auth/LoginPage";

export default function Home() {
  const router = useRouter();
  const { user, userType } = useAppStore();

  return (
    <main className="container mx-auto p-4 md:p-8">
      <LoginPage />
    </main>
  );
}
