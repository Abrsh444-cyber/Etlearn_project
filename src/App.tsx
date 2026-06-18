/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home as HomeIcon, Bot, BookOpen, Trophy, Award, Sparkles, Languages, 
  ChevronRight, CheckCircle2, AlertCircle, RefreshCw, Star, ArrowRight, 
  Zap, Play, Pause, HelpCircle, X, Shield, BookMarked, Compass, Calendar, 
  Sun, Moon, LogOut, User as UserIcon
} from 'lucide-react';

import { StudentProfile, CustomNote, Flashcard } from './types';
import SplashOnboarding from './components/SplashOnboarding';
import PWADownloadAssistant from './components/PWADownloadAssistant';
import AITutor from './components/AITutor';
import ExamPrep from './components/ExamPrep';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import MindRelax from './components/MindRelax';
import StudyNotesView from './components/StudyNotesView';

import { getEthiopianDate } from './utils/ethiopianCalendar';
import { playClickChime, playSuccessChime, playFailureChime } from './utils/audio';
import { initAuth, googleSignIn, logoutGoogle, exportAnalyticsToGoogleSheets } from './utils/workspace';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  // Try loading profile from localStorage
  const [profile, setProfile] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('ethiolearn_current_profile');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Top level settings mapping
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [currentPage, setCurrentPage] = useState<'notes' | 'tutor' | 'exam' | 'relax'>('notes');
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');

  // Load custom notes and flashcards spacing states
  const [customNotes, setCustomNotes] = useState<CustomNote[]>(() => {
    const saved = localStorage.getItem('ethiolearn_custom_notes');
    return saved ? JSON.parse(saved) : [];
  });

  const [decksState, setDecksState] = useState<{ [deckId: string]: Flashcard[] }>(() => {
    const saved = localStorage.getItem('ethiolearn_flashcards_decks');
    return saved ? JSON.parse(saved) : {};
  });

  // Streaks and logs
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('ethiolearn_pro_streak');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [studyHours, setStudyHours] = useState(() => {
    const saved = localStorage.getItem('ethiolearn_pro_study_hours');
    return saved ? parseFloat(saved) : 14.5;
  });

  // Google Authentication variables
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isExportingSheets, setIsExportingSheets] = useState(false);

  // Toast systems
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Computed Date widget
  const [ethDate, setEthDate] = useState({ day: 1, monthName: "መስከረም", year: 2016, formatted: "መስከረም 1, 2016" });

  // PWA elements
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Trigger toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync theme
  useEffect(() => {
    if (profile) {
      const mode = profile.theme === 'auto' ? 'dark' : profile.theme;
      setThemeMode(mode as 'light' | 'dark');
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [profile]);

  // Date loop refresh
  useEffect(() => {
    try {
      const computed = getEthiopianDate(new Date());
      setEthDate(computed as any);
    } catch (e) {
      console.warn("Failed standard Ethiopian calendar compute:", e);
    }
  }, []);

  // Firebase auth sync
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setGoogleToken(token);
      },
      () => {
        setGoogleUser(null);
        setGoogleToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // PWA standard installer hook
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerPWAInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Onboarding action
  const handleOnboardingComplete = (completedProfile: StudentProfile) => {
    setProfile(completedProfile);
    localStorage.setItem('ethiolearn_current_profile', JSON.stringify(completedProfile));
    playSuccessChime();
    showToast(`Welcome to EthioLearn Pro, ${completedProfile.name}!`);
  };

  // Profile modifications / signout
  const handleProfileReset = () => {
    playClickChime();
    if (window.confirm("Would you like to reset your enrollment profile and enter new credentials?")) {
      localStorage.removeItem('ethiolearn_current_profile');
      setProfile(null);
    }
  };

  // Google sheets sync
  const handleSyncStatsToSheets = async () => {
    if (!googleToken || !googleUser || !profile) {
      showToast("Please sign in with Google first in the Progress panel!");
      playFailureChime();
      return;
    }

    try {
      setIsExportingSheets(true);
      playClickChime();
      const res = await exportAnalyticsToGoogleSheets(
        profile.name,
        profile.university,
        profile.year,
        streak,
        studyHours,
        profile.dailyGoalHours || 2,
        googleToken
      );
      playSuccessChime();
      showToast("Successfully synchronized parameters to Google Sheets!");
      window.open(res.url, '_blank');
    } catch (err: any) {
      console.error(err);
      playFailureChime();
      showToast(`Sync failed: ${err.message || err}`);
    } finally {
      setIsExportingSheets(false);
    }
  };

  // Google sign in wrapper
  const handleGoogleSignIn = async () => {
    try {
      playClickChime();
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGoogleToken(res.accessToken);
        playSuccessChime();
        showToast(`Signed in securely with ${res.user.email}!`);
      }
    } catch (err) {
      console.error(err);
      playFailureChime();
      showToast("Google Authentication was canceled or failed.");
    }
  };

  // Google sign out
  const handleGoogleSignOut = async () => {
    try {
      playClickChime();
      await logoutGoogle();
      setGoogleUser(null);
      setGoogleToken(null);
      playSuccessChime();
      showToast("Signed out from Google Workspace.");
    } catch (err) {
      console.error(err);
      playFailureChime();
    }
  };

  // Save custom notes
  const handleSaveCustomNotes = (newNotes: CustomNote[]) => {
    setCustomNotes(newNotes);
    localStorage.setItem('ethiolearn_custom_notes', JSON.stringify(newNotes));
  };

  // Save flashcards
  const handleSaveDecksState = (deckId: string, cards: Flashcard[]) => {
    const updated = { ...decksState, [deckId]: cards };
    setDecksState(updated);
    localStorage.setItem('ethiolearn_flashcards_decks', JSON.stringify(updated));
  };

  // Export Progress report local downloader
  const handleExportLocalProgress = () => {
    try {
      const report = {
        student: profile?.name,
        university: profile?.university,
        year: profile?.year,
        streak,
        studyHours,
        notesCount: customNotes.length,
        decksCount: Object.keys(decksState).length
      };
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `ethiolearn_study_report.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      playSuccessChime();
    } catch (e) {}
  };

  // Computed data summary
  const analyticsData = {
    streak: streak,
    studyHours: studyHours,
    decksCount: Object.keys(decksState).length,
    totalCardsCount: (Object.values(decksState) as Flashcard[][]).reduce((acc, cards) => acc + cards.length, 0),
    masteredCardsCount: (Object.values(decksState) as Flashcard[][]).reduce((acc, cards) => 
      acc + cards.filter(c => (c.repetition || 0) >= 3).length, 0
    ),
    notesCount: customNotes.length,
    dailyGoal: profile?.dailyGoalHours || 2
  };

  const toggleLocalTheme = () => {
    playClickChime();
    const nextTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    if (profile) {
      const updated = { ...profile, theme: nextTheme };
      setProfile(updated);
      localStorage.setItem('ethiolearn_current_profile', JSON.stringify(updated));
    }
  };

  // Render Splash onboarding if not configured
  if (!profile) {
    return (
      <SplashOnboarding 
        onComplete={handleOnboardingComplete} 
        initialProfile={null} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-main-bg text-slate-800 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* HEADER WIDGET PRESERVED FOR BRANDING */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 shadow-sm select-none">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center gap-4">
          
          {/* Trademark Brand Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 dark:bg-[#1A7A3C] flex items-center justify-center text-white font-black text-lg shadow-md shrink-0">
              E
            </div>
            <div className="leading-none">
              <div className="flex items-center">
                <span className="font-bold text-slate-900 dark:text-white text-[17px] tracking-tight">EthioLearn</span>
                <span className="text-[#C8962E] font-black text-[17px] ml-1 pro-badge">PRO</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500">{profile.year} • {profile.university}</span>
            </div>
          </div>

          {/* Computed Ethiopian Date Widget */}
          <div className="hidden md:flex items-center gap-2 border border-slate-200 dark:border-zinc-800 px-3 py-1 bg-slate-50 dark:bg-zinc-900 rounded-xl">
            <Calendar className="w-4 h-4 text-[#C8962E]" />
            <div className="text-left">
              <span className="block font-bold text-slate-700 dark:text-zinc-300 text-[11px] leading-tight font-serif">{ethDate.formatted}</span>
              <span className="block text-[9px] text-[#1A7A3C] font-semibold uppercase tracking-wider">Ge'ez Calendar Active</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleLocalTheme}
              className="p-2 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all text-slate-600 dark:text-zinc-300 cursor-pointer"
              title="Toggle Light/Dark Theme"
            >
              {themeMode === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            {/* Profile Reset Manager */}
            <button
              onClick={handleProfileReset}
              className="p-2 border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 dark:hover:text-red-400 transition-all text-slate-600 dark:text-gray-300 cursor-pointer"
              title="Manage Profile & Enrolled course subjects"
            >
              <UserIcon className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* STAGE MAIN AREA VIEWPORTS */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 py-6 md:py-8 pb-28">
        
        {/* PWA Download Notice Banner */}
        <PWADownloadAssistant 
          isInstallable={isInstallable} 
          triggerPWAInstall={triggerPWAInstall} 
          isOffline={isOffline} 
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {currentPage === 'notes' && (
              <StudyNotesView 
                apiKey={profile.claudeApiKey || ""}
                customNotes={customNotes}
                onSaveCustomNotes={handleSaveCustomNotes}
                enrolledSubjects={profile.subjects}
                googleUser={googleUser}
                googleToken={googleToken}
                onGoogleSignIn={handleGoogleSignIn}
                onGoogleSignOut={handleGoogleSignOut}
                decksState={decksState}
                onSaveDecksState={handleSaveDecksState}
              />
            )}

            {currentPage === 'tutor' && (
              <AITutor 
                apiKey={profile.claudeApiKey || ""}
                enrolledSubjects={profile.subjects}
                decksState={decksState}
                onSaveDecksState={handleSaveDecksState}
              />
            )}

            {currentPage === 'exam' && (
              <ExamPrep 
                apiKey={profile.claudeApiKey || ""}
                enrolledSubjects={profile.subjects}
              />
            )}

            {currentPage === 'relax' && (
              <MindRelax />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* BOTTOM NAVIGATION TAB BLOCK (MAX 4 ITEMS, OPTIMIZED MOBILE DENSITY) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 shadow-xl">
        <div className="grid grid-cols-4 max-w-lg mx-auto h-[4px]">
          <div className={currentPage === 'notes' ? "bg-emerald-600 dark:bg-[#1A7A3C]" : "bg-transparent"} />
          <div className={currentPage === 'exam' ? "bg-emerald-600 dark:bg-[#1A7A3C]" : "bg-transparent"} />
          <div className={currentPage === 'tutor' ? "bg-[#C8962E]" : "bg-transparent"} />
          <div className={currentPage === 'relax' ? "bg-[#C8962E]" : "bg-transparent"} />
        </div>

        <div className="grid grid-cols-4 max-w-lg mx-auto px-1 py-1 bg-transparent select-none">
          {/* Notes Workspace */}
          <button
            onClick={() => { playClickChime(); setCurrentPage('notes'); }}
            className={`flex flex-col items-center justify-center h-14 w-full transition-all cursor-pointer rounded-xl ${
              currentPage === 'notes' ? 'text-emerald-600 dark:text-[#1A7A3C]' : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500'
            }`}
          >
            <BookMarked className={`w-5 h-5 ${currentPage === 'notes' ? 'fill-emerald-600/10' : ''}`} />
            <span className="text-[10px] font-bold mt-1">Study Room</span>
          </button>

          {/* Mock Exam Prep */}
          <button
            onClick={() => { playClickChime(); setCurrentPage('exam'); }}
            className={`flex flex-col items-center justify-center h-14 w-full transition-all cursor-pointer rounded-xl ${
              currentPage === 'exam' ? 'text-emerald-600 dark:text-[#1A7A3C]' : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500'
            }`}
          >
            <Trophy className={`w-5 h-5 ${currentPage === 'exam' ? 'fill-emerald-600/10' : ''}`} />
            <span className="text-[10px] font-bold mt-1">Exam Arena</span>
          </button>

          {/* AI Companion */}
          <button
            onClick={() => { playClickChime(); setCurrentPage('tutor'); }}
            className={`flex flex-col items-center justify-center h-14 w-full transition-all cursor-pointer rounded-xl ${
              currentPage === 'tutor' ? 'text-[#C8962E]' : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500'
            }`}
          >
            <Bot className={`w-5 h-5 ${currentPage === 'tutor' ? 'fill-[#C8962E]/10' : ''}`} />
            <span className="text-[10px] font-bold mt-1">AI Tutor</span>
          </button>

          {/* Stress Relief soundscapes */}
          <button
            onClick={() => { playClickChime(); setCurrentPage('relax'); }}
            className={`flex flex-col items-center justify-center h-14 w-full transition-all cursor-pointer rounded-xl ${
              currentPage === 'relax' ? 'text-[#C8962E]' : 'text-slate-400 hover:text-slate-600 dark:text-zinc-500'
            }`}
          >
            <Sun className={`w-5 h-5 ${currentPage === 'relax' ? 'fill-[#C8962E]/10 font-bold' : ''}`} />
            <span className="text-[10px] font-bold mt-1">Soundscapes</span>
          </button>
        </div>
      </nav>

      {/* Custom Popup Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-[#161616] border border-zinc-800 text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-3.5 h-3.5 text-[#C8962E]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
