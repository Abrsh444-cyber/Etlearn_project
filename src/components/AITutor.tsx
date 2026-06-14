/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Send, Mic, RefreshCw, Copy, Check, MessageSquare, Volume2, Sparkles, AlertCircle, HelpCircle, FileText,
  Paperclip, File, X
} from 'lucide-react';
import { ChatMessage, submitClaudeChat, generateQuizAI, generateFlashcardsFromContextAI } from '../utils/ai';
import { playClickChime, playSuccessChime, playFailureChime } from '../utils/audio';
import AITutorLogo from './AITutorLogo';
import { Flashcard } from '../types';

interface AITutorProps {
  apiKey: string;
  enrolledSubjects: string[];
  decksState?: { [deckId: string]: Flashcard[] };
  onSaveDecksState?: (deckId: string, cards: Flashcard[]) => void;
}

export default function AITutor({ apiKey, enrolledSubjects, decksState, onSaveDecksState }: AITutorProps) {
  const [selectedSubject, setSelectedSubject] = useState(enrolledSubjects[0] || "Emerging Technologies");
  const [language, setLanguage] = useState<'en' | 'am'>('en');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // File Upload State & Ref
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    mimeType: string;
    data: string; // raw base64 string
    previewUrl?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_SIZE) {
      setErrorBanner("Your file is too large (Maximum size is 4MB). Please attach a smaller file.");
      playFailureChime();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const commaIdx = result.indexOf(',');
      const base64Data = commaIdx !== -1 ? result.substring(commaIdx + 1) : result;
      
      const fileObj = {
        name: file.name,
        mimeType: file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'),
        data: base64Data,
        previewUrl: file.type.startsWith('image/') ? result : undefined
      };
      
      setAttachedFile(fileObj);
      setErrorBanner(null);
      playSuccessChime();
    };
    reader.onerror = () => {
      setErrorBanner("Could not read the file. Please try another one.");
      playFailureChime();
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = useState<any[] | null>(null);
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; color: string; duration: number; size: number }[]>([]);
  
  // Custom chat flashcard synthesis states
  const [isGeneratingFl, setIsGeneratingFl] = useState(false);
  const [flSuccess, setFlSuccess] = useState<string | null>(null);

  const handleGenerateFlashcardsFromHistory = async () => {
    // We want at least one user message to formulate context
    const hasUserMsg = messages.some(m => m.role === 'user');
    if (!hasUserMsg) {
      setErrorBanner("You need to chat with the AI tutor first to compile flashcards from your conversation!");
      playFailureChime();
      return;
    }

    setIsGeneratingFl(true);
    setErrorBanner(null);
    setFlSuccess(null);
    playClickChime();

    try {
      const conversationText = messages
        .filter(m => m.content.trim())
        .slice(-15) // last 15 messages for high context
        .map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
        .join('\n\n');

      const cards = await generateFlashcardsFromContextAI(conversationText, selectedSubject, apiKey);
      if (cards && cards.length > 0) {
        const formattedCards: Flashcard[] = cards.map((c, idx) => ({
          id: `chat_card_${Date.now()}_${idx}`,
          question: c.question,
          answer: c.answer,
          explanation: c.explanation || `Derived from AI chat on ${selectedSubject}`,
          interval: 0,
          repetition: 0,
          easeFactor: 2.5,
          dueDate: new Date().toISOString()
        }));

        if (decksState && onSaveDecksState) {
          const existing = decksState['deck_free_space'] || [];
          onSaveDecksState('deck_free_space', [...formattedCards, ...existing]);
          setFlSuccess(`Successfully compiled ${cards.length} flashcards from your tutor chat! Check them out in your 'Free Space' study deck.`);
          playSuccessChime();
        } else {
          const rawDecks = JSON.parse(localStorage.getItem('ethiolearn_decks_state') || '{}');
          const existing = rawDecks['deck_free_space'] || [];
          rawDecks['deck_free_space'] = [...formattedCards, ...existing];
          localStorage.setItem('ethiolearn_decks_state', JSON.stringify(rawDecks));
          setFlSuccess(`Successfully compiled ${cards.length} flashcards! Check them in your 'Free Space' study deck.`);
          playSuccessChime();
        }
      } else {
        throw new Error("Unable to formulate flashcards. Please type another message and try again.");
      }
    } catch (err: any) {
      setErrorBanner(err.message || "Failed to generate cards from chat history.");
      playFailureChime();
    } finally {
      setIsGeneratingFl(false);
    }
  };

  const triggerDopaminePop = () => {
    const colors = ['#C8962E', '#1A7A3C', '#BE1931', '#FFD700', '#1D4ED8'];
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
  const [quizAnswers, setQuizAnswers] = useState<{ [qIndex: number]: string }>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Pre-configured chips based on selection
  const quickChips: { [subject: string]: string[] } = {
    "Emerging Technologies": ["What is IoT?", "Explain Edge Computing vs Cloud", "What are Smart Cities?", "Explain AI ethics"],
    "Introduction to Economics": ["Supply and demand example", "Explain GDP formula", "What is Giffen Good?", "Why inflation happens"],
    "General Biology": ["Explain photosynthesis", "Lock and key enzyme model", "Mitosis vs Meiosis differences", "Explain Krebs Cycle"],
    "Communicative English": ["Reported speech rules", "Third conditional structure", "Active vs passive voice", "Used to vs Get used to"],
    "Moral and Civic Education": ["Ethiopian constitution pillars", "Human rights categories", "Symmetric vs Asymmetric federalism", "Deontology vs Utilitarianism"]
  };

  const getSystemPrompt = () => {
    return `You are EthioLearn Pro's AI tutor — a warm, encouraging academic 
assistant for Ethiopian university students. You specialize in: 
Emerging Technologies (IoT, AR/VR, AI ethics), Introduction to 
Economics, General Biology (cellular metabolism, photosynthesis, 
enzymes), Communicative English, and Moral & Civic Education 
(Ethiopian constitution, ethics, democratization). 

Current Selected Subject Context: ${selectedSubject}
Preferred Response Language: ${language === 'am' ? 'Amharic (አማርኛ)' : 'English'}

Adapt your explanations to Ethiopian academic context. Use local 
examples (Ethiopian economy, Ethiopian biodiversity, Ethiopian history, Lalibela architecture, traditional farming). 
You can respond in English or Amharic (አማርኛ) or code-switch naturally.
Keep answers structured with clear headings. When explaining concepts, 
use analogies from Ethiopian daily life (e.g. coffee ceremony steps for sequential operations, preparing injera batter for biological fermentation). 
Always end your tutoring messages with 2-3 specific, challenging academic practice questions related to our conversation.`;
  };

  useEffect(() => {
    // Load message history from localStorage
    const saved = localStorage.getItem(`ethiolearn_chat_history_${selectedSubject}`);
    if (saved) {
      setMessages(JSON.parse(saved).slice(-50));
    } else {
      // Welcome message
      const introText = language === 'en' 
        ? `Selam! I am your AI Academic Tutor for *${selectedSubject}*. Ask me any question, explain complex cycles, or hit "Generate Quiz" to challenge your knowledge with exam-ready questions! 🇪🇹`
        : `ሰላም! እኔ ለ*${selectedSubject}* የቪዲዮ እና የጽሑፍ ረዳትዎ ነኝ። ማንኛውንም ጥያቄ ይጠይቁኝ፣ ወይም እውቀትዎን ለመፈተን "ፈተና ጠይቅ" የሚለውን ይጫኑ! 🇪🇹`;
      setMessages([{ role: 'assistant', content: introText }]);
    }
  }, [selectedSubject, language]);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveHistory = (mList: ChatMessage[]) => {
    try {
      // Slim down oldest base64 attachment data to prevent exceeding localStorage quota rules
      const slimmedList = mList.map((m, idx) => {
        if (m.attachment && idx < mList.length - 4) {
          return {
            ...m,
            attachment: {
              ...m.attachment,
              data: '' // clear largest payload data for older messages
            }
          };
        }
        return m;
      });
      localStorage.setItem(`ethiolearn_chat_history_${selectedSubject}`, JSON.stringify(slimmedList.slice(-50)));
    } catch (e) {
      console.warn("Local storage quota limit exceeded:", e);
    }
  };

  const clearHistory = () => {
    playClickChime();
    const introText = language === 'en' 
        ? `Chat history reset. Let's start fresh with our study of *${selectedSubject}*!`
        : `የውይይት መዝገብ ተሰርዟል። ስለ *${selectedSubject}* እንደገና መማር እንጀምር!`;
    setMessages([{ role: 'assistant', content: introText }]);
    localStorage.removeItem(`ethiolearn_chat_history_${selectedSubject}`);
  };

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() && !attachedFile) return;

    // Allow request to proceed as the backend server has automatic fallback variables (like GEMINI_API_KEY) configured.

    const userMsg: ChatMessage = {
      role: 'user',
      content: text,
      attachment: attachedFile ? {
        name: attachedFile.name,
        mimeType: attachedFile.mimeType,
        data: attachedFile.data
      } : undefined
    };

    const updatedUserMessages = [...messages, userMsg];
    setMessages(updatedUserMessages);
    setInputValue('');
    setAttachedFile(null);
    setErrorBanner(null);
    setIsTyping(true);
    playClickChime();

    // Prepare container for streamed assistant response
    let assistantMessageIndex = updatedUserMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    await submitClaudeChat(
      updatedUserMessages.slice(-10), // Send last 10 messages for context
      getSystemPrompt(),
      apiKey,
      {
        onChunk: (chunk) => {
          setMessages(prev => {
            const copy = [...prev];
            if (copy[assistantMessageIndex]) {
              copy[assistantMessageIndex].content += chunk;
            }
            return copy;
          });
        },
        onComplete: (fullText) => {
          setIsTyping(false);
          setMessages(prev => {
            const copy = [...prev];
            copy[assistantMessageIndex].content = fullText;
            saveHistory(copy);
            return copy;
          });
          // Update analytics sessions count
          try {
            const analytics = JSON.parse(localStorage.getItem("ethiolearn_analytics") || "{}");
            analytics.aiSessions = (analytics.aiSessions || 0) + 1;
            localStorage.setItem("ethiolearn_analytics", JSON.stringify(analytics));
          } catch(e) {}
        },
        onError: (err) => {
          setIsTyping(false);
          setErrorBanner(`AI Service encountered an error: ${err}. Please verify your API Key in Settings.`);
          playFailureChime();
          // Remove the empty assistant bubble
          setMessages(prev => prev.slice(0, -1));
        }
      }
    );
  };

  // Web Speech API Voice Implementation
  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorBanner("Voice features are not supported in your browser.");
      return;
    }

    playClickChime();
    const recognition = new SpeechRecognition();
    recognition.lang = language === 'am' ? 'am-ET' : 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognitionRef.current = recognition;
    setListening(true);

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setInputValue(resultText);
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const copyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    playSuccessChime();
    setTimeout(() => setCopiedIndex(null), 3000);
  };

  // Convert Quiz JSON array into full-screen dialog or helper view
  const triggerQuizGeneration = async () => {
    // Allow request to proceed as the backend server has automatic fallback variables (like GEMINI_API_KEY) configured.
    setGeneratingQuiz(true);
    setCurrentQuiz(null);
    setQuizAnswers({});
    setQuizScore(null);
    playClickChime();

    try {
      // Find quick topics based on subject:
      const topic = quickChips[selectedSubject][0];
      const quiz = await generateQuizAI(topic, selectedSubject, apiKey);
      setCurrentQuiz(quiz);
      setGeneratingQuiz(false);
      playSuccessChime();
    } catch (err: any) {
      setErrorBanner(err.message || "Failed to generate AI Quiz. Please try again.");
      setGeneratingQuiz(false);
      playFailureChime();
    }
  };

  const submitQuizAnswers = () => {
    if (!currentQuiz) return;
    let score = 0;
    currentQuiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctAnswer) {
        score++;
      }
    });
    setQuizScore(score);
    if (score === currentQuiz.length) {
      playSuccessChime();
      triggerDopaminePop();
    } else {
      if (score > 0) {
        triggerDopaminePop();
      }
      playClickChime();
    }
  };

  return (
    <div 
      className="flex flex-col flex-1 min-h-0 relative bg-[#0D0D0D] h-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,application/pdf" 
        className="hidden" 
      />

      <AnimatePresence>
        {isDragging && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0D0D0D]/90 backdrop-blur-md z-50 flex flex-col items-center justify-center border-2 border-dashed border-[#C8962E] m-4 rounded-2xl"
          >
            <div className="p-6 rounded-2xl bg-[#C8962E]/10 border border-[#C8962E]/30 flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#C8962E]/20 flex items-center justify-center text-[#C8962E] animate-bounce">
                <Paperclip className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#F0EDE8]">Drop Your Files Here</h3>
                <p className="text-xs text-zinc-400 mt-1 max-w-xs">Scan and analyze any Image or PDF study materials instantly with EthioLearn AI Tutor</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Top Banner Control */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111] p-4 rounded-xl border border-zinc-800 mb-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C8962E]/10 flex items-center justify-center border border-[#C8962E]/20 overflow-hidden shrink-0">
            <AITutorLogo size={40} />
          </div>
          <div>
            <h2 className="font-serif text-lg font-bold text-[#F0EDE8]">EthioLearn AI Tutor</h2>
            <p className="text-xs text-zinc-500">OpenRouter-powered companion</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Subject dropdown */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-[#0D0D0D] border border-zinc-800 rounded-lg text-xs text-[#F0EDE8] py-2 px-3 outline-none cursor-pointer focus:border-[#C8962E]"
          >
            {enrolledSubjects.map(sub => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>

          {/* Language selection toggles */}
          <div className="flex bg-[#0D0D0D] border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => { setLanguage('en'); playClickChime(); }}
              className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors ${language === 'en' ? 'bg-[#C8962E] text-[#0D0D0D]' : 'text-zinc-500'}`}
            >
              EN 🇬🇧
            </button>
            <button
              onClick={() => { setLanguage('am'); playClickChime(); }}
              className={`text-xs px-2.5 py-1.5 rounded-md font-semibold transition-colors ${language === 'am' ? 'bg-[#1A7A3C] text-white' : 'text-zinc-500'}`}
            >
              አማ 🇪🇹
            </button>
          </div>

          <button
            onClick={clearHistory}
            title="Reset Chat"
            className="text-zinc-500 hover:text-[#BE1931] p-2 hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* New Generate Flashcard from active chat option */}
          <button
            onClick={handleGenerateFlashcardsFromHistory}
            disabled={isGeneratingFl || !messages.some(m => m.role === 'user')}
            title="Generate Flashcards from active chat (+)"
            className="px-3.5 py-2 rounded-lg bg-[#C8962E] text-[#0D0D0D] hover:bg-[#b08323] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed text-xs"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isGeneratingFl ? "Compiling..." : "+ Generate Flashcards"}</span>
          </button>
        </div>
      </div>

      {/* Success Bar for Flashcard creation */}
      {flSuccess && (
        <div className="mb-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-3 flex items-center gap-2.5 text-emerald-400 text-xs">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{flSuccess}</span>
        </div>
      )}

      {/* Error Bar */}
      {errorBanner && (
        <div className="mb-4 bg-red-950/30 border border-red-500/30 rounded-xl p-3 flex items-center gap-2.5 text-zinc-300 text-xs">
          <AlertCircle className="w-5 h-5 text-[#BE1931] shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Main chat viewport */}
      <div className="flex-1 bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] shadow-inner overflow-y-auto mb-4 relative min-h-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
            <MessageSquare className="w-12 h-12 mb-3 text-zinc-700 animate-pulse" />
            <p className="font-serif italic">Loading your study notes history...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                key={index}
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Bubble avatar logo */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden border ${
                  msg.role === 'user' 
                    ? 'bg-[#C8962E]/10 border-[#C8962E]/30 text-[#C8962E]' 
                    : 'bg-[#1A7A3C]/5 border-[#1A7A3C]/20 text-[#1A7A3C]'
                }`}>
                  {msg.role === 'user' ? 'U' : <AITutorLogo size={32} />}
                </div>

                {/* Message actual bubble representation */}
                <div className="relative group flex flex-col">
                  <div className={`rounded-2xl p-3.5 text-sm leading-relaxed shadow-md ${
                    msg.role === 'user'
                      ? 'bg-[#C8962E] text-[#0D0D0D] font-medium rounded-tr-none'
                      : 'bg-[#0D0D0D] text-[#F0EDE8] border border-[#2A2A2A] rounded-tl-none font-sans'
                  }`}>
                    {msg.attachment && (
                      <div className="mb-2.5 max-w-full">
                        {msg.attachment.mimeType.startsWith('image/') ? (
                          msg.attachment.data ? (
                            <img 
                              src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`}
                              alt="Attachment" 
                              referrerPolicy="no-referrer"
                              className="max-h-60 w-auto rounded-lg border border-black/10 object-contain max-w-full mb-1"
                            />
                          ) : (
                            <div className="flex items-center gap-2 p-2 rounded bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-500">
                              <File className="w-3.5 h-3.5" />
                              <span>{msg.attachment.name} (Pruned Image)</span>
                            </div>
                          )
                        ) : (
                          <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs text-left ${
                            msg.role === 'user' 
                              ? 'bg-amber-950/20 border-amber-900/30 text-amber-900' 
                              : 'bg-zinc-950/50 border-zinc-800 text-zinc-300'
                          }`}>
                            <FileText className="w-5 h-5 shrink-0 text-[#C8962E]" />
                            <div className="min-w-0 overflow-hidden">
                              <p className="truncate font-semibold">{msg.attachment.name}</p>
                              <p className="text-[9px] text-zinc-550 font-mono uppercase tracking-wider">PDF Document</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {/* Preserve line breaks and output clean simple structures */}
                    <p className="whitespace-pre-line text-sm break-words">{msg.content}</p>
                  </div>

                  <span className="text-[10px] text-zinc-500 mt-1 self-start flex items-center gap-1">
                    {msg.role === 'assistant' && (
                      <button 
                        onClick={() => copyText(msg.content, index)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1 hover:text-[#C8962E] py-0.5 px-1.5 bg-[#0D0D0D] rounded border border-[#2A2A2A]"
                      >
                        {copiedIndex === index ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedIndex === index ? 'Copied' : 'Copy Response'}
                      </button>
                    )}
                  </span>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-3.5 max-w-[85%] mr-auto p-4 bg-[#111] rounded-2xl border border-zinc-800/80 relative overflow-hidden shadow-2xl ml-1"
              >
                {/* Holographic shifting subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-amber-500/5 to-rose-500/5 opacity-40 mix-blend-overlay animate-pulse pointer-events-none" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <div className="relative">
                    {/* Spinning dual-colored background aura ring */}
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-[#C8962E] via-emerald-600 to-rose-600 opacity-70 blur-sm animate-spin [animation-duration:3s]" />
                    <div className="w-8 h-8 rounded-full bg-[#0D0D0D] border border-zinc-750 text-[#C8962E] flex items-center justify-center relative z-10">
                      <Bot className="w-4 h-4 text-amber-500 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-zinc-200">EthioLearn AI Copilot</span>
                    <span className="text-[10px] text-zinc-500 tracking-wider uppercase font-mono animate-pulse">Analyzing context & preparing dynamic slides...</span>
                  </div>
                </div>

                {/* Shimmering wireframe layout blocks */}
                <div className="space-y-2 mt-1 relative z-10 w-64 md:w-80">
                  <motion.div 
                    animate={{ 
                      opacity: [0.35, 0.85, 0.35],
                    }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                    className="h-3 rounded bg-zinc-850 w-full relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C8962E]/15 to-transparent w-full h-full -translate-x-full shimmer-sweep-animation" />
                  </motion.div>
                  <motion.div 
                    animate={{ 
                      opacity: [0.35, 0.85, 0.35],
                    }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: 0.25 }}
                    className="h-3 rounded bg-zinc-850 w-[92%] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent w-full h-full -translate-x-full shimmer-sweep-animation" />
                  </motion.div>
                  <motion.div 
                    animate={{ 
                      opacity: [0.35, 0.85, 0.35],
                    }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", delay: 0.5 }}
                    className="h-3 rounded bg-zinc-850 w-[78%] relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/5 to-transparent w-full h-full -translate-x-full shimmer-sweep-animation" />
                  </motion.div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Interactive AI Quiz Render Segment */}
      {generatingQuiz && (
        <div className="mb-4 p-4 bg-[#161616] border border-[#C8962E]/20 rounded-xl flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#C8962E] animate-spin" />
          <div className="text-xs">
            <p className="font-semibold text-[#F0EDE8]">Drafting interactive practice quiz...</p>
            <p className="text-zinc-500">Extracting questions about {selectedSubject} from OpenRouter AI.</p>
          </div>
        </div>
      )}

      {currentQuiz && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 bg-[#111111] p-4 rounded-xl border border-emerald-500/30 overflow-y-auto max-h-[300px] relative overflow-hidden"
        >
          {/* Confetti floats */}
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
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-serif text-sm font-semibold text-[#1A7A3C] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4" /> Interactive Quiz: {quickChips[selectedSubject][0]}
            </h4>
            <span className="text-[10px] bg-[#1A7A3C]/10 border border-[#1A7A3C]/30 text-[#1A7A3C] px-2 py-0.5 rounded-full">Pro Generated</span>
          </div>

          <div className="space-y-4 text-xs">
            {currentQuiz.map((item, qIdx) => (
              <div key={qIdx} className="space-y-2 border-b border-[#2A2A2A] pb-3 last:border-0 last:pb-0">
                <p className="font-medium text-zinc-200">{qIdx + 1}. {item.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                  {item.options.map((option: string) => {
                    const isSelected = quizAnswers[qIdx] === option;
                    const isCorrect = item.correctAnswer === option;
                    const showReveal = quizScore !== null;
                    
                    let btnStyle = "bg-[#0D0D0D] border-[#2A2A2A] text-zinc-400 hover:text-zinc-200 focus:border-[#C8962E]";
                    if (isSelected) btnStyle = "bg-[#C8962E]/10 border-[#C8962E] text-[#C8962E]";
                    if (showReveal) {
                      if (isCorrect) btnStyle = "bg-emerald-950/30 border-emerald-500 text-emerald-400 font-semibold";
                      else if (isSelected) btnStyle = "bg-red-950/30 border-red-500 text-red-400";
                    }

                    return (
                      <button
                        key={option}
                        disabled={quizScore !== null}
                        onClick={() => {
                          playClickChime();
                          setQuizAnswers(prev => ({ ...prev, [qIdx]: option }));
                        }}
                        className={`text-left p-2 rounded border cursor-pointer text-xs transition-all ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
                {quizScore !== null && (
                  <p className="text-[11px] text-zinc-500 mt-1 italic pl-1 bg-zinc-900/60 p-1.5 rounded">{item.explanation}</p>
                )}
              </div>
            ))}

            {quizScore === null ? (
              <button
                onClick={submitQuizAnswers}
                disabled={Object.keys(quizAnswers).length < currentQuiz.length}
                className="w-full py-2 bg-[#1A7A3C] text-white font-bold rounded cursor-pointer hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Submit Answers
              </button>
            ) : (
              <div className="p-3 bg-[#111] rounded border border-[#2A2A2A] text-center flex flex-col items-center justify-center gap-1.5">
                <p className="font-serif text-sm font-bold text-zinc-300">
                  Quiz Score: <span className="text-[#C8962E]">{quizScore} / {currentQuiz.length}</span>
                </p>
                <button
                  onClick={() => {
                    playClickChime();
                    setCurrentQuiz(null);
                  }}
                  className="px-4 py-1.5 bg-zinc-800 text-zinc-400 hover:text-white text-[11px] rounded transition-transform cursor-pointer"
                >
                  Clear Quiz View
                </button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Prompts chips and message form bar */}
      <div className="space-y-2 mt-auto">
        <div className="flex flex-wrap items-center gap-1.5 py-1">
          <span className="text-[10px] text-[#C8962E]/70 font-semibold uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3" /> Prompts:
          </span>
          {quickChips[selectedSubject]?.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              className="text-[10px] md:text-xs bg-[#161616] hover:bg-[#C8962E]/10 border border-[#2A2A2A] hover:border-[#C8962E]/60 text-zinc-400 hover:text-[#C8962E] rounded-full px-3 py-1 transition-all cursor-pointer"
            >
              {chip}
            </button>
          ))}
          
          {/* Quick interactive Quiz button */}
          <button
            onClick={triggerQuizGeneration}
            disabled={generatingQuiz}
            className="text-[10px] md:text-xs bg-emerald-950/20 hover:bg-emerald-950/40 border border-[#1A7A3C]/35 hover:border-emerald-500 text-emerald-400 rounded-full px-3 py-1 flex items-center gap-1 transition-all cursor-pointer ml-auto font-semibold"
          >
            <FileText className="w-3 h-3" /> Generate Practice Quiz
          </button>
        </div>

        {/* Active attachment card preview if one exists */}
        {attachedFile && (
          <div className="flex items-center gap-2.5 bg-[#161616] border border-[#2A2A2A] p-2 px-3 rounded-lg self-start text-xs text-zinc-300 relative animate-fade-in mb-2">
            {attachedFile.previewUrl ? (
              <img 
                src={attachedFile.previewUrl} 
                alt="Preview" 
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-cover rounded border border-zinc-800"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-[#C8962E]/10 border border-[#C8962E]/20 flex items-center justify-center text-[#C8962E]">
                <FileText className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1 min-w-0 max-w-[150px] md:max-w-xs text-left">
              <p className="truncate font-medium text-zinc-200">{attachedFile.name}</p>
              <p className="text-[10px] text-zinc-500 font-mono">
                {attachedFile.mimeType === 'application/pdf' ? 'PDF Document' : 'Image attachment'}
              </p>
            </div>
            <button
              onClick={() => {
                setAttachedFile(null);
                playClickChime();
              }}
              className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-colors cursor-pointer"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Message dispatch form bar */}
        <div className="flex gap-2 relative">
          <button
            onClick={() => {
              playClickChime();
              fileInputRef.current?.click();
            }}
            title="Attach study guide image or PDF"
            className="px-3.5 bg-zinc-900 border border-[#2A2A2A] rounded-xl cursor-pointer flex items-center justify-center transition-colors text-zinc-400 hover:text-[#C8962E] hover:bg-zinc-800 shrink-0"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder={language === 'en' ? `Ask tutor about ${selectedSubject}...` : `${selectedSubject} በተመለከተ ጥያቄ ይጠይቁ...`}
            className="flex-1 bg-[#161616] text-[#F0EDE8] text-sm px-4 py-3.5 rounded-xl border border-[#2A2A2A] focus:border-[#C8962E] outline-none shadow-md transition-colors min-w-0"
          />

          <button
            onClick={startVoiceInput}
            title="Speech Input (Web Speech API)"
            className={`px-3.5 bg-zinc-900 border border-[#2A2A2A] rounded-xl cursor-pointer flex items-center justify-center transition-colors shrink-0 ${
              listening ? 'text-red-500 border-red-500 bg-red-950/20 animate-pulse' : 'text-zinc-400 hover:text-[#C8962E] hover:bg-zinc-800'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleSend()}
            disabled={(!inputValue.trim() && !attachedFile) || isTyping}
            className="px-5 bg-gradient-to-r from-[#C8962E] to-[#1A7A3C] hover:opacity-95 text-[#0D0D0D] font-bold rounded-xl cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed shadow transition-all hover:scale-[1.02] shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
