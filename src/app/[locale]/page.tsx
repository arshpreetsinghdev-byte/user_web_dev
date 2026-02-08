"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import RideBookingForm from "@/components/booking/RideBookingForm";
import HeroSection from "@/components/layout/HeroSection";
import ActionButtonsGroup from "@/components/shared/ActionButtonsGroup";
import { motion } from "framer-motion";
import { navigateWithLoader } from "@/lib/utils/navigationLoader";

export default function HomePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const { t } = useTranslations();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBookRide = () => {
    navigateWithLoader(router, `/${locale}/book`);
  };

  const handleRegisterDriver = () => {
    navigateWithLoader(router, `/${locale}/driver-app`);
  };

  return (
    <div className="relative lg:h-[calc(100vh-88px)] lg:overflow-hidden">
      {/* Content goes here */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-0 relative z-10 lg:h-full flex items-center pb-42 lg:pb-8">
        <div className="flex flex-col lg:flex-row w-full justify-between gap-5 lg:gap-8 xl:gap-11">
          {/* Left Section - Hero Content */}
          <div className="w-full lg:w-1/2 xl:w-[48%] order-1 lg:order-1">
            <HeroSection
              heading={t('Welcome to')}
              headingHighlight={t('Jugnoo Taxi')}
              description={t('Book rides easily and quickly with our user-friendly app.Thanks to our advanced algorithm, we ensure you get the best ride options at the most competitive prices.')}
              primaryButtonLabel={t('Book a Ride')}
              secondaryButtonLabel={t('Register as Driver')}
              onPrimaryClick={handleBookRide}
              onSecondaryClick={handleRegisterDriver}
              align="left"
              showButtonsOnMobile={false}
            />
          </div>

          {/* Mobile Buttons - Show below hero on mobile */}
          <div className="w-full mt-3 lg:hidden order-2">
            <div className="flex flex-col items-center">
              <ActionButtonsGroup
                primaryLabel={t('Book a Ride')}
                secondaryLabel={t('Register as Driver')}
                onPrimaryClick={handleBookRide}
                onSecondaryClick={handleRegisterDriver}
                orientation="vertical"
                align="center"
                className="max-w-sm w-full"
              />
            </div>
          </div>

          {/* Right Section - Booking Form */}
          <div className="w-full lg:w-1/2 xl:w-[48%] order-3 lg:order-3 mt-10 lg:mt-0">
            <div className="w-full max-w-[380px] mx-auto lg:mx-0 lg:ml-auto">
              <RideBookingForm />
            </div>
          </div>

        </div>
      </section>

      {/* Background images - Fixed at bottom */}
      <div className="absolute lg:fixed bottom-0 left-0 right-0 w-full z-0 pointer-events-none">
        <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 bg-[url('/images/banners/Group.png')] bg-cover bg-center bg-no-repeat opacity-10" />
        <div className="relative w-full h-16 sm:h-20 md:h-24 bg-[url('/images/banners/road.png')] bg-cover bg-center bg-no-repeat"></div>
      </div>

      {/* Car Image - Fixed at bottom left */}
      <motion.div
        className="absolute lg:fixed bottom-5 left-4 sm:left-6 lg:left-8 xl:left-[calc((100vw-1280px)/2+2rem)] 2xl:left-[calc((100vw-1536px)/2+2rem)] z-1 pointer-events-none"
        initial={mounted ? { x: -300, opacity: 0 } : false}
        animate={mounted ? { x: 0, opacity: 1 } : false}
        transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
      >
        <div className="relative w-48 sm:w-56 md:w-64 lg:w-80 h-24 sm:h-28 md:h-32 lg:h-40 bg-[url('/images/vehicles/mainCar.png')] bg-contain bg-left bg-no-repeat" />
      </motion.div>
    </div>

  );
}