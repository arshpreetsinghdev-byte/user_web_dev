// src/components/ui/profile/profile.tsx
"use client"

import * as React from "react"
import { useTranslations } from "@/lib/i18n/TranslationsProvider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Camera, X } from "lucide-react"
import { useProfile } from "@/hooks/useProfile"
import Image from "next/image"

interface ProfileDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onLogout?: () => void
}

export function ProfileDialog({
  open,
  onOpenChange,
  onLogout,
}: ProfileDialogProps) {
  const { t } = useTranslations()
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

  // Fetch profile when dialog opens
  React.useEffect(() => {
    if (open) {
      fetchProfile();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[400px] max-w-[calc(100%-2rem)] p-4"
        showCloseButton={false}
      >
        {/* Header */}
        <DialogHeader className="px-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-semibold">
              {t("profile.profile") || "Profile"}
            </DialogTitle>
            <button
              onClick={() => onOpenChange?.(false)}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-3 py-2 space-y-3 bg-[#F7F7F7] rounded-lg">
          {/* Avatar Section */}
          <div className="flex items-start justify-between">
            <div className="relative flex flex-col">
              <div className="w-20 h-20 rounded-full overflow-hidden">
                {avatar ? (
                  <Image
                    src={avatar}
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
                    className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center hover:bg-[#FF5520] transition-colors shadow-lg"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#FF6B35] text-white hover:bg-[#FF5520] px-4 h-9"
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
                className="w-full h-10 bg-white border-2 border-[#FF6B35] rounded-lg px-3.5 text-base focus-visible:border-[#FF6B35] focus-visible:ring-[#FF6B35]/20 disabled:opacity-50"
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
              className="w-full h-10 bg-[#FF6B35] text-white border-0 rounded-lg text-lg font-medium hover:bg-[#FF5520] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("common.loading") || "Saving..." : t("common.save") || "Save"}
            </Button>
          )}
        </div>

        {/* Logout Section */}
        <div className="px-2 pb-2">
          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full h-10 text-red-500 border border-gray-200 rounded-lg text-lg font-medium hover:bg-red-50 hover:text-red-600"
          >
            {t("common.logout") || "Logout"}
          </Button>
      </div>
      </DialogContent>
    </Dialog>
  )
}