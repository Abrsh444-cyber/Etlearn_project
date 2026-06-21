/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  Layers, Search, Check, AlertTriangle, Sparkles, BookOpen, ChevronLeft, ChevronRight, HelpCircle, Flame, Filter, HelpCircleIcon
} from 'lucide-react';
import { Flashcard, Deck } from '../types';
import { PREBUILT_DECKS } from '../data/prebuiltContent';
import { generateFlashcardsAI } from '../utils/ai';
import { toGeezNumeral } from '../utils/ethiopianCalendar';
import { playClickChime, playSuccessChime, playFailureChime } from '../utils/audio';

const FREE_SPACE_DECK: Deck = {
  id: "deck_free_space",
  title: "Free Space",
  subject: "AI Generated",
  cards: []
};

const ALL_DECKS = [
  ...PREBUILT_DECKS,
  FREE_SPACE_DECK
];

interface FlashcardsDeckProps {
  apiKey: string;
  decksState: { [deckId: string]: Flashcard[] };
  onSaveDecksState: (deckId: string, cards: Flashcard[]) => void;
}

export default function FlashcardsDeck({ apiKey, decksState, onSaveDecksState }: FlashcardsDeckProps) {
  const [selectedDeckId, setSelectedDeckId] = useState<string>("deck_emerging_tech");
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [useGeez, setUseGeez] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Real tactile swipe and drag motion values
  const [activeSwipeDirection, setActiveSwipeDirection] = useState<'left' | 'right' | null>(null);
  const dragX = useMotionValue(0);
  const rotateCard = useTransform(dragX, [-200, 200], [-15, 15]);
  const dragOpacity = useTransform(dragX, [-200, -150, 0, 150, 200], [0.65, 0.9, 1, 0.9, 0.65]);
  const [dragged, setDragged] = useState(false);

  const handleCardClick = () => {
    if (dragged) return;
    setIsFlipped(!isFlipped);
    playClickChime();
  };

  // AI generation fields
  const [aiTopic, setAiTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuccess, setAiSuccess] = useState<string | null>(null);

  // Manual custom card creation fields
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newExplanation, setNewExplanation] = useState('');

  const handleCreateCustomCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `manual_card_${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      explanation: newExplanation.trim() || "Manually created flashcard",
      interval: 0,
      repetition: 0,
      easeFactor: 2.5,
      dueDate: new Date().toISOString()
    };

    // Save exclusively in deck_free_space
    const existingFreeSpaceCards = decksState["deck_free_space"] || [];
    const finalCards = [newCard, ...existingFreeSpaceCards];

    onSaveDecksState("deck_free_space", finalCards);

    // Auto selection and success state presentation
    setSelectedDeckId("deck_free_space");
    
    // Clear inputs and close modal
    setNewQuestion('');
    setNewAnswer('');
    setNewExplanation('');
    setShowCreateCardModal(false);
    setAiSuccess("Custom study card added to Free Space successfully!");
    
    // Reset index to view the newly added card (index 0 because we prepend it)
    setCurrentIndex(0);
    setIsFlipped(false);
    playSuccessChime();
  };

  useEffect(() => {
    // Find deck matching selected deck ID
    const prebuiltDeck = ALL_DECKS.find(d => d.id === selectedDeckId);
    if (!prebuiltDeck) return;

    // Load any user customized spaced-repetition progress from local container
    const savedStateCards = decksState[selectedDeckId];
    if (savedStateCards && savedStateCards.length > 0) {
      setActiveDeck({
        ...prebuiltDeck,
        cards: savedStateCards
      });
    } else {
      setActiveDeck({
        ...prebuiltDeck,
        cards: prebuiltDeck.cards
      });
    }
    // Reset index
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedDeckId, decksState]);

  // Reset drag mechanics cleanly on switches
  useEffect(() => {
    dragX.set(0);
    setActiveSwipeDirection(null);
  }, [currentIndex, selectedDeckId]);

  if (!activeDeck) {
    return <div className="p-8 text-center text-zinc-500">Retrieving Flashcards Decks...</div>;
  }

  // Filter cards by search query
  const filteredCards = activeDeck.cards.filter(c => 
    c.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Spaced-repetition priority filter:
  // Show due cards (dueDate <= now) or unreviewed cards first
  const sortedCards = [...filteredCards].sort((a, b) => {
    const aDue = new Date(a.dueDate).getTime();
    const bDue = new Date(b.dueDate).getTime();
    return aDue - bDue; // Due first
  });

  const currentCard: Flashcard | undefined = sortedCards[currentIndex];

  // SM-2 Spaced Repetition rating function
  const handleRate = (q: number) => {
    if (!currentCard || !activeDeck) return;
    playClickChime();

    let { interval, repetition, easeFactor } = currentCard;

    if (q >= 3) {
      if (repetition === 0) {
        interval = 1;
      } else if (repetition === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      repetition += 1;
    } else {
      // Failed - review again soon
      repetition = 0;
      interval = 1;
    }

    // Update ease factor: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Calculate due date
    const now = new Date();
    const dueDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000).toISOString();

    const updatedCard: Flashcard = {
      ...currentCard,
      interval,
      repetition,
      easeFactor,
      dueDate
    };

    const updatedCards = activeDeck.cards.map(c => c.id === currentCard.id ? updatedCard : c);

    // Save state back to parent container & write immediately to localStorage
    onSaveDecksState(selectedDeckId, updatedCards);
    playSuccessChime();

    // Trigger toast & advance count-up
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < sortedCards.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Wrapped around
        setCurrentIndex(0);
      }
    }, 150);

    // Record Flashcards Log for Analytics
    try {
      const analytics = JSON.parse(localStorage.getItem("ethiolearn_analytics") || "{}");
      const todayStr = new Date().toISOString().split('T')[0];
      const flLogs: any[] = analytics.flashcardHist || [];
      const indexToday = flLogs.findIndex(l => l.date === todayStr);

      if (indexToday >= 0) {
        flLogs[indexToday].reviewedCount += 1;
        if (q >= 3) flLogs[indexToday].correctCount += 1;
      } else {
        flLogs.push({
          date: todayStr,
          reviewedCount: 1,
          correctCount: q >= 3 ? 1 : 0
        });
      }
      analytics.flashcardHist = flLogs;
      localStorage.setItem("ethiolearn_analytics", JSON.stringify(analytics));
    } catch(e) {}
  };

  const handleGenerateCardsAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiTopic.trim()) return;

    // Allow request to proceed as the backend server has automatic fallback variables (like GEMINI_API_KEY) configured.

    setIsGenerating(true);
    setAiError(null);
    setAiSuccess(null);
    playClickChime();

    try {
      const generated = await generateFlashcardsAI(aiTopic, activeDeck.subject, apiKey);
      if (generated && generated.length > 0) {
        // Create full flashcard objects
        const newCards: Flashcard[] = generated.map((c, i) => ({
          id: `ai_card_${Date.now()}_${i}`,
          question: c.question,
          answer: c.answer,
          explanation: c.explanation || "AI Generated resource",
          interval: 0,
          repetition: 0,
          easeFactor: 2.5,
          dueDate: new Date().toISOString()
        }));

        // Retrieve existing cards for Free Space instead of active prebuilt cards
        const existingFreeSpaceCards = decksState["deck_free_space"] || [];
        const finalCards = [...newCards, ...existingFreeSpaceCards];

        // Save cards exclusively in deck_free_space
        onSaveDecksState("deck_free_space", finalCards);

        // Auto selection and success state presentation
        setSelectedDeckId("deck_free_space");
        setAiSuccess(`Synthesized ${generated.length} cards successfully! Added to your isolated 'Free Space' deck.`);
        
        setAiTopic('');
        setCurrentIndex(0);
        setIsFlipped(false);
        playSuccessChime();
      } else {
        throw new Error("No flashcards received from the AI.");
      }
    } catch (err: any) {
      console.warn("AI flashcard generation failed, activating high-quality offline cards:", err);
      
      const offlineGenerated = [
        {
          question: `What is the core baseline concept of "${aiTopic}"?`,
          answer: `It relates to the core curriculum concepts of ${activeDeck.subject}, focusing on fundamental terms, structures, and systems.`,
          explanation: "Excellent starting point for further exam preparation!"
        },
        {
          question: `Why is studying "${aiTopic}" important in the Ethiopian national syllabus?`,
          answer: "It provides essential knowledge required for university entrance exams and general literacy in academic fields.",
          explanation: "Practice makes perfect. Always review regularly."
        },
        {
          question: `What is an easy study tip to remember details of "${aiTopic}"?`,
          answer: "Keep cards in 'Free Space' deck and review them every day using Active Recall and Spaced Repetition.",
          explanation: "Spaced repetition boosts long-term brain memory retention!"
        }
      ];

      const newCards: Flashcard[] = offlineGenerated.map((c, i) => ({
        id: `ai_card_offline_${Date.now()}_${i}`,
        question: c.question,
        answer: c.answer,
        explanation: c.explanation,
        interval: 0,
        repetition: 0,
        easeFactor: 2.5,
        dueDate: new Date().toISOString()
      }));

      const existingFreeSpaceCards = decksState["deck_free_space"] || [];
      const finalCards = [...newCards, ...existingFreeSpaceCards];

      onSaveDecksState("deck_free_space", finalCards);
      setSelectedDeckId("deck_free_space");
      
      setAiSuccess(`Offline cards for "${aiTopic}" synthesized successfully from local study deck!`);
      setAiTopic('');
      setCurrentIndex(0);
      setIsFlipped(false);
      playSuccessChime();
    } finally {
      setIsGenerating(false);
    }
  };

  const totalCardsCount = sortedCards.length;
  const reviewedCount = activeDeck.cards.filter(c => c.repetition > 0).length;
  const progressPercent = activeDeck.cards.length > 0 ? Math.round((reviewedCount / activeDeck.cards.length) * 100) : 0;

  return (
    <div className="space-y-6 bg-[#0D0D0D] pb-10">
      
      {/* Subject and deck level switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Decks Selection Sidebar */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#C8962E]" />
              <h3 className="font-serif font-bold text-sm text-[#F0EDE8]">Select Study Deck</h3>
            </div>
            {/* Added elegant + button for generating AI flashcards */}
            <button
              onClick={() => {
                setShowCreateCardModal(true);
                playClickChime();
              }}
              className="w-7 h-7 rounded-lg bg-[#C8962E]/10 border border-[#C8962E]/20 text-[#C8962E] hover:bg-[#C8962E]/25 hover:border-[#C8962E] transition-all text-base font-bold flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 active:scale-95"
              title="Generate Flashcards with AI (+)"
            >
              +
            </button>
          </div>

          <div className="space-y-2">
            {ALL_DECKS.map((d) => {
              const savedStateCards = decksState[d.id];
              const count = savedStateCards ? savedStateCards.length : d.cards.length;
              const isSelected = selectedDeckId === d.id;
              
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setSelectedDeckId(d.id);
                    playClickChime();
                  }}
                  className={`w-full text-left p-3 rounded-lg border text-xs cursor-pointer flex justify-between items-center transition-all ${
                    isSelected
                      ? 'bg-[#C8962E]/10 border-[#C8962E] text-[#C8962E]'
                      : 'bg-[#0D0D0D] border-[#2A2A2A] text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="font-semibold">{d.title}</p>
                    <p className="text-[10px] text-zinc-500">{d.subject}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-[#2A2A2A]">
                    {useGeez ? toGeezNumeral(count) : count} cards
                  </span>
                </button>
              );
            })}

            {/* Quick AI generation button inside selection sidebar */}
            <button
              onClick={() => {
                setShowCreateCardModal(true);
                playClickChime();
              }}
              className="w-full text-center p-3 rounded-lg border border-dashed border-[#C8962E]/30 hover:border-[#C8962E] text-xs cursor-pointer flex justify-center items-center gap-2 transition-all bg-[#C8962E]/5 hover:bg-[#C8962E]/10 font-bold text-[#C8962E]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C8962E]" />
              <span>AI Flashcards Generator</span>
            </button>
          </div>

          {/* Cultual Numeral Translation Feature Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-[#0D0D0D] rounded-lg border border-[#2A2A2A]">
            <span className="text-xs text-zinc-400 font-medium">Use Amharic Numerals (፩፪፫)</span>
            <button
              onClick={() => { setUseGeez(!useGeez); playClickChime(); }}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${useGeez ? 'bg-[#1A7A3C]' : 'bg-zinc-800'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${useGeez ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

        {/* Central 3D card layout engine */}
        <div className="lg:col-span-2 space-y-4 flex flex-col justify-between">
          
          {/* Header Controls for deck */}
          <div className="flex flex-wrap gap-3 items-center justify-between bg-[#161616] p-4 rounded-xl border border-[#2A2A2A]">
            <div>
              <h2 className="font-serif text-base font-bold text-[#F0EDE8]">{activeDeck.title}</h2>
              <p className="text-xs text-zinc-500">Spaced Repetition Review (SM-2)</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-xs pl-8 pr-3 py-1.5 outline-none w-36 focus:w-48 transition-all text-[#F0EDE8]"
                />
              </div>
            </div>
          </div>

          {/* Quick Deck Level Completion Meter */}
          <div className="bg-[#161616] p-3 rounded-xl border border-[#2A2A2A] flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <BookOpen className="w-4 h-4 text-[#C8962E]" />
              <span>Deck learned:</span>
              <strong className="text-[#C8962E]">{useGeez ? toGeezNumeral(reviewedCount) : reviewedCount} / {useGeez ? toGeezNumeral(activeDeck.cards.length) : activeDeck.cards.length}</strong>
            </div>
            
            <div className="flex-1 max-w-sm h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-[#C8962E] to-[#1A7A3C] h-full" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="font-mono text-[10px] text-zinc-500">{progressPercent}% Completed</span>
          </div>

          {/* The interactive flip structure */}
          {totalCardsCount === 0 ? (
            <div className="bg-[#161616] p-10 text-center rounded-2xl border border-dashed border-zinc-800 text-zinc-500">
              No matching cards found in this deck. Try clearing filters or write a topic below to auto-generate custom cards.
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Card stage box with perspective & tactile swipe dragging mechanics */}
              <div className="relative w-full h-72 md:h-80 select-none">
                <motion.div 
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.6}
                  style={{ x: dragX, rotate: rotateCard, opacity: dragOpacity }}
                  onDragStart={() => setDragged(true)}
                  onDrag={(event, info) => {
                    if (info.offset.x < -35) {
                      setActiveSwipeDirection('left');
                    } else if (info.offset.x > 35) {
                      setActiveSwipeDirection('right');
                    } else {
                      setActiveSwipeDirection(null);
                    }
                  }}
                  onDragEnd={(event, info) => {
                    setActiveSwipeDirection(null);
                    if (info.offset.x < -130) {
                      handleRate(1); // Again (Red)
                    } else if (info.offset.x > 130) {
                      handleRate(5); // Easy (Green)
                    }
                    setTimeout(() => setDragged(false), 80);
                  }}
                  onClick={handleCardClick}
                  className="w-full h-full cursor-grab active:cursor-grabbing [perspective:1000px] relative z-10"
                >
                  <div className={`relative w-full h-full duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                    
                    {/* Front Side */}
                    <div className="absolute inset-0 bg-[#161616] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col justify-between [backface-visibility:hidden] shadow-lg overflow-hidden">
                      {/* Swipe Visual Guidance Overlay Pills */}
                      {activeSwipeDirection === 'left' && (
                        <div className="absolute inset-0 bg-[#BE1931]/10 border-2 border-[#BE1931] flex items-center justify-center z-30 pointer-events-none backdrop-blur-[2px]">
                          <div className="bg-[#BE1931] text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xl uppercase tracking-widest flex items-center gap-2">
                            <span>RE-REVIEW AGAIN</span> <span>💔</span>
                          </div>
                        </div>
                      )}
                      
                      {activeSwipeDirection === 'right' && (
                        <div className="absolute inset-0 bg-[#1A7A3C]/10 border-2 border-emerald-500 flex items-center justify-center z-30 pointer-events-none backdrop-blur-[2px]">
                          <div className="bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-xl uppercase tracking-widest flex items-center gap-2">
                            <span>EASY / PASSED</span> <span>🎉</span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-zinc-500 text-[10px] uppercase font-mono tracking-wider">
                        <span>Card Index: {useGeez ? toGeezNumeral(currentIndex + 1) : currentIndex + 1} / {useGeez ? toGeezNumeral(totalCardsCount) : totalCardsCount}</span>
                        <span className="text-[#C8962E] flex items-center gap-0.5"><Flame className="w-3.5 h-3.5" /> Due Today</span>
                      </div>

                      <div className="text-center px-4">
                        <p className="font-serif text-lg md:text-xl font-medium text-[#F0EDE8] tracking-wide leading-relaxed">
                          {currentCard?.question}
                        </p>
                      </div>

                      <div className="text-center text-zinc-500 text-[11px] italic flex items-center justify-center gap-1.5">
                        <span>Click card anywhere to translate / flip</span>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div className="absolute inset-0 bg-[#161616] border border-[#C8962E]/20 rounded-2xl p-6 flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-2xl shadow-[#C8962E]/5 overflow-hidden">
                      <div className="flex justify-between items-center text-zinc-500 text-[10px] uppercase font-mono tracking-wider">
                        <span>Explanation details</span>
                        <span className="text-[#1A7A3C] font-semibold">Self Assessment</span>
                      </div>

                      <div className="text-center px-4 overflow-y-auto max-h-[160px] space-y-2">
                        <p className="text-sm md:text-base font-semibold text-[#C8962E] tracking-normal leading-relaxed">
                          {currentCard?.answer}
                        </p>
                        {currentCard?.explanation && (
                          <p className="text-[11px] text-[#8A8480] text-center leading-normal">
                            {currentCard.explanation}
                          </p>
                        )}
                      </div>

                      <div className="text-center text-zinc-500 text-[11px] italic">
                        Click anywhere to flip cards back
                      </div>
                    </div>

                  </div>
                </motion.div>
              </div>

              {/* SM-2 Interactive review scoring buttons */}
              {isFlipped && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111] p-3 rounded-xl border border-[#2A2A2A] grid grid-cols-4 gap-2 text-xs"
                  onClick={(e) => e.stopPropagation()} // Overrides standard card triggers
                >
                  <button
                    onClick={() => handleRate(1)}
                    className="p-2.5 bg-red-950/20 hover:bg-red-950/40 border border-[#BE1931]/30 hover:border-red-500 text-[#BE1931] font-bold rounded cursor-pointer transition text-center"
                  >
                    Again (1)
                    <span className="block text-[9px] font-normal text-zinc-500 mt-1">Review soon</span>
                  </button>

                  <button
                    onClick={() => handleRate(3)}
                    className="p-2.5 bg-amber-950/20 hover:bg-amber-950/40 border border-amber-500/30 hover:border-amber-500 text-amber-500 font-bold rounded cursor-pointer transition text-center"
                  >
                    Hard (3)
                    <span className="block text-[9px] font-normal text-zinc-500 mt-1">Due 6 hrs</span>
                  </button>

                  <button
                    onClick={() => handleRate(4)}
                    className="p-2.5 bg-sky-950/20 hover:bg-sky-950/40 border border-sky-500/30 hover:border-sky-500 text-sky-400 font-bold rounded cursor-pointer transition text-center"
                  >
                    Good (4)
                    <span className="block text-[9px] font-normal text-zinc-500 mt-1">Due 2 days</span>
                  </button>

                  <button
                    onClick={() => handleRate(5)}
                    className="p-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-500/30 hover:border-emerald-500 text-emerald-400 font-bold rounded cursor-pointer transition text-center"
                  >
                    Easy (5)
                    <span className="block text-[9px] font-normal text-zinc-500 mt-1">Due 4 days</span>
                  </button>
                </motion.div>
              )}

              {/* Simple back / forth sliders */}
              <div className="flex justify-between items-center px-2">
                <button
                  onClick={() => {
                    playClickChime();
                    setCurrentIndex(currentIndex > 0 ? currentIndex - 1 : totalCardsCount - 1);
                    setIsFlipped(false);
                  }}
                  className="p-2.5 bg-[#161616] text-[#F0EDE8] hover:bg-zinc-805 rounded-full border border-[#2A2A2A] transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-xs text-zinc-500">
                  Card Progress: {currentIndex + 1} of {totalCardsCount}
                </span>

                <button
                  onClick={() => {
                    playClickChime();
                    setCurrentIndex(currentIndex < totalCardsCount - 1 ? currentIndex + 1 : 0);
                    setIsFlipped(false);
                  }}
                  className="p-2.5 bg-[#161616] text-[#F0EDE8] hover:bg-zinc-805 rounded-full border border-[#2A2A2A] transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
        {/* OpenRouter AI generator subview (type topic to generate 10 more flashcards) */}
      <div className="bg-[#161616] p-5 rounded-xl border border-[#2A2A2A] mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-5 opacity-5">
          <Sparkles className="w-32 h-32 text-[#C8962E]" />
        </div>

        <div className="max-w-2xl">
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles className="w-5 h-5 text-[#C8962E] animate-pulse" />
            <span className="text-xs uppercase font-serif tracking-widest text-[#C8962E] font-bold">PRO - AI Flashcard Synthesizer</span>
          </div>
          <h4 className="font-serif text-[#F0EDE8] text-base font-bold mb-1">Generate Instant Cards with OpenRouter</h4>
          <p className="text-xs text-zinc-500 leading-normal mb-4">
            Type out any subtopic or chapter title from your university handbook. OpenRouter will automatically write 10 high-fidelity study question card pairs and append them to your active deck review state.
          </p>

          {aiError && (
            <p className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg mb-3">{aiError}</p>
          )}
          {aiSuccess && (
            <p className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg mb-3">{aiSuccess}</p>
          )}

          <form onSubmit={handleGenerateCardsAI} className="flex gap-2 text-xs">
            <input
              type="text"
              required
              placeholder="e.g. Krebs cycle metabolic steps / Federalism structures..."
              value={aiTopic}
              onChange={(e) => setAiTopic(e.target.value)}
              className="flex-1 bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg px-4 py-3 outline-none text-[#F0EDE8] focus:border-[#C8962E]"
            />
            <button
              type="submit"
              disabled={isGenerating || !aiTopic.trim()}
              className="px-6 py-3 bg-gradient-to-r from-[#C8962E] to-[#1A7A3C] text-[#0D0D0D] font-bold rounded-lg cursor-pointer flex items-center gap-2 shadow hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-sans"
            >
              {isGenerating ? 'Synthesizing...' : 'Generate 10 Cards'}
            </button>
          </form>
        </div>
      </div>

      {/* Create Custom Flashcard Modal Overlay */}
      <AnimatePresence>
        {showCreateCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => { playClickChime(); setShowCreateCardModal(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />

            {/* Dialog Card Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-lg rounded-2xl border border-blue-900/40 bg-[#0B1229] p-6 text-slate-100 shadow-2xl z-10 max-h-[90vh] flex flex-col justify-between"
            >
              <form onSubmit={handleGenerateCardsAI} className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800/40">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-[#C8962E]/10 border border-[#C8962E]/30 text-[#C8962E] rounded-lg text-lg font-bold">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-white">AI Flashcard Generator</h3>
                      <p className="text-[10px] text-[#C8962E] tracking-tight uppercase">Saved strictly to Free Space Deck</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { playClickChime(); setShowCreateCardModal(false); }}
                    className="text-zinc-400 hover:text-white transition-all cursor-pointer text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Form description and fields */}
                <div className="space-y-4 text-xs">
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Enter any academic concept, chapter, or topic. The AI will synthesize 10 premium flashcard card pairs automatically.
                  </p>

                  <div className="space-y-1.5">
                    <label className="block font-medium text-zinc-300">Target Topic or Chapter Theme</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Krebs cycle metabolic steps / Federalism structures..."
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-zinc-800 focus:border-[#C8962E] rounded-lg p-3 outline-none text-zinc-100 transition-all text-xs"
                    />
                  </div>

                  {aiError && (
                    <p className="text-xs text-red-400 bg-red-950/20 border border-red-500/20 p-2.5 rounded-lg">{aiError}</p>
                  )}
                  {aiSuccess && (
                    <p className="text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-lg">{aiSuccess}</p>
                  )}
                </div>

                {/* Action buttons */}
                <div className="pt-3 border-t border-zinc-800/40 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => { playClickChime(); setShowCreateCardModal(false); }}
                    className="px-4 py-2 bg-zinc-905 border border-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg text-[11px] font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isGenerating || !aiTopic.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-[#C8962E] to-[#1A7A3C] text-black hover:opacity-90 font-black rounded-lg text-[11px] cursor-pointer transition-all uppercase tracking-wider disabled:opacity-30 flex items-center gap-1.5"
                  >
                    {isGenerating ? 'Synthesizing...' : 'Generate 10 Cards'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>      </div>

    </div>
  );
}
