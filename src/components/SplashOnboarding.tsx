/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile } from '../types';
import { playClickChime } from '../utils/audio';
import { Key, User, Landmark, GraduationCap, ArrowRight, Info, Eye, EyeOff } from 'lucide-react';

interface SplashOnboardingProps {
  onComplete: (profile: StudentProfile) => void;
  initialProfile?: StudentProfile | null;
}

export default function SplashOnboarding({ onComplete, initialProfile }: SplashOnboardingProps) {
  const [step, setStep] = useState<'splash' | 'form'>('splash');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('1st Year');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Emerging Technologies", "Introduction to Economics", "General Biology", "Communicative English", "Moral and Civic Education"
  ]);
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  
  const subjectsList = [
    "Emerging Technologies",
    "Introduction to Economics",
    "General Biology",
    "Communicative English",
    "Moral and Civic Education"
  ];

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setUniversity(initialProfile.university);
      setYear(initialProfile.year);
      setSelectedSubjects(initialProfile.subjects);
      setClaudeApiKey(initialProfile.claudeApiKey);
    }
  }, [initialProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile: StudentProfile = {
      name: name.trim(),
      university: university.trim() || "Wolkite University",
      year,
      subjects: selectedSubjects,
      claudeApiKey: claudeApiKey.trim(),
      dailyGoalHours: 2,
      theme: 'dark',
      language: 'both'
    };
    playClickChime();
    onComplete(profile);
  };

  const toggleSubject = (subject: string) => {
    if (selectedSubjects.includes(subject)) {
      if (selectedSubjects.length > 1) {
        setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
      }
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0D0D0D] z-50 flex flex-col items-center justify-center overflow-y-auto px-4 py-8 select-none">
      <AnimatePresence mode="wait">
        {step === 'splash' ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-lg flex flex-col items-center"
          >
            {/* Highly detailed Lalibela Cross SVG (Intricate gold design) */}
            <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
              <div class="absolute inset-0 bg-[#C8962E]/10 rounded-full blur-xl"></div>
              <svg 
                className="w-32 h-32 text-[#C8962E] animate-slow-rotate" 
                viewBox="0 0 100 100" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2.5"
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                {/* Outer frame structure */}
                <path d="M50 5 L50 95 M5 50 L95 50" strokeWidth="3" />
                
                {/* Central lattice cross diamond shapes */}
                <rect x="42" y="42" width="16" height="16" rx="2" strokeWidth="2" fill="#161616" />
                <path d="M42 42 L58 58 M58 42 L42 58" />
                
                {/* Upper crown block */}
                <path d="M38 18 L62 18 L50 5 Z" fill="#161616" />
                <circle cx="50" cy="11" r="2" fill="#C8962E" />
                
                {/* Lower base stand representation */}
                <path d="M38 82 L62 82 L50 95 Z" fill="#161616" />
                <circle cx="50" cy="89" r="2" fill="#C8962E" />

                {/* Left wing detailing */}
                <path d="M18 38 L18 62 L5 50 Z" fill="#161616" />
                <circle cx="11" cy="50" r="2" fill="#C8962E" />

                {/* Right wing detailing */}
                <path d="M82 38 L82 62 L95 50 Z" fill="#161616" />
                <circle cx="89" cy="50" r="2" fill="#C8962E" />

                {/* Overlocking squares / decorative lines representing ancient carving */}
                <rect x="30" y="30" width="40" height="40" rx="4" />
                <rect x="35" y="35" width="30" height="30" rx="3" strokeDasharray="3 3" />
              </svg>
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-[#C8962E] mb-2"
            >
              ኢትዮ ለርን ፕሮ
            </motion.h1>
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-2xl md:text-3xl font-serif font-semibold text-[#F0EDE8] tracking-wide mb-3"
            >
              EthioLearn Pro
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg font-medium text-[#1A7A3C] tracking-widest mb-1 uppercase"
            >
              ተማር። አድግ። ብልጽግና
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-[#8A8480] text-sm tracking-wider mb-10"
            >
              Learn. Grow. Prosper. • Secondary & University Hub
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                playClickChime();
                setStep('form');
              }}
              className="px-8 py-3.5 bg-gradient-to-r from-[#C8962E] to-[#1A7A3C] text-[#0D0D0D] font-bold rounded-lg cursor-pointer tracking-wider flex items-center gap-3 shadow-lg shadow-[#C8962E]/10 border border-[#C8962E]/40"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl bg-[#161616] p-6 md:p-8 rounded-2xl border border-[#C8962E]/30 relative shadow-2xl shadow-[#000]/60"
          >
            {/* Mini logo inside onboarding */}
            <div className="flex items-center gap-3 mb-6 border-b border-[#C8962E]/10 pb-4">
              <div className="w-10 h-10 rounded-lg bg-[#C8962E]/10 flex items-center justify-center text-[#C8962E] font-serif font-bold text-2xl border border-[#C8962E]/20">
                ኤ
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F0EDE8]">Student Onboarding</h3>
                <p className="text-xs text-[#8A8480]">ኢትዮ ለርን ፕሮ • Custom Study Plan</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C8962E] flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abebe Kebede"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#C8962E] rounded-lg px-4 py-3 text-[#F0EDE8] outline-none text-sm transition-colors"
                />
              </div>

              {/* University / School */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C8962E] flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> University / High School
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wolkite University"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#C8962E] rounded-lg px-4 py-3 text-[#F0EDE8] outline-none text-sm transition-colors"
                />
              </div>

              {/* Year Select */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C8962E] flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Academic Year
                </label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#C8962E] rounded-lg px-3 py-3 text-[#F0EDE8] outline-none text-sm transition-colors appearance-none cursor-pointer"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Secondary">Preparatory Secondary</option>
                </select>
              </div>

              {/* Subject Tags Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C8962E]">
                  Enrolled Subjects (Required)
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjectsList.map((subject) => {
                    const selected = selectedSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className={`text-xs px-3 py-2 rounded-lg border font-medium cursor-pointer transition-all ${
                          selected
                            ? 'bg-[#C8962E]/10 border-[#C8962E] text-[#C8962E]'
                            : 'bg-[#0D0D0D] border-[#2A2A2A] text-[#8A8480] hover:text-[#F0EDE8]'
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* OpenRouter API Key input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#C8962E] flex items-center gap-2">
                    <Key className="w-4 h-4" /> OpenRouter API Key
                  </label>
                  <span className="text-[10px] text-zinc-500 hover:text-[#C8962E] flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline">Get key here</a>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="sk-or-..."
                    value={claudeApiKey}
                    onChange={(e) => setClaudeApiKey(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-[#2A2A2A] focus:border-[#C8962E] rounded-lg pl-4 pr-10 py-3 text-[#F0EDE8] outline-none text-sm font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#C8962E]"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Highly recommended for personalized tutoring, flashcard generation, and mock test design. Key is stored locally in your browser.
                </p>
              </div>

              {/* Form Submission */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-4.5 bg-gradient-to-r from-[#C8962E] to-[#1A7A3C] text-[#0D0D0D] font-bold rounded-lg cursor-pointer flex items-center justify-center gap-3 hover:opacity-95 shadow-lg shadow-[#1A7A3C]/10 transition-all border border-[#C8962E]/20"
                >
                  Enter EthioLearn Pro Campus <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
