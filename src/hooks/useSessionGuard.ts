import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

/**
 * Hook to guard pages that require authentication
 * Validates session on mount and periodically
 * 
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   useSessionGuard({ 
 *     redirectTo: '/en',
 *     validateInterval: 5 * 60 * 1000 // Validate every 5 minutes
 *   });
 *   // ... rest of component
 * }
 * ```
 */
export function useSessionGuard(options?: {
  redirectTo?: string;
  validateInterval?: number; // in ms
  skipInitialValidation?: boolean;
}) {
  const { 
    isAuthenticated, 
    userSessionId, 
    userSessionIdentifier,
    validateSession,
    logout 
  } = useAuthStore();
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const redirectTo = options?.redirectTo || '/en/home';
  const validateInterval = options?.validateInterval || 5 * 60 * 1000; // 5 minutes default
  const skipInitialValidation = options?.skipInitialValidation || false;

  useEffect(() => {
    // Initial validation on mount
    const checkSession = async () => {
      if (!isAuthenticated || !userSessionId || !userSessionIdentifier) {
        console.warn('⚠️ No active session - redirecting to:', redirectTo);
        router.push(redirectTo);
        return;
      }

      // Validate session
      const isValid = await validateSession();
      if (!isValid) {
        console.warn('⚠️ Session invalid - redirecting to:', redirectTo);
        logout();
        router.push(redirectTo);
      }
    };

    // Run initial check if not skipped
    if (!skipInitialValidation) {
      checkSession();
    }

    // Set up periodic validation
    intervalRef.current = setInterval(checkSession, validateInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, userSessionId, userSessionIdentifier, validateSession, logout, router, redirectTo, validateInterval, skipInitialValidation]);
}
