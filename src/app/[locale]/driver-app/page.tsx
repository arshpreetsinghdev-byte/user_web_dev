"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import { motion } from "framer-motion";
import { ChevronRight, Play, Apple } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DriverAppPage() {
    const { t } = useTranslations();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const features = [
        "Seamless Navigation",
        "Earnings Summary",
        "Earnings Dashboard",
        "In-app Ticket Support",
        "Real-Time Requests",
        "Available in Multiple Languages",
        "Start/End Trip",
    ];

    return (
        <div className="relative min-h-[calc(100vh-88px)] overflow-hidden flex flex-col">
            {/* Content Section */}
            <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-20 relative z-10 flex-1 flex flex-col justify-center -translate-y-6">
                <div className="flex flex-col lg:flex-row w-full justify-between items-center gap-10 lg:gap-16">

                    {/* Left Section - Text Content */}
                    <motion.div
                        className="w-full lg:w-full text-black space-y-6 lg:space-y-8"
                        initial={{ opacity: 0, x: -50 }}
                        animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="space-y-3">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                                {t("Driver App") || "Driver App"}
                            </h1>
                            <p className="text-lg text-black max-w-xl leading-relaxed">
                                {t("Equip your drivers with a powerful and intuitive app.") || "Equip your drivers with a powerful and intuitive app."}
                            </p>
                        </div>

                        <div className="space-y-1">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                                    transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className="h-5 w-6 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/40 transition-colors">
                                        <ChevronRight className="h-3 w-4 text-primary" />
                                    </div>
                                    <span className="text-lg font-medium text-black">{t(feature) || feature}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* App Store Buttons */}
                        <motion.div
                            className="flex flex-wrap gap-4 pt-1"
                            initial={{ opacity: 0, y: 20 }}
                            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                            transition={{ delay: 1.0, duration: 0.6 }}
                        >
                            <Button
                                onClick={() => window.open(
                                    "https://play.google.com/store/apps/details?id=product.clicklabs.jugnoo.driver&hl=en_IN",
                                    "_blank"
                                )}

                                className="h-14 px-6 bg-white text-black hover:bg-gray-200 rounded-xl flex items-center gap-3">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-xs font-medium">Get it on</span>
                                    <span className="text-lg font-bold">Google Play</span>
                                </div>
                            </Button>
                            <Button onClick={() => window.open(
                                "https://apps.apple.com/in/app/jugnoo-driver/id1378177428",
                                "_blank"
                            )}
                                className="h-14 px-6 bg-transparent border bg-black border-black text-white hover:bg-grey-300 rounded-xl flex items-center gap-3">
                                <div className="flex flex-col items-start leading-none">
                                    <span className="text-xs font-medium">Download on the</span>
                                    <span className="text-lg font-bold">App Store</span>
                                </div>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Right Section - Dummy Phone Image */}
                    <motion.div
                        className="w-full lg:w-1/2 flex justify-center lg:justify-end relative"
                        initial={{ opacity: 0, x: 50 }}
                        animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        {/* Glowing Background Effect behind Phone */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[600px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />

                        {/* Phone Mockup Placeholder */}
                        <div className="relative w-[700px] h-[800px] lg:w-[900px] lg:h-[500px] z-10">
                            <Image
                                src="/Group-1171275760-2.png"
                                alt="Driver App Interface"
                                fill
                                priority
                                className="object-contain rounded-xl shadow-xl"
                            />
                        </div>

                    </motion.div>

                </div>
            </section>

            {/* Background images - Fixed at bottom */}
            <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none">
                {/* City Skyline Silhouette (Group.png) */}
                <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 bg-[url('/images/banners/Group.png')] bg-cover bg-center bg-no-repeat opacity-20" />
                {/* Road (road.png) */}
                <div className="relative w-full h-16 sm:h-20 md:h-24 bg-[url('/images/banners/road.png')] bg-cover bg-center bg-no-repeat" />
            </div>

            {/* Car Image - Animation */}
            <motion.div
                className="absolute bottom-5 left-5 sm:left-10 z-1 pointer-events-none"
                initial={{ x: -1000 }}
                animate={mounted ? { x: 0 } : { x: -1000 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            >
                <div className="relative w-48 sm:w-56 md:w-64 lg:w-80 h-24 sm:h-28 md:h-32 lg:h-40 bg-[url('/images/vehicles/mainCar.png')] bg-contain bg-left bg-no-repeat" />
            </motion.div>
        </div>
    );
}
