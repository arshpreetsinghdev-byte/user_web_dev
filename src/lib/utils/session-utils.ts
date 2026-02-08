/**
 * Session Validation Utilities
 * Helper functions for session management and validation
 */

/**
 * Check if error is session-related (Flag 101, 401, or authentication error)
 */
export function isSessionError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorData = error.response?.data || {};
  
  return (
    errorData.flag === 101 ||
    error.response?.status === 401 ||
    errorMessage.includes('session') ||
    errorMessage.includes('authentication') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('invalid session') ||
    errorMessage.includes('expired')
  );
}

/**
 * Extract error message from various error formats
 */
export function getErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
  if (typeof error === 'string') return error;
  
  return (
    error?.message ||
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.data?.message ||
    defaultMessage
  );
}

/**
 * Check if response indicates session expiration
 */
export function isSessionExpiredResponse(response: any): boolean {
  return response?.flag === 101 || response?.data?.flag === 101;
}
