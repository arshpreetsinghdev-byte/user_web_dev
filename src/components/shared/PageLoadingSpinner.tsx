"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Global page transition loading spinner
 * Shows a minimal spinner during navigation
 */
export function PageLoadingSpinner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset loading state when route changes
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Listen for custom navigation events
    const handleRouteChangeStart = () => setIsLoading(true);
    const handleRouteChangeComplete = () => setIsLoading(false);

    window.addEventListener("routeChangeStart", handleRouteChangeStart);
    window.addEventListener("routeChangeComplete", handleRouteChangeComplete);

    return () => {
      window.removeEventListener("routeChangeStart", handleRouteChangeStart);
      window.removeEventListener("routeChangeComplete", handleRouteChangeComplete);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80"
        >
          <div className="flex flex-col items-center gap-3">
            {/* Spinner */}
            <div className="relative">
              <div className="w-12 h-12 border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            {/* Optional text */}
            <p className="text-sm text-gray-600 font-medium">Loading...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
