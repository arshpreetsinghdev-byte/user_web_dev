// src/components/auth/otpDialog.tsx
"use client"

import * as React from "react"
import { useTranslations } from "@/lib/i18n/TranslationsProvider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { OtpDialogProps, SignupData } from "@/types"

export function OtpDialog({
  open,
  onOpenChange,
  onLogin,
  onSignupOnboarding,
  phoneNumber,
  countryCode,
  signupData
}: OtpDialogProps) {
  const { t } = useTranslations()
  const [otp, setOtp] = React.useState(["", "", "", ""])
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])
  const { verifyOtp, updateProfile, isLoading } = useAuth()

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 4)
    const digits = pastedData.split("").filter((char) => /^\d$/.test(char))

    const newOtp = ['', '', '', '']
    digits.forEach((digit, index) => {
      if (index < 4) {
        newOtp[index] = digit
      }
    })
    setOtp(newOtp)

    // Focus last filled input or next empty
    const lastIndex = Math.min(digits.length, 3)
    inputRefs.current[lastIndex]?.focus()
  }

  const handleLogin = async () => {
    const otpValue = otp.join("")
    if (otpValue.length === 4 && phoneNumber && countryCode) {
      try {
        // Build full phone number for API
        const fullPhoneNumber = countryCode + phoneNumber

        console.log('🔐 Verifying OTP with:', {
          otp: otpValue,
          phoneNumber: fullPhoneNumber,
          countryCode
        });

        // Call API to verify OTP with phone data
        const response = await verifyOtp(otpValue, fullPhoneNumber, countryCode)
        console.log('✅ OTP verified successfully:', response);

        // Check if signup onboarding is required
        if (!signupData && response?.data?.signup_onboarding === 1) {
          console.log('📝 Signup onboarding required');
          toast.info(t("auth.completeProfile") || "Please complete your profile");

          // Close OTP dialog and open signup dialog with pre-filled phone
          setOtp(["", "", "", ""])
          onOpenChange?.(false)
          onSignupOnboarding?.(phoneNumber, countryCode)
          return
        }

        // If this was a signup flow (signupData exists), update profile
        if (signupData && signupData.name && signupData.email) {
          console.log('📝 Updating profile with signup data:', signupData);
          try {
            await updateProfile(signupData.name, signupData.email);
            console.log('✅ Profile updated successfully');
          } catch (profileError: any) {
            // console.error('❌ Profile update failed:', profileError);
            // Don't fail the login if profile update fails
            toast.warning(t("auth.profileUpdateFailed") || "Profile update failed, you can update it later");
          }
        }

        // Success
        toast.success(t("auth.loginSuccess") || "Login successful")
        onLogin?.(otpValue)

        // Reset OTP
        setOtp(["", "", "", ""])
      } catch (error: any) {
        toast.error(error.message || t("auth.invalidOtp") || "Invalid OTP")
        // Clear OTP on error
        setOtp(["", "", "", ""])
        inputRefs.current[0]?.focus()
      }
    }
  }

  const handleCancel = () => {
    setOtp(["", "", "", ""])
    onOpenChange?.(false)
  }

  const isOtpComplete = otp.every((digit) => digit !== "")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[340px] max-w-[calc(100%-2rem)] p-4 max-h-[90vh] flex flex-col gap-1.5"
        showCloseButton={false}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <DialogHeader className="space-y-2 shrink-0">
          <DialogTitle className="text-xl font-semibold leading-tight text-left">
            {t("auth.loginToAccount")}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2 space-y-2 overflow-y-auto flex-1">
          {/* OTP Label */}
          <label className="block">
            <span className="text-[#64748B] text-xs font-medium mb-1.5 block">
              {t("auth.otp")}
            </span>

            {/* OTP Input Boxes */}
            <div className="flex gap-1.5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="flex-1 max-w-12 h-12 m-1 bg-[#d3d6d8] border-0 rounded-md text-center text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              ))}
            </div>
          </label>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1.5">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-[0.3] h-10 text-black bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleLogin}
              disabled={!isOtpComplete || isLoading}
              className="flex-[0.7] h-10 bg-primary text-white border-0 rounded-md text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("common.loading") || "Loading..." : t("auth.login")}
            </Button>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}