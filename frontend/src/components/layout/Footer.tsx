import React from 'react';
import { Activity, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full border-t border-black/10 bg-black/5 mt-auto">
            <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-2 opacity-80">
                    <Activity className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm">প্রজ্ঞা পারমাণবিক</span>
                </div>

                <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                    থিসিস রিসার্চ এবং ডেটা অ্যানালিটিক্স এর জন্য বিশেষভাবে তৈরি।
                </p>

                <div className="flex items-center space-x-4 text-sm font-medium text-muted-foreground">
                    <a href="#" className="hover:text-foreground transition-colors flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        <span>ওপেন সোর্স প্রোজেক্ট</span>
                    </a>
                </div>
            </div>
        </footer>
    );
}
