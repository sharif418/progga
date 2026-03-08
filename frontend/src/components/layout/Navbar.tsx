import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart2, Home, UploadCloud, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { name: 'হোম', path: '/', icon: <Home className="w-4 h-4" /> },
        { name: 'ড্যাশবোর্ড', path: '/dashboard', icon: <BarChart2 className="w-4 h-4" /> },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full glass text-foreground">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileOpen(false)}>
                        <img src="/logo.png" alt="পিউ" className="w-9 h-9 rounded-full object-cover border-2 border-primary/30 shadow-md transition-transform group-hover:scale-105" />
                        <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
                            প্রজ্ঞা পারমাণবিক পিউ
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden sm:flex items-center gap-2">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link key={link.name} to={link.path}
                                    className={cn("relative px-4 py-2 text-sm font-bold transition-colors flex items-center gap-2 rounded-lg",
                                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-black/5")}>
                                    {link.icon}
                                    <span>{link.name}</span>
                                    {isActive && (
                                        <motion.div layoutId="nav-indicator"
                                            className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                                            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }} />
                                    )}
                                </Link>
                            );
                        })}
                        <Link to="/dashboard"
                            className="ml-3 inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:-translate-y-0.5">
                            <UploadCloud className="w-4 h-4 mr-2" />
                            ডেটা আপলোড
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button onClick={() => setMobileOpen(!mobileOpen)} className="sm:hidden p-2 rounded-lg hover:bg-black/5 transition-colors" aria-label="মেনু">
                        {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="sm:hidden border-t border-black/5 bg-white/95 backdrop-blur-xl overflow-hidden">
                        <div className="container mx-auto px-4 py-4 space-y-2">
                            {navLinks.map((link) => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link key={link.name} to={link.path} onClick={() => setMobileOpen(false)}
                                        className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-colors",
                                            isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-black/5")}>
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                );
                            })}
                            <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                                className="flex items-center justify-center gap-2 w-full mt-2 px-4 py-3 rounded-xl bg-primary text-white font-bold shadow-lg">
                                <UploadCloud className="w-5 h-5" />
                                ডেটা আপলোড করুন
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
