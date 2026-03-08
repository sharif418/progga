import React from 'react';
import { Github, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer className="w-full border-t border-black/5 bg-white/50 mt-auto">
            <div className="container mx-auto px-4 py-8 sm:py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <img src="/logo.png" alt="পিউ" className="w-8 h-8 rounded-full object-cover border-2 border-primary/20 transition-transform group-hover:scale-105" />
                        <span className="font-bold text-sm bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-700">
                            প্রজ্ঞা পারমাণবিক পিউ
                        </span>
                    </Link>

                    {/* Tagline */}
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5 text-center">
                        <Heart className="w-3.5 h-3.5 text-red-400" />
                        বাংলাদেশি গবেষকদের জন্য তৈরি
                    </p>

                    {/* Links */}
                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                        <a href="https://github.com/sharif418/progga" target="_blank" rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-black/5">
                            <Github className="w-4 h-4" />
                            <span className="hidden sm:inline">ওপেন সোর্স</span>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
