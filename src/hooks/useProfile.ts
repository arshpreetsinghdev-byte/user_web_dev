import { useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useProfileUIStore } from '@/stores/profileUI.store';
import { toast } from 'sonner';

/**
 * Custom hook to manage profile dialog UI and auth state
 * Provides abstraction layer over auth store and profile UI store
 */
export function useProfile() {
  const {
    user,
    isLoading,
    updateProfile: updateProfileAPI,
    fetchProfile: fetchProfileAPI,
    validateSession,
  } = useAuthStore();

  const {
    fullName,
    email,
    phoneNumber,
    avatar,
    avatarFile,
    isEditing,
    setFullName,
    setEmail,
    setAvatar,
    setAvatarFile,
    setIsEditing,
    syncFromUser,
    resetEditing,
  } = useProfileUIStore();

  // Sync profile UI store with user data whenever user changes
  useEffect(() => {
    if (user) {
      syncFromUser(user);
    }
  }, [user, syncFromUser]);

  /**
   * Fetch user profile from API with session validation
   */
  const fetchProfile = useCallback(async () => {
    try {
      console.log('📥 Fetching user profile...');

      // Validate session before fetching
      const isValid = await validateSession();
      if (!isValid) {
        console.warn('⚠️ Session invalid, skipping profile fetch');
        return;
      }

      await fetchProfileAPI();
      console.log('✅ Profile fetched successfully');
    } catch (error: any) {
      console.error('❌ Failed to fetch profile:', error);
      // Error handling is done in the API call and store
    }
  }, [fetchProfileAPI, validateSession]);

  /**
   * Update user profile
   */
  /**
   * Validate email format
   */
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (t: (key: string) => string) => {
    if (!fullName.trim() || !email.trim()) {
      toast.error(t('profile.fillRequired') || 'Please fill required fields');
      return;
    }

    if (!validateEmail(email)) {
      toast.error(t('profile.invalidEmail') || 'Please enter a valid email address');
      return;
    }

    try {
      console.log('💾 Updating profile:', { fullName, email });

      const response = await updateProfileAPI({
        updated_user_name: fullName,
        updated_user_email: email,
        image_file: avatarFile || undefined
      });
      console.log("Profile response!!!!!!!!!", response);
      if (response && response.flag === 144) {
        // Handle warning case
        toast.warning(response.error || response.message || t('profile.emailTaken') || 'The email address provided is already registered with us.');
      } else {
        // Fetch updated profile to refresh the avatar URL
        await fetchProfileAPI();

        toast.success(t('profile.updateSuccess') || 'Profile updated successfully');
        resetEditing();
      }
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      toast.error(error.message || t('profile.updateFailed') || 'Failed to update profile');
    }
  }, [fullName, email, avatarFile, updateProfileAPI, fetchProfileAPI, resetEditing]);

  /**
   * Handle file upload for avatar
   */
  const handleAvatarChange = useCallback((file: File) => {
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [setAvatarFile, setAvatar]);

  /**
   * Check if form is valid
   */
  const isEmailValid = validateEmail(email);
  const isFormValid = !!(fullName.trim() && isEmailValid);

  return {
    // State
    fullName,
    email,
    phoneNumber,
    avatar,
    isEditing,
    isLoading,
    isFormValid,

    // Actions
    setFullName,
    setEmail,
    setIsEditing,

    // Methods
    fetchProfile,
    updateProfile,
    handleAvatarChange,
    isEmailValid,
  };
}
