
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import RideBookingForm from "@/components/booking/RideBookingForm";
import HeroSection from "@/components/layout/HeroSection";
import ActionButtonsGroup from "@/components/shared/ActionButtonsGroup";
import { motion } from "framer-motion";
import { navigateWithLoader } from "@/lib/utils/navigationLoader";
import { useOperatorParamsStore } from "@/lib/operatorParamsStore";

export default function HomePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);
  const { getUserWebConfig } = useOperatorParamsStore();
  const config = getUserWebConfig();
  const configHeading = config?.heading || "Welcome to,BlackBadge Transportation";
  const configSubHeading = config?.sub_heading || "";
  const [heading, headingHighlight] = configHeading.split(',').map((part: string) => part.trim());

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBookRide = () => {
    navigateWithLoader(router, `/${locale}/book`);
  };

  const handleRegisterDriver = () => {
    window.open('https://jmpno.app.link/76PJg8ohi0b', '_blank');
  };

  return (
    <div className="relative min-h-[calc(95vh-88px)] pb-40 md:pb-5 lg:pb-30 mt-8 ">
      {/* Main Content */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-0 relative z-10">
        <div className="flex flex-col lg:flex-row w-full justify-between gap-10 md:gap-6 lg:gap-8 xl:gap-10">

          {/* Hero Section */}
          <div className="w-full lg:w-1/2 2xl:w-[60%] mt-6 md:mt-2 lg:mt-5 2xl:mt-10 order-1">
            <HeroSection
              heading={t(heading)}
              headingHighlight={t(headingHighlight)}
              description={t(
                configSubHeading
              )}
              primaryButtonLabel={t("Book a Ride")}
              secondaryButtonLabel={t("Register as Driver")}
              onPrimaryClick={handleBookRide}
              onSecondaryClick={handleRegisterDriver}
              align="left"
              showButtonsOnMobile={false}
            />
          </div>

          {/* Mobile Action Buttons */}
          <div className="w-full mt-6 md:mt-3 lg:hidden order-2">
            <div className="flex flex-col items-center">
              <ActionButtonsGroup
                primaryLabel={t("Book a Ride")}
                secondaryLabel={t("Register as Driver")}
                onPrimaryClick={handleBookRide}
                onSecondaryClick={handleRegisterDriver}
                orientation="vertical"
                align="center"
                className="max-w-sm w-full"
              />
            </div>
          </div>

          {/* Booking Form */}
          <div className="w-full lg:w-[80%] xl:w-[48%] order-3 lg:order-3 mt-6 md:mt-2 lg:mt-0">
            <div className="w-full max-w-100 mx-auto lg:mx-0 lg:ml-auto">
              <RideBookingForm />
            </div>
          </div>
        </div>
      </section>

      {/* Background Banners */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none">
        <div className="relative w-full h-20 sm:h-24 md:h-32 lg:h-40 bg-[url('/images/banners/Group.png')] bg-cover bg-center bg-no-repeat opacity-10" />
        <div className="relative w-full h-14 sm:h-18 md:h-22 bg-[url('/images/banners/road.png')] bg-cover bg-center bg-no-repeat" />
      </div>

      {/* Car Animation */}
      <motion.div
        className="absolute bottom-6 left-4 sm:left-6 lg:left-8 xl:left-[calc((100vw-1280px)/2+2rem)] 2xl:left-[calc((100vw-1536px)/2+2rem)] z-10 pointer-events-none"
        initial={{ x: -1000 }}
        animate={mounted ? { x: 0 } : { x: -1000 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
      >
        <div className="relative w-40 sm:w-50 md:w-52 lg:w-90 h-30 sm:h-24 md:h-28 lg:h-40 bg-[url('/images/vehicles/mainCar.png')] bg-contain bg-left bg-no-repeat" />
      </motion.div>
    </div>
  );
}
