// src/components/navbar/navbar.tsx
'use client';
import { Button } from "../ui/button";
import { useTranslations } from '@/lib/i18n/TranslationsProvider';
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { NAV_ITEMS } from "@/lib/utils/constants";
import { LoginDialog, SignupDialog, OtpDialog } from '@/components/auth/auth';
import { ProfileDialog } from '@/components/profile/profile';
import { WalletDialog } from '@/components/wallet/WalletDialog';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import type { SignupData } from '@/types';
import { toast } from "sonner";
import { navigateWithLoader } from "@/lib/utils/navigationLoader";
import { useOperatorParamsStore } from '@/lib/operatorParamsStore';
import { openHippoChat } from '@/lib/hippo/hippo.service';

export default function Navbar() {
  const { t } = useTranslations();
  const router = useRouter();
  const params = useParams() as { locale?: string };
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    setAuthModalTab
  } = useUIStore();
  const loginOpen = isAuthModalOpen && authModalTab === 'login';
  const signupOpen = isAuthModalOpen && authModalTab === 'signup';

  const setLoginOpen = (open: boolean) => open ? openAuthModal('login') : closeAuthModal();
  const setSignupOpen = (open: boolean) => open ? openAuthModal('signup') : closeAuthModal();
  const [signupData, setSignupData] = useState<SignupData | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false); // Add this
  const [otpOpen, setOtpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [phoneData, setPhoneData] = useState({
    countryCode: '',
    phoneNumber: '',
  });

  // Get auth state from store
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [logoUrl, setLogoUrl] = useState('/black-badge-assets/ic_launcher.png');

  // Subscribe to logo URL from store using selector
  const storeLogoUrl = useOperatorParamsStore(
    (state) => state.data.operatorDetails?.[0]?.logo_url || null
  );
  const userWebLogo = useOperatorParamsStore(state => state.data.user_web_config?.logo_url || null);
  // console.log("user web logo::::->", userWebLogo);
  // Handle hydration and custom events
  useEffect(() => {
    setMounted(true);
    const selectedLogo = userWebLogo || storeLogoUrl;
    if (selectedLogo) {
      setLogoUrl(selectedLogo);
    }

    const handleOpenLogin = () => {
      openAuthModal('login');
    };

    window.addEventListener('open-login', handleOpenLogin);
    return () => {
      window.removeEventListener('open-login', handleOpenLogin);
    };
  }, [userWebLogo, storeLogoUrl]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLoginProceed = (phoneNumber: string, countryCode: string) => {
    console.log('Country Code:', countryCode);
    console.log('Phone Number:', phoneNumber);
    setPhoneData({ phoneNumber, countryCode });
    // setIsOnboarding(true); 
    setLoginOpen(false);
    setOtpOpen(true);
  };

  const handleSignUp = (data: any) => {
    console.log('Sign Up Data:', data);
    if (phoneData.phoneNumber && phoneData.countryCode && isOnboarding) {
      console.log('✅ Onboarding completed - user is now logged in');
      setSignupOpen(false);
      setPhoneData({ phoneNumber: '', countryCode: '' });
      setSignupData(null);
      setIsOnboarding(false);
      // User is already authenticated from OTP verification
      return;
    }
    setSignupData(data);
    setSignupOpen(false);
    setPhoneData({ phoneNumber: data.phoneNumber, countryCode: data.countryCode });
    setOtpOpen(true);
  };

  const handleOtpLogin = (otp: string) => {
    console.log('OTP verified successfully');
    setOtpOpen(false);
    setIsOnboarding(false);
    setSignupData(null);
  };

  const handleSignupOnboarding = (phoneNumber: string, countryCode: string) => {
    console.log('Signup onboarding required for:', phoneNumber, countryCode);
    setPhoneData({ phoneNumber, countryCode });
    setOtpOpen(false);
    setIsOnboarding(true);
    setSignupOpen(true);
  };

  const handleLogout = () => {
    logout();
    setTimeout(() => setProfileOpen(false), 400);
  };

  const openLogin = () => {
    setIsMobileMenuOpen(false);
    setLoginOpen(true);
  };

  const openSignup = () => {
    setIsMobileMenuOpen(false);
    setIsOnboarding(false);
    setSignupOpen(true);
  };

  const openProfile = () => {
    setIsMobileMenuOpen(false);
    setProfileOpen(true);
  };

  const handleNavClick = (item: typeof NAV_ITEMS[number]) => {
    if ((item.key === 'wallet' || item.key === 'history') && !isAuthenticated) {
      toast.info(t('Please login to access this feature'));
      openLogin();
      return;
    }

    if (item.key === 'wallet') {
      setWalletOpen(true);
    } else if (item.key === 'history') {
      const locale = params?.locale || 'en';
      const target = `/${locale}/history`;
      if (typeof window !== 'undefined' && pathname === target) {
        // Already on history page — avoid re-navigating which can trigger infinite loading.
        // Close mobile menu and scroll to top instead.
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      } else {
        navigateWithLoader(router, target);
      }
    } else if (item.key === 'support') {
      openHippoChat();
    } else {
      // Default behavior for other links if any
      router.push(`/#`);
    }
    setIsMobileMenuOpen(false);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      <nav>
        <header className="border-b bg-white shadow-l">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 flex items-center justify-between">
            <div className="flex items-center">
              <div
                onClick={() => {
                  const locale = params?.locale || 'en';
                  const target = `/${locale}/home`;
                  if (pathname === target) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    navigateWithLoader(router, target);
                  }
                }}
                className="block cursor-pointer hover:opacity-90 transition-opacity"
              >
                <Image
                  src={logoUrl}
                  alt="Logo"
                  height={40}
                  width={350}
                  className="h-10 w-auto max-w-none"
                  priority
                />
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center justify-end gap-2 lg:gap-4">
              {/* Nav Links */}
              <div className="flex gap-3 lg:gap-6">
                {NAV_ITEMS.map((item) => (
                  <Button
                    key={item.key}
                    variant="ghost"
                    onClick={() => handleNavClick(item)}
                    className="text-sm lg:text-base leading-[25.89px] tracking-normal hover:bg-background hover:cursor-pointer hover:scale-105 px-2 lg:px-4"
                  >
                    {t(item.label)}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1.5 lg:gap-2">
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    onClick={openProfile}
                    className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white w-24 lg:w-32 py-5"
                  >
                    <User className="h-4 w-4" />
                    {t('Profile')}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="border-primary w-24 lg:w-32 py-5 text-primary hover:text-base text-sm lg:text-base"
                      onClick={openLogin}
                    >
                      {t('Login')}
                    </Button>
                    {/* <Button 
                      variant="default" 
                      className="w-24 lg:w-32 py-5 hover:text-base text-sm lg:text-base"
                      onClick={openSignup}
                    >
                      {t('Sign Up')}
                    </Button> */}
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Sidebar - Same pattern */}
          <>
            {/* Overlay */}
            <div
              className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'opacity-50 z-40' : 'opacity-0 pointer-events-none -z-10'
                }`}
              onClick={toggleMobileMenu}
            />

            {/* Sidebar */}
            <div className={`fixed top-0 right-0 h-full w-full bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
              }`}>
              <div className="flex flex-col h-full">
                {/* Close Button */}
                <div className="flex justify-end p-4 border-b">
                  <button
                    onClick={toggleMobileMenu}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="h-6 w-6 text-gray-700" />
                  </button>
                </div>

                {/* Menu Items */}
                <div className="flex flex-col p-4 gap-4">
                  {NAV_ITEMS.map((item) => (
                    <Button
                      key={item.key}
                      variant="ghost"
                      className="justify-start text-base w-full hover:bg-gray-100 transition-colors"
                      onClick={() => handleNavClick(item)}
                    >
                      {t(item.label)}
                    </Button>
                  ))}

                  <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                    {isAuthenticated ? (
                      <Button
                        variant="outline"
                        className="border-primary text-primary w-full transition-all hover:bg-primary hover:text-white flex items-center gap-2"
                        onClick={openProfile}
                      >
                        <User className="h-4 w-4" />
                        {t('Profile')}
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="border-primary text-primary w-full transition-all hover:bg-primary hover:text-white"
                        onClick={openLogin}
                      >
                        {t('Login')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>


        </header>
      </nav>

      {/* Auth Dialogs */}
      <LoginDialog
        open={loginOpen}
        onOpenChange={setLoginOpen}
        onProceed={handleLoginProceed}
      />
      <SignupDialog
        open={signupOpen}

        onOpenChange={(open) => {
          setSignupOpen(open);
          if (!open) {
            // Reset state when dialog closes
            setIsOnboarding(false);
            setPhoneData({ phoneNumber: '', countryCode: '' });
          }
        }}
        onSignUp={handleSignUp}
        initialPhoneNumber={phoneData.phoneNumber} // Add this
        initialCountryCode={phoneData.countryCode} // Add this
        signupOnboarding={isOnboarding}
      />
      <OtpDialog
        open={otpOpen}
        onOpenChange={setOtpOpen}
        onLogin={handleOtpLogin}
        onSignupOnboarding={handleSignupOnboarding}
        phoneNumber={phoneData.phoneNumber}
        countryCode={phoneData.countryCode}
        signupData={signupData}
      />
      <ProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        onLogout={handleLogout}
      />
      <WalletDialog
        open={walletOpen}
        onOpenChange={setWalletOpen}
      />
    </>
  );
}