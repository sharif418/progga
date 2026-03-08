import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Database, FileSpreadsheet, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
    {
        icon: <Database className="w-6 h-6 text-blue-500" />,
        title: "কোনো ইন্সটলেশনের প্রয়োজন নেই",
        description: "SPSS ক্র্যাক করার ঝামেলা ভুলে যান। ব্রাউজার থেকেই সরাসরি আপনার Excel বা CSV ফাইল আপলোড করুন, বাকি কাজ আমাদের ক্লাউড ইঞ্জিন করবে।"
    },
    {
        icon: <Zap className="w-6 h-6 text-amber-500" />,
        title: "বিদ্যুৎ গতির ANOVA",
        description: "মুহূর্তের মধ্যে One-Way এবং Two-Way ANOVA সহ Tukey Post-Hoc টেস্ট রান করুন। পাইথনের ইন্ডাস্ট্রি-স্ট্যান্ডার্ড লাইব্রেরি দিয়ে ফলাফল তৈরি করা হয়।"
    },
    {
        icon: <BarChart3 className="w-6 h-6 text-green-500" />,
        title: "থিসিসের জন্য প্রস্তুত ফলাফল",
        description: "আপনার থিসিসে সরাসরি কপি-পেস্ট করার উপযোগী পরিষ্কার টেবিল, অটোমেটেড ইন্টারপ্রিটেশন এবং চমৎকার Boxplot পান।"
    },
    {
        icon: <FileSpreadsheet className="w-6 h-6 text-purple-500" />,
        title: "১০০% ডেটা প্রাইভেসি",
        description: "আপনার ডেটা কোথাও সেভ করা হয় না। শুধুমাত্র বিশ্লেষণের সময় এটি মেমোরিতে থাকে এবং ফলাফল তৈরির সাথে সাথেই সম্পূর্ণ মুছে ফেলা হয়।"
    }
];

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary mb-6">
                            <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                            থিসিস গবেষণার বিশ্বস্ত সঙ্গী
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-8 leading-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        স্ট্যাটিস্টিকস এখন একদম সহজ  <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                            আপনার রিসার্চ ডিফেন্সের জন্য
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        জটিল ও পুরানো সফটওয়্যার নিয়ে আর দুশ্চিন্তা নয়। আপনার ডেটা আপলোড করুন, ভ্যারিয়েবল সিলেক্ট করুন এবং কয়েক সেকেন্ডের মধ্যেই পেয়ে যান ভিজ্যুয়াল চার্ট সহ নির্ভুল ANOVA ফলাফল।
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-1"
                        >
                            এনালাইসিস শুরু করুন
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-black/5 border-t border-black/5 relative">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">থিসিসের জন্য প্রয়োজনীয় সবকিছু</h2>
                        <p className="text-muted-foreground font-medium w-full max-w-2xl mx-auto">
                            শিক্ষার্থী ও গবেষকদের জন্য তৈরি, যারা কোনো পূর্ব অভিজ্ঞতা ছাড়াই নিখুঁত স্ট্যাটিস্টিক্যাল এনালিসিস করতে চান।
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                className="bg-white rounded-2xl p-6 text-left border border-black/5 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                            >
                                <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center mb-6 border border-black/5">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
