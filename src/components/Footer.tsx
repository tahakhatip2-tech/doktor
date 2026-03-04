import React from 'react';
import {
    Sparkles,
    Facebook,
    Instagram,
    Linkedin,
    Twitter
} from 'lucide-react';

export default function Footer() {
    return (
        <footer className="border-t border-border/50 bg-card/30 backdrop-blur-md py-8">
            <div className="container mx-auto px-4">
                {/* Professional Divider */}
                <div className="w-full flex items-center justify-center gap-4 mb-8 opacity-80">
                    <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />
                    <div className="h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent flex-1" />
                </div>

                {/* Desktop: Two Columns | Mobile: Single Column */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

                    {/* Left Column: Doctor Jo Branding */}
                    <div className="flex flex-col items-center lg:items-start gap-3">
                        <div className="flex items-center gap-3">
                            {/* Doctor Jo Logo */}
                            <div className="relative group cursor-pointer">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur opacity-30 animate-pulse group-hover:animate-[pulse_0.5s_ease-in-out_infinite]"></div>
                                <img
                                    src="/hakeem-logo.png"
                                    alt="Doctor Jo Logo"
                                    className="relative h-14 w-14 lg:h-16 lg:w-16 rounded-2xl shadow-2xl object-contain transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/logo.png';
                                    }}
                                />
                            </div>

                            <div className="flex flex-col">
                                {/* Doctor Jo Brand Name */}
                                <h2 className="text-base lg:text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-blue-700 to-orange-500 bg-clip-text text-transparent">
                                    DOCTOR JO
                                </h2>
                                <p className="text-[9px] lg:text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-orange-500 to-blue-600 bg-clip-text text-transparent">
                                    Clinic Management System
                                </p>
                            </div>
                        </div>

                        {/* Tagline */}
                        <p className="text-xs text-blue-600/60 text-center lg:text-left max-w-md">
                            The Middle East's first AI-powered, self-operating clinic management ecosystem
                        </p>
                    </div>

                    {/* Right Column: Al-Khatib Signature & Social */}
                    <div className="flex flex-col items-center lg:items-end gap-3">
                        {/* Al-Khatib Signature */}
                        <a
                            href="https://alkhatib-marketing.great-site.net/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                        >
                            <h3 className="text-sm lg:text-base font-black tracking-tight bg-gradient-to-r from-blue-600 via-orange-500 to-blue-600 bg-clip-text text-transparent group-hover:from-orange-500 group-hover:via-blue-600 group-hover:to-orange-500 transition-all duration-500">
                                AL-KHATIB-MARKETING&SOFTWARE
                            </h3>
                        </a>

                        {/* Tagline */}
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-600/70 uppercase tracking-wider">
                            <Sparkles className="h-2.5 w-2.5 text-orange-500" />
                            Premium Digital Solutions
                        </div>

                        {/* Social Icons */}
                        <div className="flex items-center justify-center gap-2.5 mt-2">
                            {[
                                { icon: Facebook, href: "https://www.facebook.com/alkhatib.marketing/" },
                                { icon: Instagram, href: "https://www.instagram.com/alkhatib.marketing/" },
                                { icon: Twitter, href: "https://twitter.com/alkhatib_mkt" },
                                { icon: Linkedin, href: "https://www.linkedin.com/company/alkhatib-marketing/" }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full border border-blue-600/30 text-blue-600 transition-all duration-300 hover:scale-110 hover:border-orange-500 hover:bg-gradient-to-r hover:from-blue-600 hover:to-orange-500 hover:text-white hover:shadow-lg group"
                                >
                                    <social.icon className="h-4 w-4 transition-transform duration-500 group-hover:rotate-[360deg]" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Divider & Version */}
                <div className="mt-6 pt-4 border-t border-blue-600/10">
                    <p className="text-center text-[10px] text-blue-600/40">
                        آ© 2026 Doctor Jo v1.0 | Powered by Al-Khatib Software
                    </p>
                </div>
            </div>
        </footer>
    );
}
