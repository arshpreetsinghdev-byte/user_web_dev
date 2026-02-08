// src/components/profile/profile.tsx
"use client"

import * as React from "react"
import { useTranslations } from "@/lib/i18n/TranslationsProvider"
import { useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Camera, X, Palette } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import { useThemeStore } from "@/stores/theme.store"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import type { ProfileDialogProps } from "@/types"

export function ProfileDialog({
  open,
  onOpenChange,
  onLogout,
}: ProfileDialogProps) {
  const { t } = useTranslations()
  const { theme, setTheme } = useThemeStore()
  const {
    fullName,
    email,
    phoneNumber,
    avatar,
    isEditing,
    isLoading,
    isFormValid,
    setFullName,
    setEmail,
    setIsEditing,
    fetchProfile,
    updateProfile,
    handleAvatarChange,
  } = useProfile()

  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  // Fetch profile when dialog opens
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      fetchProfile();
    } else {
      setIsVisible(false);
    }
  }, [open, fetchProfile]);

  const handleSave = async () => {
    await updateProfile(t);
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleAvatarChange(file);
    }
  }

  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false)

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setIsVisible(false);
    onLogout?.()
  }

  return (
    <>
      {isVisible && (
        <Dialog open={true} onOpenChange={() => { setIsVisible(false); onOpenChange?.(false); }}>
          <DialogContent className="sm:max-w-[400px] max-w-[calc(100%-2rem)] p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            >
                {/* Header */}
                <DialogHeader className="px-2">
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-2xl font-semibold">
                      {t("profile.profile") || "Profile"}
                    </DialogTitle>
                    <button
                      onClick={() => setIsVisible(false)}
                      className="rounded-full p-1 hover:bg-gray-100 transition-colors"
                    >
                      {/* <X className="h-6 w-6" /> */}
                    </button>
                  </div>
                </DialogHeader>

                <div className="px-3 py-2 space-y-3 bg-[#F7F7F7] rounded-lg">
                  {/* Theme Toggle Section */}
                  {/* <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Palette className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {t("profile.theme") || "Theme"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {theme === 'orange' ? t("profile.orangeTheme") || "Orange" : t("profile.blueTheme") || "Blue"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setTheme('orange')}
                          className={`w-10 h-10 rounded-full transition-all duration-300 ${theme === 'orange'
                              ? 'bg-primary ring-2 ring-primary ring-offset-2 scale-110'
                              : 'bg-primary/30 hover:bg-primary/50'
                            }`}
                          title="Orange Theme"
                        />
                        <button
                          onClick={() => setTheme('blue')}
                          className={`w-10 h-10 rounded-full transition-all duration-300 flex items-center justify-center ${theme === 'blue'
                              ? 'bg-[#3B82F6] ring-2 ring-[#3B82F6] ring-offset-2 scale-110'
                              : 'bg-[#3B82F6]/30 hover:bg-[#3B82F6]/50'
                            }`}
                          title="Blue Theme"
                        />
                      </div>
                    </div>
                  </div> */}

                  {/* Avatar Section */}
                  <div className="flex items-start justify-between">
                    <div className="relative flex flex-col">
                      <div className="w-20 h-20 rounded-full overflow-hidden">
                        {avatar ? (
                          <Image
                            src={avatar || "/images/default.png"}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark">
                            <span className="text-3xl text-white font-semibold">
                              {fullName.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                      </div>

                      {isEditing && (
                        <>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <button
                            onClick={handleButtonClick}
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center transition-colors shadow-lg"
                          >
                            <Camera className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <Button
                        onClick={() => setIsEditing(true)}
                        className="bg-primary text-white hover:bg-primary/90 px-4 h-9"
                      >
                        {t("common.edit") || "Edit"}
                      </Button>
                    )}
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-2">
                    {/* Full Name */}
                    <label className="block">
                      <span className="text-[#1E293B] text-base font-medium mb-1 block">
                        {t("profile.fullName") || "Full Name"}
                      </span>
                      <Input
                        type="text"
                        placeholder={t("profile.enterFullName") || "Enter your full name"}
                        value={fullName}
                        disabled={!isEditing || isLoading}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full h-10 bg-white border-2 border-primary rounded-lg px-3.5 text-base focus-visible:border-primary focus-visible:ring-primary/20 disabled:opacity-50"
                      />
                    </label>

                    {/* Email */}
                    <label className="block">
                      <span className="text-[#1E293B] text-base font-medium mb-1 block">
                        {t("profile.email") || "Email"}
                      </span>
                      <Input
                        type="email"
                        placeholder={t("profile.enterEmail") || "Enter your email"}
                        value={email}
                        disabled={!isEditing || isLoading}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full h-10 bg-[#F8FAFC] border-0 rounded-lg px-3.5 text-base disabled:opacity-50"
                      />
                    </label>

                    {/* Phone Number - Read Only */}
                    <label className="block">
                      <span className="text-[#1E293B] text-base font-medium mb-1 block">
                        {t("profile.phoneNumber") || "Phone Number"}
                      </span>
                      <Input
                        type="tel"
                        placeholder={t("profile.phoneNumber") || "Phone Number"}
                        value={phoneNumber}
                        disabled={true}
                        className="w-full h-10 bg-[#F8FAFC] border-0 rounded-lg px-3.5 text-base opacity-60"
                      />
                    </label>
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <Button
                      onClick={handleSave}
                      disabled={!isFormValid || isLoading}
                      className="w-full h-10 bg-primary text-white border-0 rounded-lg text-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? t("common.loading") || "Saving..." : t("common.save") || "Save"}
                    </Button>
                  )}
                </div>

                {/* Logout Section */}
                <div className="px-2 pb-2">
                  <Button
                    onClick={handleLogoutClick}
                    variant="ghost"
                    className="w-full h-10 text-black border border-gray-200 rounded-lg text-lg font-medium hover:bg-red-50 hover:text-red-600"
                  >
                    {t("common.logout") || "Logout"}
                  </Button>
                </div>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
          <DialogContent className="sm:max-w-[300px] max-w-[calc(100%-2rem)] p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
            >
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    {t("common.logout") || "Logout"}
                  </DialogTitle>
                </DialogHeader>
                <div className="py-2">
                  <p className="text-gray-600">
                    {t("profile.logoutConfirmation") || "Are you sure you want to logout?"}
                  </p>
                </div>
                <div className="flex gap-3 justify-end mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1"
                  >
                    {t("common.cancel") || "Cancel"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmLogout}
                    className="flex-1 bg-black text-white"
                  >
                    {t("common.logout") || "Logout"}
                  </Button>
                </div>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}