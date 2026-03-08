import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Settings2, BarChart as BarChartIcon, AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || '';

type Step = 'upload' | 'configure' | 'results';

export default function Dashboard() {
    const [currentStep, setCurrentStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [columns, setColumns] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Configuration state
    const [testType, setTestType] = useState<'oneway' | 'twoway'>('oneway');
    const [dependentVar, setDependentVar] = useState<string>('');
    const [factorVar, setFactorVar] = useState<string>('');
    const [factorVar2, setFactorVar2] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
                toast.warning('ভুল ফাইল ফরম্যাট!', {
                    description: 'এই সিস্টেমটি শুধুমাত্র Excel (.xlsx) অথবা CSV (.csv) ডেটাসেট সমর্থন করে। দয়া করে সঠিক ফাইল আপলোড করুন।'
                });
                return;
            }
            setFile(selectedFile);
            await fetchColumns(selectedFile);
        }
    };

    const fetchColumns = async (selectedFile: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post(`${API_URL}/analyze/extract-columns`, formData);
            setColumns(response.data.columns);
            setCurrentStep('configure');
            toast.success('ডেটা এক্সট্র্যাক্ট সম্পূর্ণ!', {
                description: 'আপনার ফাইলের ভেরিয়েবলগুলো সফলভাবে লোড হয়েছে। এখন টেস্ট প্যারামিটার কনফিগার করুন।'
            });
        } catch (error) {
            console.error('Error fetching columns', error);
            toast.error('ডেটা এক্সট্র্যাক্ট করতে ব্যর্থ!', {
                description: 'ফাইল থেকে ভ্যারিয়েবল এক্সট্র্যাক্ট করা সম্ভব হচ্ছে না। অনুগ্রহ করে নিশ্চিত করুন যে ব্যাকএন্ড ইঞ্জিন 8122 পোর্টে সঠিকভাবে চলছে কিনা এবং ফাইলের ডেটা ফরম্যাট সঠিক আছে কিনা।'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAnalyze = async () => {
        if (!dependentVar || !factorVar || (testType === 'twoway' && !factorVar2)) {
            toast.warning('তথ্য অসম্পূর্ণ!', {
                description: 'অ্যানালাইসিস করার জন্য প্রয়োজনীয় সকল ডিপেন্ডেন্ট এবং ইন্ডিপেন্ডেন্ট ভ্যারিয়েবল সিলেক্ট করতে হবে।'
            });
            return;
        }

        setIsAnalyzing(true);
        const formData = new FormData();
        if (file) formData.append('file', file);
        formData.append('dependent', dependentVar);
        formData.append('factor', factorVar);
        if (testType === 'twoway') formData.append('factor2', factorVar2);

        try {
            const endpoint = testType === 'oneway' ? 'anova-oneway' : 'anova-twoway';
            const response = await axios.post(`${API_URL}/analyze/${endpoint}`, formData);
            setResults(response.data);
            setCurrentStep('results');
            toast.success('অ্যানালাইসিস সফল হয়েছে!', {
                description: 'আপনার টেস্টের ফলাফল তৈরি হয়ে গেছে। নিচে রিপোর্ট দেখতে পারেন।'
            });
        } catch (error: any) {
            console.error('Analysis failed', error);

            // Backend specific error handling
            let errorDesc = "অ্যানালাইসিস চলাকালীন একটি ইন্টারনাল ত্রুটি হয়েছে। অনুগ্রহ করে ডেটাসেট বা ব্যাকএন্ড চেক করুন।";
            const apiError = error.response?.data?.detail;

            if (apiError) {
                if (typeof apiError === 'string' && (apiError.includes("must be numeric") || apiError.includes("DV must be numeric"))) {
                    errorDesc = "ডিপেন্ডেন্ট ভ্যারিয়েবল (Dependent Variable) অবশ্যই সংখ্যাসূচক (Numeric) হতে হবে। কিন্তু আপনার ডেটাসেটে এটি অ্যালফাবেট বা টেক্সট হিসেবে রয়েছে। অনুগ্রহ করে একটি সঠিক সংখ্যামূলক কলাম নির্বাচন করুন।";
                } else if (Array.isArray(apiError) && apiError[0]?.msg?.includes("numeric")) {
                    errorDesc = "ডিপেন্ডেন্ট ভ্যারিয়েবল (Dependent Variable) অবশ্যই সংখ্যাসূচক (Numeric) হতে হবে। কিন্তু আপনার ডেটাসেটে এটি অ্যালফাবেট বা টেক্সট হিসেবে রয়েছে। অনুগ্রহ করে একটি সঠিক সংখ্যামূলক কলাম নির্বাচন করুন।";
                } else {
                    errorDesc = `পাইথন ইঞ্জিন এরর: ${typeof apiError === 'string' ? apiError : JSON.stringify(apiError)}`;
                }
            }

            toast.error('অ্যানালাইসিস ব্যর্থ হয়েছে!', {
                description: errorDesc,
                duration: 8000
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setFile(null);
        setColumns([]);
        setDependentVar('');
        setFactorVar('');
        setFactorVar2('');
        setResults(null);
        setCurrentStep('upload');
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl min-h-[calc(100vh-140px)] flex flex-col">
            {/* Stepper Header */}
            <div className="flex items-center justify-between mb-12 pb-6 border-b border-black/5 relative">
                <div className="flex gap-4 sm:gap-12 w-full max-w-3xl mx-auto">
                    {['ডেটা আপলোড', 'টেস্ট কনফিগার', 'ফলাফল দেখুন'].map((step, idx) => {
                        const stepStates = ['upload', 'configure', 'results'];
                        const stepIcons = [FileUp, Settings2, BarChartIcon];
                        const isActive = currentStep === stepStates[idx];
                        const isPast = stepStates.indexOf(currentStep) > idx;
                        const Icon = stepIcons[idx];

                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 z-10">
                                <div
                                    className={cn(
                                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 font-bold mb-3 shadow-sm border",
                                        isActive ? "bg-primary text-white scale-110 shadow-primary/30 border-primary" :
                                            isPast ? "bg-green-500 text-white border-green-500" : "bg-white text-muted-foreground border-black/10"
                                    )}
                                >
                                    {isPast ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn(
                                    "text-xs md:text-sm font-bold transition-colors text-center w-max uppercase tracking-wider",
                                    isActive ? "text-primary" : "text-muted-foreground"
                                )}>
                                    {step}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow flex flex-col justify-center mb-10">
                <AnimatePresence mode="wait">

                    {/* STEP 1: UPLOAD */}
                    {currentStep === 'upload' && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 md:p-16 text-center max-w-2xl mx-auto w-full border-dashed border-2 border-primary/40 hover:border-primary/60 transition-colors shadow-sm"
                        >
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <FileUp className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-3 tracking-tight">আপনার ডেটাসেট আপলোড করুন</h2>
                            <p className="text-muted-foreground mb-10 text-lg font-medium">
                                Excel (.xlsx) বা (.csv) ফরম্যাটে আপনার গবেষণার কাঁচা ডেটা আপলোড করুন। আমরা নিশ্চিত করি যে আপনার ডেটা সম্পূর্ণ নিরাপদ এবং ফলাফল তৈরি হওয়ার পর তা সার্ভার থেকে মুছে ফেলা হয়।
                            </p>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                className="hidden"
                                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            />

                            <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                            >
                                {isUploading ? (
                                    <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
                                ) : (
                                    <FileUp className="w-6 h-6 mr-3" />
                                )}
                                {isUploading ? 'ভ্যারিয়েবল এক্সট্র্যাক্ট করা হচ্ছে...' : 'ডিভাইস থেকে ফাইল নির্বাচন করুন'}
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: CONFIGURE */}
                    {currentStep === 'configure' && (
                        <motion.div
                            key="configure"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto w-full"
                        >
                            <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-black/5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-black/5">
                                    <div>
                                        <h2 className="text-2xl font-extrabold tracking-tight">টেস্ট প্যারামিটার কনফিগার করুন</h2>
                                        <p className="text-muted-foreground font-medium flex items-center mt-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                                            বর্তমান ডেটাসেট: <span className="text-foreground ml-1 font-bold">{file?.name || 'লোকাল টেস্টিং ডেটা'}</span>
                                        </p>
                                    </div>
                                    <button onClick={resetAnalysis} className="text-sm font-bold text-muted-foreground hover:text-black flex items-center transition-colors bg-black/5 px-4 py-2 rounded-lg">
                                        <RefreshCw className="w-4 h-4 mr-2" /> ফাইল পরিবর্তন করুন
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-10">
                                    {/* Test Type Selection */}
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold uppercase tracking-widest text-primary">১. হাইপোথিসিস টেস্ট নির্বাচন করুন</label>
                                        <div className="grid grid-cols-1 gap-4">
                                            <button
                                                onClick={() => setTestType('oneway')}
                                                className={cn(
                                                    "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                                                    testType === 'oneway'
                                                        ? "bg-primary/5 border-primary shadow-sm"
                                                        : "bg-white border-black/5 hover:border-black/10"
                                                )}
                                            >
                                                {testType === 'oneway' && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                                                <div className="font-extrabold text-lg mb-1 flex items-center justify-between">
                                                    One-Way ANOVA
                                                    {testType === 'oneway' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                                </div>
                                                <div className="text-sm text-muted-foreground font-medium">১টি ইন্ডিপেন্ডেন্ট ভ্যারিয়েবল গ্রুপের মধ্যে তুলনা করুন।</div>
                                            </button>
                                            <button
                                                onClick={() => setTestType('twoway')}
                                                className={cn(
                                                    "p-6 rounded-2xl border-2 text-left transition-all relative overflow-hidden",
                                                    testType === 'twoway'
                                                        ? "bg-primary/5 border-primary shadow-sm"
                                                        : "bg-white border-black/5 hover:border-black/10"
                                                )}
                                            >
                                                {testType === 'twoway' && <div className="absolute top-0 left-0 w-1 h-full bg-primary" />}
                                                <div className="font-extrabold text-lg mb-1 flex items-center justify-between">
                                                    Two-Way ANOVA
                                                    {testType === 'twoway' && <CheckCircle2 className="w-5 h-5 text-primary" />}
                                                </div>
                                                <div className="text-sm text-muted-foreground font-medium">২টি ইন্ডিপেন্ডেন্ট ভ্যারিয়েবল পর্যবেক্ষণ করে তুলনা করুন।</div>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Variables Selection */}
                                    <div className="space-y-6">
                                        <label className="text-xs font-bold uppercase tracking-widest text-primary">২. ডেটাসেট ভ্যারিয়েবল ম্যাপ করুন</label>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground">ডিপেন্ডেন্ট ভ্যারিয়েবল (ফলাফল)</label>
                                            <select
                                                className="w-full bg-white border-2 border-black/10 rounded-xl p-3.5 text-sm font-medium focus:ring-0 focus:border-primary outline-none transition-colors"
                                                value={dependentVar}
                                                onChange={(e) => setDependentVar(e.target.value)}
                                            >
                                                <option value="">কলাম থেকে ভ্যারিয়েবল নির্বাচন করুন...</option>
                                                {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-foreground">ফ্যাক্টর ১ (ইন্ডিপেন্ডেন্ট গ্রুপ)</label>
                                            <select
                                                className="w-full bg-white border-2 border-black/10 rounded-xl p-3.5 text-sm font-medium focus:ring-0 focus:border-primary outline-none transition-colors"
                                                value={factorVar}
                                                onChange={(e) => setFactorVar(e.target.value)}
                                            >
                                                <option value="">কলাম থেকে ভ্যারিয়েবল নির্বাচন করুন...</option>
                                                {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                            </select>
                                        </div>

                                        {testType === 'twoway' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="space-y-2"
                                            >
                                                <label className="text-sm font-bold text-foreground">ফ্যাক্টর ২ (দ্বিতীয় ইন্ডিপেন্ডেন্ট গ্রুপ)</label>
                                                <select
                                                    className="w-full bg-white border-2 border-black/10 rounded-xl p-3.5 text-sm font-medium focus:ring-0 focus:border-primary outline-none transition-colors"
                                                    value={factorVar2}
                                                    onChange={(e) => setFactorVar2(e.target.value)}
                                                >
                                                    <option value="">কলাম থেকে ভ্যারিয়েবল নির্বাচন করুন...</option>
                                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                </select>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-black/5 flex justify-end">
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="inline-flex items-center justify-center rounded-xl bg-primary px-10 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-1 disabled:opacity-50 disabled:pointer-events-none w-full sm:w-auto"
                                    >
                                        {isAnalyzing ? (
                                            <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                                        ) : (
                                            <Zap className="w-5 h-5 mr-3" />
                                        )}
                                        {isAnalyzing ? 'ম্যাট্রিক্স ক্যালকুলেট করা হচ্ছে...' : 'অ্যানালাইসিস শুরু করুন'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: RESULTS */}
                    {currentStep === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-5xl mx-auto w-full space-y-8"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-extrabold tracking-tight">অ্যানালাইসিস রিপোর্ট</h2>
                                    <p className="text-muted-foreground font-medium mt-1">একাডেমিক রিসার্চ সাইটেশনের জন্য বিশেষভাবে তৈরি।</p>
                                </div>
                                <button onClick={resetAnalysis} className="px-6 py-3 rounded-xl bg-white shadow-sm border border-black/5 hover:border-black/20 transition-all text-sm font-bold flex items-center justify-center">
                                    <RefreshCw className="w-4 h-4 mr-2" /> নতুন অ্যানালাইসিস শুরু করুন
                                </button>
                            </div>

                            {/* Automated Interpretation */}
                            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20 relative">
                                <AlertCircle className="w-32 h-32 absolute -top-4 -right-4 text-primary opacity-5 pointer-events-none" />
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-3 text-primary flex items-center">
                                    <CheckCircle2 className="w-5 h-5 mr-2" />
                                    অটোমেটেড থিসিস ইন্টারপ্রিটেশন
                                </h3>
                                <p className="text-lg leading-relaxed font-bold text-foreground relative z-10">
                                    {results?.interpretation}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                {/* ANOVA Table */}
                                <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-black/5 bg-black/[0.02]">
                                        <h3 className="font-bold text-foreground text-lg">স্ট্যাটিস্টিক্যাল সিগনিফিকেন্স টেবিল (ANOVA)</h3>
                                    </div>
                                    <div className="p-6 overflow-x-auto">
                                        <table className="w-full text-sm text-left border-collapse">
                                            <thead className="text-xs uppercase bg-black/5 text-muted-foreground rounded-lg">
                                                <tr>
                                                    <th className="px-5 py-4 font-bold rounded-tl-lg">ভ্যারিয়েন্স সোর্স</th>
                                                    <th className="px-5 py-4 font-bold">F-ভ্যালু</th>
                                                    <th className="px-5 py-4 font-bold rounded-tr-lg">P-ভ্যালু</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-black/5">
                                                    <td className="px-5 py-4 font-bold text-foreground">{factorVar || 'Condition'} (গ্রুপগুলোর মাঝে)</td>
                                                    <td className="px-5 py-4 font-mono font-medium">{results?.f_value?.toFixed(3)}</td>
                                                    <td className="px-5 py-4 font-mono font-bold text-primary">{results?.p_value?.toFixed(4)}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Plot Area */}
                                <div className="bg-white rounded-2xl border border-black/5 shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px] w-full">
                                    {results?.chart_data ? (
                                        <div className="w-full h-full min-h-[300px] flex flex-col">
                                            <h3 className="font-bold text-foreground text-lg mb-6 text-center">গ্রুপভিত্তিক গড় (Mean Plot)</h3>
                                            <div className="flex-grow w-full relative">
                                                <ResponsiveContainer width="100%" height={250}>
                                                    <RechartsBarChart data={results.chart_data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                        <XAxis
                                                            dataKey="name"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                                                            dy={10}
                                                        />
                                                        <YAxis
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: '#6B7280', fontSize: 13, fontWeight: 500 }}
                                                            dx={-10}
                                                        />
                                                        <Tooltip
                                                            cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                                                            contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 600, padding: '12px' }}
                                                            itemStyle={{ color: '#3B82F6', fontWeight: 700 }}
                                                        />
                                                        <Bar
                                                            dataKey="value"
                                                            name="গড় মান"
                                                            fill="url(#colorUv)"
                                                            radius={[6, 6, 0, 0]}
                                                            maxBarSize={60}
                                                            animationDuration={1500}
                                                        />
                                                        <defs>
                                                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                                                                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.8} />
                                                            </linearGradient>
                                                        </defs>
                                                    </RechartsBarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <BarChartIcon className="w-16 h-16 text-black/10 mb-6" />
                                            <p className="text-muted-foreground font-extrabold text-lg">ডেটা ভিজ্যুয়ালাইজেশন খুব শীঘ্রই আসছে</p>
                                            <p className="text-sm text-muted-foreground mt-2 px-8 text-center font-medium">পাইথন স্ট্যাটিস্টিক্স ব্যাকএন্ডের সাথে কানেক্ট করে এখানে চার্ট রেন্ডার করা হবে।</p>
                                        </>
                                    )}
                                </div>
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
