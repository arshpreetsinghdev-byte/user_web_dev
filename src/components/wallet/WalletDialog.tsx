"use client";

import { useTranslations } from "@/lib/i18n/TranslationsProvider";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, ArrowRight, ChevronRight, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useWallet } from "@/hooks/useWallet";
import { Skeleton } from "@/components/ui/skeleton";
import { RechargeWalletModal } from "@/components/wallet/RechargeWalletModal";
import { motion } from "framer-motion";

interface WalletDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WalletDialog({ open, onOpenChange }: WalletDialogProps) {
    const { t } = useTranslations();
    const [amount, setAmount] = useState("");
    const [isRechargeModalOpen, setIsRechargeModalOpen] = useState(false);
    const { balance, currency, transactions,  isLoading, refetch } = useWallet();
    // console.log('💰 Wallet Data in Dialog:', { balance, currency, transactions, isLoading })        ;
    
    useEffect(() => {
        if (open) {
            refetch();
        }
    }, [open, refetch]);

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        // If today, show "Today HH:mm"
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            return `Today ${format(date, "HH:mm")}`;
        }
        // If yesterday
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) {
            return `Yesterday ${format(date, "HH:mm")}`;
        }

        return format(date, "MMM dd HH:mm");
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent showCloseButton={false} className="max-w-[480px] p-0 gap-0 border-none overflow-hidden bg-white rounded-2xl">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    >
                                <div>

                                    {/* Header Section with Gradient */}
                                    <div className="flex justify-between items-start relative bg-primary from-primary to-primary-light p-6 text-white overflow-hidden">
                                        {/* Decorative background circle */}
                                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />

                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <DialogTitle className="text-2xl font-bold">{t("Wallet")}</DialogTitle>
                                                <p className="text-white/80 text-sm mt-1 max-w-[200px]">
                                                    {t("Add money to your wallet for easy transactions")}
                                                </p>
                                                <div className="mt-4 mb-2">
                                                    {isLoading ? (
                                                        <Skeleton className="h-10 w-24 bg-white/20" />
                                                    ) : (
                                                        <div className="text-4xl font-bold">
                                                            {currency}{balance.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid items-center gap-3 mt-6">
                                            <Input
                                                type="number"
                                                placeholder={t("Enter amount")}
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="bg-white border-0 text-gray-900 placeholder:text-gray-400 h-11"
                                            />
                                            <Button
                                                className="bg-white hover:bg-grey text-black h-11 px-6 font-medium"
                                                onClick={() => {
                                                    if (!amount || parseFloat(amount) <= 0) {
                                                        // You can add toast notification here if needed
                                                        return;
                                                    }
                                                    onOpenChange(false); // close wallet dialog
                                                    setTimeout(() => setIsRechargeModalOpen(true), 300);
                                                }}
                                            >
                                                {t("Recharge")}
                                            </Button>
                                        </div>
                                        <button
                                            onClick={() => onOpenChange(false)}
                                            className="p-1 rounded-full hover:bg-white/20 transition-colors -mt-3 -mr-4"
                                        >
                                            <X className="h-6 w-6 text-white" />
                                        </button>
                                    </div>

                                </div>

                                {/* Transactions List */}
                                <div className="bg-white">
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <h3 className="font-bold text-lg text-gray-900">{t("Transactions")}</h3>
                                    </div>

                                    <div className="max-h-[250px] overflow-y-auto">
                                        {isLoading ? (
                                            <div className="p-6 space-y-4">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="flex justify-between items-center">
                                                        <div className="flex items-center gap-3">
                                                            <Skeleton className="h-8 w-8 rounded-full" />
                                                            <div className="space-y-2">
                                                                <Skeleton className="h-4 w-24" />
                                                                <Skeleton className="h-3 w-16" />
                                                            </div>
                                                        </div>
                                                        <Skeleton className="h-4 w-12" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : transactions.length > 0 ? (
                                            transactions.map((txn: any, index: number) => {
                                                const isCredit = txn.txn_type === 1;
                                                return (
                                                    <div
                                                        key={txn.txn_id}
                                                        className={`flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${index !== transactions.length - 1 ? 'border-b border-gray-50' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                <Wallet className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-900 text-sm truncate max-w-[200px]">
                                                                    {txn.txn_text || t("Transaction")}
                                                                </div>
                                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                                    {txn.txn_datev2} {txn.txn_timev2}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <div className={`font-bold text-sm ${isCredit ? 'text-green-600' : 'text-red-900'
                                                                }`}>
                                                                {isCredit ? '+' : '-'}{currency}{Math.abs(txn.amount).toFixed(2)}
                                                            </div>
                                                            {/* <ChevronRight className="h-4 w-4 text-gray-300" /> */}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                {t("No transactions yet")}
                                            </div>
                                        )}
                                    </div>
                                </div>
                    </motion.div>
                </DialogContent>
            </Dialog>

            {/* Recharge Wallet Modal */}
            <RechargeWalletModal
                isOpen={isRechargeModalOpen}
                onClose={() => {
                    setIsRechargeModalOpen(false);
                    onOpenChange(true); // Reopen wallet dialog when closing recharge modal
                }}
                amount={amount}
                onRechargeComplete={() => {
                    setAmount("");
                    refetch(); // Refresh wallet balance after recharge
                    onOpenChange(true); // Reopen wallet dialog after successful recharge
                }}
            />
        </>
    );
}
