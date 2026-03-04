
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Function to check scroll position
        const checkScroll = () => {
            // Check window scroll
            if (window.scrollY > 400) {
                setIsVisible(true);
                return;
            }

            // Check if there is a custom-scrollbar container scrolling
            const customScrollContainer = document.querySelector('.custom-scrollbar');
            if (customScrollContainer && customScrollContainer.scrollTop > 400) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Add listeners to window and any custom scrollbars found
        window.addEventListener('scroll', checkScroll);

        // Use a small interval to attach to dynamic containers if needed, 
        // or just rely on the fact that Index.tsx is always present for dashboard
        const interval = setInterval(checkScroll, 500);

        return () => {
            window.removeEventListener('scroll', checkScroll);
            clearInterval(interval);
        };
    }, []);

    const scrollToTop = () => {
        // Scroll window
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Scroll custom container if exists
        const customScrollContainer = document.querySelector('.custom-scrollbar');
        if (customScrollContainer) {
            customScrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 20 }}
                    onClick={scrollToTop}
                    className="fixed bottom-24 md:bottom-8 right-8 z-[100] h-14 w-14 rounded-2xl bg-primary text-white shadow-glow-primary flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden"
                >
                    <ArrowUp className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
