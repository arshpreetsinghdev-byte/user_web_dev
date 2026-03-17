import { useCallback, useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchWalletBalance, getTransactionHistory, rechargeWallet } from '@/lib/api/wallet.api';
import { useAuthStore } from '@/stores/auth.store';
import { useGeolocationConfigStore } from '@/stores/geolocation.store';
import { useOperatorParamsStore } from '@/lib/operatorParamsStore';
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
    const { latitude, longitude, permission, currency: geoCurrency } = useGeolocationConfigStore();
    const geoLoading = permission === 'prompt';

    const walletQuery = useQuery({
        queryKey: ['wallet-balance', isAuthenticated, latitude, longitude],
        queryFn: () => fetchWalletBalance({
            latitude: latitude || 0,
            longitude: longitude || 0
        }),
        enabled: isAuthenticated && !geoLoading && latitude !== null && longitude !== null,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
    // --- Pagination state ---
    const [allTransactions, setAllTransactions] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const pageSize = 10;
    const initialFetchDone = useRef(false);

    const transactionsQuery = useQuery({
        queryKey: ['wallet-transactions', isAuthenticated],
        queryFn: () => getTransactionHistory({
            login_type: 0,
            locale: 'en',
            currency: geoCurrency || config?.currency_code || 'USD',
            start_from: 0,
        }),
        enabled: isAuthenticated && !!walletQuery.data,
        staleTime: 5 * 60 * 1000,
    });

    // Seed accumulated list from initial query
    useEffect(() => {
        if (transactionsQuery.data?.transactions) {
            const txns = transactionsQuery.data.transactions;
            setAllTransactions(txns);
            setHasMore(txns.length >= pageSize);
            initialFetchDone.current = true;
        }
    }, [transactionsQuery.data, transactionsQuery.dataUpdatedAt]);

    // Load next page
    const loadMoreTransactions = useCallback(async () => {
        if (isLoadingMore || !hasMore) return;
        setIsLoadingMore(true);
        try {
            const res = await getTransactionHistory({
                login_type: 0,
                locale: 'en',
                currency: walletQuery.data?.data?.currency || 'USD',
                start_from: allTransactions.length,
            });
            const newTxns = res.transactions || [];
            setAllTransactions((prev: any[]) => [...prev, ...newTxns]);
            setHasMore(newTxns.length >= pageSize);
        } catch (e) {
            console.error('Failed to load more transactions', e);
        } finally {
            setIsLoadingMore(false);
        }
    }, [isLoadingMore, hasMore, allTransactions.length, walletQuery.data]);

    // console.log('💰 Wallet Data:', walletQuery.data?.data);

    // Extract payment details from the response
    const responseData = walletQuery.data?.data;
    const stripeConfig = responseData?.payment_mode_config_data?.find(
        (item: any) => item.name === "stripe_cards"
    );
    const squareConfig = responseData?.payment_mode_config_data?.find(
        (item: any) => item.name === "square_cards"
    );

    const isStripeEnabled = Number(stripeConfig?.enabled) === 1;
    const isSquareEnabled = Number(squareConfig?.enabled) === 1;

    const stripeCards = responseData?.stripe_cards?.length
        ? responseData.stripe_cards
        : (stripeConfig?.cards_data || []);

    const squareCards = responseData?.square_cards?.length
        ? responseData.square_cards
        : (squareConfig?.cards_data || []);

    const operatorCurrency = geoCurrency ||
        useOperatorParamsStore.getState().data?.user_web_config?.currency ||
        useOperatorParamsStore.getState().data?.user_web_config?.currency_symbol ||
        '₹';

    const config = useOperatorParamsStore.getState().getUserWebConfig();
    return {
        balance: responseData?.jugnoo_balance || 0,
        currency: operatorCurrency || '₹',
        transactions: allTransactions,
        hasMoreTransactions: hasMore,
        isLoadingMore,
        loadMoreTransactions,
        stripeCards,
        squareCards,
        isStripeEnabled,
        isSquareEnabled,
        stripePublishableKey: config?.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        squareApplicationId: config?.NEXT_PUBLIC_SQUARE_APPLICATION_ID || process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
        squareLocationId: config?.NEXT_PUBLIC_SQUARE_LOCATION_ID || process.env.NEXT_PUBLIC_SQUARE_lOCATION_ID,
        isLoading: walletQuery.isLoading || transactionsQuery.isLoading || geoLoading,
        error: walletQuery.error || transactionsQuery.error,
        refetch: useCallback(() => {
            // Clear list so reopening the dialog starts fresh
            setAllTransactions([]);
            setHasMore(true);
            initialFetchDone.current = false;
            walletQuery.refetch();
            transactionsQuery.refetch();
        }, []), // TanStack Query refetch functions are stable
        recharge: async (amount: number, cardId: string | number, cardType: 'stripe' | 'square' = 'stripe') => {
            const user = useAuthStore.getState().user;
            if (!user?.phone_no) {
                toast.error("User phone number not found");
                return;
            }
            // if (amount < 50) {
            //     toast.error("Minimum recharge amount is 50");
            //     return;
            // }

            return rechargeWallet({
                driver_phone_no: user.phone_no.replace(/^\+/, ''),
                amount,
                login_type: 1,
                payment_mode: cardType === 'square' ? 73 : 9,
                currency: geoCurrency || config?.currency_code || 'USD',
                card_id: cardId
            });
        }
    };
}

