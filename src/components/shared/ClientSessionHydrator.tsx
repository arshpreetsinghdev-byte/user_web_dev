"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/stores/auth.store"

export default function ClientSessionHydrator({ session }: { session: any }) {
  const { setSession, isAuthenticated, fetchProfile, isHydrated } = useAuthStore()
  const currentState = useAuthStore.getState();

  useEffect(() => {
    // Only set global session if it doesn't exist or has changed
  if (session && session.session_id && session.session_identifier) {
    if (!currentState.sessionId || currentState.sessionId !== session.session_id) {
      console.log('🔧 Setting global session');
      setSession(session.session_id, session.session_identifier);
    }
  }
    // Set global session
    // if (session && session.session_id && session.session_identifier) {
    //   setSession(session.session_id, session.session_identifier)
    // }

    // Validate user session ONLY after store has hydrated
    if (isAuthenticated && isHydrated) {
      console.log("🔄 Validating user session on startup...")
      fetchProfile().catch((err) => {
        console.error("❌ Session validation failed:", err)
        // Store handles logout on flag 101
      })
    }
  }, [session, setSession, isAuthenticated, fetchProfile, isHydrated])

  return null
}

