/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, PieChart, TrendingUp, Calendar, Zap, Download, RefreshCw, Smile, Award, Flame, Activity
} from 'lucide-react';
import { playClickChime, playSuccessChime } from '../utils/audio';

interface AnalyticsDashboardProps {
  analyticsData: any;
  onExport: () => void;
}

export default function AnalyticsDashboard({ analyticsData, onExport }: AnalyticsDashboardProps) {
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<HTMLCanvasElement>(null);

  // Active chart instances refs for tracking/destroying to prevent canvas duplication
  const barInstRef = useRef<any>(null);
  const doughInstRef = useRef<any>(null);
  const lineInstRef = useRef<any>(null);

  const [studyStreak, setStudyStreak] = useState(5); // Default start streak
  const [hoursTaught, setHoursTaught] = useState(14.8);
  const [cardsMastered, setCardsMastered] = useState(48);
  const [personalityDesc, setPersonalityDesc] = useState({ title: '', desc: '', icon: '🎓' });

  useEffect(() => {
    // Read local parameters to fill stat boards
    try {
      const savedAn = localStorage.getItem("ethiolearn_analytics");
      if (savedAn) {
        const parsed = JSON.parse(savedAn);
        if (parsed.studyHours) setHoursTaught(parsed.studyHours);
        if (parsed.streak) setStudyStreak(parsed.streak);
        if (parsed.masteredCards) setCardsMastered(parsed.masteredCards);
      }
    } catch(e) {}

    // Calculate dynamic cultural "Study Personality" based on hours & accuracy
    const calcPersonality = () => {
      if (hoursTaught > 25) {
        return {
          title: "የአክሱም ሊቅ (The Axum Scientist)",
          desc: "You are consistent, incredibly dedicated, and possess massive educational focus, reflecting the architectural precision of Axum Obelisks.",
          icon: "🏛️"
        };
      } else if (hoursTaught > 10) {
        return {
          title: "ብሩህ አእምሮ (Coffee Ceremony Anchor)",
          desc: "You thrive on methodical, sequential study schedules. Just like roasting raw coffee beans, you extract deep semantic structure gradually.",
          icon: "☕"
        };
      } else {
        return {
          title: "የላሊበላ ረቂቅ (Rising Scholar)",
          desc: "You are laying down the initial structural foundations of your long-term academic growth, building block-by-block.",
          icon: "✨"
        };
      }
    };
    setPersonalityDesc(calcPersonality());

    // Initialize Chart.js layouts dynamically
    const drawCharts = () => {
      const Chart = (window as any).Chart;
      if (!Chart) return;

      // Chart.js global theme parameters overrides
      Chart.defaults.color = '#8A8480';
      Chart.defaults.font.family = 'Inter';

      // 1. Weekly Study Hours - Bar Chart
      if (barChartRef.current) {
        if (barInstRef.current) barInstRef.current.destroy();
        const ctx = barChartRef.current.getContext('2d');
        if (ctx) {
          barInstRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
              labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
              datasets: [{
                label: 'Study Hours',
                data: [2.5, 1.8, 3.2, 0.5, 2.1, 4.0, 1.2],
                backgroundColor: '#C8962E',
                borderColor: '#C8962E',
                borderWidth: 1,
                borderRadius: 4
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: '#222' } },
                x: { grid: { display: false } }
              }
            }
          });
        }
      }

      // 2. Subject time distribution - Doughnut Chart
      if (doughnutChartRef.current) {
        if (doughInstRef.current) doughInstRef.current.destroy();
        const ctx = doughnutChartRef.current.getContext('2d');
        if (ctx) {
          doughInstRef.current = new Chart(ctx, {
            type: 'doughnut',
            data: {
              labels: ['Emerging Tech', 'Economics', 'Biology', 'English', 'Civics'],
              datasets: [{
                data: [35, 20, 15, 15, 15],
                backgroundColor: ['#C8962E', '#1A7A3C', '#BE1931', '#1D4ED8', '#6B21A8'],
                borderWidth: 0
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: { boxWidth: 12, padding: 15 }
                }
              }
            }
          });
        }
      }

      // 3. Exam Score history - Line Chart
      if (lineChartRef.current) {
        if (lineInstRef.current) lineInstRef.current.destroy();
        const ctx = lineChartRef.current.getContext('2d');
        if (ctx) {
          lineInstRef.current = new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Mock 1', 'Mock 2', 'Mock 3', 'Mock 4', 'Mock 5'],
              datasets: [{
                label: 'Readiness Score %',
                data: [60, 68, 75, 70, 88],
                borderColor: '#1A7A3C',
                backgroundColor: 'rgba(26, 122, 60, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                y: { grid: { color: '#222' }, min: 40, max: 100 },
                x: { grid: { display: false } }
              }
            }
          });
        }
      }
    };

    // A small buffer waiting for CDNs if needed
    const t = setTimeout(drawCharts, 150);
    return () => {
      clearTimeout(t);
      if (barInstRef.current) barInstRef.current.destroy();
      if (doughInstRef.current) doughInstRef.current.destroy();
      if (lineInstRef.current) lineInstRef.current.destroy();
    };
  }, [hoursTaught]);

  // Construct a standard GitHub-style streak heatmap grid representing 30 preceding study intervals
  const renderGithubGrid = () => {
    const panels = [];
    const seedValues = [4, 0, 1, 2, 0, 3, 4, 1, 0, 2, 3, 4, 0, 1, 2, 4, 0, 1, 3, 2, 0, 4, 1, 2, 3, 0, 4, 2, 1, 4];
    
    for (let i = 0; i < 30; i++) {
      const level = seedValues[i % seedValues.length];
      let colorClass = 'bg-[#0D0D0D] border-[#2A2A2A]'; // Default unstudied
      if (level === 1) colorClass = 'bg-[#1A7A3C]/20 border-emerald-950';    // Mild
      else if (level === 2) colorClass = 'bg-[#1A7A3C]/50 border-emerald-900'; // Med
      else if (level === 3) colorClass = 'bg-[#1A7A3C] border-emerald-800';      // Dense
      else if (level === 4) colorClass = 'bg-[#C8962E] border-amber-900';        // Pro Gold study level

      panels.push(
        <div
          key={i}
          className={`w-3.5 h-3.5 rounded border transition-all hover:scale-110 ${colorClass}`}
          title={`Academic Day ${i + 1}: Study density level ${level}`}
        />
      );
    }
    return panels;
  };

  return (
    <div className="space-y-6">
      
      {/* Top statistics summary boxes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Streak card */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Daily Streak</span>
            <p className="font-mono text-xl font-bold text-[#F0EDE8]">{studyStreak} Days</p>
          </div>
          <Flame className="w-8 h-8 text-[#C8962E] animate-pulse" />
        </div>

        {/* Study Hours */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Total Study Hours</span>
            <p className="font-mono text-xl font-bold text-[#F0EDE8]">{hoursTaught} Hours</p>
          </div>
          <Activity className="w-8 h-8 text-[#1A7A3C]" />
        </div>

        {/* Mastered Cards */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Flashcards Mastered</span>
            <p className="font-mono text-xl font-bold text-[#F0EDE8]">{cardsMastered} Cards</p>
          </div>
          <Smile className="w-8 h-8 text-rose-500" />
        </div>

        {/* Readiness Rank */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">Exam Readiness</span>
            <p className="font-mono text-xl font-bold text-emerald-400">82.5% Rank</p>
          </div>
          <Award className="w-8 h-8 text-emerald-400" />
        </div>

      </div>

      {/* Main Charts grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly study distribution bar chart */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] space-y-3">
          <span className="text-xs font-serif font-bold text-[#F0EDE8] block">Weekly Log Duration (Hours)</span>
          <div className="h-56 relative">
            <canvas ref={barChartRef} />
          </div>
        </div>

        {/* Subject coverage dough chart */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] space-y-3">
          <span className="text-xs font-serif font-bold text-[#F0EDE8] block">Subject Focus breakdown</span>
          <div className="h-56 relative">
            <canvas ref={doughnutChartRef} />
          </div>
        </div>

        {/* Readiness progression trends lines */}
        <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] space-y-3">
          <span className="text-xs font-serif font-bold text-[#F0EDE8] block">Predictive diagnostic readiness</span>
          <div className="h-56 relative">
            <canvas ref={lineChartRef} />
          </div>
        </div>

      </div>

      {/* Streak Heatmap Calendar grid & Personality assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Github grid */}
        <div className="lg:col-span-2 bg-[#161616] p-5 rounded-xl border border-[#2A2A2A] space-y-3.5">
          <div>
            <h4 className="font-serif text-[#F0EDE8] text-sm font-bold">Study Density Calendar Map</h4>
            <p className="text-[11px] text-zinc-500">A rhythmic display of your daily lessons density for the preceding 30 days.</p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {renderGithubGrid()}
          </div>

          <div className="flex items-center gap-4 text-[9px] text-zinc-500 pl-1">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-[#0D0D0D] border border-zinc-850" /> Unreviewed</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-[#1A7A3C]/30 border border-emerald-950" /> 15 mins</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-[#1A7A3C] border border-emerald-800" /> 1 Hour</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded bg-[#C8962E] border border-amber-900" /> Pro Score (Mock A+)</span>
          </div>
        </div>

        {/* Unique dynamic study personality card */}
        <div className="bg-[#161616] p-5 rounded-xl border border-[#C8962E]/20 relative shadow overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] text-[#C8962E] font-bold uppercase tracking-widest font-mono">My Study personality</span>
            <div className="flex items-center gap-3">
              <span className="text-4xl">{personalityDesc.icon}</span>
              <h3 className="font-serif text-base font-black text-[#F0EDE8] leading-tight">{personalityDesc.title}</h3>
            </div>
            <p className="text-xs text-zinc-400 leading-normal pl-0.5">{personalityDesc.desc}</p>
          </div>

          <button
            onClick={() => { playSuccessChime(); onExport(); }}
            className="w-full mt-4 py-2.5 bg-[#0D0D0D] border border-[#2A2A2A] hover:border-[#C8962E]/40 hover:bg-[#161616] text-zinc-300 font-semibold rounded text-xs flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <Download className="w-4 h-4 text-[#C8962E]" /> Export Learning Sheets JSON
          </button>
        </div>

      </div>

    </div>
  );
}
