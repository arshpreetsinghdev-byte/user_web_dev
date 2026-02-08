import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWalletBalance, getTransactionHistory, rechargeWallet } from '@/lib/api/wallet.api';
import { useAuthStore } from '@/stores/auth.store';
import { useGeolocation } from './useGeolocation';
import { toast } from 'sonner';

export interface StripeCard {
    id: number | string;
    card_id: string;
    last_4: string;
    brand: string;
    exp_month: number;
    exp_year: number;
    name?: string;
}

/**
 * Hook to manage wallet state and balance
 */
export function useWallet() {
    const { isAuthenticated } = useAuthStore();
    const { latitude, longitude, loading: geoLoading } = useGeolocation();

    // Default coordinates if geolocation fails (can be adjusted)
    const defaultCoords = {
        latitude: 30.719852,
        longitude: 76.748012
    };

    const walletQuery = useQuery({
        queryKey: ['wallet-balance', isAuthenticated, latitude, longitude],
        queryFn: () => fetchWalletBalance({
            latitude: latitude || defaultCoords.latitude,
            longitude: longitude || defaultCoords.longitude
        }),
        enabled: isAuthenticated && !geoLoading,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const transactionsQuery = useQuery({
        queryKey: ['wallet-transactions', isAuthenticated],
        queryFn: () => getTransactionHistory({
            login_type: 0,
            locale: 'en',
            currency: walletQuery.data?.data?.currency || 'USD'
        }),
        enabled: isAuthenticated && !!walletQuery.data,
        staleTime: 5 * 60 * 1000,
    });

    // console.log('💰 Wallet Data:', walletQuery.data?.data);

    // Extract payment details from the response
    const responseData = walletQuery.data?.data;
    const stripeConfig = responseData?.payment_mode_config_data?.find(
        (item: any) => item.name === "stripe_cards"
    );
    const squareConfig = responseData?.payment_mode_config_data?.find(
        (item: any) => item.name === "square_cards"
    );

    const isStripeEnabled = Number(stripeConfig?.enabled) === 1 || Number(stripeConfig?.stripe_3d_enabled) === 1;
    const isSquareEnabled = Number(squareConfig?.enabled) === 1;

    const stripeCards = responseData?.stripe_cards?.length
        ? responseData.stripe_cards
        : (stripeConfig?.cards_data || []);

    const squareCards = responseData?.square_cards?.length
        ? responseData.square_cards
        : (squareConfig?.cards_data || []);

    return {
        balance: responseData?.jugnoo_balance || 0,
        currency: responseData?.currency || '₹',
        transactions: transactionsQuery.data?.transactions || [],
        stripeCards,
        squareCards,
        isStripeEnabled,
        isSquareEnabled,
        stripePublishableKey: stripeConfig?.stripe_publishable_key || responseData?.stripe_publishable_key || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_8RZQ6vistTt7kqiEveFVjQMT",
        squareApplicationId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID || "sandbox-sq0idb-9OnwGVf-NtDYWh43j-0mJA",
        squareLocationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || "L0GKESYQ1QTXT",
        isLoading: walletQuery.isLoading || transactionsQuery.isLoading || geoLoading,
        error: walletQuery.error || transactionsQuery.error,
        refetch: useCallback(() => {
            walletQuery.refetch();
            transactionsQuery.refetch();
        }, []), // TanStack Query refetch functions are stable
        recharge: async (amount: number, cardId: string | number) => {
            const user = useAuthStore.getState().user;
            if (!user?.phone_no) {
                toast.error("User phone number not found");
                return;
            }
            if (amount < 50) {
                toast.error("Minimum recharge amount is 50");
                return;
            }
            
            return rechargeWallet({
                driver_phone_no: user.phone_no.replace(/^\+/, ''),
                amount,
                login_type: 1,
                payment_mode: 9,
                currency: walletQuery.data?.data?.currency || 'INR',
                card_id: cardId
            });
        }
    };
}

