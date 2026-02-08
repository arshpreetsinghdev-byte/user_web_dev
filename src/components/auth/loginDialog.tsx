"use client"

import * as React from "react"
import { useTranslations } from "@/lib/i18n/TranslationsProvider"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PhoneInput } from "./phoneInput"
import { Button } from "@/components/ui/button"
import { getCountryCallingCode, CountryCode } from "libphonenumber-js"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { LoginDialogProps } from "@/types"

export function LoginDialog({
  open,
  onOpenChange,
  onProceed,
}: LoginDialogProps) {
  const { t } = useTranslations()
  const [countryCode, setCountryCode] = React.useState("IN")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const { generateOtp, isLoading } = useAuth()

  const handleProceed = async () => {
    if (phoneNumber.trim()) {
      try {
        const callingCode = `+${getCountryCallingCode(countryCode as CountryCode)}`
        const fullPhoneNumber = callingCode + phoneNumber

        // Call API to generate OTP
        await generateOtp(fullPhoneNumber, callingCode)

        // Success - notify parent to open OTP dialog
        toast.success(t("auth.otpSent") || "OTP sent successfully")
        onProceed?.(phoneNumber, callingCode)
      } catch (error: any) {
        toast.error(error.message || t("auth.otpFailed") || "Failed to send OTP")
      }
    }
  }

  const handleCancel = () => {
    setPhoneNumber("")
    onOpenChange?.(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[360px] max-w-[calc(100%-2rem)] p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <DialogHeader className="space-y-1.5">
                <DialogTitle className="text-xl font-semibold leading-tight text-left">
                  {t("auth.loginToAccount")}
                </DialogTitle>
              </DialogHeader>

              <div className="mt-2 space-y-2">
                {/* Phone Number Label */}
                <div className="block">
                  <span className="text-[#64748B] text-xs font-medium mb-1.5 block">
                    {t("auth.phoneNumber")}
                  </span>
                  <PhoneInput
                    countryCode={countryCode}
                    phoneNumber={phoneNumber}
                    onCountryCodeChange={setCountryCode}
                    onPhoneNumberChange={setPhoneNumber}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1.5">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="flex-[0.35] h-10 text-black bg-white border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 hover:text-black"
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={handleProceed}
                    disabled={!phoneNumber.trim() || isLoading}
                    className="flex-[0.65] h-10 bg-primary! text-white! border-0 rounded-md text-sm font-medium hover:bg-gray-800! disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? t("common.loading") || "Loading..." : t("auth.proceed")}
                  </Button>
                </div>
              </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}