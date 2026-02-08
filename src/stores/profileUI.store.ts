import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ProfileUIState {
  // Form state
  fullName: string;
  email: string;
  phoneNumber: string;
  avatar: string;
  avatarFile: File | null;
  isEditing: boolean;

  // Actions
  setFullName: (name: string) => void;
  setEmail: (email: string) => void;
  setAvatar: (avatar: string) => void;
  setAvatarFile: (file: File | null) => void;
  setIsEditing: (isEditing: boolean) => void;
  
  // Bulk updates
  syncFromUser: (user: { name?: string; email?: string; phone_no?: string; user_image?: string } | null) => void;
  resetEditing: () => void;
}

export const useProfileUIStore = create<ProfileUIState>()(
  devtools(
    (set) => ({
      // Initial state
      fullName: '',
      email: '',
      phoneNumber: '',
      avatar: '',
      avatarFile: null,
      isEditing: false,

      // Individual setters
      setFullName: (fullName) =>
        set({ fullName }, false, 'profileUI/setFullName'),

      setEmail: (email) =>
        set({ email }, false, 'profileUI/setEmail'),

      setAvatar: (avatar) =>
        set({ avatar }, false, 'profileUI/setAvatar'),

      setAvatarFile: (avatarFile) =>
        set({ avatarFile }, false, 'profileUI/setAvatarFile'),

      setIsEditing: (isEditing) =>
        set({ isEditing }, false, 'profileUI/setIsEditing'),

      // Sync form from user object
      syncFromUser: (user) =>
        set(
          {
            fullName: user?.name || '',
            email: user?.email || '',
            phoneNumber: user?.phone_no || '',
            avatar: user?.user_image || '',
          },
          false,
          'profileUI/syncFromUser'
        ),

      // Reset editing state and clear file
      resetEditing: () =>
        set(
          {
            isEditing: false,
            avatarFile: null,
          },
          false,
          'profileUI/resetEditing'
        ),
    }),
    { name: 'profile-ui-store' }
  )
);
