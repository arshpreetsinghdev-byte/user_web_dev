/**
 * Square Payment Integration
 * Handles Square payment initialization and configuration
 */

export interface SquareConfig {
  applicationId: string;
  locationId: string;
}

/**
 * Load Square Web Payments SDK (Sandbox Environment)
 */
export async function loadSquareSDK(environment: 'sandbox' | 'production' = 'sandbox'): Promise<boolean> {
  return new Promise((resolve) => {
    // Remove any existing Square scripts
    const existingScripts = document.querySelectorAll('script[src*="squarecdn.com"]');
    existingScripts.forEach(script => script.remove());
    
    // Clear existing Square object if present
    if (window.Square) {
      delete window.Square;
    }

    // Load Square SDK script - hardcoded to sandbox
    const script = document.createElement('script');
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Square Sandbox SDK loaded');
      resolve(true);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Square Sandbox SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Initialize Square Payments
 */
export async function initializeSquarePayments(applicationId: string, locationId: string) {
  if (!window.Square) {
    throw new Error('Square SDK not loaded');
  }

  try {
    const payments = window.Square.payments(applicationId, locationId);
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

