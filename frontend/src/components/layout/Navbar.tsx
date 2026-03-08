import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, BarChart2, Home, UploadCloud } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export default function Navbar() {
    const location = useLocation();

    const navLinks = [
        { name: 'হোম', path: '/', icon: <Home className="w-4 h-4 mr-2" /> },
        { name: 'অ্যানালিটিক্স ড্যাশবোর্ড', path: '/dashboard', icon: <BarChart2 className="w-4 h-4 mr-2" /> },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full glass border-b border-white/10 text-foreground">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 text-white shadow-lg">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                            প্রজ্ঞা পারমাণবিক
                        </span>
                    </Link>

                    <div className="flex items-center space-x-1 sm:space-x-4">
                        {navLinks.map((link) => {
                            const isActive = location.pathname === link.path;
                            return (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={cn(
                                        "relative px-3 py-2 text-sm font-bold transition-colors flex items-center rounded-md",
                                        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-black/5"
                                    )}
                                >
                                    {link.icon}
                                    <span className="hidden sm:inline-block">{link.name}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute inset-0 rounded-md bg-primary/10 border border-primary/20"
                                            transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                                        />
                                    )}
                                </Link>
                            );
                        })}

                        <Link
                            to="/dashboard"
                            className="ml-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow transition-all hover:bg-primary/90 hover:shadow-lg focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                        >
                            <UploadCloud className="w-4 h-4 mr-2" />
                            ডেটা আপলোড
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
