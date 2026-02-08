"use client";

import { useState } from "react";
import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MessageCircle,
  HelpCircle,
  FileText,
  Shield,
  CreditCard,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface SupportCategory {
  icon: any;
  title: string;
  description: string;
  action: string;
}

export default function SupportPage() {
  const { t } = useTranslations();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // FAQ Data
  const faqs: FAQItem[] = [
    {
      category: "Booking",
      question: "How do I book a ride?",
      answer: "To book a ride, enter your pickup and drop-off locations on the home page, select your preferred vehicle type, and click 'Book Now'. You can also schedule rides for later.",
    },
    {
      category: "Booking",
      question: "Can I schedule a ride in advance?",
      answer: "Yes! When booking, you can choose 'Schedule for Later' and select your preferred date and time. We recommend booking at least 30 minutes in advance.",
    },
    {
      category: "Booking",
      question: "How do I add multiple stops to my ride?",
      answer: "While booking, click on 'Add Stop' button to add intermediate destinations. You can add multiple stops along your route.",
    },
    {
      category: "Payment",
      question: "What payment methods are accepted?",
      answer: "We accept Cash, Credit/Debit Cards, Wallet, and UPI payments. You can select your preferred payment method during checkout.",
    },
    {
      category: "Payment",
      question: "How do I use a coupon code?",
      answer: "During the booking process, go to the 'Services & Options' step and click on 'Coupons & Promotions'. Select an available coupon or enter your code manually.",
    },
    {
      category: "Payment",
      question: "How does the wallet work?",
      answer: "Add money to your wallet from the Wallet section in the navigation menu. You can use wallet balance for faster checkout and receive exclusive cashback offers.",
    },
    {
      category: "Account",
      question: "How do I update my profile information?",
      answer: "Click on the Profile icon in the navigation bar, then select 'Edit Profile' to update your name, email, and other details.",
    },
    {
      category: "Account",
      question: "I forgot my password. What should I do?",
      answer: "We use OTP-based authentication. Simply enter your phone number on the login page, and you'll receive a one-time password to access your account.",
    },
    {
      category: "Rides",
      question: "Can I cancel a ride?",
      answer: "Yes, you can cancel a ride from the active ride screen. Please note that cancellation fees may apply depending on the timing and driver acceptance status.",
    },
    {
      category: "Rides",
      question: "How do I track my ride?",
      answer: "Once your ride is confirmed, you can track your driver's location in real-time on the map. You'll also see the estimated time of arrival.",
    },
    {
      category: "Safety",
      question: "Are the rides safe?",
      answer: "Yes! All our drivers are verified and background-checked. You can share your ride details with trusted contacts and access emergency features during your trip.",
    },
    {
      category: "Safety",
      question: "Can I share my ride details with someone?",
      answer: "Yes, you can share live ride tracking with your emergency contacts from the active ride screen for added safety.",
    },
  ];

  // Support Categories
  const supportCategories: SupportCategory[] = [
    {
      icon: Phone,
      title: "Call Support",
      description: "Speak with our support team",
      action: "tel:+1234567890",
    },
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us your queries",
      action: "mailto:support@jugnoo.com",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Chat with us in real-time",
      action: "chat",
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Browse our knowledge base",
      action: "help",
    },
  ];

  // Filter FAQs based on search
  const filteredFAQs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group FAQs by category
  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = [];
    }
    acc[faq.category].push(faq);
    return acc;
  }, {} as Record<string, FAQItem[]>);

  const handleCategoryClick = (action: string) => {
    if (action.startsWith("tel:") || action.startsWith("mailto:")) {
      window.location.href = action;
    } else if (action === "chat") {
      toast.info("Live chat will be available soon!");
    } else if (action === "help") {
      toast.info("Redirecting to help center...");
    }
  };

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="relative min-h-[calc(100vh-88px)] bg-white">
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t("How can we help you?")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("Get quick answers to your questions or reach out to our support team")}
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder={t("Search for help...")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-primary"
            />
          </div>
        </motion.div>

        {/* Support Categories */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16"
        >
          {supportCategories.map((category, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card
                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary group"
                onClick={() => handleCategoryClick(category.action)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all duration-300">
                    <category.icon className="h-8 w-8 text-primary group-hover:text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {t(category.title)}
                  </h3>
                  <p className="text-sm text-gray-600">{t(category.description)}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            {t("Popular Topics")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: MapPin, title: "Booking & Routes", color: "text-blue-600" },
              { icon: CreditCard, title: "Payments & Wallet", color: "text-green-600" },
              { icon: Shield, title: "Safety & Security", color: "text-red-600" },
              { icon: Clock, title: "Ride History", color: "text-purple-600" },
              { icon: FileText, title: "Terms & Policies", color: "text-orange-600" },
              { icon: HelpCircle, title: "Account Help", color: "text-cyan-600" },
            ].map((topic, index) => (
              <Card
                key={index}
                className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer border hover:border-primary group"
              >
                <div className="flex items-center gap-3">
                  <topic.icon className={`h-6 w-6 ${topic.color} group-hover:scale-110 transition-transform`} />
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {t(topic.title)}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* FAQs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            {t("Frequently Asked Questions")}
          </h2>

          {Object.entries(groupedFAQs).length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">{t("No results found. Try a different search term.")}</p>
            </Card>
          ) : (
            Object.entries(groupedFAQs).map(([category, categoryFAQs], categoryIndex) => (
              <div key={categoryIndex} className="mb-8">
                <h3 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  {t(category)}
                </h3>
                <div className="space-y-3">
                  {categoryFAQs.map((faq, faqIndex) => {
                    const globalIndex = faqs.indexOf(faq);
                    return (
                      <Card
                        key={faqIndex}
                        className="overflow-hidden transition-all duration-300 hover:shadow-md"
                      >
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-medium text-gray-900 pr-4">
                            {t(faq.question)}
                          </span>
                          {expandedFAQ === globalIndex ? (
                            <ChevronUp className="h-5 w-5 text-primary flex-shrink-0" />
                          ) : (
                            <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          )}
                        </button>
                        {expandedFAQ === globalIndex && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="px-5 pb-5"
                          >
                            <p className="text-gray-600 leading-relaxed border-t pt-4">
                              {t(faq.answer)}
                            </p>
                          </motion.div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {t("Still need help?")}
              </h2>
              <p className="text-gray-600 mb-6">
                {t("Our support team is available 24/7 to assist you with any questions or concerns.")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => handleCategoryClick("tel:+1234567890")}
                >
                  <Phone className="h-5 w-5" />
                  {t("Call Support")}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-primary text-primary hover:bg-primary hover:text-white"
                  onClick={() => handleCategoryClick("mailto:support@jugnoo.com")}
                >
                  <Mail className="h-5 w-5" />
                  {t("Email Us")}
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Business Hours */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-center mt-12 text-gray-500 text-sm"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="h-4 w-4" />
            <span className="font-medium">{t("Support Hours")}</span>
          </div>
          <p>{t("Monday - Sunday: 24/7")}</p>
          <p className="mt-1">{t("Average response time: Less than 5 minutes")}</p>
        </motion.div>
      </section>

      {/* Background - Same as home page */}
      <div className="absolute bottom-0 left-0 right-0 w-full z-0 pointer-events-none">
        <div className="relative w-full h-32 sm:h-40 md:h-48 lg:h-56 bg-[url('/images/banners/Group.png')] bg-cover bg-center bg-no-repeat opacity-10" />
        <div className="relative w-full h-16 sm:h-20 md:h-24 bg-[url('/images/banners/road.png')] bg-cover bg-center bg-no-repeat"></div>
      </div>
    </div>
  );
}
