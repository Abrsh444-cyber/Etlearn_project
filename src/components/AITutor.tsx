import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Send, Mic, RefreshCw, Copy, Check, MessageSquare, Sparkles, AlertCircle, HelpCircle, FileText,
  Paperclip, File, X, Languages
} from 'lucide-react';
import { ChatMessage, submitClaudeChat, generateQuizAI, generateFlashcardsFromContextAI } from '../utils/ai';
import { playClickChime, playSuccessChime, playFailureChime } from '../utils/audio';
import AITutorLogo from './AITutorLogo';
import { StudentProfile, Flashcard } from '../types';

interface AITutorProps {
  apiKey: string;
  enrolledSubjects: string[];
  decksState?: { [deckId: string]: Flashcard[] };
  onSaveDecksState?: (deckId: string, cards: Flashcard[]) => void;
  onStudyAction?: () => void;
  profile: StudentProfile;
  onUpdateProfile: (updated: StudentProfile) => void;
}

const LOCAL_FALLBACK_QUIZ: { [subject: string]: any[] } = {
  "Emerging Technologies": [
    {
      question: "Which of the following is the best definition of IoT (Internet of Things)?",
      options: [
        "A network of physical objects embedded with sensors and software to exchange data over the internet.",
        "A search engine used for looking up academic textbook summaries online.",
        "A type of security protocol for central bank transactions.",
        "A private server cluster designed for hosting high-speed gaming systems."
      ],
      correctAnswer: "A network of physical objects embedded with sensors and software to exchange data over the internet.",
      explanation: "IoT connects physical devices to collect, transmit, and act on local data automatically."
    },
    {
      question: "What distinguishes Edge Computing from conventional cloud computing?",
      options: [
        "Data is processed at the network edge, closer to the source device.",
        "It consumes infinitely more internet data bandwidth.",
        "It replaces the need for any storage physical drives.",
        "It strictly prevents any wireless connections for device security."
      ],
      correctAnswer: "Data is processed at the network edge, closer to the source device.",
      explanation: "Edge computing keeps data processing close to the collection source, saving response time and bandwidth."
    }
  ],
  "Introduction to Economics": [
    {
      question: "Which term describes the total monetary value of all finished goods and services produced within a country's borders in a specific period?",
      options: [
        "Gross Domestic Product (GDP)",
        "Consumer Price Index (CPI)",
        "Aggregate Inflation Scale",
        "Giffen Marginal Utility"
      ],
      correctAnswer: "Gross Domestic Product (GDP)",
      explanation: "GDP is the standard macro-economic metric used to measure the official production output of an economy."
    }
  ],
  "General Biology": [
    {
      question: "What is the primary organic outcome of Photosynthesis in green plants?",
      options: [
        "Synthesis of glucose sugars and release of oxygen gas",
        "Production of carbon dioxide and water molecules",
        "Metabolism of lipid membranes in root tissues",
        "Direct replication of nuclear chromatin structures"
      ],
      correctAnswer: "Synthesis of glucose sugars and release of oxygen gas",
      explanation: "Chloroplasts capture sunlight to transform carbon dioxide and water into glucose and oxygen."
    }
  ],
  "Communicative English": [
    {
      question: "Which option correctly uses reported speech for: 'The examination is tomorrow,' told the tutor.",
      options: [
        "The tutor said that the examination was the next day.",
        "The tutor says the examination is tomorrow.",
        "The tutor told me that tomorrow is exam day.",
        "The tutor has been saying the examination was tomorrow."
      ],
      correctAnswer: "The tutor said that the examination was the next day.",
      explanation: "'Is' shifts to 'was' in reported speech, and 'tomorrow' shifts to 'the next day'."
    }
  ],
  "Moral and Civic Education": [
    {
      question: "Which of the following is core to the constitutional system and rule of law?",
      options: [
        "Respect for human and democratic rights and sovereignty of citizens",
        "Unchecked authority of a centralized monarch",
        "Exclusive priority of private corporate legal systems",
        "Restricting public speech and citizen representation"
      ],
      correctAnswer: "Respect for human and democratic rights and sovereignty of citizens",
      explanation: "Modern democratic constitutions ensure sovereignty belongs to the citizens, protected by rigorous checks and balances."
    }
  ]
};

export default function AITutor({ 
  apiKey, 
  enrolledSubjects, 
  decksState, 
  onSaveDecksState, 
  onStudyAction,
  profile,
  onUpdateProfile
}: AITutorProps) {
  const [selectedSubject, setSelectedSubject] = useState(enrolledSubjects[0] || "Emerging Technologies");
  
  // Persistent language mapping
  const [language, setLanguage] = useState<'en' | 'am'>(() => {
    const saved = localStorage.getItem('ethiolearn_language_preference');
    return (saved === 'am' || saved === 'en') ? saved : 'en';
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  
  // File Upload Systems
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    mimeType: string;
    data: string; // raw base64 string
    previewUrl?: string;
  } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggestions list
  const suggestedQuestions = [
    { label: language === 'en' ? "Explain photosynthesis" : "ፎቶሲንተሲስን አስረዳኝ", value: "Explain photosynthesis in detail with local crop analogies." },
    { label: language === 'en' ? "Solve this math problem" : "የሂሳብ ስሌት ፍታልኝ", value: "Give me step-by-step guidance on solving quadratic equations." },
    { label: language === 'en' ? "Help with Grade 12 Physics" : "የክፍል 12 ፊዚክስ እርዳኝ", value: "Help me study the core concepts of Grade 12 Physics electric potential." }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    const MAX_SIZE = 4 * 1024 * 1024; // 4MB
    if (file.size > MAX_SIZE) {
      setErrorBanner(
        language === 'en' 
          ? "Your file is too large (Maximum size is 4MB). Please attach a smaller file."
          : "ፋይሉ በጣም ትልቅ ነው። ከፍተኛው መጠን 4 ሜጋባይት ነው።"
      );
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
      setErrorBanner(
        language === 'en' 
          ? "Could not read the file. Please try another one."
          : "ፋይሉን ማንበብ አልተቻለም። እባኮትን በድጋሚ ይሞክሩ።"
      );
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

  // Quiz states
  const [currentQuiz, setCurrentQuiz] = useState<any[] | null>(null);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{ [qIndex: number]: string }>({});
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; color: string; duration: number; size: number }[]>([]);

  // Flashcards synths
  const [isGeneratingFl, setIsGeneratingFl] = useState(false);
  const [flSuccess, setFlSuccess] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const quickChips: { [subject: string]: string[] } = {
    "Emerging Technologies": ["What is IoT?", "Explain Edge Computing vs Cloud", "What are Smart Cities?", "Explain AI ethics"],
    "Introduction to Economics": ["Supply and demand example", "Explain GDP formula", "What is Giffen Good?", "Why inflation happens"],
    "General Biology": ["Explain photosynthesis", "Lock and key enzyme model", "Mitosis vs Meiosis differences", "Explain Krebs Cycle"],
    "Communicative English": ["Reported speech rules", "Third conditional structure", "Active vs passive voice", "Used to vs Get used to"],
    "Moral and Civic Education": ["Ethiopian constitution pillars", "Human rights categories", "Federalism system", "Deontology vs Utilitarianism"]
  };

  const getSystemPrompt = () => {
    return `You are EthioLearn Pro's AI tutor — a warm, encouraging, patient academic 
assistant for Ethiopian students. Maintain a high standard of education, mirroring local curriculum structure. 

CRITICAL DICTATE:
Always respond in the same language the student uses. 
If they write in Amharic, reply in Amharic (አማርኛ). 
If they write in English, reply in English. 
Always be encouraging, highly explanatory, and patient.

Current Selected Subject Context: ${selectedSubject}
Preferred Response Language: ${language === 'am' ? 'Amharic (አማርኛ)' : 'English'}

Adapt explanations to the local environment, referencing Ethiopian economy, agricultural cycles, traditional foods (injera fermentation), and national historic landmarks (Lalibela, Axum, Sof Omar) for metaphors where helpful. 

Always end your explanations with 2 conversational, helpful revision questions for the student to build critical thinking.`;
  };

  useEffect(() => {
    // Sync language selection to localStorage
    localStorage.setItem('ethiolearn_language_preference', language);
  }, [language]);

  useEffect(() => {
    // Load chat history or create greeting
    const saved = localStorage.getItem(`ethiolearn_chat_history_${selectedSubject}`);
    if (saved) {
      setMessages(JSON.parse(saved).slice(-50));
    } else {
      const introText = language === 'en' 
        ? `Selam! I am your AI Academic Tutor for *${selectedSubject}*. Ask me any question, attach your homework, or hit "Generate Quiz" to challenge your knowledge! 🇪🇹`
        : `ሰላም! እኔ ለ*${selectedSubject}* የትምህርት ረዳትዎ ነኝ። ማንኛውንም ጥያቄ ይጠይቁኝ፣ የቤት ስራዎን ያያይዙ ወይም ራስዎን ለመፈተን "ፈተናዎች" የሚለውን ይጫኑ! 🇪🇹`;
      setMessages([{ role: 'assistant', content: introText }]);
    }
  }, [selectedSubject, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const saveHistory = (mList: ChatMessage[]) => {
    try {
      const slimmedList = mList.map((m, idx) => {
        if (m.attachment && idx < mList.length - 4) {
          return { ...m, attachment: { ...m.attachment, data: '' } };
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

    const isPremiumUser = profile.isRegistered === true;
    const creditsRemaining = profile.unregisteredAICredits !== undefined ? profile.unregisteredAICredits : 5;

    if (!isPremiumUser && creditsRemaining <= 0) {
      playFailureChime();
      setErrorBanner(
        language === 'en'
          ? "AI Guest Credit limit reached (5/5 queries used). Please click the Profile button / avatar at the top right to Register or Sign In for unlimited premium Pro AI Access!"
          : "የእንግዳ አይ አጠቃቀም ገደብ ላይ ደርሰዋል (5 ፈተናዎች አልቀዋል)። እባክዎን ያልተገደበ አገልግሎት ለማግኘት ቅጽበታዊ መገለጫዎን ከላይ ተጭነው ይመዝገቡ!"
      );
      return;
    }

    if (!isPremiumUser) {
      onUpdateProfile({
        ...profile,
        unregisteredAICredits: creditsRemaining - 1
      });
    }

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
    onStudyAction?.();

    let assistantMessageIndex = updatedUserMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    await submitClaudeChat(
      updatedUserMessages.slice(-10),
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
        },
        onError: (err) => {
          setIsTyping(false);
          setErrorBanner(
            language === 'en'
              ? `AI service error: ${err}. Please check your internet connection or API setup.`
              : `የአይ አገልግሎት ስህተት ገጥሞታል፡ ${err}። እባኮትን ግንኙነትዎን ይፈትሹ።`
          );
          playFailureChime();
          setMessages(prev => prev.slice(0, -1));
        }
      }
    );
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorBanner("Voice input features are not fully supported in your browser.");
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

  const triggerQuizGeneration = async () => {
    setGeneratingQuiz(true);
    setCurrentQuiz(null);
    setQuizAnswers({});
    setQuizScore(null);
    playClickChime();

    try {
      const topic = quickChips[selectedSubject][0];
      const quiz = await generateQuizAI(topic, selectedSubject, apiKey);
      if (quiz && quiz.length > 0) {
        setCurrentQuiz(quiz);
        setGeneratingQuiz(false);
        playSuccessChime();
      } else {
        throw new Error("Empty quiz response from AI");
      }
    } catch (err: any) {
      console.warn("AI generation failed in AITutor, using offline fallback quiz:", err);
      // Retrieve subject specific fallback quiz list or default
      const fallbackList = LOCAL_FALLBACK_QUIZ[selectedSubject] || LOCAL_FALLBACK_QUIZ["Emerging Technologies"];
      setCurrentQuiz(fallbackList);
      setGeneratingQuiz(false);
      playSuccessChime();
      setErrorBanner(
        language === 'en'
          ? "AI was offline or slow. Loaded official practice sheets from local library instead."
          : "አይ መምህሩ ከመስመር ውጭ በመሆኑ ምክንያት ጥያቄዎችን ከመካነ-መዝገቡ አምጥተናቸዋል::"
      );
      setTimeout(() => setErrorBanner(null), 5000);
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
    playSuccessChime();
  };

  return (
    <div 
      className="flex flex-col flex-1 min-h-0 relative bg-slate-50 dark:bg-[#050508] h-full p-2 md:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm"
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

      {/* TOP HEADER CONTROLS - LIGHT & DARK STYLE */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0c0d12] p-4 rounded-xl border border-slate-200 dark:border-zinc-800 mb-4 shadow-sm text-slate-800 dark:text-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center shrink-0 overflow-hidden">
            <AITutorLogo size={36} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="font-serif text-base font-bold text-slate-900 dark:text-white leading-tight">
                {language === 'en' ? 'AI Study Companion' : 'የአይ መማሪያ ተባባሪ'}
              </h2>
              {profile.isRegistered ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900 rounded font-sans">
                  PRO MEMBER
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/60 rounded font-sans animate-pulse">
                  GUEST QUOTA: {profile.unregisteredAICredits !== undefined ? profile.unregisteredAICredits : 5}/5 LEFT
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
              {language === 'en' ? 'Personalized National Tutor' : 'የግል መማሪያ ረዳት'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Active Subject choosing */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-zinc-200 py-2.5 px-3 outline-none cursor-pointer focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shrink-0"
          >
            {enrolledSubjects.map(sub => (
              <option key={sub} value={sub} className="bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-200">{sub}</option>
            ))}
          </select>

          {/* Bilingual Language Selector - Top requirement */}
          <div className="flex bg-slate-100 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-805 rounded-xl p-0.5">
            <button
              onClick={() => { setLanguage('en'); playClickChime(); }}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                language === 'en' 
                  ? 'bg-[#078930] text-white shadow-sm' 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              EN 🇺🇸
            </button>
            <button
              onClick={() => { setLanguage('am'); playClickChime(); }}
              className={`text-xs font-extrabold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                language === 'am' 
                  ? 'bg-[#078930] text-white shadow-sm' 
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
              }`}
            >
              አማ 🇪🇹
            </button>
          </div>

          <button
            onClick={clearHistory}
            title={language === 'en' ? "Clear Chat" : "ውይይት አጽዳ"}
            className="text-slate-400 hover:text-red-600 p-2.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Floating alert warnings or indicators */}
      {errorBanner && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5 text-red-700 text-xs shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Success notifier */}
      {flSuccess && (
        <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2.5 text-emerald-800 text-xs shadow-sm">
          <Check className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{flSuccess}</span>
        </div>
      )}

      {/* Chat messages layout viewport (clean white layout) */}
      <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-inner overflow-y-auto mb-4 relative min-h-0 min-h-[300px]">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
            <MessageSquare className="w-12 h-12 mb-3 text-emerald-100 shrink-0" />
            <p className="font-serif italic text-base">
              {language === 'en' ? 'Type your study query to begin...' : 'ለመጀመር የጥናት ጥያቄዎን ይጻፉ...'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                key={index}
                className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Bubble icon */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border text-[13px] font-bold shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-amber-50 border-amber-100 text-[#C8962E]'
                }`}>
                  {msg.role === 'user' ? 'U' : 'AI'}
                </div>

                {/* Bubble text content */}
                <div className="flex flex-col">
                  <div className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#078930] text-white rounded-tr-none'
                      : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none font-sans'
                  }`}>
                    {msg.attachment && (
                      <div className="mb-2.5">
                        {msg.attachment.mimeType.startsWith('image/') ? (
                          <img 
                            src={`data:${msg.attachment.mimeType};base64,${msg.attachment.data}`}
                            alt="Attached Homework" 
                            className="max-h-56 w-auto rounded-lg border border-slate-200 object-contain max-w-full"
                          />
                        ) : (
                          <div className="flex items-center gap-2 p-2 rounded bg-slate-100 text-xs text-slate-600">
                            <File className="w-4 h-4 text-[#078930]" />
                            <span className="truncate">{msg.attachment.name}</span>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-line text-sm font-sans break-words">{msg.content}</p>
                  </div>

                  {msg.role === 'assistant' && msg.content && (
                    <button 
                      onClick={() => copyText(msg.content, index)}
                      className="text-[10px] text-slate-400 mt-1 self-start flex items-center gap-1 hover:text-emerald-705 p-1 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copiedIndex === index ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedIndex === index ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <div className="flex gap-3 max-w-[85%] mr-auto items-center">
                <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0 animate-pulse">
                  AI
                </div>
                <div className="bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 shadow-sm">
                  {/* Simple Thinking Spinner - requirement */}
                  <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="text-xs font-sans">
                    {language === 'en' ? 'Tutor is thinking...' : 'መርጃው እያሰበ ነው...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* FOOTER MESSAGE DISPATCH & SUGGESTION CHIPS CHIP LIST */}
      <div className="space-y-3 mt-auto">
        {/* "Suggested Questions" chips - requirement */}
        <div>
          <p className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider mb-1 px-1 flex items-center gap-1 select-none">
            <Sparkles className="w-3 h-3 text-amber-500" />
            {language === 'en' ? 'Suggested topics' : 'የሚመከሩ ጥያቄዎች'}
          </p>
          <div className="flex flex-wrap gap-1.5 py-1">
            {suggestedQuestions.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => { playClickChime(); handleSend(chip.value); }}
                className="text-xs bg-white text-slate-700 hover:text-[#078930] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-250 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 font-medium min-h-[38px]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input area attachments preview */}
        {attachedFile && (
          <div className="flex items-center gap-2.5 bg-white border border-slate-200 p-2.5 rounded-xl self-start text-xs shadow-sm max-w-sm animate-fade-in">
            {attachedFile.previewUrl ? (
              <img src={attachedFile.previewUrl} alt="Upload preview" className="w-9 h-9 rounded object-cover border border-slate-200" />
            ) : (
              <File className="w-5 h-5 text-emerald-600" />
            )}
            <div className="flex-1 min-w-0">
              <p className="truncate font-medium text-slate-800 dark:text-zinc-200">{attachedFile.name}</p>
            </div>
            <button
              onClick={() => { setAttachedFile(null); playClickChime(); }}
              className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-zinc-205 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Message Input Box - always visible at bottom, never hidden */}
        <div className="flex gap-2">
          <button
            onClick={() => { playClickChime(); fileInputRef.current?.click(); }}
            title={language === 'en' ? "Attach study guide image or PDF" : "ማስረጃ ፋይል አያይዝ"}
            className="w-12 h-12 min-h-[48px] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-[#078930] hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shrink-0 shadow-sm cursor-pointer"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            placeholder={language === 'en' ? `Ask anything about ${selectedSubject}...` : `ስለ ${selectedSubject} ያሰቡትን ይጠይቁ...`}
            className="flex-1 bg-white dark:bg-zinc-900 text-slate-800 dark:text-white text-base px-4 py-3 border border-slate-200 dark:border-zinc-800 rounded-xl focus:border-[#078930] focus:ring-1 focus:ring-[#078930] outline-none shadow-sm transition-colors min-w-0 h-12 min-h-[48px]"
          />

          <button
            onClick={startVoiceInput}
            title="Voice Speech Input"
            className={`w-12 h-12 min-h-[48px] bg-white dark:bg-zinc-900 border rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm cursor-pointer ${
              listening 
                ? 'text-red-600 border-red-300 bg-red-50 dark:bg-red-950/20 animate-pulse' 
                : 'text-slate-500 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:text-[#078930] hover:bg-slate-50 dark:hover:bg-zinc-800'
            }`}
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleSend()}
            disabled={(!inputValue.trim() && !attachedFile) || isTyping}
            className="h-12 min-h-[48px] px-5 bg-[#078930] text-white hover:bg-emerald-700 font-serif font-extrabold text-sm rounded-xl flex items-center justify-center disabled:opacity-45 disabled:cursor-not-allowed shadow transition-all hover:scale-102 shrink-0 cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
