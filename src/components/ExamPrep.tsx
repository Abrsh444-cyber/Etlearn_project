import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, Trophy, Zap, Clock, Calendar, ArrowRight, Sparkles, FileText, CheckCircle, XCircle, HelpCircle, Award, RefreshCw
} from 'lucide-react';
import { playClickChime, playSuccessChime, playFailureChime } from '../utils/audio';
import { generateQuizAI, submitClaudeChat, ChatMessage } from '../utils/ai';

interface ExamPrepProps {
  apiKey: string;
  enrolledSubjects: string[];
  onStudyAction?: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

const PAST_EXAM_BANK: { [subject: string]: QuizQuestion[] } = {
  "Emerging Technologies": [
    {
      question: "Which technology acts as the underlying fabric enabling the secure decentralization of cryptocurrencies without middlemen?",
      options: ["Centralized cloud clusters", "Blockchain distributed ledgers", "Quantum supercomputing", "Edge mesh nodes"],
      correctAnswer: "Blockchain distributed ledgers",
      explanation: "Blockchain technology employs decentralized consensus mechanisms (like Proof of Work/Stake) to secure accounting books without trusting central banks or middlemen."
    },
    {
      question: "What is the primary operational advantage of implementing Edge Computing in remote industrial networks?",
      options: ["Massive cloud data-center compilation", "Reduced latency by processing closer to host devices", "Infinitely high energy consumption profiles", "Lower overall cryptography overhead"],
      correctAnswer: "Reduced latency by processing closer to host devices",
      explanation: "Edge processing handles immediate data local to the collection node, cutting transmission latency to remote servers and saving network bandwidth."
    }
  ],
  "Introduction to Economics": [
    {
      question: "Which state of a typical free market represents the stable price-point where consumer demand perfectly equals producer supply?",
      options: ["Systemic inflation", "Equilibrium price level", "Economic stagnation", "Mercantile deficit"],
      correctAnswer: "Equilibrium price level",
      explanation: "Market equilibrium occurs at the intersection of supply and demand curves. No supply surplus or demand deficit forces price adjustments."
    },
    {
      question: "What unique Giffen Good feature violates the fundamental 'Law of Demand' in microeconomics?",
      options: ["An increase in price leads to an increase in demand", "Demand falls to zero immediately upon price adjustments", "Producers refuse to supply items below premium limits", "The substitution effect eclipses real-income restrictions"],
      correctAnswer: "An increase in price leads to an increase in demand",
      explanation: "For highly essential inferior foods like staple grains in low-income populations, a high price reduces disposable cash, forcing families to buy more basic grains instead of expensive meats."
    }
  ],
  "General Biology": [
    {
      question: "What primary chemical organelle hosts the aerobic Krebs (Citric Acid) Cycle within organic eukaryotic cells?",
      options: ["Cytosolic ribosomes", "The inner mitochondria matrix", "Nucleolar envelope membranes", "Lysosome digestion bubbles"],
      correctAnswer: "The inner mitochondria matrix",
      explanation: "While glycolysis happens in the cytosol, the Citric Acid Cycle occurs inside the mitochondrial matrix to synthesize NADH, FADH2, and ATP precursors."
    },
    {
      question: "Which cellular cycle phase copies genetic chromatid structures to prepare cells for real mitosis division?",
      options: ["G0 stagnant resting stage", "S (Synthesis) phase of Interphase", "Prophase spindle convergence", "Telophase cytokinetics split"],
      correctAnswer: "S (Synthesis) phase of Interphase",
      explanation: "DNA replication is completed in the S-Phase (Synthesis Phase) of the cell cycle, ensuring each resulting daughter cell gets a perfect genome duplicate."
    }
  ],
  "Communicative English": [
    {
      question: "Choose the correct indirect reported statement for: \"I am studying biology tonight,\" said Almaz.",
      options: [
        "Almaz said she is studying biology tonight.",
        "Almaz said she was studying biology that night.",
        "Almaz said I had been studying biology tonight.",
        "Almaz says she studied biology that night."
      ],
      correctAnswer: "Almaz said she was studying biology that night.",
      explanation: "When reporting speech, present continuous shifts to past continuous ('am studying' -> 'was studying'), and time phrases shift ('tonight' -> 'that night')."
    }
  ],
  "Moral and Civic Education": [
    {
      question: "Which founding document governs the modern federal structure and human rights standards of the Federal Democratic Republic of Ethiopia?",
      options: ["The 1931 imperial decree", "The 1987 Derg legal template", "The 1995 FDRE Constitution", "The Fetha Nagast historical code"],
      correctAnswer: "The 1995 FDRE Constitution",
      explanation: "The 1995 Constitution of the FDRE established the current ethnic-based federal structure, decentralized administrative powers, and coded core democratic rights."
    }
  ]
};

export default function ExamPrep({ apiKey, enrolledSubjects, onStudyAction }: ExamPrepProps) {
  const [selectedSubject, setSelectedSubject] = useState(enrolledSubjects[0] || "Emerging Technologies");
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qCount, setQCount] = useState<number>(5);

  // Load language settings from localStorage
  const [language, setLanguage] = useState<'en' | 'am'>(() => {
    const saved = localStorage.getItem('ethiolearn_language_preference');
    return (saved === 'am' || saved === 'en') ? saved : 'en';
  });

  const [examMode, setExamMode] = useState<'setup' | 'active' | 'results'>('setup');
  const [examQuestions, setExamQuestions] = useState<QuizQuestion[]>([]);
  const [activeQIndex, setActiveQIndex] = useState<number>(0);
  
  // Quiz evaluation states
  const [userSelections, setUserSelections] = useState<{ [qIndex: number]: string }>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState<boolean>(false);
  
  const [examScore, setExamScore] = useState<number>(0);
  const [examGrade, setExamGrade] = useState<'A' | 'B' | 'C' | 'D' | 'F'>('F');
  const [pastSessions, setPastSessions] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem("ethiolearn_exam_sessions_history");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [loadingText, setLoadingText] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(60);
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; color: string; duration: number; size: number }[]>([]);

  // Revision tool
  const [revisionTopic, setRevisionTopic] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [revisionOutput, setRevisionOutput] = useState('');

  const examTimerRef = useRef<any>(null);

  // Sync language with state changes
  useEffect(() => {
    const handleLangChange = () => {
      const saved = localStorage.getItem('ethiolearn_language_preference');
      if (saved === 'am' || saved === 'en') {
        setLanguage(saved);
      }
    };
    window.addEventListener('storage', handleLangChange);
    // Interval check for in-app page transfers
    const interval = setInterval(handleLangChange, 1000);
    return () => {
      window.removeEventListener('storage', handleLangChange);
      clearInterval(interval);
    };
  }, []);

  const triggerDopaminePop = () => {
    const colors = ['#078930', '#FCDD09', '#BE1931', '#2563EB', '#8B5CF6'];
    const newList = Array.from({ length: 30 }).map((_, i) => ({
      id: Date.now() + i,
      left: Math.random() * 85 + 5,
      top: Math.random() * 30 + 40,
      color: colors[i % colors.length],
      duration: 0.8 + Math.random() * 0.7,
      size: 5 + Math.random() * 7
    }));
    setParticles(newList);
    setTimeout(() => setParticles([]), 2200);
  };

  const handleStartPastExam = () => {
    const bank = PAST_EXAM_BANK[selectedSubject];
    if (!bank || bank.length === 0) {
      setLoadingText(
        language === 'en' 
          ? "No hand-verified past papers available for this grade yet. We will generate questions with AI!" 
          : "በዚህ የትምህርት ምርጫ የተዘጋጀ ፈተና የለም። በአይ እናዘጋጅልዎታለን!"
      );
      playFailureChime();
      setTimeout(() => {
        setLoadingText(null);
        handleGenerateMockAI();
      }, 2500);
      return;
    }

    playClickChime();
    setExamQuestions(bank);
    setExamMode('active');
    setActiveQIndex(0);
    setUserSelections({});
    setIsAnswerRevealed(false);
    setTimeRemaining(90);
    startQuestionTimer(90);
  };

  const handleGenerateMockAI = async () => {
    setLoadingText(
      language === 'en'
        ? `Contacting AI to formulate a customized ${difficulty} quiz for you...`
        : `አይ መምህር የፈተና ጥያቄዎችን እያዘጋጀ ነው...`
    );
    playClickChime();

    try {
      const topic = `curriculum of ${selectedSubject} of grade high standards containing exactly ${qCount} multiple choice questions`;
      const questions = await generateQuizAI(topic, selectedSubject, apiKey);
      if (questions && questions.length > 0) {
        setExamQuestions(questions.slice(0, qCount));
        setExamMode('active');
        setActiveQIndex(0);
        setUserSelections({});
        setIsAnswerRevealed(false);
        setLoadingText(null);
        setTimeRemaining(60);
        startQuestionTimer(60);
        playSuccessChime();
      } else {
        throw new Error("Unable to formulate quiz questions from AI.");
      }
    } catch (err: any) {
      console.warn('AI exam generation failed/offline. Activating exam bank fallback:', err);
      
      // Look up subject in local bank or default to Emerging Technologies
      let fallbackList = PAST_EXAM_BANK[selectedSubject] || PAST_EXAM_BANK["Emerging Technologies"];
      
      setExamQuestions(fallbackList);
      setExamMode('active');
      setActiveQIndex(0);
      setUserSelections({});
      setIsAnswerRevealed(false);
      setLoadingText(null);
      setTimeRemaining(90);
      startQuestionTimer(90);
      
      // Show notice of local fallback
      const notice = language === 'en' 
        ? "AI was offline or slow. Loaded official curriculum practice questions from local library instead."
        : "አይ መምህሩ ከመስመር ውጭ በመሆኑ ምክንያት ጥያቄዎችን ከመካነ-መዝገቡ አምጥተናቸዋል።";
      alert(notice);
      playSuccessChime();
    }
  };

  const startQuestionTimer = (seconds: number) => {
    clearInterval(examTimerRef.current);
    setTimeRemaining(seconds);
    examTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(examTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOptionSelect = (option: string) => {
    if (isAnswerRevealed) return; // Answer locked

    setUserSelections(prev => ({ ...prev, [activeQIndex]: option }));
    setIsAnswerRevealed(true);
    clearInterval(examTimerRef.current);

    const question = examQuestions[activeQIndex];
    if (option === question.correctAnswer) {
      playSuccessChime();
      triggerDopaminePop();
    } else {
      playFailureChime();
    }
    onStudyAction?.();
  };

  const handleNextQuestion = () => {
    playClickChime();
    setIsAnswerRevealed(false);
    
    if (activeQIndex < examQuestions.length - 1) {
      setActiveQIndex(activeQIndex + 1);
      const seconds = 60;
      startQuestionTimer(seconds);
    } else {
      calculateExamResults();
    }
  };

  const calculateExamResults = () => {
    let score = 0;
    examQuestions.forEach((q, idx) => {
      const selected = userSelections[idx];
      if (selected === q.correctAnswer) {
        score++;
      }
    });

    const percent = Math.round((score / examQuestions.length) * 100);
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
    if (percent >= 85) grade = 'A';
    else if (percent >= 70) grade = 'B';
    else if (percent >= 55) grade = 'C';
    else if (percent >= 40) grade = 'D';

    setExamScore(score);
    setExamGrade(grade);
    setExamMode('results');

    // Save logs to history
    const newSession = {
      id: `session_${Date.now()}`,
      subject: selectedSubject,
      date: new Date().toLocaleDateString(),
      score: percent,
      grade
    };

    const updatedSessions = [newSession, ...pastSessions].slice(0, 15);
    setPastSessions(updatedSessions);
    localStorage.setItem("ethiolearn_exam_sessions_history", JSON.stringify(updatedSessions));

    // Save last score for Dashboard "Continue where left off" helper
    localStorage.setItem('ethiolearn_last_subject', selectedSubject);
    localStorage.setItem('ethiolearn_last_quiz_score', percent.toString());

    // Update global diagnostics metrics
    try {
      const analytics = JSON.parse(localStorage.getItem("ethiolearn_analytics") || "{}");
      analytics.examsDone = (analytics.examsDone || 0) + 1;
      analytics.examHistory = analytics.examHistory || [];
      analytics.examHistory.push({
        date: new Date().toLocaleDateString(),
        score: percent
      });
      localStorage.setItem("ethiolearn_analytics", JSON.stringify(analytics));
    } catch(e) {}

    playSuccessChime();
    triggerDopaminePop();
  };

  // AI 5-Minute summaries
  const runRevisionAI = async () => {
    if (!revisionTopic.trim()) return;
    setIsSummarizing(true);
    setRevisionOutput('');
    playClickChime();

    try {
      const sysPr = "You are a concise academic summary annotator. Summarize requested concepts into five bullet points using simple formatting, highlighting memory tricks.";
      const messages: ChatMessage[] = [{ role: 'user', content: `Summarize the topic: "${revisionTopic}" under the subject "${selectedSubject}" in a 5-minute revision card.` }];

      await submitClaudeChat(messages, sysPr, apiKey, {
        onChunk: (chunk) => {
          setRevisionOutput(prev => prev + chunk);
        },
        onComplete: (full) => {
          setIsSummarizing(false);
          setRevisionOutput(full);
          playSuccessChime();
        },
        onError: (err) => {
          setIsSummarizing(false);
          setRevisionOutput(
            language === 'en'
              ? `Revision formulation failed: ${err}`
              : `ማጠቃለያውን ማውጣት አልተቻለም፡ ${err}`
          );
          playFailureChime();
        }
      });
    } catch (err: any) {
      setIsSummarizing(false);
      setRevisionOutput(`Error: ${err}`);
      playFailureChime();
    }
  };

  return (
    <div className="space-y-6">
      <AnimatePresence mode="wait">
        {/* SETUP SCREEN */}
        {examMode === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Form configuration panel */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Compass className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-base text-slate-900">
                  {language === 'en' ? 'Start a Quiz' : 'ፈተና ጀምር'}
                </h3>
              </div>

              {/* Subject dropdown */}
              <div className="space-y-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <label>{language === 'en' ? 'Subject / ኮርስ' : 'የትምህርት አይነት'}</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 font-sans font-semibold rounded-xl py-3 px-3.5 outline-none cursor-pointer focus:border-emerald-600"
                >
                  {enrolledSubjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Question count options */}
              <div className="space-y-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <label>{language === 'en' ? 'Length / ብዛት' : 'የጥያቄዎች ብዛት'}</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  {[5, 10, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => { setQCount(count); playClickChime(); }}
                      className={`py-2 text-xs font-bold rounded-lg cursor-pointer ${
                        qCount === count ? 'bg-[#078930] text-white shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      {count} {language === 'en' ? 'Qns' : 'ጥያቄ'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 space-y-3">
                <button
                  onClick={handleGenerateMockAI}
                  className="w-full h-12 min-h-[48px] bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-sm font-serif font-extrabold tracking-wide rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Sparkles className="w-4 h-4" />
                  {language === 'en' ? 'Formulate Quiz with AI' : 'በአይ ፈተና አዘጋጅ'}
                </button>

                <button
                  onClick={handleStartPastExam}
                  className="w-full h-12 min-h-[48px] bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-serif font-extrabold tracking-wide rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  {language === 'en' ? 'Start Classic Paper' : 'የተለመዱ የድሮ ፈተናዎች'}
                </button>
              </div>

              {loadingText && (
                <div className="p-3 bg-emerald-55/30 border border-emerald-500/20 rounded-xl text-center text-xs text-emerald-800 font-bold animate-pulse">
                  {loadingText}
                </div>
              )}
            </div>

            {/* AI Revision helper cards */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Zap className="w-5 h-5 text-amber-500 animate-bounce" />
                <h3 className="font-serif font-bold text-base text-slate-900">
                  {language === 'en' ? '5-Min Topic Summary' : 'ፈጣን ማጠቃለያ'}
                </h3>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {language === 'en' ? 'Enter any topic and get immediate bullet notes to review before exams!' : 'ያልገባዎትን ርዕስ እዚህ ይጻፉና በአጭር ነጥቦች ተዘጋጅቶ ይከልሱት!'}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Mitochondria, GDP, FDRE..."
                    value={revisionTopic}
                    onChange={(e) => setRevisionTopic(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 outline-none"
                  />
                  <button
                    onClick={runRevisionAI}
                    disabled={isSummarizing || !revisionTopic.trim()}
                    className="h-10 px-4 bg-[#078930] hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-40"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {revisionOutput ? (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed max-h-60 overflow-y-auto whitespace-pre-line text-slate-700 font-sans">
                  {revisionOutput}
                </div>
              ) : (
                <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 font-serif">
                  {language === 'en' ? 'Notes outcome will compile here...' : 'የተዘጋጀው ማጠቃለያ እዚህ ላይ ይወጣል...'}
                </div>
              )}
            </div>

            {/* Score logs list */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Trophy className="w-5 h-5 text-emerald-600" />
                <h3 className="font-serif font-bold text-base text-[#078930]">
                  {language === 'en' ? 'Performance Logs' : 'የውጤት መዝገብ'}
                </h3>
              </div>

              {pastSessions.length === 0 ? (
                <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 font-serif">
                  {language === 'en' ? 'Your test grades history is currently empty' : 'የወሰዷቸው ፈተናዎች ውጤት እዚህ ሙሉ ታሪክ ሆኖ ይቀመጣል'}
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {pastSessions.map((sess, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block leading-tight">{sess.subject}</span>
                        <span className="text-[10px] text-slate-400 mt-0.5 block">{sess.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-sm text-emerald-600 block">{sess.score}%</span>
                        <span className="block text-[10px] font-black uppercase text-amber-600">Grade {sess.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ACTIVE EXAM RUNNING SCREEN */}
        {examMode === 'active' && examQuestions.length > 0 && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-md space-y-5"
          >
            {/* Visual Progress Bar (Requirement) */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase font-mono">
                <span>{selectedSubject}</span>
                <span className="text-emerald-700">
                  {language === 'en' 
                    ? `Question ${activeQIndex + 1} of ${examQuestions.length}`
                    : `ጥያቄ ${activeQIndex + 1} ከ ${examQuestions.length}`}
                </span>
              </div>
              
              {/* Actual HTML progress percentage indicators bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-[#078930] h-full rounded-full transition-all duration-300" 
                  style={{ width: `${((activeQIndex + 0.5) / examQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Timer card block */}
            <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="text-xs font-semibold text-slate-500">
                {language === 'en' ? 'Choose carefully to get feedback' : 'መልካም ፈተና ይሁንልዎት!'}
              </span>
              <span className="flex items-center gap-1 text-xs font-extrabold font-mono text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 select-none">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                {timeRemaining} Seconds
              </span>
            </div>

            {/* Question Text block */}
            <div className="space-y-5 py-2">
              <h3 className="font-serif text-lg text-slate-900 font-extrabold leading-relaxed">
                {examQuestions[activeQIndex]?.question}
              </h3>

              {/* LARGE BUTTONS lists selecting - h-14 min-h-[48px], responsive (Requirement) */}
              <div className="grid grid-cols-1 gap-2.5">
                {examQuestions[activeQIndex]?.options.map((opt: string) => {
                  const isSelected = userSelections[activeQIndex] === opt;
                  const isCorrect = examQuestions[activeQIndex].correctAnswer === opt;
                  
                  let btnColorStyle = "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300";
                  
                  // Instant feedback coloring rule (Green for Correct, Red for Incorrect)
                  if (isAnswerRevealed) {
                    if (isCorrect) {
                      btnColorStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-extrabold ring-1 ring-emerald-500";
                    } else if (isSelected) {
                      btnColorStyle = "bg-red-50 border-red-500 text-red-800 font-extrabold ring-1 ring-red-500";
                    } else {
                      btnColorStyle = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                    }
                  } else if (isSelected) {
                    btnColorStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold";
                  }

                  return (
                    <button
                      key={opt}
                      disabled={isAnswerRevealed}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full min-h-[48px] h-14 px-4 rounded-xl text-left text-sm leading-snug font-sans transition-all flex items-center justify-between border-2 shadow-sm cursor-pointer select-none ${btnColorStyle}`}
                    >
                      <span>{opt}</span>
                      {isAnswerRevealed && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 ml-1" />}
                      {isAnswerRevealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-600 shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation card dynamically revealed below options if answered (Requirement) */}
            {isAnswerRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-2 text-xs text-slate-600 space-y-1.5"
              >
                <div className="flex items-center gap-1.5 font-extrabold text-slate-800 uppercase tracking-wide">
                  {userSelections[activeQIndex] === examQuestions[activeQIndex].correctAnswer ? (
                    <span className="text-[#078930] flex items-center gap-1">🌟 {language === 'en' ? 'Excellent! Correct' : 'በጣም ጎበዝ! መልስዎ ትክክል ነው'}</span>
                  ) : (
                    <span className="text-red-600 flex items-center gap-1">✨ {language === 'en' ? 'Incorrect' : 'ትክክለኛው መልስ አልነበረም'}</span>
                  )}
                </div>
                <p className="font-sans leading-normal font-medium italic">
                  {examQuestions[activeQIndex]?.explanation || (language === 'en' ? 'Review your subject textbooks.' : 'በመማሪያ መጽሐፉ ላይ ያሉትን ማብራሪያዎች ያንብቡ።')}
                </p>
              </motion.div>
            )}

            {/* Bottom Proceed bar */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={handleNextQuestion}
                disabled={!userSelections[activeQIndex]}
                className="w-full sm:w-auto h-12 px-6 bg-[#078930] hover:bg-emerald-700 text-white font-serif font-extrabold text-sm rounded-xl flex items-center justify-center gap-1.5 shadow disabled:opacity-40 cursor-pointer select-none active:scale-98"
              >
                <span>
                  {activeQIndex === examQuestions.length - 1 
                    ? (language === 'en' ? 'Complete quiz ' : 'ውጤት ይመልከቱ ') 
                    : (language === 'en' ? 'Next Question ' : 'ቀጣይ ጥያቄ ')}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* RESULTS CELEBRATORY SCREEN */}
        {examMode === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-6 relative overflow-hidden shadow-lg"
          >
            {/* Dopamine confetti floating particles */}
            {particles.map(p => (
              <div 
                key={p.id}
                className="absolute pointer-events-none rounded-full particle-reward-rise z-50"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  backgroundColor: p.color,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDuration: `${p.duration}s`
                }}
              />
            ))}

            <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-100 text-[#078930] rounded-full flex items-center justify-center mx-auto text-3xl font-serif font-black shadow-inner">
              {examGrade}
            </div>

            <div className="space-y-1.5">
              <h2 className="font-serif text-2xl font-black text-slate-900 leading-tight">
                {language === 'en' ? 'Quiz Session Finalized!' : 'የፈተና ጊዜ ተጠናቋል!'}
              </h2>
              
              {/* Amharic Encouragement Custom block based on score rules (Requirement) */}
              <p className="text-lg font-serif font-bold text-[#078930]">
                {Math.round((examScore / examQuestions.length) * 100) >= 80 ? (
                  <span>ጎበዝ! ምርጥ ስራ ነው 🌟 <span className="block text-xs font-sans text-slate-400 mt-1">Excellent! Keep up this high standard!</span></span>
                ) : Math.round((examScore / examQuestions.length) * 100) >= 50 ? (
                  <span>በጣም ጥሩ! በርታ/በርቺ 💪 <span className="block text-xs font-sans text-slate-400 mt-1">Great job! Keep trying and advancing!</span></span>
                ) : (
                  <span>ተስፋ አትቁረጥ! ይቻላል ✨ <span className="block text-xs font-sans text-slate-400 mt-1">Never give up under hard steps!</span></span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs bg-slate-50 p-4 border border-slate-200 rounded-xl shadow-inner">
              <div className="space-y-0.5">
                <span className="text-slate-400 font-bold uppercase">{language === 'en' ? 'Score' : 'ውጤት'}</span>
                <span className="font-mono text-base font-extrabold text-slate-800 block">{examScore} / {examQuestions.length}</span>
              </div>

              <div className="space-y-0.5">
                <span className="text-slate-400 font-bold uppercase">{language === 'en' ? 'Percentage' : 'በመቶኛ'}</span>
                <span className="font-mono text-base font-extrabold text-[#078930] block">
                  {Math.round((examScore / examQuestions.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Detailed answers logging recap */}
            <div className="text-left bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 text-xs max-h-56 overflow-y-auto">
              <p className="font-bold text-slate-700 pb-1.5 border-b border-slate-200 font-serif">
                {language === 'en' ? 'Questions Recap' : 'ለጥያቄዎች የተሰጡ መልሶች፡'}
              </p>
              {examQuestions.map((q, idx) => {
                const isCorrect = userSelections[idx] === q.correctAnswer;
                return (
                  <div key={idx} className="pb-2 border-b border-slate-100 last:border-none last:pb-0 font-sans">
                    <p className="font-medium text-slate-800 flex items-start gap-1">
                      <span className={isCorrect ? "text-[#078930] font-black" : "text-red-500 font-black"}>
                        {isCorrect ? "✓" : "✗"}
                      </span>
                      <span>
                        {language === 'en' ? 'Qns' : 'ጥያቄ'} {idx + 1}: {q.question}
                      </span>
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => { playClickChime(); setExamMode('setup'); }}
              className="w-full h-12 bg-[#078930] hover:bg-emerald-700 text-white font-serif font-extrabold text-sm rounded-xl cursor-pointer"
            >
              {language === 'en' ? 'Practice Another Quiz' : 'ሌላ የፈተና ጥያቄ ውሰድ'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
