/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { StudentProfile } from '../types';
import { playClickChime, playSuccessChime, playFailureChime } from '../utils/audio';
import { 
  Key, User, Landmark, GraduationCap, ArrowRight, Info, Eye, EyeOff, 
  Mail, Lock, LogIn, UserPlus, ArrowLeft, ShieldAlert, CheckCircle 
} from 'lucide-react';
import EthioLearnLogo from './EthioLearnLogo';
import StudentAvatarSelector from './StudentAvatarSelector';
import StudentAvatar from './StudentAvatar';

interface SplashOnboardingProps {
  onComplete: (profile: StudentProfile) => void;
  initialProfile?: StudentProfile | null;
}

interface AccountInfo {
  email: string;
  passwordEncrypted: string; // Plain password for prototype/localStorage authenticity
  rememberMe: boolean;
  profile: StudentProfile;
}

export default function SplashOnboarding({ onComplete, initialProfile }: SplashOnboardingProps) {
  // Mode switcher: 'splash' | 'signin' | 'signup'
  const [mode, setMode] = useState<'splash' | 'signin' | 'signup'>('splash');
  
  // Registration and Authentication inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [year, setYear] = useState('1st Year');
  const [avatar, setAvatar] = useState('star');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    "Emerging Technologies", "Introduction to Economics", "General Biology", "Communicative English", "Moral and Civic Education"
  ]);
  const [claudeApiKey, setClaudeApiKey] = useState('');
  
  // Interface toggles
  const [showKey, setShowKey] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Accounts list from local state
  const [registeredAccounts, setRegisteredAccounts] = useState<AccountInfo[]>([]);

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

  // Fetch accounts on load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ethiolearn_accounts');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRegisteredAccounts(parsed);
          // Keep default mode as "splash" to allow immediate one-touch quick start
        }
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (initialProfile) {
      setName(initialProfile.name);
      setEmail(initialProfile.email || '');
      setUniversity(initialProfile.university);
      setYear(initialProfile.year);
      setSelectedSubjects(initialProfile.subjects);
      setClaudeApiKey(initialProfile.claudeApiKey);
      if (initialProfile.avatar) {
        setAvatar(initialProfile.avatar);
      }
    }
  }, [initialProfile]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const emailTrim = email.trim().toLowerCase();
    const passwordTrim = password.trim();

    if (!emailTrim || !passwordTrim) {
      setAuthError("Please fill out both email and password fields.");
      playFailureChime();
      return;
    }

    // Lookup credentials
    const found = registeredAccounts.find(
      acc => acc.email.toLowerCase() === emailTrim && acc.passwordEncrypted === passwordTrim
    );

    if (!found) {
      setAuthError("Incorrect password or email. Please check your credentials.");
      playFailureChime();
      return;
    }

    // Save rememberMe selection
    try {
      const updatedAccounts = registeredAccounts.map(acc => {
        if (acc.email.toLowerCase() === emailTrim) {
          return { ...acc, rememberMe };
        }
        return acc;
      });
      localStorage.setItem('ethiolearn_accounts', JSON.stringify(updatedAccounts));
      
      // Set active user session
      localStorage.setItem('ethiolearn_active_email', found.email);
    } catch (e) {}

    playSuccessChime();
    
    // Pass completed profile to parent to load user session
    onComplete(found.profile);
  };

  const handleQuickLogin = (acc: AccountInfo) => {
    setAuthError(null);
    playClickChime();

    if (acc.rememberMe) {
      // Direct session validation bypass if "Remember Me" is true
      try {
        localStorage.setItem('ethiolearn_active_email', acc.email);
      } catch (e) {}
      playSuccessChime();
      onComplete(acc.profile);
    } else {
      // Autofill email and prompt for password
      setEmail(acc.email);
      setPassword('');
      setAuthError("Please enter your security password to login.");
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const nameTrim = name.trim();
    const emailTrim = email.trim().toLowerCase();
    const passwordTrim = password.trim();

    if (!nameTrim || !emailTrim || !passwordTrim) {
      setAuthError("Full Name, Email, and Password are required to enroll.");
      playFailureChime();
      return;
    }

    if (!emailTrim.endsWith('@gmail.com')) {
      setAuthError("For security and verification, you must register using a valid Gmail address (@gmail.com).");
      playFailureChime();
      return;
    }

    if (passwordTrim.length < 5) {
      setAuthError("For safety, password must be at least 6 characters long.");
      playFailureChime();
      return;
    }

    // Check pre-existing accounts
    const exists = registeredAccounts.some(acc => acc.email.toLowerCase() === emailTrim);
    if (exists) {
      setAuthError("An academic account with this email address already exists.");
      playFailureChime();
      return;
    }

    // Create student profile
    const profile: StudentProfile = {
      name: nameTrim,
      email: emailTrim,
      university: university.trim() || "Wolkite University",
      year,
      subjects: selectedSubjects,
      claudeApiKey: claudeApiKey.trim(),
      dailyGoalHours: 2,
      theme: 'dark',
      language: 'both',
      avatar
    };

    const newAccount: AccountInfo = {
      email: emailTrim,
      passwordEncrypted: passwordTrim,
      rememberMe: rememberMe,
      profile
    };

    // Save accounts storage
    const updated = [...registeredAccounts, newAccount];
    try {
      localStorage.setItem('ethiolearn_accounts', JSON.stringify(updated));
      localStorage.setItem('ethiolearn_active_email', emailTrim);
    } catch (e) {}

    playSuccessChime();
    onComplete(profile);
  };

  const handleGuestQuickStart = () => {
    playSuccessChime();
    const guestProfile: StudentProfile = {
      name: "Ethiopian Scholar",
      email: "scholar.guest@ethiolearn.com",
      university: "Addis Ababa University",
      year: "1st Year",
      subjects: [
        "Emerging Technologies",
        "Introduction to Economics",
        "General Biology",
        "Communicative English",
        "Moral and Civic Education"
      ],
      claudeApiKey: "",
      dailyGoalHours: 2,
      theme: 'dark',
      language: 'both',
      avatar: 'champion'
    };
    onComplete(guestProfile);
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
    <div className="fixed inset-0 bg-[#070707] z-50 flex flex-col items-center justify-center overflow-y-auto overflow-x-hidden px-4 py-8 select-none relative">
      
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
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 via-[#C8962E] to-red-500 opacity-60" />
        <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 via-[#C8962E] to-red-500 opacity-60" />
      </div>

      <AnimatePresence mode="wait">
        
        {/* Step SPLASH */}
        {mode === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-lg flex flex-col items-center relative z-10 w-full my-auto px-4"
          >
            {/* Elegant Habesha Welcome Banner */}
            <div className="mb-2">
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest text-amber-200 bg-gradient-to-r from-emerald-950/40 via-amber-950/40 to-red-950/40 border border-[#C8962E]/30 backdrop-blur-md uppercase font-serif animate-pulse">
                እንኳን በደህና መጡ!
              </span>
            </div>

            {/* Traditional 'Tibeb' styled geometric woven pattern strip */}
            <div className="w-full max-w-xs flex h-2.5 overflow-hidden rounded-full my-4 border border-zinc-800 shadow-inner select-none bg-zinc-900">
              {Array.from({ length: 16 }).map((_, i) => {
                const colors = ["bg-emerald-600", "bg-[#C8962E]", "bg-red-600"];
                return (
                  <div 
                    key={i} 
                    className={`flex-1 h-full ${colors[i % 3]} transform skew-x-12 mx-[1px]`} 
                  />
                );
              })}
            </div>

            <div className="relative w-full max-w-[320px] aspect-[4/3] mb-6 flex items-center justify-center select-none">
              {/* Vibrant Ambient Backglow representing Ethiopian National Flag Colors */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-emerald-600 via-[#C8962E] to-red-600 blur-[36px] opacity-35 animate-pulse" />

              {/* Glassmorphic Rounded Display Shield */}
              <div className="absolute inset-0 rounded-3xl bg-black/40 border border-zinc-800 backdrop-blur-md overflow-hidden shadow-2xl flex flex-col items-center justify-center px-4 py-3">
                
                {/* SVG Moving Illustration Container */}
                <svg viewBox="0 0 400 300" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    {/* Glowing Sun Gradient */}
                    <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#C8962E" stopOpacity="0.4" />
                      <stop offset="60%" stopColor="#C8962E" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#C8962E" stopOpacity="0" />
                    </radialGradient>
                    
                    {/* Ethiopian Traditional Netela Borders (Green - Yellow - Red) */}
                    <linearGradient id="habeshaTrim" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10B981" /> {/* Green */}
                      <stop offset="50%" stopColor="#F59E0B" /> {/* Yellow */}
                      <stop offset="100%" stopColor="#EF4444" /> {/* Red */}
                    </linearGradient>

                    {/* Book Glow Effect */}
                    <radialGradient id="bookLight" cx="50%" cy="80%" r="50%">
                      <stop offset="0%" stopColor="#FCD34D" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#FCD34D" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* 1. Golden Traditional Sunrise of Knowledge (Rotating segments in back) */}
                  <g transform="translate(200, 150)">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <line
                        key={i}
                        x1="0"
                        y1="0"
                        x2={120 * Math.cos((i * 30 * Math.PI) / 180)}
                        y2={120 * Math.sin((i * 30 * Math.PI) / 180)}
                        stroke="#C8962E"
                        strokeWidth="1.5"
                        strokeOpacity="0.15"
                        strokeDasharray="4,8"
                      />
                    ))}
                    <circle cx="0" cy="0" r="50" fill="url(#sunGlow)" />
                  </g>

                  {/* 2. Students silhouettes (Left: Boy Student, Right: Girl Student) */}
                  {/* Left Student: Boy in Traditional White Gabi/Netela */}
                  <g transform="translate(110, 140)">
                    {/* Subtle Breathing Motion */}
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="110,140; 110,137; 110,140"
                      dur="4s"
                      repeatCount="indefinite"
                      additive="sum"
                    />
                    
                    {/* Hair */}
                    <path d="M 10,-35 C -15,-35 -15,-60 10,-60 C 35,-60 35,-35 10,-35 Z" fill="#18181B" />
                    <circle cx="-2" cy="-48" r="8" fill="#18181B" />
                    <circle cx="22" cy="-48" r="8" fill="#18181B" />
                    <circle cx="10" cy="-56" r="10" fill="#18181B" />

                    {/* Left Kid Head and smiling face */}
                    <circle cx="10" cy="-35" r="18" fill="#5C4233" />
                    {/* Eyes */}
                    <circle cx="4" cy="-37" r="1.8" fill="#FFFFFF" />
                    <circle cx="4" cy="-37" r="0.8" fill="#000" />
                    <circle cx="14" cy="-37" r="1.8" fill="#FFFFFF" />
                    <circle cx="14" cy="-37" r="0.8" fill="#000" />
                    {/* Smile */}
                    <path d="M 4,-26 Q 9,-22 14,-26" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    {/* Ears */}
                    <circle cx="-9" cy="-35" r="4" fill="#5C4233" />
                    <circle cx="29" cy="-35" r="4" fill="#5C4233" />

                    {/* Neck */}
                    <rect x="6" y="-18" width="8" height="12" fill="#5C4233" />

                    {/* Traditional Shamma / Netela (Garment shoulders) */}
                    <path d="M -25,45 C -25,10 -15,0 10,0 C 35,0 45,10 45,45 Z" fill="#F4F4F5" />
                    
                    {/* Traditional Woven Border (Green-Yellow-Red strip on clothing) */}
                    <path d="M -21,28 C -7,16 11,16 41,28" stroke="url(#habeshaTrim)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
                    
                    {/* Holding Hand */}
                    <circle cx="35" cy="42" r="6" fill="#5C4233" />
                  </g>

                  {/* Right Student: Girl with braids in traditional white dress with Netela wrap */}
                  <g transform="translate(290, 140)">
                    {/* Anti-phase Breathing Motion */}
                    <animateTransform
                      attributeName="transform"
                      type="translate"
                      values="290,137; 290,140; 290,137"
                      dur="4s"
                      repeatCount="indefinite"
                      additive="sum"
                    />
                    
                    {/* Braids / Traditional Hair */}
                    <path d="M -10,-35 C -35,-35 -35,-60 -10,-60 C 15,-60 15,-35 -10,-35 Z" fill="#18181B" />
                    {/* Drooping Braids on sides */}
                    <path d="M -26,-40 Q -33,-20 -28,-3" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                    <path d="M 6,-40 Q 13,-20 8,-3" stroke="#18181B" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                    
                    {/* Red hair ties at the end */}
                    <circle cx="-28" cy="-3" r="3" fill="#EF4444" />
                    <circle cx="8" cy="-3" r="3" fill="#EF4444" />

                    {/* Kid Head and smiling face */}
                    <circle cx="-10" cy="-35" r="18" fill="#6B4E3D" />
                    {/* Eyes */}
                    <circle cx="-16" cy="-37" r="1.8" fill="#FFFFFF" />
                    <circle cx="-16" cy="-37" r="0.8" fill="#000" />
                    <circle cx="-6" cy="-37" r="1.8" fill="#FFFFFF" />
                    <circle cx="-6" cy="-37" r="0.8" fill="#000" />
                    {/* Smile */}
                    <path d="M -16,-26 Q -11,-22 -6,-26" stroke="#FFFFFF" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    {/* Ears */}
                    <circle cx="-29" cy="-35" r="4" fill="#6B4E3D" />
                    <circle cx="9" cy="-35" r="4" fill="#6B4E3D" />

                    {/* Neck */}
                    <rect x="-14" y="-18" width="8" height="12" fill="#6B4E3D" />

                    {/* Traditional Shamma / Dress shoulders */}
                    <path d="M -45,45 C -45,10 -35,0 -10,0 C 15,0 25,10 25,45 Z" fill="#F4F4F5" />
                    
                    {/* Traditional Woven Border (Green-Yellow-Red strip on shoulders) */}
                    <path d="M -41,28 C -11,16 7,16 21,28" stroke="url(#habeshaTrim)" strokeWidth="5.5" fill="none" strokeLinecap="round" />

                    {/* Holding Hand */}
                    <circle cx="-35" cy="42" r="6" fill="#6B4E3D" />
                  </g>

                  {/* 3. Central Open Glowing Study Book */}
                  <g transform="translate(145, 175)">
                    {/* Soft ambient book light beam upward */}
                    <polygon points="10,-60 145,-60 115,10 40,10" fill="url(#bookLight)" />

                    {/* Beautiful traditional wooden or golden book stand */}
                    <path d="M 5,28 L 30,12 L 125,12 L 150,28 Z" fill="#5F3F19" stroke="#78350F" strokeWidth="2" />
                    <path d="M 30,12 L 77,40 L 125,12" stroke="#451A03" strokeWidth="3" fill="none" />

                    {/* Animated Golden pages */}
                    <path d="M 15,15 Q 77,-5 77,15 Q 77,-5 139,15 L 129,-8 Q 77,-28 77,-8 Q 77,-28 25,-8 Z" fill="#FFFBEB" stroke="#C8962E" strokeWidth="1.5" />
                    <line x1="77" y1="-8" x2="77" y2="15" stroke="#D97706" strokeWidth="1.5" />
                    
                    {/* Glowing Star Spark coming out of book */}
                    <circle cx="77" cy="-22" r="2.5" fill="#FBBF24">
                      <animate attributeName="r" values="1;3;1" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </g>

                  {/* 4. Drifting Floating Ge'ez Alphabets (ሀ, ለ, ሐ, መ) with random animation keyframes */}
                  {/* HA (ሀ) */}
                  <g transform="translate(80, 80)">
                    <text x="0" y="0" fill="#C8962E" fontSize="24" fontFamily="serif" fontWeight="900" opacity="0.85">
                      ሀ
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; -10,-20; 0,0"
                        dur="6s"
                        repeatCount="indefinite"
                      />
                      <animate attributeName="opacity" values="0.4;1;0.4" dur="6s" repeatCount="indefinite" />
                    </text>
                  </g>

                  {/* LE (ለ) */}
                  <g transform="translate(310, 80)">
                    <text x="0" y="0" fill="#10B981" fontSize="22" fontFamily="serif" fontWeight="900" opacity="0.85">
                      ለ
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 12,-15; 0,0"
                        dur="5s"
                        repeatCount="indefinite"
                      />
                      <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5s" repeatCount="indefinite" />
                    </text>
                  </g>

                  {/* HAM (ሐ) */}
                  <g transform="translate(130, 60)">
                    <text x="0" y="0" fill="#EF4444" fontSize="20" fontFamily="serif" fontWeight="900" opacity="0.85">
                      ሐ
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; 5,-25; 0,0"
                        dur="7s"
                        repeatCount="indefinite"
                      />
                      <animate attributeName="opacity" values="0.2;1;0.2" dur="7s" repeatCount="indefinite" />
                    </text>
                  </g>

                  {/* MA (መ) */}
                  <g transform="translate(250, 60)">
                    <text x="0" y="0" fill="#FBBF24" fontSize="20" fontFamily="serif" fontWeight="900" opacity="0.85">
                      መ
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        values="0,0; -8,-18; 0,0"
                        dur="5.5s"
                        repeatCount="indefinite"
                      />
                      <animate attributeName="opacity" values="0.4;0.95;0.4" dur="5.5s" repeatCount="indefinite" />
                    </text>
                  </g>

                  {/* Floating sparks of wisdom (drifting up and around) */}
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const startX = 130 + idx * 26;
                    const delay = idx * 0.7;
                    return (
                      <circle
                        key={idx}
                        cx={startX}
                        cy="160"
                        r="2.5"
                        fill="#F59E0B"
                        opacity="0"
                      >
                        <animate
                          attributeName="cy"
                          values="160; 70"
                          dur="4s"
                          begin={`${delay}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="cx"
                          values={`${startX}; ${startX + (idx % 2 === 0 ? 15 : -15)}`}
                          dur="4s"
                          begin={`${delay}s`}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0; 0.9; 0"
                          dur="4s"
                          begin={`${delay}s`}
                          repeatCount="indefinite"
                        />
                      </circle>
                    );
                  })}
                </svg>

                {/* Floating Micro Label overlay */}
                <div className="absolute bottom-2.5 px-3 py-0.5 rounded-full bg-zinc-950/80 border border-zinc-900 text-[10px] text-zinc-400 font-mono tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span>STUDY ROOM FRONTIER</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-[#C8962E] tracking-normal" style={{ textShadow: "0 0 20px rgba(200, 150, 46, 0.25)" }}>
                ኢትዮ ለርን ፕሮ
              </h1>
              <h2 className="text-lg md:text-xl font-serif font-semibold text-[#F0EDE8] tracking-widest uppercase">
                EthioLearn Pro
              </h2>

              <div className="flex items-center justify-center gap-3 w-40 mx-auto py-1">
                <div className="h-[1px] bg-gradient-to-r from-transparent to-[#C8962E]/40 flex-1" />
                <div className="w-1.5 h-1.5 rounded-full bg-[#C8962E]" />
                <div className="h-[1px] bg-gradient-to-l from-transparent to-emerald-500/40 flex-1" />
              </div>

              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-400 tracking-[0.25em] uppercase">
                  ተማር • አድግ • ብልጽግና
                </p>
                <p className="text-[#A29A95] text-[10px] font-mono tracking-widest uppercase">
                  Learn. Grow. Prosper.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 w-full max-w-sm justify-center">
              {/* Primary Pulsing Instant Quick Start Button */}
              <motion.button
                onClick={handleGuestQuickStart}
                whileHover={{ scale: 1.025 }}
                whileTap={{ scale: 0.985 }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-[#C8962E] to-red-500 text-black font-extrabold text-xs tracking-widest uppercase rounded-2xl cursor-pointer shadow-[0_0_24px_rgba(200,150,46,0.3)] transition-all flex items-center justify-center gap-2 border border-amber-300/30 font-serif"
              >
                <span className="relative flex h-2.5 w-2.5 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                </span>
                Quick Start (አሁን ጀምር)
              </motion.button>

              {/* Smaller clean row for alternative flows */}
              <div className="flex items-center justify-center gap-6 mt-1">
                <button
                  onClick={() => { playClickChime(); setMode('signin'); }}
                  className="text-[10px] text-zinc-400 hover:text-white font-bold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3 h-3 text-[#C8962E]" /> Student Sign In
                </button>
                <span className="text-zinc-800">|</span>
                <button
                  onClick={() => { playClickChime(); setMode('signup'); }}
                  className="text-[10px] text-zinc-400 hover:text-white font-bold tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-3 h-3 text-[#C8962E]" /> Custom Register
                </button>
              </div>

              {/* Traditional Bottom Accents */}
              <div className="w-full max-w-[140px] flex h-[2px] overflow-hidden rounded-full mt-4 mx-auto opacity-40 select-none">
                <div className="flex-1 bg-emerald-600 h-full" />
                <div className="flex-1 bg-[#C8962E] h-full" />
                <div className="flex-1 bg-red-600 h-full" />
              </div>

              {/* Frictionless tagline */}
              <p className="text-[9px] text-zinc-500 font-mono text-center tracking-normal mt-1 max-w-xs mx-auto">
                Instant portal to your study notes, exam prep, and audio companion.
              </p>
            </div>
          </motion.div>
        )}

        {/* Step SIGN IN */}
        {mode === 'signin' && (
          <motion.div
            key="signin"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md bg-[#111111]/95 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-zinc-800 relative z-10 shadow-2xl space-y-6 my-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <EthioLearnLogo size={42} />
                <div>
                  <h3 className="font-serif text-base font-bold text-[#F0EDE8]">Student Campus Portal</h3>
                  <p className="text-[10px] text-zinc-500 tracking-wider">SECURE DEVICE GATEWAY</p>
                </div>
              </div>
              <button
                onClick={() => { playClickChime(); setMode('splash'); }}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}

            {/* Quick Login Section (if accounts are stored) */}
            {registeredAccounts.length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-[#C8962E] font-mono tracking-widest uppercase block">
                  Quick Access Profiles
                </span>
                <div className="grid grid-cols-1 gap-2.5 max-h-36 overflow-y-auto pr-1">
                  {registeredAccounts.map((acc) => (
                    <div
                      key={acc.email}
                      onClick={() => handleQuickLogin(acc)}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-zinc-900 bg-zinc-950/60 hover:bg-zinc-900/60 hover:border-zinc-800 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full border border-amber-600/30 overflow-hidden bg-zinc-900 flex items-center justify-center shrink-0">
                          <StudentAvatar avatar={acc.profile.avatar || 'star'} name={acc.profile.name} size={28} />
                        </div>
                        <div className="text-left">
                          <span className="font-serif text-xs font-semibold text-zinc-200 block group-hover:text-amber-500 transition-colors">
                            {acc.profile.name}
                          </span>
                          <span className="font-mono text-[9px] text-zinc-500 block">
                            {acc.email}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 font-mono text-[9px]">
                        {acc.rememberMe ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-emerald-900/20 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-2.5 h-2.5 text-emerald-400" /> One-Click
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                            Needs Key
                          </span>
                        )}
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Main Sign-In Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Gmail Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. abebe@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#090909] border border-zinc-800 focus:border-[#C8962E] rounded-lg pl-10 pr-4 py-2.5 text-zinc-100 outline-none text-xs transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                  Password Key
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#090909] border border-zinc-800 focus:border-[#C8962E] rounded-lg pl-10 pr-10 py-2.5 text-zinc-100 outline-none text-xs transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me box */}
              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-zinc-400">Remember session (One-click Login)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-[#1A7A3C] hover:opacity-95 text-[#0d0d0d] font-serif font-extrabold text-xs tracking-wider uppercase rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-[0.99]"
              >
                <LogIn className="w-4 h-4 text-[#0d0d0d]" /> Enter Campus
              </button>
            </form>

            <div className="text-center pt-2 border-t border-zinc-900/60">
              <p className="text-xs text-zinc-500">
                Don't have an academic account on this device?{' '}
                <button
                  onClick={() => { playClickChime(); setMode('signup'); }}
                  className="text-[#C8962E] font-bold hover:underline cursor-pointer"
                >
                  Register Profile
                </button>
              </p>
            </div>
          </motion.div>
        )}

        {/* Step SIGN UP */}
        {mode === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xl bg-[#111111]/95 backdrop-blur-md p-5 md:p-6 rounded-2xl border border-zinc-800 relative z-10 shadow-2xl space-y-4 my-auto"
          >
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <EthioLearnLogo size={36} />
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#F0EDE8]">Academic Registration</h3>
                  <p className="text-[9px] text-zinc-500">SET UP COHORT MEMBERSHIP</p>
                </div>
              </div>
              <button
                onClick={() => { playClickChime(); setMode(registeredAccounts.length > 0 ? 'signin' : 'splash'); }}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 transition-colors"
                title="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-950/20 border border-red-500/30 text-red-400 text-xs rounded-lg flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p>{authError}</p>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* Account Credentials Group */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    Full Student Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abebe Kebede"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#090909] border border-zinc-800 focus:border-[#C8962E] rounded-lg px-3 py-2 text-zinc-100 outline-none text-xs transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    Gmail Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="student@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#090909] border border-zinc-800 focus:border-[#C8962E] rounded-lg px-3 py-2 text-zinc-100 outline-none text-xs transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                    Academy Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Min 5 chars"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#090909] border border-zinc-800 focus:border-[#C8962E] rounded-lg px-3 py-2 text-zinc-100 outline-none text-xs transition-all font-mono"
                  />
                </div>
              </div>

              {/* Choose Picture */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#C8962E] uppercase block">
                  Select Custom Portrait Avatar
                </label>
                <StudentAvatarSelector
                  currentAvatar={avatar}
                  name={name || 'Student'}
                  onChange={setAvatar}
                />
              </div>

              {/* School & Year Group */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">
                    University / High School
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Wolkite University"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full bg-[#090909] border border-zinc-800 focus:border-[#C8962E] rounded-lg px-3 py-2 text-zinc-100 outline-none text-xs transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">
                    Academic standing
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-[#090909] border border-zinc-800 focus:border-[#C8962E] rounded-lg px-3 py-2 text-zinc-100 outline-none text-xs transition-all appearance-none cursor-pointer"
                  >
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Secondary">Preparatory Secondary</option>
                  </select>
                </div>
              </div>

              {/* Enrolled Subjects */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase block">
                  Assign Campus Focus Modules (Select one or more)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {subjectsList.map((subject) => {
                    const selected = selectedSubjects.includes(subject);
                    return (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => toggleSubject(subject)}
                        className={`text-[10px] px-2.5 py-1.5 rounded-lg border font-medium cursor-pointer transition-all ${
                          selected
                            ? 'bg-[#C8962E]/10 border-[#C8962E] text-[#C8962E]'
                            : 'bg-[#090909] border-zinc-900 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        {subject}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* API Key */}
              <div className="space-y-1 bg-zinc-950/40 p-2.5 rounded-xl border border-zinc-900">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block">
                    Custom LLM Model API Key (Optional)
                  </label>
                  <span className="text-[9px] text-[#C8962E] flex gap-1.5 shrink-0">
                    <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" className="hover:underline">OpenRouter</a>
                    <span>|</span>
                    <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="hover:underline">Groq</a>
                  </span>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="Optional. Press view key or leave blank to proxy built-in AI models."
                    value={claudeApiKey}
                    onChange={(e) => setClaudeApiKey(e.target.value)}
                    className="w-full bg-[#050505] border border-zinc-900 focus:border-[#C8962E] rounded-lg pl-3 pr-10 py-1.5 text-zinc-200 outline-none text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#C8962E]"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-zinc-900 text-amber-500 focus:ring-0 cursor-pointer"
                  />
                  <span className="text-[11px] text-zinc-400">Remember session (One-click Login)</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#C8962E] to-[#1A7A3C] text-black font-serif font-extrabold text-xs tracking-wider uppercase rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow"
              >
                Register & Enter Campus <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-zinc-900/60">
              <p className="text-xs text-zinc-500">
                Already registered on this browser?{' '}
                <button
                  onClick={() => { playClickChime(); setMode('signin'); }}
                  className="text-[#C8962E] font-bold hover:underline cursor-pointer"
                >
                  Student Login
                </button>
              </p>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
