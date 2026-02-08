import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Location } from '@/types';

interface LocationState {
  currentLocation: Location | null;
  recentLocations: Location[];
  
  // Actions
  setCurrentLocation: (location: Location) => void;
  addRecentLocation: (location: Location) => void;
  clearRecentLocations: () => void;
}

export const useLocationStore = create<LocationState>()(
  devtools(
    persist(
      (set) => ({
        currentLocation: null,
        recentLocations: [],

        setCurrentLocation: (location) =>
          set({ currentLocation: location }, false, 'location/setCurrentLocation'),

        addRecentLocation: (location) =>
          set(
            (state) => {
              // Avoid duplicates
              const exists = state.recentLocations.some(
                (loc) => loc.placeId === location.placeId
              );
              
              if (exists) return state;
              
              // Keep only last 5 recent locations
              const updated = [location, ...state.recentLocations].slice(0, 5);
              
              return { recentLocations: updated };
            },
            false,
            'location/addRecentLocation'
          ),

        clearRecentLocations: () =>
          set({ recentLocations: [] }, false, 'location/clearRecentLocations'),
      }),
      {
        name: 'location-storage',
      }
    )
  )
);
