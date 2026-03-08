import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Database, FileSpreadsheet, Zap, Shield, GitCompare, Layers, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: <Database className="w-6 h-6" />,
        color: 'from-blue-500 to-blue-600',
        bg: 'bg-blue-50',
        title: "কোনো ইন্সটলেশনের প্রয়োজন নেই",
        description: "SPSS ক্র্যাক করার ঝামেলা ভুলে যান। ব্রাউজার থেকেই সরাসরি আপনার ফাইল আপলোড করুন।"
    },
    {
        icon: <Zap className="w-6 h-6" />,
        color: 'from-amber-500 to-orange-500',
        bg: 'bg-amber-50',
        title: "তড়িৎ গতির পরিসংখ্যান",
        description: "মুহূর্তের মধ্যে ANOVA, Tukey, DMRT সহ সকল টেস্ট রান করুন।"
    },
    {
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'from-emerald-500 to-green-600',
        bg: 'bg-emerald-50',
        title: "থিসিসের জন্য প্রস্তুত ফলাফল",
        description: "কপি-পেস্টের উপযোগী পরিষ্কার টেবিল, অটো ইন্টারপ্রিটেশন এবং চার্ট।"
    },
    {
        icon: <Shield className="w-6 h-6" />,
        color: 'from-violet-500 to-purple-600',
        bg: 'bg-violet-50',
        title: "১০০% ডেটা প্রাইভেসি",
        description: "আপনার ডেটা কোথাও সেভ করা হয় না। বিশ্লেষণের পরেই সম্পূর্ণ মুছে ফেলা হয়।"
    },
    {
        icon: <GitCompare className="w-6 h-6" />,
        color: 'from-pink-500 to-rose-500',
        bg: 'bg-pink-50',
        title: "Post-Hoc টেস্ট বিল্ট-ইন",
        description: "Tukey HSD এবং Duncan (DMRT) দিয়ে গ্রুপভিত্তিক পার্থক্য চিহ্নিত করুন।"
    },
    {
        icon: <Layers className="w-6 h-6" />,
        color: 'from-cyan-500 to-teal-500',
        bg: 'bg-cyan-50',
        title: "Cluster Analysis",
        description: "K-Means অ্যালগরিদম দিয়ে আপনার ডেটাকে স্বয়ংক্রিয়ভাবে গ্রুপ করুন।"
    }
];

const stats = [
    { value: "৬+", label: "স্ট্যাটিস্টিক্যাল টেস্ট" },
    { value: "০", label: "সফটওয়্যার খরচ" },
    { value: "১০০%", label: "বাংলায় ফলাফল" },
    { value: "< ৫ সে.", label: "ফলাফল পেতে সময়" },
];

const howItWorks = [
    { step: "০১", title: "ফাইল আপলোড", desc: "আপনার Excel বা CSV ফাইলটি ড্র্যাগ অ্যান্ড ড্রপ করুন।" },
    { step: "০২", title: "টেস্ট নির্বাচন", desc: "ANOVA, Tukey, DMRT বা Cluster Analysis বেছে নিন।" },
    { step: "০৩", title: "ভ্যারিয়েবল ম্যাপিং", desc: "ডিপেন্ডেন্ট এবং ফ্যাক্টর ভ্যারিয়েবল সিলেক্ট করুন।" },
    { step: "০৪", title: "ফলাফল গ্রহণ", desc: "টেবিল, চার্ট এবং বাংলা ইন্টারপ্রিটেশন পান।" },
];

export default function LandingPage() {
    return (
        <div className="flex flex-col">
            {/* ===== HERO SECTION ===== */}
            <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32">
                {/* Background */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-background to-background" />
                <div className="absolute inset-0 -z-10 grid-pattern opacity-40" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                            থিসিস গবেষণার বিশ্বস্ত সঙ্গী
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 sm:mb-8 leading-tight"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        স্ট্যাটিস্টিকস এখন{' '}
                        <span className="shimmer-text">একদম সহজ</span>
                        <br className="hidden sm:block" />
                        আপনার রিসার্চ ডিফেন্সের জন্য
                    </motion.h1>

                    <motion.p
                        className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed font-medium px-2"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        জটিল ও পুরানো সফটওয়্যার নিয়ে আর দুশ্চিন্তা নয়। আপনার ডেটা আপলোড করুন, ভ্যারিয়েবল সিলেক্ট করুন —
                        কয়েক সেকেন্ডেই পান নির্ভুল ANOVA ফলাফল, ভিজ্যুয়াল চার্ট এবং বাংলা ইন্টারপ্রিটেশন।
                    </motion.p>

                    <motion.div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                        <Link to="/dashboard"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3.5 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-1 hover:shadow-2xl pulse-glow">
                            এনালাইসিস শুরু করুন
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                        <a href="#features"
                            className="inline-flex items-center justify-center rounded-full border-2 border-black/10 bg-white px-7 py-3.5 text-base font-bold text-foreground shadow-sm transition-all hover:border-primary/30 hover:-translate-y-1">
                            ফিচারসমূহ দেখুন
                            <ChevronRight className="ml-1 w-4 h-4" />
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* ===== STATS BAR ===== */}
            <section className="relative -mt-8 sm:-mt-12 z-10 px-4">
                <div className="container mx-auto max-w-4xl">
                    <motion.div
                        className="bg-white rounded-2xl shadow-xl border border-black/5 grid grid-cols-2 sm:grid-cols-4 divide-x divide-black/5"
                        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                        {stats.map((stat, idx) => (
                            <div key={idx} className="p-4 sm:p-6 text-center">
                                <div className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">{stat.value}</div>
                                <div className="text-xs sm:text-sm font-bold text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ===== FEATURES SECTION ===== */}
            <section id="features" className="py-20 sm:py-28 relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="text-center mb-12 sm:mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">সম্পূর্ণ টুলকিট</span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 tracking-tight">থিসিসের জন্য প্রয়োজনীয় সবকিছু</h2>
                            <p className="text-muted-foreground font-medium max-w-xl mx-auto text-sm sm:text-base">
                                শিক্ষার্থী ও গবেষকদের জন্য তৈরি, পূর্ব অভিজ্ঞতা ছাড়াই নিখুঁত স্ট্যাটিস্টিক্যাল এনালিসিস।
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {features.map((feature, idx) => (
                            <motion.div key={idx}
                                className="group bg-white rounded-2xl p-5 sm:p-6 text-left border border-black/5 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.08 }}>
                                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                                    <span className={`bg-gradient-to-br ${feature.color} bg-clip-text`}>
                                        {feature.icon}
                                    </span>
                                </div>
                                <h3 className="text-base sm:text-lg font-bold mb-2">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-20 sm:py-28 section-gradient relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
                    <div className="text-center mb-12 sm:mb-16">
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3 block">কিভাবে কাজ করে</span>
                            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 tracking-tight">মাত্র ৪টি ধাপ</h2>
                            <p className="text-muted-foreground font-medium max-w-lg mx-auto text-sm sm:text-base">
                                কোনো পূর্ব অভিজ্ঞতা বা ট্রেনিং ছাড়াই শুরু করতে পারবেন।
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {howItWorks.map((item, idx) => (
                            <motion.div key={idx} className="relative text-center sm:text-left"
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}>
                                <div className="text-5xl sm:text-6xl font-extrabold text-primary/10 mb-2 leading-none">{item.step}</div>
                                <h3 className="text-base sm:text-lg font-bold mb-2">{item.title}</h3>
                                <p className="text-muted-foreground text-sm font-medium leading-relaxed">{item.desc}</p>
                                {idx < howItWorks.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 -right-4 text-primary/20">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-20 sm:py-28">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                    <motion.div
                        className="relative bg-gradient-to-br from-primary to-blue-700 rounded-3xl p-8 sm:p-14 text-center text-white overflow-hidden"
                        initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

                        <div className="relative z-10">
                            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 tracking-tight">
                                আজই আপনার ডেটা অ্যানালাইসিস শুরু করুন
                            </h2>
                            <p className="text-white/80 font-medium mb-8 max-w-lg mx-auto text-sm sm:text-base">
                                কোনো রেজিস্ট্রেশন, কোনো ডাউনলোড, কোনো খরচ নেই। সরাসরি ব্রাউজার থেকে শুরু করুন।
                            </p>
                            <Link to="/dashboard"
                                className="inline-flex items-center justify-center rounded-full bg-white text-primary px-8 py-4 text-base font-bold shadow-xl transition-all hover:shadow-2xl hover:-translate-y-1">
                                এখনই শুরু করুন — বিনামূল্যে
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
