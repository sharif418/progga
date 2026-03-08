import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Settings2, BarChart as BarChartIcon, AlertCircle, CheckCircle2, RefreshCw, Zap, Table2, GitCompare, Layers, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

/// <reference types="vite/client" />
const API_URL = import.meta.env.VITE_API_URL || '';

type Step = 'upload' | 'configure' | 'results';
type TestType = 'descriptive' | 'oneway' | 'twoway' | 'tukey' | 'dmrt' | 'cluster';

const CHART_COLORS = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#F97316'];

const TEST_OPTIONS: { id: TestType; name: string; desc: string; icon: React.ReactNode; needsFactor2: boolean; needsMultiVar: boolean }[] = [
    { id: 'descriptive', name: 'Descriptive Statistics', desc: 'গড়, মধ্যমা, আদর্শ বিচ্যুতি সহ বর্ণনামূলক পরিসংখ্যান।', icon: <Table2 className="w-5 h-5" />, needsFactor2: false, needsMultiVar: false },
    { id: 'oneway', name: 'One-Way ANOVA', desc: '১টি ইন্ডিপেন্ডেন্ট ভ্যারিয়েবল গ্রুপের মধ্যে তুলনা।', icon: <BarChartIcon className="w-5 h-5" />, needsFactor2: false, needsMultiVar: false },
    { id: 'twoway', name: 'Two-Way ANOVA', desc: '২টি ইন্ডিপেন্ডেন্ট ভ্যারিয়েবল পর্যবেক্ষণ।', icon: <BarChartIcon className="w-5 h-5" />, needsFactor2: true, needsMultiVar: false },
    { id: 'tukey', name: 'Tukey HSD Post-Hoc', desc: 'কোন গ্রুপগুলোর মধ্যে পার্থক্য সেটা চিহ্নিত করুন।', icon: <GitCompare className="w-5 h-5" />, needsFactor2: false, needsMultiVar: false },
    { id: 'dmrt', name: 'DMRT (Duncan)', desc: 'Duncan Multiple Range Test — কৃষি গবেষণায় প্রচলিত।', icon: <GitCompare className="w-5 h-5" />, needsFactor2: false, needsMultiVar: false },
    { id: 'cluster', name: 'Cluster Analysis', desc: 'K-Means ক্লাস্টারিং দিয়ে ডেটা গ্রুপিং।', icon: <Layers className="w-5 h-5" />, needsFactor2: false, needsMultiVar: true },
];

export default function Dashboard() {
    const [currentStep, setCurrentStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [columns, setColumns] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Configuration state
    const [testType, setTestType] = useState<TestType>('descriptive');
    const [dependentVar, setDependentVar] = useState<string>('');
    const [factorVar, setFactorVar] = useState<string>('');
    const [factorVar2, setFactorVar2] = useState<string>('');
    const [clusterVars, setClusterVars] = useState<string[]>([]);
    const [nClusters, setNClusters] = useState<number>(3);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<any>(null);

    const currentTest = TEST_OPTIONS.find(t => t.id === testType)!;

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
                toast.warning('ভুল ফাইল ফরম্যাট!', { description: 'এই সিস্টেমটি শুধুমাত্র Excel (.xlsx) অথবা CSV (.csv) ডেটাসেট সমর্থন করে।' });
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
            toast.success('ডেটা এক্সট্র্যাক্ট সম্পূর্ণ!', { description: 'আপনার ফাইলের ভেরিয়েবলগুলো সফলভাবে লোড হয়েছে।' });
        } catch (error) {
            toast.error('ডেটা এক্সট্র্যাক্ট করতে ব্যর্থ!', { description: 'ব্যাকএন্ড ইঞ্জিন চলছে কিনা এবং ফাইলের ফরম্যাট সঠিক কিনা নিশ্চিত করুন।' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleAnalyze = async () => {
        if (testType === 'cluster') {
            if (clusterVars.length < 2) {
                toast.warning('তথ্য অসম্পূর্ণ!', { description: 'Cluster Analysis এর জন্য কমপক্ষে ২টি সংখ্যাসূচক ভ্যারিয়েবল সিলেক্ট করুন।' });
                return;
            }
        } else {
            if (!dependentVar || (!currentTest.needsMultiVar && !factorVar && testType !== 'descriptive')) {
                toast.warning('তথ্য অসম্পূর্ণ!', { description: 'প্রয়োজনীয় সকল ভ্যারিয়েবল সিলেক্ট করুন।' });
                return;
            }
            if (currentTest.needsFactor2 && !factorVar2) {
                toast.warning('তথ্য অসম্পূর্ণ!', { description: 'Two-Way ANOVA-এর জন্য দ্বিতীয় ফ্যাক্টর ভ্যারিয়েবল সিলেক্ট করুন।' });
                return;
            }
        }

        setIsAnalyzing(true);
        const formData = new FormData();
        if (file) formData.append('file', file);

        let endpoint = '';
        if (testType === 'descriptive') {
            endpoint = 'descriptive';
            formData.append('dependent', dependentVar);
            if (factorVar) formData.append('factor', factorVar);
        } else if (testType === 'oneway') {
            endpoint = 'anova-oneway';
            formData.append('dependent', dependentVar);
            formData.append('factor', factorVar);
        } else if (testType === 'twoway') {
            endpoint = 'anova-twoway';
            formData.append('dependent', dependentVar);
            formData.append('factor', factorVar);
            formData.append('factor2', factorVar2);
        } else if (testType === 'tukey') {
            endpoint = 'tukey';
            formData.append('dependent', dependentVar);
            formData.append('factor', factorVar);
        } else if (testType === 'dmrt') {
            endpoint = 'dmrt';
            formData.append('dependent', dependentVar);
            formData.append('factor', factorVar);
        } else if (testType === 'cluster') {
            endpoint = 'cluster';
            formData.append('variables', clusterVars.join(','));
            formData.append('n_clusters', nClusters.toString());
        }

        try {
            const response = await axios.post(`${API_URL}/analyze/${endpoint}`, formData);
            setResults({ ...response.data, testType });
            setCurrentStep('results');
            toast.success('অ্যানালাইসিস সফল হয়েছে!', { description: 'আপনার ফলাফল তৈরি হয়ে গেছে।' });
        } catch (error: any) {
            const apiError = error.response?.data?.detail;
            let errorDesc = "অ্যানালাইসিস চলাকালীন একটি ত্রুটি হয়েছে।";
            if (apiError) {
                if (typeof apiError === 'string' && apiError.includes("Numeric")) {
                    errorDesc = "ডিপেন্ডেন্ট ভ্যারিয়েবল অবশ্যই সংখ্যাসূচক (Numeric) হতে হবে। অনুগ্রহ করে সঠিক কলাম নির্বাচন করুন।";
                } else {
                    errorDesc = typeof apiError === 'string' ? apiError : JSON.stringify(apiError);
                }
            }
            toast.error('অ্যানালাইসিস ব্যর্থ!', { description: errorDesc, duration: 8000 });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const resetAnalysis = () => {
        setFile(null); setColumns([]); setDependentVar(''); setFactorVar(''); setFactorVar2('');
        setClusterVars([]); setResults(null); setCurrentStep('upload');
    };

    const toggleClusterVar = (col: string) => {
        setClusterVars(prev => prev.includes(col) ? prev.filter(v => v !== col) : [...prev, col]);
    };

    // ===== RENDER RESULT TABLES =====
    const renderResultContent = () => {
        if (!results) return null;
        const rt = results.testType;

        // Descriptive Stats Table
        if (rt === 'descriptive' && results.table_data) {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="text-xs uppercase bg-black/5 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold">গ্রুপ</th>
                                <th className="px-4 py-3 text-right font-bold">N</th>
                                <th className="px-4 py-3 text-right font-bold">গড়</th>
                                <th className="px-4 py-3 text-right font-bold">মধ্যমা</th>
                                <th className="px-4 py-3 text-right font-bold">Std Dev</th>
                                <th className="px-4 py-3 text-right font-bold">Min</th>
                                <th className="px-4 py-3 text-right font-bold">Max</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.table_data.map((row: any, i: number) => (
                                <tr key={i} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                                    <td className="px-4 py-3 font-bold">{row.group}</td>
                                    <td className="px-4 py-3 text-right font-mono">{row.count}</td>
                                    <td className="px-4 py-3 text-right font-mono font-medium">{row.mean}</td>
                                    <td className="px-4 py-3 text-right font-mono">{row.median}</td>
                                    <td className="px-4 py-3 text-right font-mono">{row.std}</td>
                                    <td className="px-4 py-3 text-right font-mono">{row.min}</td>
                                    <td className="px-4 py-3 text-right font-mono">{row.max}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // ANOVA Table
        if ((rt === 'oneway' || rt === 'twoway') && results.f_value !== undefined) {
            return (
                <table className="w-full text-sm border-collapse">
                    <thead className="text-xs uppercase bg-black/5 text-muted-foreground">
                        <tr>
                            <th className="px-5 py-4 text-left font-bold">ভ্যারিয়েন্স সোর্স</th>
                            <th className="px-5 py-4 text-right font-bold">F-ভ্যালু</th>
                            <th className="px-5 py-4 text-right font-bold">P-ভ্যালু</th>
                            <th className="px-5 py-4 text-right font-bold">সিদ্ধান্ত</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-b border-black/5">
                            <td className="px-5 py-4 font-bold">{factorVar || 'Factor'} (গ্রুপগুলোর মাঝে)</td>
                            <td className="px-5 py-4 text-right font-mono font-medium">{results.f_value?.toFixed(3)}</td>
                            <td className={cn("px-5 py-4 text-right font-mono font-bold", results.p_value < 0.05 ? "text-green-600" : "text-amber-600")}>{results.p_value?.toFixed(4)}</td>
                            <td className="px-5 py-4 text-right">
                                <span className={cn("px-3 py-1 rounded-full text-xs font-bold", results.p_value < 0.05 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
                                    {results.p_value < 0.05 ? "সার্থক" : "অসার্থক"}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            );
        }

        // Tukey Table
        if (rt === 'tukey' && results.comparisons) {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="text-xs uppercase bg-black/5 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold">গ্রুপ A</th>
                                <th className="px-4 py-3 text-left font-bold">গ্রুপ B</th>
                                <th className="px-4 py-3 text-right font-bold">গড় পার্থক্য</th>
                                <th className="px-4 py-3 text-right font-bold">P-ভ্যালু</th>
                                <th className="px-4 py-3 text-right font-bold">সিদ্ধান্ত</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.comparisons.map((c: any, i: number) => (
                                <tr key={i} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                                    <td className="px-4 py-3 font-bold">{c.group_a}</td>
                                    <td className="px-4 py-3 font-bold">{c.group_b}</td>
                                    <td className="px-4 py-3 text-right font-mono">{c.mean_diff}</td>
                                    <td className={cn("px-4 py-3 text-right font-mono font-bold", c.significant ? "text-green-600" : "text-muted-foreground")}>{c.p_value}</td>
                                    <td className="px-4 py-3 text-right">
                                        <span className={cn("px-3 py-1 rounded-full text-xs font-bold", c.significant ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                                            {c.significant ? "সার্থক" : "অসার্থক"}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // DMRT Table
        if (rt === 'dmrt' && results.ranking) {
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="text-xs uppercase bg-black/5 text-muted-foreground">
                            <tr>
                                <th className="px-5 py-3 text-left font-bold">র‍্যাঙ্ক</th>
                                <th className="px-5 py-3 text-left font-bold">গ্রুপ</th>
                                <th className="px-5 py-3 text-right font-bold">গড় মান</th>
                                <th className="px-5 py-3 text-center font-bold">গ্রুপিং অক্ষর</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.ranking.map((r: any, i: number) => (
                                <tr key={i} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                                    <td className="px-5 py-3 font-mono text-muted-foreground">{i + 1}</td>
                                    <td className="px-5 py-3 font-bold">{r.group}</td>
                                    <td className="px-5 py-3 text-right font-mono font-medium">{r.mean}</td>
                                    <td className="px-5 py-3 text-center">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-lg">{r.letter}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }

        // Cluster Table
        if (rt === 'cluster' && results.cluster_summary) {
            const vars = results.variables || [];
            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="text-xs uppercase bg-black/5 text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold">ক্লাস্টার</th>
                                <th className="px-4 py-3 text-right font-bold">সদস্য সংখ্যা</th>
                                {vars.map((v: string) => (<th key={v} className="px-4 py-3 text-right font-bold">{v} (গড়)</th>))}
                            </tr>
                        </thead>
                        <tbody>
                            {results.cluster_summary.map((c: any, i: number) => (
                                <tr key={i} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                                    <td className="px-4 py-3 font-bold flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                        {c.cluster}
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono font-bold">{c.count}</td>
                                    {vars.map((v: string) => (<td key={v} className="px-4 py-3 text-right font-mono">{c[`${v}_mean`]}</td>))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl min-h-[calc(100vh-140px)] flex flex-col">
            {/* Stepper */}
            <div className="flex items-center justify-between mb-10 pb-6 border-b border-black/5">
                <div className="flex gap-4 sm:gap-12 w-full max-w-3xl mx-auto">
                    {['ডেটা আপলোড', 'টেস্ট কনফিগার', 'ফলাফল দেখুন'].map((step, idx) => {
                        const stepStates = ['upload', 'configure', 'results'];
                        const stepIcons = [FileUp, Settings2, BarChartIcon];
                        const isActive = currentStep === stepStates[idx];
                        const isPast = stepStates.indexOf(currentStep) > idx;
                        const Icon = stepIcons[idx];
                        return (
                            <div key={idx} className="flex flex-col items-center flex-1 z-10">
                                <div className={cn("w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 font-bold mb-3 shadow-sm border", isActive ? "bg-primary text-white scale-110 shadow-primary/30 border-primary" : isPast ? "bg-green-500 text-white border-green-500" : "bg-white text-muted-foreground border-black/10")}>
                                    {isPast ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-5 h-5" />}
                                </div>
                                <span className={cn("text-xs md:text-sm font-bold transition-colors text-center uppercase tracking-wider", isActive ? "text-primary" : "text-muted-foreground")}>{step}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col justify-center mb-10">
                <AnimatePresence mode="wait">

                    {/* STEP 1: UPLOAD */}
                    {currentStep === 'upload' && (
                        <motion.div key="upload" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 md:p-16 text-center max-w-2xl mx-auto w-full border-dashed border-2 border-primary/40 hover:border-primary/60 transition-colors shadow-sm">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <FileUp className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-3xl font-extrabold mb-3 tracking-tight">আপনার ডেটাসেট আপলোড করুন</h2>
                            <p className="text-muted-foreground mb-10 text-lg font-medium">Excel (.xlsx) বা CSV (.csv) ফরম্যাটে আপনার গবেষণার কাঁচা ডেটা আপলোড করুন।</p>
                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".csv, .xlsx, .xls" />
                            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-1 disabled:opacity-50 w-full sm:w-auto">
                                {isUploading ? <RefreshCw className="w-6 h-6 mr-3 animate-spin" /> : <FileUp className="w-6 h-6 mr-3" />}
                                {isUploading ? 'ভ্যারিয়েবল এক্সট্র্যাক্ট করা হচ্ছে...' : 'ডিভাইস থেকে ফাইল নির্বাচন করুন'}
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: CONFIGURE */}
                    {currentStep === 'configure' && (
                        <motion.div key="configure" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-5xl mx-auto w-full">
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-black/5">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-black/5">
                                    <div>
                                        <h2 className="text-2xl font-extrabold tracking-tight">টেস্ট কনফিগার করুন</h2>
                                        <p className="text-muted-foreground font-medium flex items-center mt-1.5">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                                            ডেটাসেট: <span className="text-foreground ml-1 font-bold">{file?.name}</span>
                                        </p>
                                    </div>
                                    <button onClick={resetAnalysis} className="text-sm font-bold text-muted-foreground hover:text-black flex items-center transition-colors bg-black/5 px-4 py-2 rounded-lg">
                                        <RefreshCw className="w-4 h-4 mr-2" /> ফাইল পরিবর্তন
                                    </button>
                                </div>

                                {/* Test Type Grid */}
                                <div className="mb-6">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary mb-3 block">১. স্ট্যাটিস্টিক্যাল টেস্ট নির্বাচন করুন</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {TEST_OPTIONS.map(test => (
                                            <button key={test.id} onClick={() => setTestType(test.id)}
                                                className={cn("p-4 rounded-xl border-2 text-left transition-all relative group", testType === test.id ? "bg-primary/5 border-primary shadow-sm" : "bg-white border-black/5 hover:border-black/15")}>
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={cn("transition-colors", testType === test.id ? "text-primary" : "text-muted-foreground")}>{test.icon}</span>
                                                    <span className="font-bold text-sm">{test.name}</span>
                                                    {testType === test.id && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">{test.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Variable Selection */}
                                <div className="border-t border-black/5 pt-6">
                                    <label className="text-xs font-bold uppercase tracking-widest text-primary mb-4 block">২. ভ্যারিয়েবল ম্যাপিং</label>

                                    {testType === 'cluster' ? (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-bold text-foreground mb-2 block">সংখ্যাসূচক ভ্যারিয়েবল সিলেক্ট করুন (কমপক্ষে ২টি)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {columns.map(col => (
                                                        <button key={col} onClick={() => toggleClusterVar(col)}
                                                            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all", clusterVars.includes(col) ? "bg-primary text-white border-primary" : "bg-white border-black/10 hover:border-primary/30")}>
                                                            {col}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-bold text-foreground mb-1 block">ক্লাস্টার সংখ্যা (K)</label>
                                                <input type="number" min={2} max={10} value={nClusters} onChange={e => setNClusters(parseInt(e.target.value) || 3)}
                                                    className="w-32 bg-white border-2 border-black/10 rounded-xl p-3 text-sm font-medium focus:ring-0 focus:border-primary outline-none" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-foreground">ডিপেন্ডেন্ট ভ্যারিয়েবল (ফলাফল)</label>
                                                <select className="w-full bg-white border-2 border-black/10 rounded-xl p-3 text-sm font-medium focus:ring-0 focus:border-primary outline-none transition-colors" value={dependentVar} onChange={e => setDependentVar(e.target.value)}>
                                                    <option value="">ভ্যারিয়েবল নির্বাচন করুন...</option>
                                                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                </select>
                                            </div>
                                            {testType !== 'descriptive' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-foreground">ফ্যাক্টর (ইন্ডিপেন্ডেন্ট গ্রুপ)</label>
                                                    <select className="w-full bg-white border-2 border-black/10 rounded-xl p-3 text-sm font-medium focus:ring-0 focus:border-primary outline-none transition-colors" value={factorVar} onChange={e => setFactorVar(e.target.value)}>
                                                        <option value="">ভ্যারিয়েবল নির্বাচন করুন...</option>
                                                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            {testType === 'descriptive' && (
                                                <div className="space-y-2">
                                                    <label className="text-sm font-bold text-foreground">গ্রুপিং ফ্যাক্টর (ঐচ্ছিক)</label>
                                                    <select className="w-full bg-white border-2 border-black/10 rounded-xl p-3 text-sm font-medium focus:ring-0 focus:border-primary outline-none transition-colors" value={factorVar} onChange={e => setFactorVar(e.target.value)}>
                                                        <option value="">ফ্যাক্টর ছাড়া (সম্পূর্ণ ডেটা)...</option>
                                                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            {currentTest.needsFactor2 && (
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm font-bold text-foreground">ফ্যাক্টর ২ (দ্বিতীয় ইন্ডিপেন্ডেন্ট গ্রুপ)</label>
                                                    <select className="w-full bg-white border-2 border-black/10 rounded-xl p-3 text-sm font-medium focus:ring-0 focus:border-primary outline-none transition-colors" value={factorVar2} onChange={e => setFactorVar2(e.target.value)}>
                                                        <option value="">ভ্যারিয়েবল নির্বাচন করুন...</option>
                                                        {columns.map(col => <option key={col} value={col}>{col}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Analyze Button */}
                                <div className="mt-8 pt-6 border-t border-black/5 flex justify-end">
                                    <button onClick={handleAnalyze} disabled={isAnalyzing}
                                        className="inline-flex items-center justify-center rounded-xl bg-primary px-10 py-4 text-base font-bold text-white shadow-xl shadow-primary/30 transition-all hover:bg-primary/90 hover:-translate-y-1 disabled:opacity-50 w-full sm:w-auto">
                                        {isAnalyzing ? <RefreshCw className="w-5 h-5 mr-3 animate-spin" /> : <Zap className="w-5 h-5 mr-3" />}
                                        {isAnalyzing ? 'ক্যালকুলেট করা হচ্ছে...' : 'অ্যানালাইসিস শুরু করুন'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: RESULTS */}
                    {currentStep === 'results' && (
                        <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto w-full space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-extrabold tracking-tight">অ্যানালাইসিস রিপোর্ট</h2>
                                    <p className="text-muted-foreground font-medium mt-1">
                                        {TEST_OPTIONS.find(t => t.id === results?.testType)?.name} — একাডেমিক রিসার্চের জন্য তৈরি।
                                    </p>
                                </div>
                                <button onClick={resetAnalysis} className="px-6 py-3 rounded-xl bg-white shadow-sm border border-black/5 hover:border-black/20 transition-all text-sm font-bold flex items-center">
                                    <RefreshCw className="w-4 h-4 mr-2" /> নতুন অ্যানালাইসিস
                                </button>
                            </div>

                            {/* Interpretation */}
                            <div className="bg-primary/5 rounded-2xl p-6 md:p-8 border border-primary/20 relative overflow-hidden">
                                <AlertCircle className="w-32 h-32 absolute -top-4 -right-4 text-primary opacity-5 pointer-events-none" />
                                <h3 className="text-sm font-bold uppercase tracking-widest mb-3 text-primary flex items-center">
                                    <CheckCircle2 className="w-5 h-5 mr-2" /> অটোমেটেড ইন্টারপ্রিটেশন
                                </h3>
                                <p className="text-base leading-relaxed font-bold text-foreground relative z-10">{results?.interpretation}</p>
                            </div>

                            <div className="grid lg:grid-cols-5 gap-6">
                                {/* Data Table */}
                                <div className="lg:col-span-3 bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
                                    <div className="p-5 border-b border-black/5 bg-black/[0.02]">
                                        <h3 className="font-bold text-foreground text-lg">{TEST_OPTIONS.find(t => t.id === results?.testType)?.name} টেবিল</h3>
                                    </div>
                                    <div className="p-4">{renderResultContent()}</div>
                                </div>

                                {/* Chart */}
                                <div className="lg:col-span-2 bg-white rounded-2xl border border-black/5 shadow-sm p-5 flex flex-col items-center justify-center min-h-[300px]">
                                    {results?.chart_data ? (
                                        <div className="w-full flex flex-col">
                                            <h3 className="font-bold text-foreground text-base mb-4 text-center">গ্রুপভিত্তিক তুলনা</h3>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <RechartsBarChart data={results.chart_data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} dy={10} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 11, fontWeight: 500 }} dx={-5} />
                                                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.03)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600, padding: '10px' }} />
                                                    <Bar dataKey="value" name="মান" radius={[6, 6, 0, 0]} maxBarSize={50} animationDuration={1500}>
                                                        {results.chart_data.map((_: any, i: number) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                                                    </Bar>
                                                </RechartsBarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    ) : (
                                        <>
                                            <BarChartIcon className="w-16 h-16 text-black/10 mb-4" />
                                            <p className="text-muted-foreground font-bold text-sm">চার্ট ডেটা পাওয়া যায়নি</p>
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
