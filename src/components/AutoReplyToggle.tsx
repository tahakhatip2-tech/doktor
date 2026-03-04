import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Power, UserCog } from "lucide-react";
import { motion } from "framer-motion";

interface AutoReplyToggleProps {
    isActive?: boolean;
    onToggle?: (active: boolean) => void;
}

export function AutoReplyToggle({ isActive = true, onToggle }: AutoReplyToggleProps) {
    // In a real scenario, this would use the prop. For now, we keep the visual active.

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={{
                type: "spring",
                stiffness: 400,
                damping: 25,
            }}
            className="w-full px-4"
        >
            <Card className="relative overflow-hidden p-4 md:p-6 transition-all duration-700 border-y border-white/10 bg-blue-950/5 backdrop-blur-[80px] rounded-none shadow-2xl group hover:shadow-primary/20">
                <div className="">

                    {/* 1. Ultra-Premium Light Sweep */}
                    <div className="light-sweep" />

                    {/* 2. Architectural Accent (Top Right) */}
                    <motion.div
                        whileHover={{ rotate: 0, scale: 1.25 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className="absolute top-0 right-0 w-20 h-20 flex items-center justify-center -mr-4 -mt-4 opacity-5 group-hover:opacity-15 transition-all duration-700 rotate-12"
                    >
                        <UserCog className="h-12 w-12 text-primary" />
                    </motion.div>

                    <div className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">

                        {/* Left Side: Icon & Info */}
                        <div className="flex items-center gap-4">
                            {/* Vertical Flagship Ribbon */}
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 40 }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="w-1.5 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full opacity-60 group-hover:opacity-100 transition-opacity"
                            />

                            <div className="flex flex-col gap-0.5">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="p-1 rounded-sm bg-primary/20 text-primary">
                                        <MessageCircle className="h-3.5 w-3.5" strokeWidth={3} />
                                    </div>
                                    <p className="text-[9px] md:text-[10px] font-black text-primary/80 uppercase tracking-[0.25em]">SYST_AUTO_REPLY</p>
                                </motion.div>

                                <h3 className="text-xl md:text-2xl font-black tracking-tighter text-foreground italic uppercase">سكرتير العيادة</h3>
                                <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider pl-1 border-l border-white/5 line-clamp-1">
                                    نشط - يعمل على خدمة المرضى وتنظيم المواعيد على مدار الساعة
                                </p>
                            </div>
                        </div>

                        {/* Right Side: Ultra-Premium Action Button */}
                        <div className="flex items-center gap-4 self-end md:self-auto">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onToggle && onToggle(!isActive)}
                                className="h-10 px-6 font-black text-primary hover:bg-primary/10 transition-all text-[10px] uppercase tracking-[0.2em] border border-primary/20 backdrop-blur-md gap-2 group/btn"
                            >
                                <span className="relative z-10">إعدادات النظام</span>
                                <Power className="h-4 w-4 group-hover/btn:text-primary transition-colors" />
                            </Button>
                        </div>
                    </div>

                    {/* 4. Bottom Professional "Power Line" */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                        className="absolute bottom-0 left-0 flex opacity-40 group-hover:opacity-100 transition-opacity duration-1000"
                    >
                        <div className="h-[3px] w-2/5 bg-primary shadow-[0_0_15px_rgba(var(--primary),0.6)]" />
                        <div className="h-[3px] flex-1 bg-white/5" />
                    </motion.div>

                    {/* 5. Inner Glass Edge Shine */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                </div>
                <div className="absolute inset-0 pointer-events-none border-x border-white/5" />
            </Card>
        </motion.div>
    );
}
