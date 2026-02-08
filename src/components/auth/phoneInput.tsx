// src/components/auth/PhoneInput.tsx
"use client"

import * as React from "react"
import { useTranslations } from "@/lib/i18n/TranslationsProvider"
import Image from "next/image";
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { getCountries, getCountryCallingCode } from "libphonenumber-js"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PhoneInputProps } from "@/types"


const CountryFlag = ({ countryCode, className }: { countryCode: string; className?: string }) => {
  return (
    <Image
      src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
      alt={countryCode}
      className={cn("inline-block", className)}
      loading="lazy"
      width={24}
      height={18}
      unoptimized
    />
  )
}

// Get country name from country code
const getCountryName = (countryCode: string): string => {
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" })
    return regionNames.of(countryCode) || countryCode
  } catch {
    return countryCode
  }
}

export function PhoneInput({
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  placeholder,
}: PhoneInputProps) {
  const { t } = useTranslations()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Get all countries
  const countries = React.useMemo(() => {
    return getCountries().map((country) => ({
      code: country,
      callingCode: `+${getCountryCallingCode(country)}`,
      name: getCountryName(country),
    }))
  }, [])

  const filteredCountries = React.useMemo(() => {
    if (!search) return countries
    const searchLower = search.toLowerCase()
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(searchLower) ||
        country.callingCode.includes(searchLower) ||
        country.code.toLowerCase().includes(searchLower)
    )
  }, [countries, search])

  // Get selected country from countryCode prop (e.g., "+91")
  const selectedCountry = React.useMemo(() => {
    return countries.find((c) => c.code === countryCode) || countries.find((c) => c.code === "IN");
  }, [countries, countryCode])

  // Focus input after selecting country
  const handleCountrySelect = (country: typeof countries[0]) => {
    onCountryCodeChange(country.code)
    setOpen(false)
    setSearch("")
    // Focus phone input after selection
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return (
    <div className="flex gap-2">
      {/* Country Code Selector */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "w-[105px] h-10 bg-[#F8FAFC] border-0 rounded-md px-2.5",
              "flex items-center justify-between",
              "hover:bg-[#EFF3F8] transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shrink-0"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setOpen((prev) => !prev);
            }}
          >
            <div className="flex items-center gap-1.5">
              {selectedCountry ? (
                <CountryFlag countryCode={selectedCountry.code} className="w-5 h-auto" />
              ) : (
                <span className="text-lg">🌐</span>
              )}
              <span className="text-xs font-medium">
                {selectedCountry?.callingCode || countryCode}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-muted-foreground transition-transform",
                open && "rotate-180"
              )}
            />
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[280px] p-0 z-100"
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command shouldFilter={false} className="pointer-events-auto">
            <CommandInput
              placeholder="Search country..."
              value={search}
              onValueChange={setSearch}
              className="h-8 text-xs"
            />
            <CommandList
              className="max-h-[180px] overflow-y-auto relative z-20 pointer-events-auto touch-pan-y"
              style={{ WebkitOverflowScrolling: 'touch' }}
              onWheel={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchMove={(e) => e.stopPropagation()}
            >
              <CommandEmpty>No country found.</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={country.code}
                    onSelect={() => handleCountrySelect(country)}
                    className="cursor-pointer py-1.5 pointer-events-auto"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <CountryFlag countryCode={country.code} className="w-4 h-auto" />
                      <span className="font-medium min-w-[45px] text-xs">{country.callingCode}</span>
                      <span className="text-muted-foreground text-xs truncate">
                        {country.name}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Phone Number Input */}
      <Input
        ref={inputRef}
        type="tel"
        placeholder={placeholder || t("auth.enterPhoneNumber")}
        value={phoneNumber}
        onChange={(e) => {
          // Only allow numbers
          const value = e.target.value.replace(/\D/g, "")
          onPhoneNumberChange(value)
        }}
        className="flex-1 h-10 bg-[#F8FAFC] border-0 rounded-md px-3 text-xs placeholder:text-[#CBD5E1]"
      />
    </div>
  )
}