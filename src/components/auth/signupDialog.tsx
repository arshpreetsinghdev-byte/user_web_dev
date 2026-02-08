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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PhoneInput } from "./phoneInput"
import { getCountryCallingCode, CountryCode, getCountries } from "libphonenumber-js"
import { useAuth } from "@/hooks/useAuth"
import { useAuthStore } from "@/stores/auth.store"
import { toast } from "sonner"
import { motion } from "framer-motion"
import type { SignupDialogProps, SignupData } from "@/types"

export function SignupDialog({
  open,
  onOpenChange,
  onSignUp,
  initialPhoneNumber = "",
  initialCountryCode = "IN",
  signupOnboarding = false,
}: SignupDialogProps) {
  const { t } = useTranslations()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [age, setAge] = React.useState("")
  const [gender, setGender] = React.useState("")
  const [countryCode, setCountryCode] = React.useState("IN")
  const [phoneNumber, setPhoneNumber] = React.useState("")
  const [agreedToTerms, setAgreedToTerms] = React.useState(false)
  const { generateOtp, updateProfile, isLoading } = useAuth()
  const setUser = useAuthStore((state) => state.setUser)


  React.useEffect(() => {
    if (initialPhoneNumber) {
      setPhoneNumber(initialPhoneNumber)
    }
    if (initialCountryCode) {
      if (initialCountryCode.length <= 3 && !initialCountryCode.startsWith('+')) {
        setCountryCode(initialCountryCode)
      } else {
        // If it's a calling code (e.g., "+91"), find the matching country
        const callingCodeNumber = initialCountryCode.replace('+', '')
        const allCountries = getCountries()
        const matchingCountry = allCountries.find(
          (country) => getCountryCallingCode(country) === callingCodeNumber
        )
        if (matchingCountry) {
          setCountryCode(matchingCountry);
        }
      }
    }
  }, [initialPhoneNumber, initialCountryCode])

  const isOnboardingMode = !!initialPhoneNumber && signupOnboarding;

  const handleSignUp = async () => {
    if (name.trim() && email.trim() && phoneNumber.trim() && agreedToTerms) {
      try {
        // ONBOARDING MODE: Update profile directly and authenticate
        if (isOnboardingMode) {
          console.log('📝 Onboarding mode: Updating profile directly');
          await updateProfile(name, email);

          // NOW set authentication after profile is updated
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            setUser({ ...currentUser, name, email });
          }

          toast.success(t("auth.profileUpdateSuccess") || "Profile updated successfully");
          toast.success(t("auth.loginSuccess") || "Login successful");

          // Reset form
          setName("")
          setEmail("")
          setAge("")
          setGender("")
          setAgreedToTerms(false)
          onOpenChange?.(false)

          // Notify parent of completion
          onSignUp?.({
            name,
            email,
            phoneNumber,
            countryCode,
            agreedToTerms,
          })
          return
        }

        // NORMAL SIGNUP MODE: Generate OTP
        const callingCode = `+${getCountryCallingCode(countryCode as CountryCode)}`
        const fullPhoneNumber = callingCode + phoneNumber
        console.log('📝 Normal signup: Generating OTP');

        await generateOtp(fullPhoneNumber, callingCode)

        toast.success(t("auth.otpSent") || "OTP sent successfully")

        onSignUp?.({
          name,
          email,
          phoneNumber,
          countryCode: callingCode,
          agreedToTerms,
        })
      } catch (error: any) {
        toast.error(error.message || t("auth.signupFailed") || "Failed to sign up")
      }
    }
  }


  const handleCancel = () => {
    setName("")
    setEmail("")
    setAge("")
    setGender("")
    setPhoneNumber("")
    setAgreedToTerms(false)
    onOpenChange?.(false)
  }

  const isFormValid = name.trim() && email.trim() && phoneNumber.trim() && agreedToTerms

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[400px] max-w-[calc(100%-2rem)] p-5 gap-2"
        showCloseButton={false}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-semibold leading-tight text-left">
            {t("auth.createNewAccount")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1 overflow-y-auto px-1">
          {/* Name Input */}
          <label className="block">
            <span className="text-[#1E293B] text-sm font-medium my-1.5 block">
              {t("auth.name")}
            </span>
            <Input
              type="text"
              placeholder={t("auth.enterName")}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-8.5 bg-[#F8FAFC] border-0 rounded-lg px-3.5 text-sm placeholder:text-[#CBD5E1]"
            />
          </label>

          {/* Email Input */}
          <label className="block">
            <span className="text-[#1E293B] text-sm font-medium my-1.5 block">
              {t("auth.email")}
            </span>
            <Input
              type="email"
              placeholder={t("auth.enterEmail")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-8.5 bg-[#F8FAFC] border-0 rounded-lg px-3.5 text-sm placeholder:text-[#CBD5E1]"
            />
          </label>

          {/* Age and Gender Row
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[#1E293B] text-sm font-medium my-1.5 block">
                {t("auth.age")}
              </span>
              <Input
                type="number"
                placeholder={t("auth.enterAge")}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full h-8.5 bg-[#F8FAFC] border-0 rounded-lg px-3.5 text-sm placeholder:text-[#CBD5E1]"
              />
            </label> */}

          {/* <label className="block">
              <span className="text-[#1E293B] text-sm font-medium my-1.5 block">
                {t("auth.gender")}
              </span>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-full h-9 bg-[#F8FAFC] border-0 rounded-lg px-3.5 text-sm">
                  <SelectValue placeholder={t("auth.chooseGender")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">{t("auth.male")}</SelectItem>
                  <SelectItem value="female">{t("auth.female")}</SelectItem>
                  <SelectItem value="other">{t("auth.other")}</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div> */}

          {/* Phone Number */}
          <div className="block">
            <span className="text-[#1E293B] text-sm font-medium my-1.5 block">
              {t("auth.phoneNumber")}
            </span>
            <PhoneInput
              countryCode={countryCode}
              phoneNumber={phoneNumber}
              onCountryCodeChange={setCountryCode}
              onPhoneNumberChange={setPhoneNumber}
            />
          </div>

          {/* Terms and Conditions Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-[#CBD5E1] text-[#FF6B35] focus:ring-[#FF6B35] cursor-pointer"
            />
            <span className="text-[#1E293B] text-sm leading-relaxed">
              {t("auth.iAgreeTo")}{" "}
              <a href="#" className="text-[#1E293B] underline font-medium">
                {t("auth.termsAndConditions")}
              </a>{" "}
              {t("auth.andThe")}{" "}
              <a href="#" className="text-[#1E293B] underline font-medium">
                {t("auth.privacyPolicy")}
              </a>
            </span>
          </label>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-[0.3] h-12 text-black bg-white border border-gray-300 rounded-lg text-base font-medium hover:bg-gray-50"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={handleSignUp}
              disabled={!isFormValid || isLoading}
              className="flex-[0.7] h-12 bg-black text-white border-0 rounded-lg text-base font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("common.loading") || "Loading..." : t("auth.signUp")}
            </Button>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}