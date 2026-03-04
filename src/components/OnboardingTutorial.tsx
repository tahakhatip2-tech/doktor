import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles, Gift, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface OnboardingTutorialProps {
    onComplete: () => void;
    onSkip: () => void;
}

const OnboardingTutorial = ({ onComplete, onSkip }: OnboardingTutorialProps) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleComplete = () => {
        setIsVisible(false);
        setTimeout(() => onComplete(), 300);
    };

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onSkip(), 300);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
                        onClick={handleClose}
                    />

                    {/* Welcome Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 z-[101] flex items-center justify-center px-4"
                    >
                        <Card className="relative overflow-y-auto max-h-[90vh] border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-blue-950/95 backdrop-blur-2xl rounded-3xl p-6 md:p-10 w-full max-w-lg custom-scrollbar">
                            {/* Ambient Glows */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

                            <button
                                onClick={handleClose}
                                className="absolute top-4 left-4 p-2 text-white/50 hover:text-white transition-colors z-20"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="text-center relative z-10">
                                <div className="flex justify-center mb-4 md:mb-6">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500/30 blur-xl rounded-full animate-pulse" />
                                        <div className="relative bg-gradient-to-br from-blue-500 to-orange-500 p-3 md:p-4 rounded-2xl shadow-lg">
                                            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-white" />
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-2xl md:text-3xl font-black text-white mb-2 md:mb-3 tracking-tight leading-tight">
                                    Welcome to Doctor Jo
                                </h2>
                                <p className="text-blue-200/70 mb-6 md:mb-8 font-medium text-sm md:text-base">
                                    Jordan's First Smart Clinic Management System
                                </p>

                                <div className="space-y-2.5 md:space-y-3 mb-6 md:mb-8">
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <Gift className="h-4 w-4 md:h-5 md:w-5 text-orange-400" />
                                        <span className="text-xs md:text-sm font-bold text-white flex-1">Full 7-Day Free Trial</span>
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <Shield className="h-4 w-4 md:h-5 md:w-5 text-blue-400" />
                                        <span className="text-xs md:text-sm font-bold text-white flex-1">Direct Access to All Features</span>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleComplete}
                                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-5 md:py-6 rounded-2xl shadow-xl shadow-blue-500/20 transition-all border-0 text-sm md:text-base"
                                >
                                    Get Started
                                    <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default OnboardingTutorial;
