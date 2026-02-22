'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bug,
    AlertTriangle,
    FileText,
    Link as LinkIcon,
    Mail,
    Send,
    Loader2,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BugReportPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [expandedSections, setExpandedSections] = useState<number[]>([0, 1, 2]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        steps: '',
        url: '',
        email: '',
    });

    const [charCount, setCharCount] = useState({ title: 0, description: 0, steps: 0 });

    const toggleSection = (index: number) => {
        setExpandedSections(prev =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setCharCount(prev => ({ ...prev, [name]: value.length }));
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const data = {
            title: formData.title,
            description: formData.description,
            steps: formData.steps,
            page_url: formData.url,
            email: formData.email,
        };

        try {
            const res = await fetch('/api/bug-reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({ error: 'Failed to submit bug report' }));
                throw new Error(errData.error || 'Failed to submit bug report');
            }

            setSuccess(true);
            setFormData({ title: '', description: '', steps: '', url: '', email: '' });
            setCharCount({ title: 0, description: 0, steps: 0 });
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-16 px-4">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-12 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                        >
                            <CheckCircle2 className="w-12 h-12 text-white" />
                        </motion.div>
                        <motion.h2
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold text-white mb-3"
                        >
                            Bug Report Submitted!
                        </motion.h2>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-400 mb-8 max-w-md mx-auto"
                        >
                            Thank you for helping us improve Komida. We will review your report and get back to you if needed.
                        </motion.p>
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            onClick={() => setSuccess(false)}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink--xl600 text-white rounded font-medium hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
                        >
                            Submit Another Report
                        </motion.button>
                    </motion.div>
                </div>
            </div>
        );
    }

    const sections = [
        { title: 'Title', icon: AlertTriangle, required: true, field: 'title', maxLength: 100, placeholder: 'Brief description of the bug' },
        { title: 'Description', icon: FileText, required: true, field: 'description', maxLength: 1000, placeholder: 'Detailed description of the bug. What happened?', isTextarea: true },
        { title: 'Steps to Reproduce', icon: Bug, required: true, field: 'steps', maxLength: 2000, placeholder: '1. Go to...\n2. Click on...\n3. See error', isTextarea: true },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] pt-28 pb-16 px-4">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center space-y-4"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30"
                    >
                        <Bug className="w-10 h-10 text-white" />
                    </motion.div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Report a Bug</h1>
                        <p className="text-gray-400 mt-2">
                            Found something wrong? Help us improve Komida by reporting it below.
                        </p>
                    </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-center gap-3"
                        >
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden"
                    >
                        {/* Dynamic Sections */}
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            const isExpanded = expandedSections.includes(index);
                            const value = formData[section.field as keyof typeof formData] as string;
                            const count = charCount[section.field as keyof typeof charCount] || 0;
                            const maxLength = section.maxLength || 100;

                            return (
                                <div key={section.field} className="border-b border-white/5 last:border-b-0">
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(index)}
                                        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                                <Icon className="w-4 h-4 text-purple-400" />
                                            </div>
                                            <div className="text-left">
                                                <span className="text-white font-medium">{section.title}</span>
                                                {section.required && <span className="text-red-400 ml-1">*</span>}
                                            </div>
                                        </div>
                                        {isExpanded ? (
                                            <ChevronUp className="w-5 h-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="w-5 h-5 text-gray-500" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 mt-3">
                                                    {section.isTextarea ? (
                                                        <textarea
                                                            name={section.field}
                                                            value={value}
                                                            onChange={handleInputChange}
                                                            required={section.required}
                                                            rows={4}
                                                            maxLength={maxLength}
                                                            placeholder={section.placeholder}
                                                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a0a0a] text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none transition-all"
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            name={section.field}
                                                            value={value}
                                                            onChange={handleInputChange}
                                                            required={section.required}
                                                            maxLength={maxLength}
                                                            placeholder={section.placeholder}
                                                            className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a0a0a] text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                                        />
                                                    )}
                                                    <div className="flex justify-end mt-2">
                                                        <span className={cn(
                                                            "text-xs",
                                                            count > maxLength * 0.9 ? "text-yellow-500" : "text-gray-600"
                                                        )}>
                                                            {count}/{maxLength}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}

                        {/* Optional Fields */}
                        <div className="p-5 bg-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <LinkIcon className="w-4 h-4" />
                                        Page URL (optional)
                                    </label>
                                    <input
                                        type="url"
                                        name="url"
                                        value={formData.url}
                                        onChange={handleInputChange}
                                        placeholder="https://komida.site/..."
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a0a0a] text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                                        <Mail className="w-4 h-4" />
                                        Email (optional)
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#0a0a0a] text-white placeholder:text-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    Submit Bug Report
                                </>
                            )}
                        </button>
                    </motion.div>

                    {/* Footer Note */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-sm text-gray-500 flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Thank you for helping us improve Komida!
                    </motion.p>
                </form>
            </div>
        </div>
    );
}
