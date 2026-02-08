import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
  // Modals
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup';
  isVehicleDetailsModalOpen: boolean;
  isCouponModalOpen: boolean;
  isRideDetailsModalOpen: boolean;
  
  // Loading states
  isGlobalLoading: boolean;
  
  // Toast/Notification
  toast: {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    isOpen: boolean;
  };
  
  // Mobile menu
  isMobileMenuOpen: boolean;
  
  // Actions
  openAuthModal: (tab?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthModalTab: (tab: 'login' | 'signup') => void;
  openVehicleDetailsModal: () => void;
  closeVehicleDetailsModal: () => void;
  openCouponModal: () => void;
  closeCouponModal: () => void;
  openRideDetailsModal: () => void;
  closeRideDetailsModal: () => void;
  setGlobalLoading: (loading: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
  toggleMobileMenu: () => void;
}

export const useUIStore = create<UIState>()(
  devtools((set) => ({
    isAuthModalOpen: false,
    authModalTab: 'login',
    isVehicleDetailsModalOpen: false,
    isCouponModalOpen: false,
    isRideDetailsModalOpen: false,
    isGlobalLoading: false,
    toast: {
      message: '',
      type: 'info',
      isOpen: false,
    },
    isMobileMenuOpen: false,

    openAuthModal: (tab = 'login') =>
      set({ isAuthModalOpen: true, authModalTab: tab }, false, 'ui/openAuthModal'),

    closeAuthModal: () =>
      setTimeout(() => set({ isAuthModalOpen: false }, false, 'ui/closeAuthModal'), 400),

    setAuthModalTab: (tab) =>
      set({ authModalTab: tab }, false, 'ui/setAuthModalTab'),

    openVehicleDetailsModal: () =>
      set({ isVehicleDetailsModalOpen: true }, false, 'ui/openVehicleDetailsModal'),

    closeVehicleDetailsModal: () =>
      set({ isVehicleDetailsModalOpen: false }, false, 'ui/closeVehicleDetailsModal'),

    openCouponModal: () =>
      set({ isCouponModalOpen: true }, false, 'ui/openCouponModal'),

    closeCouponModal: () =>
      set({ isCouponModalOpen: false }, false, 'ui/closeCouponModal'),

    openRideDetailsModal: () =>
      set({ isRideDetailsModalOpen: true }, false, 'ui/openRideDetailsModal'),

    closeRideDetailsModal: () =>
      set({ isRideDetailsModalOpen: false }, false, 'ui/closeRideDetailsModal'),

    setGlobalLoading: (loading) =>
      set({ isGlobalLoading: loading }, false, 'ui/setGlobalLoading'),

    showToast: (message, type = 'info') =>
      set(
        { toast: { message, type, isOpen: true } },
        false,
        'ui/showToast'
      ),

    hideToast: () =>
      set(
        (state) => ({ toast: { ...state.toast, isOpen: false } }),
        false,
        'ui/hideToast'
      ),

    toggleMobileMenu: () =>
      set(
        (state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }),
        false,
        'ui/toggleMobileMenu'
      ),
  }))
);
