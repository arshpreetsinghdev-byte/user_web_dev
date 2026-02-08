import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { mapsService } from '@/lib/google-maps/GoogleMapsService';
import { toast } from 'sonner';

interface GoogleMapsState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  loadApiKey: (apiKey: string) => Promise<void>;
  reset: () => void;
}

export const useGoogleMapsStore = create<GoogleMapsState>()(
  devtools(
    (set, get) => {
      mapsService.subscribe((isLoaded) => {
        set({ isLoaded, isLoading: false }, false, 'maps/loaded');
        if (isLoaded) {
          // toast.success('Google Maps loaded successfully');
          console.log('✅ Google Maps loaded successfully');
        }
      });

      return {
        isLoaded: false,
        isLoading: false,
        error: null,

        loadApiKey: async (apiKey: string) => {
          const { isLoading } = get();

          if (isLoading) return;
          set({ isLoading: true, error: null }, false, 'maps/loading');

          try {

            await mapsService.loadApiKey(apiKey, ['places', 'geometry']);

          } catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'Failed to load Google Maps';
            set({ error: errorMessage, isLoading: false, isLoaded: false, }, false, 'maps/error');
            toast.error(errorMessage);
          }
        },

        reset: () => {
          set(
            {
              isLoaded: false,
              isLoading: false,
              error: null,
            },
            false,
            'maps/reset'
          );
        },
      };
    },
    {
      name: 'GoogleMapsStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);


export const useGoogleMapsLoaded = () => useGoogleMapsStore((state) => state.isLoaded);
export const useGoogleMapsLoading = () => useGoogleMapsStore((state) => state.isLoading);
export const useGoogleMapsError = () => useGoogleMapsStore((state) => state.error);