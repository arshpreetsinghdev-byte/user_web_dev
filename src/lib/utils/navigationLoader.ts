/**
 * Navigation loader utility
 * Triggers loading events for page transitions
 */

export function triggerRouteChangeStart() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('routeChangeStart'));
  }
}

export function triggerRouteChangeComplete() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('routeChangeComplete'));
  }
}

/**
 * Wrapper for router.push that shows loading spinner
 */
export function navigateWithLoader(router: any, path: string) {
  triggerRouteChangeStart();
  router.push(path);
}
