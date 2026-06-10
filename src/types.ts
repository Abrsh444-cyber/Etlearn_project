/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StudentProfile {
  name: string;
  university: string;
  year: string;
  subjects: string[];
  claudeApiKey: string;
  dailyGoalHours: number;
  theme: 'dark' | 'light' | 'auto';
  language: 'en' | 'am' | 'both';
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  difficulty?: string;
  explanation?: string;
  // SM-2 Spaced Repetition Fields
  interval: number; // in days
  repetition: number;
  easeFactor: number;
  dueDate: string; // ISO string
}

export interface Deck {
  id: string;
  title: string;
  subject: string;
  cards: Flashcard[];
}

export interface CustomNote {
  id: string;
  title: string;
  content: string;
  subject: string;
  tags: string[];
  color: string; // Tailwind bg color class
  createdAt: string;
}

export interface ExamSession {
  id: string;
  subject: string;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionsCount: number;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  weakAreas: string[];
}

export interface StudySession {
  id: string;
  subject: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
}

export interface FlashcardReviewLog {
  date: string; // YYYY-MM-DD
  reviewedCount: number;
  correctCount: number;
}

export interface AppState {
  currentPage: string;
  profile: StudentProfile | null;
  streak: {
    current: number;
    highest: number;
    lastActiveDate: string | null;
  };
  customNotes: CustomNote[];
  examSessions: ExamSession[];
  studySessions: StudySession[];
  flashcardLogs: FlashcardReviewLog[];
  decksState: { [deckId: string]: Flashcard[] }; // Overrides / stores review state of cards in a deck
}
