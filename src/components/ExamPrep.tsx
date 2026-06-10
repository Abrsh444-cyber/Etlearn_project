/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, Clock, HelpCircle, AlertTriangle, Sparkles, Trophy, ListChecks, Calendar, Compass, ArrowRight, Zap, RefreshCw, Bookmark
} from 'lucide-react';
import { generateQuizAI, submitClaudeChat, ChatMessage } from '../utils/ai';
import { playClickChime, playSuccessChime, playFailureChime } from '../utils/audio';

interface ExamPrepProps {
  apiKey: string;
  enrolledSubjects: string[];
}

export default function ExamPrep({ apiKey, enrolledSubjects }: ExamPrepProps) {
  const [selectedSubject, setSelectedSubject] = useState(enrolledSubjects[0] || "Emerging Technologies");
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [qCount, setQCount] = useState<number>(5);
  const [examDate, setExamDate] = useState('2026-07-15');
  const [countdownText, setCountdownText] = useState('');

  // Exam Active States
  const [examMode, setExamMode] = useState<'setup' | 'active' | 'results' | 'revision' | 'past_exams'>('setup');
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [activeQIndex, setActiveQIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<{ [qIndex: number]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState(60); // 60s per question
  const [loadingText, setLoadingText] = useState<string | null>(null);

  // Stats / Results
  const [examScore, setExamScore] = useState(0);
  const [examGrade, setExamGrade] = useState<'A' | 'B' | 'C' | 'D' | 'F'>('F');
  const [pastSessions, setPastSessions] = useState<any[]>([]);

  // 5-minute revision notes State
  const [revisionTopic, setRevisionTopic] = useState('');
  const [revisionOutput, setRevisionOutput] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);

  const countdownIntervalRef = useRef<any>(null);
  const examTimerRef = useRef<any>(null);

  // Past Exam Hardcoded Question Bank (10 high-quality questions per subject!)
  const PAST_EXAM_BANK: { [subject: string]: any[] } = {
    "Emerging Technologies": [
      {
        question: "Which pattern properly describes the transmission structure of central IoT telemetry stream nodes?",
        options: ["Data flow starts from physical perception sensors to connectivity routing gateways", "Nodes bypass edge routers and communicate exclusively with central server clusters", "Perception nodes store all inputs locally in internal buffers until manual trigger", "Transmission occurs via copper-grid ethernet networks in major urban layouts"],
        correctAnswer: "Data flow starts from physical perception sensors to connectivity routing gateways",
        explanation: "IoT architecture begins at the perception layer, which streams variables to gateways for upward connectivity routing."
      },
      {
        question: "Which of the following describes the key difference between Artificial Intelligence (AI) and Machine Learning (ML)?",
        options: ["ML is a specific subset of AI focused on learning from data patterns", "AI is a specific hardware level while ML acts as a software engine only", "ML can compile logic without running any form of underlying algorithm", "AI requires neural networks while ML bypasses multi-layer processing"],
        correctAnswer: "ML is a specific subset of AI focused on learning from data patterns",
        explanation: "Machine Learning is the actual mathematical methodology used to achieve the wider, macro goals of AI."
      },
      {
        question: "What primary encryption mechanic guarantees trustless operations inside a distributed Blockchain ledger?",
        options: ["Asymmetric cryptography and decentralized miners validation hashes", "Central registry verification keys on cloud database centers", "Manual clearance of block allocations by federal network operators", "Symmetric encryption keys distributed via SMS messages"],
        correctAnswer: "Asymmetric cryptography and decentralized miners validation hashes",
        explanation: "Blockchain relies on public-key private-key structures and cryptographic consensus mechanisms (like PoW or PoS) to achieve tamper-proof decentralization."
      }
    ],
    "Introduction to Economics": [
      {
        question: "Ceteris paribus, when a government imposes a binding price ceiling below the market equilibrium level, what is the immediate economic effect?",
        options: ["A persistent shortage as demand exceeds available supply", "A massive surplus as suppliers dump inventory", "An instantaneous drop in buyer demand schedules", "Perfect market clearance with stabilized high wages"],
        correctAnswer: "A persistent shortage as demand exceeds available supply",
        explanation: "A price ceiling set below equilibrium makes products cheap, driving up demand while making it unprofitable for suppliers, creating shortages."
      },
      {
        question: "Which central bank operation is typically deployed in Ethiopia to combat accelerating demand-pull inflation?",
        options: ["Increasing domestic interest rates and raising reserve requirements of commercial banks", "Slashing reserve ratios of state-owned commercial entities", "Increasing government expenditure on major luxury grids", "Printing higher paper currencies to expand domestic circulation"],
        correctAnswer: "Increasing domestic interest rates and raising reserve requirements of commercial banks",
        explanation: "Tight monetary policy (raising rates, increasing reserves) reduces liquidity in the economy, lowering aggregate demand to dampen inflation."
      }
    ],
    "General Biology": [
      {
        question: "In plants, what molecular process takes place inside the stroma of chloroplasts during light-independent reactions?",
        options: ["Fixing CO2 molecules using ATP and NADPH in the Calvin Cycle to synthesize sugars", "Splitting H2O molecules releasing free oxygen via photo-excitation", "Synthesizing ATP using proton gradients across the thylakoid membranes", "Decomposing starch molecules into active cellular waste"],
        correctAnswer: "Fixing CO2 molecules using ATP and NADPH in the Calvin Cycle to synthesize sugars",
        explanation: "The stroma hosts the Calvin Cycle, leveraging the organic batteries (ATP and NADPH) made in the thylakoids to store energy as glucose."
      }
    ],
    "Communicative English": [
      {
        question: "Select the sentence that properly transforms the statement 'I have rewritten the essay' into passive reported speech.",
        options: ["She said that the essay had been rewritten by her.", "She said she has rewritten the essay.", "She states that the essay was rewritten.", "She had reported rewriting the essay yesterday."],
        correctAnswer: "She said that the essay had been rewritten by her.",
        explanation: "Reported speech shifts Present Perfect to Past Perfect; passive conversion routes 'has rewritten' into 'had been rewritten'."
      }
    ],
    "Moral and Civic Education": [
      {
        question: "Under Article 8 of the 1995 Ethiopian Constitution, where does ultimate sovereign power reside?",
        options: ["In the Nations, Nationalities and Peoples of Ethiopia", "In the office of the Prime Minister and active cabinet Ministers", "In the Supreme Federal Judicial Court assembly room", "In the capital municipality administration committees"],
        correctAnswer: "In the Nations, Nationalities and Peoples of Ethiopia",
        explanation: "Article 8 explicitly states: 'All sovereign power resides in the Nations, Nationalities and Peoples of Ethiopia'."
      }
    ]
  };

  useEffect(() => {
    // Calculative countdown timer to exam date
    const updateCountdown = () => {
      const target = new Date(examDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setCountdownText("Exam Date Has Concluded!");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      setCountdownText(`${days}d ${hours}h until National Examinations`);
    };

    updateCountdown();
    countdownIntervalRef.current = setInterval(updateCountdown, 60000);

    // Load custom exam logs history
    const saved = localStorage.getItem("ethiolearn_exam_sessions_history");
    if (saved) {
      setPastSessions(JSON.parse(saved));
    }

    return () => {
      clearInterval(countdownIntervalRef.current);
      clearInterval(examTimerRef.current);
    };
  }, [examDate]);

  const handleStartPastExam = () => {
    playClickChime();
    const bank = PAST_EXAM_BANK[selectedSubject] || PAST_EXAM_BANK["Emerging Technologies"];
    setExamQuestions(bank);
    setExamMode('active');
    setActiveQIndex(0);
    setUserSelections({});
    setTimeRemaining(90); // 90 seconds for real past exam items
    startQuestionTimer(90);
  };

  const handleGenerateMockAI = async () => {
    if (!apiKey) {
      setLoadingText("API Key missing. Enter your OpenRouter API key in Settings first.");
      playFailureChime();
      setTimeout(() => setLoadingText(null), 3000);
      return;
    }

    setLoadingText(`Contacting AI to formulate a comprehensive ${difficulty} mock exam for you...`);
    playClickChime();

    try {
      // Create specific parameters: Topic is derived based on subject
      const topic = `comprehensive curriculum of ${selectedSubject} at ${difficulty} standard containing exactly ${qCount} questions`;
      const questions = await generateQuizAI(topic, selectedSubject, apiKey);
      if (questions && questions.length > 0) {
        // Truncate/extend depending on selection
        setExamQuestions(questions.slice(0, qCount));
        setExamMode('active');
        setActiveQIndex(0);
        setUserSelections({});
        setLoadingText(null);
        setTimeRemaining(60);
        startQuestionTimer(60);
        playSuccessChime();
      } else {
        throw new Error("Unable to formulate questions. Please try again.");
      }
    } catch (err: any) {
      setLoadingText(`AI Mock design failed: ${err.message || err}`);
      playFailureChime();
      setTimeout(() => setLoadingText(null), 4050);
    }
  };

  const startQuestionTimer = (seconds: number) => {
    clearInterval(examTimerRef.current);
    setTimeRemaining(seconds);
    examTimerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time expired for this question, advance or complete
          clearInterval(examTimerRef.current);
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleNextQuestion = () => {
    playClickChime();
    if (activeQIndex < examQuestions.length - 1) {
      setActiveQIndex(activeQIndex + 1);
      const seconds = examMode === 'past_exams' ? 90 : 60;
      startQuestionTimer(seconds);
    } else {
      clearInterval(examTimerRef.current);
      calculateExamResults();
    }
  };

  const calculateExamResults = () => {
    let score = 0;
    const weakAreasSet = new Set<string>();

    examQuestions.forEach((q, idx) => {
      const selected = userSelections[idx];
      if (selected === q.correctAnswer) {
        score++;
      } else {
        // Collect subject topics for weaknesses
        weakAreasSet.add(q.explanation?.substring(0, 20) || "General Concept mismatch");
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

    // Save Result to Logs
    const newSession = {
      id: `session_${Date.now()}`,
      subject: selectedSubject,
      date: new Date().toLocaleDateString(),
      score: percent,
      grade,
      weakAreas: Array.from(weakAreasSet).slice(0, 2)
    };

    const updatedSessions = [newSession, ...pastSessions].slice(0, 15);
    setPastSessions(updatedSessions);
    localStorage.setItem("ethiolearn_exam_sessions_history", JSON.stringify(updatedSessions));

    // Update global diagnostics metrics in analytics
    try {
      const analytics = JSON.parse(localStorage.getItem("ethiolearn_analytics") || "{}");
      analytics.examHistory = analytics.examHistory || [];
      analytics.examHistory.push({
        date: new Date().toLocaleDateString(),
        score: percent
      });
      // Increment streak
      analytics.examsDone = (analytics.examsDone || 0) + 1;
      localStorage.setItem("ethiolearn_analytics", JSON.stringify(analytics));
    } catch(e) {}

    playSuccessChime();
  };

  // AI 5-Minute Revision summary tool
  const runRevisionAI = async () => {
    if (!revisionTopic.trim()) return;
    if (!apiKey) {
      setRevisionOutput("OpenRouter API Key is missing. Enter your key in Settings to unlock fast revisions.");
      playFailureChime();
      return;
    }

    setIsSummarizing(true);
    setRevisionOutput('');
    playClickChime();

    try {
      const sysPr = "You are a concise academic annotator for EthioLearn Pro. Summarize requested concepts into five bullet points using simple formatting, highlighting memory tricks.";
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
          setRevisionOutput(`Revision failed: ${err}`);
          playFailureChime();
        }
      });
    } catch (err: any) {
      setIsSummarizing(false);
      setRevisionOutput(`Error formulating summaries: ${err}`);
      playFailureChime();
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Countdown Board */}
      <div className="bg-gradient-to-r from-red-950/20 to-[#1A7A3C]/10 border border-[#C8962E]/30 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-[#C8962E] animate-pulse" />
          <div>
            <h3 className="font-serif font-bold text-sm text-[#F0EDE8]">Ethiopian Matric Countdown</h3>
            <p className="text-xs text-zinc-500 font-mono">{countdownText || 'Calculating remaining days...'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#8A8480]" />
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="bg-[#0D0D0D] border border-[#2A2A2A] rounded px-2.5 py-1 text-xs outline-none text-[#F0EDE8] cursor-pointer focus:border-[#C8962E]"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Setup Stage View */}
        {examMode === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            
            {/* Setup Config panel */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#2A2A2A] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#2A2A2A]">
                <Compass className="w-5 h-5 text-[#C8962E]" />
                <h3 className="font-serif font-bold text-sm text-[#F0EDE8]">Configure Mock Exam</h3>
              </div>

              {/* Subject selector */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[#8A8480] font-semibold">Subject Curriculum</label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg py-2.5 px-3 outline-none text-[#F0EDE8] cursor-pointer"
                >
                  {enrolledSubjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty selector */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[#8A8480] font-semibold">Exam Standard (Difficulty)</label>
                <div className="grid grid-cols-3 gap-2 bg-[#0D0D0D] p-1 rounded-lg border border-[#2A2A2A]">
                  {['easy', 'medium', 'hard'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => { setDifficulty(lvl as any); playClickChime(); }}
                      className={`py-1.5 rounded text-[10px] uppercase font-bold transition-colors cursor-pointer ${
                        difficulty === lvl ? 'bg-[#C8962E] text-[#0D0D0D]' : 'text-zinc-500 hover:text-white'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count */}
              <div className="space-y-1.5 text-xs">
                <label className="text-[#8A8480] font-semibold">Count of Questions</label>
                <div className="grid grid-cols-3 gap-2 bg-[#0D0D0D] p-1 rounded-lg border border-[#2A2A2A]">
                  {[5, 10, 20].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => { setQCount(count); playClickChime(); }}
                      className={`py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer ${
                        qCount === count ? 'bg-[#1A7A3C] text-white' : 'text-zinc-500'
                      }`}
                    >
                      {count} Items
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit triggers */}
              <div className="pt-3 space-y-2">
                <button
                  type="button"
                  onClick={handleGenerateMockAI}
                  className="w-full py-3.5 bg-gradient-to-r from-[#C8962E] to-[#1A7A3C] text-[#0D0D0D] text-xs font-bold rounded-lg tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow hover:opacity-95"
                >
                  <Sparkles className="w-4 h-4" /> AI Model Mock Exam
                </button>

                <button
                  type="button"
                  onClick={handleStartPastExam}
                  className="w-full py-3.5 bg-zinc-90 w-full bg-zinc-900 border border-[#2A2A2A] hover:bg-zinc-850 text-xs font-bold rounded-lg text-zinc-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-[#8A8480]" /> Classic Past Papers
                </button>
              </div>

              {loadingText && (
                <div className="p-3 bg-[#0D0D0D] rounded border border-[#C8962E]/20 text-center text-[11px] text-[#C8962E] font-medium animate-pulse">
                  {loadingText}
                </div>
              )}
            </div>

            {/* Quick 5-Minute Revision Summaries */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#2A2A2A] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#2A2A2A]">
                <Zap className="w-5 h-5 text-[#C8962E]" />
                <h3 className="font-serif font-bold text-sm text-[#F0EDE8]">5-Min Revision Cards</h3>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-zinc-500">Provide topic from handbook</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enzymes activation energy..."
                    value={revisionTopic}
                    onChange={(e) => setRevisionTopic(e.target.value)}
                    className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-3 py-2 outline-none text-[#F0EDE8] w-24"
                  />
                  <button
                    onClick={runRevisionAI}
                    disabled={isSummarizing || !revisionTopic.trim()}
                    className="p-3 bg-[#1A7A3C] text-white rounded-lg flex items-center justify-center cursor-pointer hover:opacity-90 disabled:opacity-30"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSummarizing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {revisionOutput ? (
                <div className="bg-[#0D0D0D] p-3 rounded-lg border border-[#2A2A2A] text-[11px] leading-relaxed max-h-56 overflow-y-auto whitespace-pre-line text-zinc-300 font-sans shadow-inner">
                  {revisionOutput}
                </div>
              ) : (
                <div className="p-10 border border-dashed border-[#2A2A2A] rounded-lg text-center text-[11px] text-zinc-500">
                  Summary bullets appear here. Key takeaways for quick retention.
                </div>
              )}
            </div>

            {/* Historic Exam Prep Cards logs */}
            <div className="bg-[#161616] p-5 rounded-xl border border-[#2A2A2A] space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#2A2A2A]">
                <Trophy className="w-5 h-5 text-[#C8962E]" />
                <h3 className="font-serif font-bold text-sm text-[#F0EDE8]">Score Diagnostics</h3>
              </div>

              {pastSessions.length === 0 ? (
                <div className="p-8 border border-dashed border-[#2A2A2A] rounded-lg text-center text-xs text-zinc-500">
                  Completing mock sheets automatically tracks readiness percentage scoring histories here.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {pastSessions.map((sess, idx) => (
                    <div key={idx} className="bg-[#0D0D0D] p-3 rounded-lg border border-[#2A2A2A] flex items-center justify-between text-xs transition-transform hover:scale-[1.01]">
                      <div className="space-y-1">
                        <span className="font-semibold text-zinc-200">{sess.subject}</span>
                        <span className="block text-[10px] text-zinc-500">{sess.date}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-[#C8962E]">{sess.score}%</span>
                        <span className={`block text-[10px] font-black ${sess.grade === 'F' ? 'text-[#BE1931]' : 'text-[#1A7A3C]'}`}>Grade: {sess.grade}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </motion.div>
        )}

        {/* Active Exam Running View */}
        {examMode === 'active' && examQuestions.length > 0 && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-[#161616] p-6 rounded-2xl border border-[#C8962E]/20 relative shadow-2xl"
          >
            {/* Header progress info */}
            <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2A] text-xs font-mono mb-6">
              <span className="text-[#C8962E]">Subject: {selectedSubject}</span>
              <span className="text-zinc-400">Question {activeQIndex + 1} of {examQuestions.length}</span>
              
              <span className="flex items-center gap-1.5 text-zinc-300 font-bold bg-[#0D0D0D] px-3 py-1 rounded-full border border-[#2A2A2A]">
                <Clock className={`w-3.5 h-3.5 ${timeRemaining < 15 ? 'text-[#BE1931] animate-pulse' : 'text-[#1A7A3C]'}`} />
                {timeRemaining} Seconds
              </span>
            </div>

            {/* Question Box */}
            <div className="space-y-6">
              <h3 className="font-serif text-lg text-[#F0EDE8] tracking-wide leading-relaxed pl-1">
                {examQuestions[activeQIndex]?.question}
              </h3>

              {/* Options lists selection */}
              <div className="grid grid-cols-1 gap-3">
                {examQuestions[activeQIndex]?.options.map((opt: string) => {
                  const isSelected = userSelections[activeQIndex] === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        playClickChime();
                        setUserSelections(prev => ({ ...prev, [activeQIndex]: opt }));
                      }}
                      className={`w-full text-left p-4 rounded-xl border text-xs leading-relaxed transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#C8962E]/10 border-[#C8962E] text-[#C8962E] shadow font-medium scale-[1.01]'
                          : 'bg-[#0D0D0D] border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center pt-8 border-t border-[#2A2A2A] mt-8">
              <button
                disabled={activeQIndex === 0}
                onClick={() => {
                  playClickChime();
                  setActiveQIndex(prev => prev - 1);
                }}
                className="px-4 py-2 bg-zinc-900 border border-[#2A2A2A] hover:bg-zinc-855 rounded-lg text-xs text-zinc-400 disabled:opacity-20 cursor-pointer"
              >
                Previous Question
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={!userSelections[activeQIndex]}
                className="px-6 py-2.5 bg-[#1A7A3C] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow hover:opacity-95 cursor-pointer disabled:opacity-50"
              >
                {activeQIndex === examQuestions.length - 1 ? 'Complete Mock Review' : 'Proceed Details'} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Results Page */}
        {examMode === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-[#161616] p-6 rounded-2xl border border-[#2A2A2A] text-center space-y-6"
          >
            <div className="w-20 h-20 bg-[#C8962E]/10 border border-[#C8962E]/30 text-[#C8962E] rounded-full flex items-center justify-center mx-auto text-3xl font-bold font-serif shadow-lg">
              {examGrade}
            </div>

            <div>
              <h2 className="font-serif text-xl font-bold text-[#F0EDE8]">Mock Session Finalized!</h2>
              <p className="text-xs text-zinc-500">Diagnostic grade computed on active curriculum checks</p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-xs bg-[#0D0D0D] p-4 rounded-xl border border-[#2A2A2A]">
              <div className="space-y-1">
                <span className="text-zinc-500">Correct Answers:</span>
                <span className="font-mono text-base font-bold text-white block">{examScore} / {examQuestions.length}</span>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500">Calculated Percentage:</span>
                <span className="font-mono text-base font-bold text-[#C8962E] block">{Math.round((examScore / examQuestions.length) * 100)}%</span>
              </div>
            </div>

            <div className="space-y-3 pb-4">
              <h4 className="text-xs font-semibold text-zinc-300">Detailed Diagnostic Feedback:</h4>
              <div className="text-left bg-zinc-900 border border-[#2A2A2A] p-3.5 rounded-lg space-y-3.5 text-xs">
                {examQuestions.map((q, idx) => {
                  const isCorrect = userSelections[idx] === q.correctAnswer;
                  return (
                    <div key={idx} className="border-b border-[#2A2A2A] pb-3 last:border-0 last:pb-0">
                      <p className="font-medium text-zinc-300 flex items-center gap-1.5">
                        {isCorrect ? (
                          <span className="text-[#1A7A3C] font-semibold">✓</span>
                        ) : (
                          <span className="text-[#BE1931] font-semibold">✗</span>
                        )}
                        Question {idx + 1}: {q.question}
                      </p>
                      <p className="text-[10px] text-zinc-500 pl-4 mt-1 leading-normal italic">
                        {isCorrect ? 'Correct selection!' : `Answer: ${q.correctAnswer}.`} {q.explanation}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              onClick={() => {
                playClickChime();
                setExamMode('setup');
              }}
              className="px-6 py-2 bg-[#C8962E] text-[#0D0D0D] font-bold rounded-lg text-xs hover:opacity-95 cursor-pointer"
            >
              Exit Mock Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
