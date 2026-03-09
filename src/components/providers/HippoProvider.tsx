"use client";

import Script from "next/script";
import { useEffect } from "react";
import { initHippo, identifyHippoUser, closeHippoChat, isHippoChatOpen } from "@/lib/hippo/hippo.service";
import { useAuthStore } from "@/stores/auth.store";

export default function HippoProvider() {
  const { isAuthenticated, user } = useAuthStore();

  // Initialize Hippo on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.initHippo) {
      initHippo();
    }
  }, []);

  // Intercept the mobile back button while the Hippo chat is open.
  // We register in the capture phase so our handler fires before:
  //   1. The Hippo widget's own (broken) popstate handler
  //   2. Next.js's router popstate handler
  // stopImmediatePropagation() prevents both from running, then we
  // close the widget via the official API which does proper cleanup.
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (!isHippoChatOpen()) return;
      e.stopImmediatePropagation();
      closeHippoChat();
    };
    window.addEventListener("popstate", handlePopState, true /* capture */);
    return () => window.removeEventListener("popstate", handlePopState, true);
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
