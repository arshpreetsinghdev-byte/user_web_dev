/**
 * Square Card API Functions
 * Handles Square card management operations
 */



import apiClient from '../client';

export interface SquareCardData {
  id?: string;
  card_id?: string | number;
  last_4?: string;
  card_brand?: string;
  exp_month?: number;
  exp_year?: number;
  cardholder_name?: string;
}

export interface AddSquareCardRequest {
  square_token: string;
  card_id?: string | number;
  last_4?: string;
  card_brand?: string;
  exp_month?: number;
  exp_year?: number;
}

export interface SquareCardResponse {
  flag: number;
  message: string;
  data?: {
    card_id?: string | number;
    cards?: SquareCardData[];
  };
}

/**
 * Add Square Card with Token
 */
export async function addSquareCardWithToken(
  cardData: AddSquareCardRequest,
  sessionId: string,
  sessionIdentifier: string
): Promise<SquareCardResponse> {
  try {
    const response = await apiClient.post('/open/v1/add_sqaure_card', cardData);
    return response.data;
  } catch (error: any) {
    console.error('Add Square card API error:', error);
    throw error;
  }
}

/**
 * Delete Square Card
 */
export async function deleteSquareCard(
  cardId: string | number,
): Promise<SquareCardResponse> {
  try {
    const response = await apiClient.post('/open/v1/delete_square_card', { card_id: String(cardId) });
    return response.data;
  } catch (error: any) {
    console.error('Delete Square card API error:', error);
    throw error;
  }
}
