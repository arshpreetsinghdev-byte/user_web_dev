"use client";

import Script from "next/script";
import { useEffect } from "react";
import { initHippo, identifyHippoUser } from "@/lib/hippo/hippo.service";
import { useAuthStore } from "@/stores/auth.store";

export default function HippoProvider() {
  const { isAuthenticated, user } = useAuthStore();

  // Initialize Hippo on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.initHippo) {
      initHippo();
    }
  }, []);

  // Sync authenticated user data with Hippo
  useEffect(() => {
    if (isAuthenticated && user && typeof window !== "undefined" && window.updateHippo) {
      identifyHippoUser({
        id: String(user.user_id) || "",
        name: user.name || "",
        email: user.email || "",
        phone: user.phone_no || "",
      });
    }
  }, [isAuthenticated, user]);

  return (
    <Script
      src="https://chat.hippochat.io/js/widget.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== "undefined" && window.initHippo) {
          initHippo();
        }
      }}
    />
  );
}
