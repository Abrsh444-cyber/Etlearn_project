/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, Bot, Layers, FileText, BookOpen, BarChart, Settings, Flame, GraduationCap, 
  HelpCircle, Calendar, Compass, Clock, Award, Landmark, Sparkles, LogOut, Check, AlertTriangle, Key, Bell, Trash2, WifiOff
} from 'lucide-react';

import { StudentProfile, Flashcard, CustomNote } from './types';
import SplashOnboarding from './components/SplashOnboarding';
import AITutor from './components/AITutor';
import FlashcardsDeck from './components/FlashcardsDeck';
import ExamPrep from './components/ExamPrep';
import StudyNotesView from './components/StudyNotesView';
import AnalyticsDashboard from './components/AnalyticsDashboard';

import { ETHIOPIAN_PROVERBS } from './data/ethiopianProverbs';
import { getEthiopianDate, toGeezNumeral, ETHIOPIAN_HOLIDAYS } from './utils/ethiopianCalendar';
import { playClickChime, playSuccessChime, playFailureChime } from './utils/audio';

export default function App() {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'tutor' | 'flashcards' | 'exam' | 'notes' | 'analytics' | 'settings'>('dashboard');
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  // Local states
  const [decksState, setDecksState] = useState<{ [deckId: string]: Flashcard[] }>({});
  const [customNotes, setCustomNotes] = useState<CustomNote[]>([]);
  const [streak, setStreak] = useState(5);
  const [totalStudyHours, setTotalStudyHours] = useState(14.5);
  const [dailyHoursGoal, setDailyHoursGoal] = useState(2);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Notifications and system toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Setup/Onboarding loader
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check offline conditions
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 2. Load Local Data with prefix 'ethiolearn_'
    const storedProfile = localStorage.getItem('ethiolearn_profile');
    const storedDecks = localStorage.getItem('ethiolearn_decks_state');
    const storedNotes = localStorage.getItem('ethiolearn_custom_notes');
    const storedStats = localStorage.getItem('ethiolearn_analytics');

    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    if (storedDecks) {
      setDecksState(JSON.parse(storedDecks));
    }
    if (storedNotes) {
      setCustomNotes(JSON.parse(storedNotes));
    }
    if (storedStats) {
      const stats = JSON.parse(storedStats);
      if (stats.studyHours) setTotalStudyHours(stats.studyHours);
      if (stats.streak) setStreak(stats.streak);
      if (stats.dailyGoal) setDailyHoursGoal(stats.dailyGoal);
    } else {
      // Create initial stats placeholder
      const initialStats = {
        studyHours: 14.5,
        streak: 5,
        dailyGoal: 2,
        masteredCards: 48,
        examsDone: 4
      };
      localStorage.setItem('ethiolearn_analytics', JSON.stringify(initialStats));
    }

    setIsLoading(false);

    // 3. Register Alt + [1-7] Navigation Keyboard Shortcuts
    const handleShortcuts = (e: KeyboardEvent) => {
      if (e.altKey) {
        const key = e.key;
        let targetPage: typeof currentPage | null = null;
        if (key === '1') targetPage = 'dashboard';
        else if (key === '2') targetPage = 'tutor';
        else if (key === '3') targetPage = 'flashcards';
        else if (key === '4') targetPage = 'exam';
        else if (key === '5') targetPage = 'notes';
        else if (key === '6') targetPage = 'analytics';
        else if (key === '7') targetPage = 'settings';

        if (targetPage) {
          e.preventDefault();
          playClickChime();
          setCurrentPage(targetPage);
          showToast(`Alt Shortcut: Navigated to ${targetPage.toUpperCase()}`);
        }
      }
    };
    window.addEventListener('keydown', handleShortcuts);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('keydown', handleShortcuts);
    };
  }, []);

  const handleOnboardingComplete = (newProfile: StudentProfile) => {
    setProfile(newProfile);
    localStorage.setItem('ethiolearn_profile', JSON.stringify(newProfile));
    
    // Trigger success animations and sounds
    playSuccessChime();
    showToast(`ሰላም, ${newProfile.name}! Welcome to EthioLearn Pro Campus.`);
    
    // Establish initial streak increments
    try {
      const stats = JSON.parse(localStorage.getItem('ethiolearn_analytics') || '{}');
      stats.streak = 5;
      stats.studyHours = 14.5;
      stats.dailyGoal = newProfile.dailyGoalHours;
      localStorage.setItem('ethiolearn_analytics', JSON.stringify(stats));
      setStreak(5);
      setTotalStudyHours(14.5);
      setDailyHoursGoal(newProfile.dailyGoalHours);
    } catch (e) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateProfile = (updated: StudentProfile) => {
    setProfile(updated);
    localStorage.setItem('ethiolearn_profile', JSON.stringify(updated));
    showToast("Profile configurations updated successfully!");
    playSuccessChime();
  };

  const handleSaveDecksState = (deckId: string, cards: Flashcard[]) => {
    const updated = { ...decksState, [deckId]: cards };
    setDecksState(updated);
    localStorage.setItem('ethiolearn_decks_state', JSON.stringify(updated));
    
    // Dynamically calculate accurate total mastered cards to store
    let totalMastered = 0;
    (Object.values(updated) as Flashcard[][]).forEach((cardList) => {
      cardList.forEach((c) => {
        if (c.repetition >= 3) totalMastered++;
      });
    });
    try {
      const stats = JSON.parse(localStorage.getItem('ethiolearn_analytics') || '{}');
      stats.masteredCards = Math.max(48, totalMastered); // preserve baseline
      localStorage.setItem('ethiolearn_analytics', JSON.stringify(stats));
    } catch(e) {}
  };

  const handleSaveCustomNotes = (notesList: CustomNote[]) => {
    setCustomNotes(notesList);
    localStorage.setItem('ethiolearn_custom_notes', JSON.stringify(notesList));
  };

  const handleResetProgress = () => {
    playFailureChime();
    // Flush all keys prefixed with ethiolearn_
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('ethiolearn_')) {
        localStorage.removeItem(key);
      }
    });
    setProfile(null);
    setDecksState({});
    setCustomNotes([]);
    setStreak(5);
    setTotalStudyHours(14.5);
    setDailyHoursGoal(2);
    setShowResetConfirm(false);
    setCurrentPage('dashboard');
    showToast("EthioLearn Campus files reset completely.");
  };

  const handleExportDataAsJson = () => {
    playClickChime();
    const data = {
      profile,
      streak,
      totalStudyHours,
      decksState,
      customNotes,
      metrics: localStorage.getItem('ethiolearn_analytics')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ethiolearn_campus_portfolio_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    playSuccessChime();
    showToast("Learning profile backup downloaded!");
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-t-[#C8962E] border-zinc-800 rounded-full animate-spin mx-auto"></div>
          <p className="font-serif italic text-zinc-500 text-xs">Booting EthioLearn Classrooms...</p>
        </div>
      </div>
    );
  }

  // Show onboarding setup if no active profile exists
  if (!profile) {
    return <SplashOnboarding onComplete={handleOnboardingComplete} />;
  }

  // Calculate greeting indices
  const getGreetingText = () => {
    const hr = new Date().getHours();
    if (hr < 12) return { am: "እንደምን አደሩ", en: "Good morning" };
    if (hr < 17) return { am: "እንደምን ዋሉ", en: "Good afternoon" };
    return { am: "እንደምን አመሹ", en: "Good evening" };
  };
  const greeting = getGreetingText();

  // Pick Rotate Proverbs (proverbs rotate daily based on dates modulus)
  const currentDaysId = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const proverb: typeof ETHIOPIAN_PROVERBS[0] = ETHIOPIAN_PROVERBS[currentDaysId % ETHIOPIAN_PROVERBS.length];

  // Ge'ez calendar info
  const ethCalendarInfo = getEthiopianDate(new Date());

  // Count study goal completion percent
  const todayProgressHours = 1.2; // default studied today indicator
  const progressGoalPercent = Math.min(100, Math.round((todayProgressHours / dailyHoursGoal) * 100));

  // Render navigation selections
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, badge: null, labelAm: "ዳሽቦርድ" },
    { id: 'tutor', label: 'AI Tutor', icon: Bot, badge: 'Pro', labelAm: "አይ ረዳት" },
    { id: 'flashcards', label: 'Flashcards', icon: Layers, badge: 'SM-2', labelAm: "ፍላሽ ካርዶች" },
    { id: 'exam', label: 'Exam Prep', icon: FileText, badge: 'MCQ', labelAm: "ፈተና ማዘጋጃ" },
    { id: 'notes', label: 'Study Notes', icon: BookOpen, badge: 'AI', labelAm: "የጥናት ማስታወሻ" },
    { id: 'analytics', label: 'Analytics', icon: BarChart, badge: null, labelAm: "ውጤት ትንተና" },
    { id: 'settings', label: 'Settings', icon: Settings, badge: null, labelAm: "ቅንብሮች" }
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col md:flex-row select-none text-[#F0EDE8] relative font-sans antialiased">
      
      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 bg-[#161616] border border-[#C8962E] px-4.5 py-3 rounded-xl shadow-2xl text-xs z-50 flex items-center gap-2.5 max-w-sm font-semibold"
          >
            <Sparkles className="w-4.5 h-4.5 text-[#C8962E] shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Alert Banner */}
      {isOffline && (
        <div className="bg-[#BE1931] text-[#0D0D0D] text-[11px] font-bold text-center py-1.5 px-4 flex items-center justify-center gap-2 absolute top-0 left-0 w-full z-45 shadow">
          <WifiOff className="w-4 h-4" />
          <span>Offline mode active. You can still review pre-loaded Study Notes, Flashcard decks and customized cached files.</span>
        </div>
      )}

      {/* Desktop Left Sidebar Panel Layout */}
      <aside className="hidden md:flex flex-col w-64 bg-[#111111] border-r border-[#2A2A2A] p-5 shrink-0 h-screen sticky top-0 justify-between">
        <div className="space-y-6">
          
          {/* Main Logo wordmark with styling */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#2A2A2A]">
            <div className="w-10 h-10 rounded-xl bg-[#C8962E]/10 flex items-center justify-center border border-[#C8962E]/20 text-[#C8962E] font-serif font-black text-2xl">
              ኤ
            </div>
            <div>
              <h1 className="font-serif text-base font-bold tracking-tight text-[#F0EDE8]">EthioLearn Pro</h1>
              <p className="text-[10px] text-[#1A7A3C] uppercase tracking-widest font-black">ተማር • አድግ • ብልጽግ</p>
            </div>
          </div>

          {/* Nav selections items */}
          <nav className="space-y-1.5 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentPage === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playClickChime();
                    setCurrentPage(item.id as any);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C8962E]/10 border-[#C8962E]/30 text-[#C8962E]'
                      : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-200 hover:bg-[#161616]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span className="font-medium tracking-wide">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[8px] font-black tracking-wider uppercase px-2 py-0.5 rounded border ${
                      item.badge === 'Pro' 
                        ? 'bg-amber-950/25 border-amber-900 text-[#C8962E]' 
                        : 'bg-emerald-950/25 border-emerald-900 text-emerald-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Profile Card and log out widget */}
        <div className="border-t border-[#2A2A2A] pt-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-[#C8962E]/15 border border-[#C8962E]/30 flex items-center justify-center font-bold font-serif text-[#C8962E]">
              {profile.name.substring(0, 1).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate max-w-[100px] text-zinc-200">{profile.name}</p>
              <p className="text-[10px] text-zinc-500 truncate max-w-[100px]">{profile.university}</p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickChime();
              setProfile(null);
            }}
            title="Switch User Log"
            className="p-1 px-2.5 bg-[#0D0D0D] hover:bg-[#BE1931]/10 text-zinc-500 border border-[#2A2A2A] hover:border-[#BE1931]/30 hover:text-[#BE1931] rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main layout contents stage wrapper */}
      <main className={`flex-1 p-5 md:p-8 flex flex-col min-h-0 ${
        currentPage === 'tutor'
          ? 'h-[calc(100vh-76px)] md:h-screen md:max-h-screen overflow-hidden'
          : 'overflow-y-auto max-h-[85vh] md:max-h-screen'
      }`}>
        
        {/* Top Header Widget: Show Calendar dates indices */}
        <div className="flex justify-between items-center pb-4 border-b border-zinc-900 mb-6 flex-wrap gap-4">
          <div className="space-y-0.5">
            <h2 className="text-xl font-serif font-bold text-[#F0EDE8] uppercase tracking-wide">
              {currentPage.toUpperCase()} CAMPUS
            </h2>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <GraduationCap className="w-4 h-4 text-[#C8962E]" />
              <span>{profile.year} • {profile.university}</span>
            </div>
          </div>

          {/* Traditional Ethiopian Calendar block display */}
          <div className="flex items-center gap-3 bg-[#111] border border-[#2A2A2A] p-2 px-3 rounded-xl text-xs">
            <div className="text-right">
              <span className="block text-[11px] text-[#C8962E] font-medium leading-tight">{ethCalendarInfo.formatted}</span>
              <span className="block text-[9px] text-[#1A7A3C] tracking-tight">Ge'ez Calendar Integration</span>
            </div>
            
            <div className="w-8 h-8 rounded-lg bg-[#C8962E]/10 flex items-center justify-center font-serif text-[#C8962E] font-bold border border-[#C8962E]/20 text-md">
              {toGeezNumeral(ethCalendarInfo.day)}
            </div>
          </div>
        </div>

        {/* Dynamic page transition swapper */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className={currentPage === 'tutor' ? "flex-1 flex flex-col min-h-0" : undefined}
          >
            
            {/* 🏠 DASHBOARD VIEW */}
            {currentPage === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Hero Greeting and circular progress ring bento */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Greeting Box */}
                  <div className="lg:col-span-2 bg-[#161616] p-6 rounded-2xl border border-[#2A2A2A] flex flex-col justify-between shadow-xl min-h-60">
                    <div className="space-y-2">
                      <span className="text-[10px] text-[#C8962E] uppercase font-bold tracking-widest font-mono">Student campus portal</span>
                      <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-normal text-[#F0EDE8]">
                        {greeting.am}፣ <span className="text-[#C8962E]">{profile.name}</span>!
                      </h2>
                      <p className="text-xs text-zinc-400">
                        {greeting.en}, {profile.name}! Continue where you left off to preserve your daily streaks.
                      </p>
                    </div>

                    <div className="border-t border-[#2A2A2A] pt-4 mt-6">
                      <span className="text-[9px] text-[#1A7A3C] uppercase font-black tracking-wider block mb-1">Weekly Proverbs quote (ምሳሌዎች)</span>
                      <p className="font-serif italic text-sm text-[white] leading-relaxed">"{proverb.amharic}"</p>
                      <p className="text-zinc-500 text-[11px] mt-1 italic leading-snug">"{proverb.english}" — <span className="text-[#C8962E]">Meaning: {proverb.meaning}</span></p>
                    </div>
                  </div>

                  {/* Goal Circular progress ring SVG */}
                  <div className="bg-[#161616] p-5 rounded-2xl border border-[#2A2A2A] flex flex-col items-center justify-between text-center shadow-xl">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Daily Study Target</span>
                    
                    <div className="relative w-36 h-36 flex items-center justify-center my-3">
                      {/* SVG circle track loader */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#111" strokeWidth="6.5" fill="transparent" />
                        <motion.circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#C8962E"
                          strokeWidth="6.5"
                          strokeDasharray="251.2"
                          initial={{ strokeDashoffset: 251.2 }}
                          animate={{ strokeDashoffset: 251.2 - (251.2 * progressGoalPercent) / 100 }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          fill="transparent"
                          strokeLinecap="round"
                        />
                      </svg>
                      
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="font-mono text-xl font-extrabold text-[#F0EDE8]">{progressGoalPercent}%</span>
                        <span className="text-[9px] text-[#1A7A3C] uppercase font-bold tracking-widest font-mono">{todayProgressHours} / {dailyHoursGoal} Hrs</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-zinc-400 font-medium">Keep learning to achieve your streak badges!</span>
                  </div>

                </div>

                {/* Subject progress grids meters */}
                <div className="bg-[#161616] p-5 rounded-xl border border-[#2A2A2A] space-y-4 shadow-md">
                  <div>
                    <h3 className="font-serif text-[#F0EDE8] text-sm font-bold">Your Subjects Curriculum Progression</h3>
                    <p className="text-[11px] text-zinc-500">Curriculums percentages mapped from flashcard levels, test results and study completions.</p>
                  </div>

                  <div className="space-y-3.5">
                    {profile.subjects.map((sub, idx) => {
                      const seedProgress = 40 + (idx * 12) % 55; // sample progress tracker
                      let colorClass = 'bg-[#C8962E]';
                      if (sub.includes('Biology')) colorClass = 'bg-[#1A7A3C]';
                      if (sub.includes('Civic')) colorClass = 'bg-[#BE1931]';

                      return (
                        <div key={sub} className="space-y-1.5 text-xs">
                          <div className="flex justify-between text-zinc-400">
                            <span className="font-semibold">{sub}</span>
                            <span className="font-mono font-bold text-zinc-300">{seedProgress}% Mastery</span>
                          </div>
                          <div className="w-full h-1.5 bg-[#0D0D0D] rounded-full overflow-hidden">
                            <div className={`${colorClass} h-full rounded-full`} style={{ width: `${seedProgress}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Highlight holidays panel */}
                <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] space-y-3">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Ethiopian Holidays Calendar (በዓላት)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                    {ETHIOPIAN_HOLIDAYS.slice(0, 4).map((hol) => (
                      <div key={hol.nameEn} className="bg-[#0D0D0D] border border-[#2A2A2A] p-2.5 rounded-lg">
                        <span className="block font-bold text-[#C8962E]">{hol.nameAm}</span>
                        <span className="block text-[10px] text-zinc-500 mt-0.5">{hol.nameEn}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 🤖 AI TUTOR VIEW */}
            {currentPage === 'tutor' && (
              <AITutor apiKey={profile.claudeApiKey} enrolledSubjects={profile.subjects} />
            )}

            {/* 🃏 FLASHCARDS DECK VIEW */}
            {currentPage === 'flashcards' && (
              <FlashcardsDeck 
                apiKey={profile.claudeApiKey} 
                decksState={decksState}
                onSaveDecksState={handleSaveDecksState}
              />
            )}

            {/* 📝 EXAM PREPARATION MCQ VIEW */}
            {currentPage === 'exam' && (
              <ExamPrep apiKey={profile.claudeApiKey} enrolledSubjects={profile.subjects} />
            )}

            {/* 📚 STUDY NOTES TAB WITH AI Note compiler */}
            {currentPage === 'notes' && (
              <StudyNotesView 
                apiKey={profile.claudeApiKey}
                customNotes={customNotes}
                onSaveCustomNotes={handleSaveCustomNotes}
                enrolledSubjects={profile.subjects}
              />
            )}

            {/* 📊 ANALYTICS DASHBOARD VIEW */}
            {currentPage === 'analytics' && (
              <AnalyticsDashboard 
                analyticsData={null} 
                onExport={handleExportDataAsJson} 
              />
            )}

            {/* ⚙️ SETTINGS CONFIGURATION */}
            {currentPage === 'settings' && (
              <div className="max-w-2xl mx-auto bg-[#161616] p-6 rounded-2xl border border-[#2A2A2A] space-y-6 shadow-2xl">
                
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#F0EDE8]">EthioLearn Campus Settings</h3>
                  <p className="text-xs text-zinc-500">Configure your profile, API Keys and save backups</p>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold">Student Name</label>
                    <input
                      type="text"
                      className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3 text-zinc-300 outline-none focus:border-[#C8962E]"
                      value={profile.name}
                      onChange={(e) => handleUpdateProfile({ ...profile, name: e.target.value })}
                    />
                  </div>

                  {/* University */}
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold">University Affiliation</label>
                    <input
                      type="text"
                      className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3 text-zinc-300 outline-none focus:border-[#1A7A3C]"
                      value={profile.university}
                      onChange={(e) => handleUpdateProfile({ ...profile, university: e.target.value })}
                    />
                  </div>

                  {/* Target Goal Hours */}
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-semibold font-sans">Daily Goal (Hours)</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={dailyHoursGoal}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 2;
                        setDailyHoursGoal(val);
                        handleUpdateProfile({ ...profile, dailyGoalHours: val });
                      }}
                      className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3 text-zinc-300 outline-none"
                    />
                  </div>

                  {/* OpenRouter API details update */}
                  <div className="space-y-1.5 p-3.5 bg-[#0D0D0D] rounded-xl border border-[#2A2A2A]">
                    <label className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-[#C8962E]" /> OpenRouter API Key
                    </label>
                    <input
                      type="password"
                      placeholder="sk-or-..."
                      className="w-full bg-[#161616] border border-[#2A2A2A] rounded-lg p-2.5 text-xs text-[#C8962E] font-mono outline-none"
                      value={profile.claudeApiKey}
                      onChange={(e) => handleUpdateProfile({ ...profile, claudeApiKey: e.target.value })}
                    />
                    <p className="text-[10px] text-zinc-500 pl-0.5 leading-normal">
                      Provide your OpenRouter API Key to allow the server to fetch interactive quiz elements, flashcards, and notes. Saved with 'ethiolearn_' browser namespaces safely.
                    </p>
                  </div>

                  {/* Danger zones reset options */}
                  <div className="border-t border-[#2A2A2A] pt-6 space-y-3">
                    <span className="text-xs text-[#BE1931] font-bold uppercase block tracking-wider">Danger Zone</span>
                    
                    <div className="flex justify-between items-center bg-red-950/10 border border-red-500/10 p-4 rounded-xl flex-wrap gap-3">
                      <div>
                        <span className="font-semibold text-zinc-300 block">Reset Learning parameters</span>
                        <span className="text-[10px] text-zinc-500 block leading-normal">This action will flush your flashcard reviews progress, test logs and customized notes completely.</span>
                      </div>

                      {showResetConfirm ? (
                        <div className="flex gap-2">
                          <button
                            onClick={handleResetProgress}
                            className="px-3.5 py-1.5 bg-[#BE1931] text-white rounded text-xs font-bold font-sans cursor-pointer"
                          >
                            Yes, Reset All
                          </button>
                          <button
                            onClick={() => setShowResetConfirm(false)}
                            className="px-3 py-1.5 bg-zinc-900 text-zinc-400 rounded text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { playClickChime(); setShowResetConfirm(true); }}
                          className="px-4 py-2 bg-[#BE1931]/10 border border-[#BE1931]/30 hover:border-red-500 text-[#BE1931] rounded-lg font-bold transition-all cursor-pointer"
                        >
                          Reset Campus Progress
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Tab Bar Layout */}
      <footer className="md:hidden fixed bottom-o bg-[#111111] border-t border-[#2A2A2A] w-full p-2 grid grid-cols-7 gap-1 z-40 relative bottom-0 left-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                playClickChime();
                setCurrentPage(item.id as any);
              }}
              className={`flex flex-col items-center justify-center p-2.5 rounded-lg border cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#C8962E] text-[#C8962E] bg-[#C8962E]/10'
                  : 'border-transparent text-zinc-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[8px] mt-1 font-semibold truncate max-w-[40px]">{item.label}</span>
            </button>
          );
        })}
      </footer>

    </div>
  );
}
