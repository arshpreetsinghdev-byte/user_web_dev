/**
 * Square Payment Integration
 * Handles Square payment initialization and configuration
 */

export interface SquareConfig {
  applicationId: string;
  locationId: string;
}

/**
 * Detect Square environment from application ID.
 * Sandbox app IDs start with 'sandbox-'.
 */
export function detectSquareEnvironment(applicationId: string): 'sandbox' | 'production' {
  return applicationId?.startsWith('sandbox-') ? 'sandbox' : 'production';
}

/**
 * Load Square Web Payments SDK
 * Defaults to sandbox. Pass 'production' or use detectSquareEnvironment() to switch.
 */
export async function loadSquareSDK(environment: 'sandbox' | 'production' = 'sandbox'): Promise<boolean> {
  return new Promise((resolve) => {
    // Remove any existing Square scripts
    const existingScripts = document.querySelectorAll('script[src*="squarecdn.com"]');
    existingScripts.forEach(script => script.remove());
    
    // Clear existing Square object if present
    if ((window as any).Square) {
      delete (window as any).Square;
    }

    // Load Square SDK script - URL depends on environment
    const sdkUrl = environment === 'sandbox'
    ? 'https://web.squarecdn.com/v1/square.js'
    : 'https://sandbox.web.squarecdn.com/v1/square.js';

    const script = document.createElement('script');
    script.src = sdkUrl;
    script.async = true;
    script.onload = () => {
      // Poll until window.Square is fully ready (avoids "unable to initialize in time")
      let attempts = 0;
      const maxAttempts = 20;
      const interval = setInterval(() => {
        attempts++;
        if ((window as any).Square) {
          clearInterval(interval);
          // console.log(`✅ Square ${environment} SDK loaded`);
          resolve(true);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          console.error(`❌ Square ${environment} SDK timed out waiting for window.Square`);
          resolve(false);
        }
      }, 100);
    };
    script.onerror = () => {
      console.error(`❌ Failed to load Square ${environment} SDK`);
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initialize Square Payments
 */
export async function initializeSquarePayments(applicationId: string, locationId: string) {
  if (!(window as any).Square) {
    throw new Error('Square SDK not loaded');
  }

  try {
    const payments = (window as any).Square.payments(applicationId, locationId);
    return payments;
  } catch (error) {
    console.error('Failed to initialize Square Payments:', error);
    throw error;
  }
}

/**
 * Create Square Card Payment Method
 */
export async function createSquareCard(payments: any) {
  try {
    const card = await payments.card();
    return card;
  } catch (error) {
    console.error('Failed to create Square card:', error);
    throw error;
  }
}

/**
 * Tokenize Square Card
 */
export async function tokenizeSquareCard(card: any): Promise<string> {
  try {
    const tokenResult = await card.tokenize();
    
    if (tokenResult.status === 'OK') {
      return tokenResult.token;
    } else {
      const errorMessages = tokenResult.errors?.map((error: any) => error.message).join(', ');
      throw new Error(errorMessages || 'Card tokenization failed');
    }
  } catch (error: any) {
    console.error('Failed to tokenize card:', error);
    throw error;
  }
}

