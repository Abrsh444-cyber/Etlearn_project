/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile } from '../types';
import { playClickChime } from '../utils/audio';
import { Key, User, Landmark, GraduationCap, ArrowRight, Info, Eye, EyeOff } from 'lucide-react';
import EthioLearnLogo from './EthioLearnLogo';
import StudentAvatarSelector from './StudentAvatarSelector';

interface SplashOnboardingProps {
  onComplete: (profile: StudentProfile) => void;
  initialProfile?: StudentProfile | null;
}

export default function SplashOnboarding({ onComplete, initialProfile }: SplashOnboardingProps) {
  const [step, setStep] = useState<'splash' | 'form'>('splash');
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('1st Year');
  const [avatar, setAvatar] = useState('star');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Emerging Technologies", "Introduction to Economics", "General Biology", "Communicative English", "Moral and Civic Education"
  ]);
  const [claudeApiKey, setClaudeApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  // Generate dynamic, beautiful background stars to create a premium cinematic space
  const [starNodes] = useState(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 2.5 + 0.8,
      opacity: Math.random() * 0.7 + 0.3,
      duration: 15 + Math.random() * 25,
      delay: Math.random() * -20,
    }));
  });
  
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
      if (initialProfile.avatar) {
        setAvatar(initialProfile.avatar);
      }
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
      language: 'both',
      avatar
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
    <div className="fixed inset-0 bg-[#070707] z-50 flex flex-col items-center justify-center overflow-hidden px-4 select-none relative">
      
      {/* Dynamic Cinematic Motion Graphics Background Canvas */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black">
        {/* Floating star nodes with drifting cinematic loops */}
        {starNodes.map((star) => (
          <motion.div
            key={star.id}
            initial={{ 
              x: `${star.left}%`, 
              y: `${star.top}%`, 
              opacity: 0,
              scale: 0.5 
            }}
            animate={{ 
              y: [`${star.top}%`, `${(star.top + 8) % 100}%`, `${star.top}%`],
              opacity: [star.opacity * 0.4, star.opacity, star.opacity * 0.4],
              scale: [0.8, 1.25, 0.8]
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: star.delay
            }}
            style={{
              position: 'absolute',
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: star.id % 3 === 0 ? '#C8962E' : star.id % 3 === 1 ? '#1D4ED8' : '#e4e4e7',
              borderRadius: '50%',
              boxShadow: star.size > 2 ? `0 0 8px 1px ${star.id % 3 === 0 ? '#C8962E' : '#FFECA7'}` : 'none'
            }}
          />
        ))}

        {/* Ambient Pulsing Aura Orbs */}
        <motion.div 
          animate={{
            scale: [1, 1.15, 0.9, 1],
            opacity: [0.12, 0.22, 0.12],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-[380px] h-[380px] rounded-full bg-emerald-950/20 blur-[130px]"
        />
        <motion.div 
          animate={{
            scale: [1.1, 0.9, 1.15, 1.1],
            opacity: [0.1, 0.18, 0.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[425px] h-[425px] rounded-full bg-amber-950/20 blur-[140px]"
        />

        {/* Traditional Geometric Habesha Bands with modern neon-wireframe style */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-[#C8962E]/30 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />
        
        {/* Subtle geometric wireframe side guidelines */}
        <div className="absolute left-6 inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-800/25 to-transparent hidden lg:block" />
        <div className="absolute right-6 inset-y-0 w-[1px] bg-gradient-to-b from-transparent via-zinc-800/25 to-transparent hidden lg:block" />
      </div>

      <AnimatePresence mode="wait">
        {step === 'splash' ? (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-lg flex flex-col items-center relative z-10 w-full"
          >
            {/* Logo Stage Container with dual rotating astronomical design rings */}
            <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
              
              {/* Complex Orbital Graphics */}
              {/* Outer Counter-Rotating Segmented Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 42, ease: "linear" }}
                className="absolute inset-0 rounded-full border border-dashed border-[#C8962E]/10"
              />
              {/* Inner Fast Drifting Compass Segment */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
                className="absolute inset-4 rounded-full border border-dashed border-emerald-500/15"
              />

              {/* Glowing anchor dots moving on orbital rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                className="absolute inset-2 flex items-start justify-center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#C8962E] shadow-[0_0_10px_2px_#C8962E]" />
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
                className="absolute inset-6 flex items-end justify-center"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_#10B981]" />
              </motion.div>
              
              {/* Holographic central aura */}
              <motion.div 
                animate={{
                  scale: [0.92, 1.08, 0.92],
                  opacity: [0.15, 0.3, 0.15]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-10 rounded-full bg-gradient-to-br from-[#C8962E] via-red-600 to-emerald-500 blur-2xl opacity-20"
              />

              {/* Interactive Hover-Reactive Logo Frame */}
              <motion.div
                whileHover={{ 
                  scale: 1.08, 
                  rotate: [0, -3, 3, 0],
                  transition: { duration: 0.6 }
                }}
                initial={{ scale: 0.85, rotate: -3 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="relative z-10 p-4 rounded-3xl bg-black/40 border border-white/5 backdrop-blur-md shadow-2xl"
              >
                <EthioLearnLogo size={132} showCardBackground={false} />
              </motion.div>
            </div>

            {/* Cinematic Staggered Titles */}
            <div className="space-y-4 mb-10">
              <motion.h1 
                initial={{ opacity: 0, y: 20, letterSpacing: "0.15em" }}
                animate={{ opacity: 1, y: 0, letterSpacing: "0.05em" }}
                transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="font-serif text-5xl md:text-6xl font-black text-[#C8962E]"
                style={{ textShadow: "0 0 20px rgba(200, 150, 46, 0.22)" }}
              >
                ኢትዮ ለርን ፕሮ
              </motion.h1>
              
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="text-2xl md:text-3xl font-serif font-semibold text-[#F0EDE8] tracking-widest uppercase"
              >
                EthioLearn Pro
              </motion.h2>

              <div className="flex items-center justify-center gap-3 w-40 mx-auto">
                <div className="h-[1px] bg-gradient-to-r from-transparent to-[#C8962E]/40 flex-1" />
                <motion.div 
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-1.5 h-1.5 rounded-full bg-[#C8962E]" 
                />
                <div className="h-[1px] bg-gradient-to-l from-transparent to-emerald-500/40 flex-1" />
              </div>

              <div className="space-y-1">
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.95 }}
                  transition={{ duration: 0.8, delay: 0.55 }}
                  className="text-sm font-semibold text-emerald-400 tracking-[0.25em] uppercase"
                >
                  ተማር • አድግ • ብልጽግና
                </motion.p>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                  className="text-[#8A8480] text-xs font-mono tracking-widest uppercase flex items-center justify-center gap-1"
                >
                  Learn. Grow. Prosper. <span className="text-[#C8962E]">•</span> Secondary & Uni Hub
                </motion.p>
              </div>
            </div>

            {/* Ultra-Premium Glow Sweep Shimmer Action Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="relative group cursor-pointer"
            >
              {/* Outer Pulsing Glow Border effect */}
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-[#C8962E] via-amber-600 to-emerald-600 opacity-60 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300 animate-pulse" />
              
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  playClickChime();
                  setStep('form');
                }}
                className="relative px-12 py-4 bg-black border border-zinc-700/60 text-zinc-100 font-bold rounded-xl cursor-pointer tracking-[0.12em] flex items-center gap-3 overflow-hidden shadow-2xl transition-colors duration-300 group-hover:border-[#C8962E]/70 group-hover:text-white uppercase text-xs"
              >
                {/* Laser Sweep Shimmer Effect */}
                <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden rounded-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8962E]/20 to-transparent w-full h-full -translate-x-full shimmer-sweep-animation" />
                </div>
                
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4 text-[#C8962E] group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>
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
              <EthioLearnLogo size={42} />
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

              {/* Student Profile Picture Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#C8962E]">
                  Choose Profile Picture
                </label>
                <StudentAvatarSelector
                  currentAvatar={avatar}
                  name={name || 'Student'}
                  onChange={setAvatar}
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

              {/* OpenRouter or Groq API Key input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#C8962E] flex items-center gap-2">
                    <Key className="w-4 h-4" /> OpenRouter or Groq API Key
                  </label>
                  <span className="text-[10px] text-zinc-500 hover:text-[#C8962E] flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="underline">OpenRouter</a>
                    </span>
                    <span>|</span>
                    <span className="flex items-center gap-1">
                      <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="underline">Groq Console</a>
                    </span>
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="sk-or-... or gsk_..."
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
                  Optional. Leave blank to use our built-in high-performance server-side AI! Supports custom OpenRouter, Gemini (<code className="font-mono text-zinc-400">AIzaSy...</code>), or Groq (<code className="font-mono text-zinc-400">gsk_...</code>) keys if you want to use your own limits.
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
