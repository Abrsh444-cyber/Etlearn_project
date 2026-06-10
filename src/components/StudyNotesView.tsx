/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Edit3, Clipboard, FileText, Download, Sparkles, Plus, Trash2, Check, HelpCircle, Save, Tags, AlertCircle
} from 'lucide-react';
import { CustomNote } from '../types';
import { PREBUILT_STUDY_NOTES } from '../data/prebuiltContent';
import { generateNoteAI } from '../utils/ai';
import { playClickChime, playSuccessChime, playFailureChime } from '../utils/audio';

interface StudyNotesViewProps {
  apiKey: string;
  customNotes: CustomNote[];
  onSaveCustomNotes: (notes: CustomNote[]) => void;
  enrolledSubjects: string[];
}

export default function StudyNotesView({ apiKey, customNotes, onSaveCustomNotes, enrolledSubjects }: StudyNotesViewProps) {
  const [activeTab, setActiveTab] = useState<'prebuilt' | 'ai_generator' | 'notepad'>('prebuilt');
  const [selectedNoteId, setSelectedNoteId] = useState<'note_et' | 'note_ec' | 'note_bi' | 'note_eg' | 'note_mc'>('note_et');
  const [selectedNote, setSelectedNote] = useState<any>(PREBUILT_STUDY_NOTES[0]);

  // AI Generator state
  const [aiNoteTopic, setAiNoteTopic] = useState('');
  const [generatingNote, setGeneratingNote] = useState(false);
  const [aiNoteErr, setAiNoteErr] = useState<string | null>(null);

  // Note editor Notepad state
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteSubject, setNoteSubject] = useState(enrolledSubjects[0] || 'Emerging Technologies');
  const [noteColor, setNoteColor] = useState('bg-amber-950/20');
  const [isSavedToast, setIsSavedToast] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const colorsList = [
    { class: 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400', name: 'Emerald' },
    { class: 'bg-blue-950/20 border-blue-500/30 text-blue-400', name: 'Blue' },
    { class: 'bg-amber-950/20 border-amber-500/30 text-[#C8962E]', name: 'Gold' },
    { class: 'bg-rose-950/20 border-rose-500/30 text-rose-400', name: 'Rose' },
    { class: 'bg-purple-950/20 border-purple-500/30 text-purple-400', name: 'Purple' }
  ];

  useEffect(() => {
    // Find prebuilt note matching Selected note ID
    const found = PREBUILT_STUDY_NOTES.find(n => n.id === selectedNoteId);
    if (found) setSelectedNote(found);
  }, [selectedNoteId]);

  const handleTriggerGeneratorAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiNoteTopic.trim()) return;

    if (!apiKey) {
      setAiNoteErr("Provide an OpenRouter API Key in Settings to generate customized study sheets.");
      playFailureChime();
      return;
    }

    setGeneratingNote(true);
    setAiNoteErr(null);
    playClickChime();

    try {
      // Choose corresponding subject based on selected prebuilt or defaults
      const derivedSubject = noteSubject || enrolledSubjects[0];
      const note = await generateNoteAI(aiNoteTopic, derivedSubject, apiKey);
      if (note && note.title) {
        // Construct custom note in editor
        const newNote: CustomNote = {
          id: `custom_note_${Date.now()}`,
          title: note.title,
          content: `<h3>${note.intro}</h3>
<p class="font-bold border-l-4 border-[#C8962E] pl-3 py-1 my-3 bg-zinc-900/40">${note.definition}</p>
<div class="space-y-2 mt-4 text-xs">${note.explanation}</div>
<pre class="bg-[#0D0D0D] border border-zinc-800 p-3 rounded font-mono text-[10px] my-3 leading-relaxed text-zinc-300 block">${note.diagram}</pre>
<p class="text-[11px] text-zinc-500 bg-zinc-900 border border-zinc-850 p-2 rounded mt-2"><strong>Mnemonic device:</strong> ${note.mnemonics}</p>`,
          subject: derivedSubject,
          tags: ["AI-Generated", "OpenRouter Study Log"],
          color: 'bg-amber-950/20 border-[#C8962E]/30 text-[#C8962E]',
          createdAt: new Date().toLocaleDateString()
        };

        const updated = [newNote, ...customNotes];
        onSaveCustomNotes(updated);
        setAiNoteTopic('');
        setNoteTitle(note.title);
        // Switch tab to notepad and open it
        setActiveTab('notepad');
        setEditingNoteId(newNote.id);
        setNoteContent(newNote.content);
        playSuccessChime();
      } else {
        throw new Error("Unable to formulate notes correctly. Let us try again.");
      }
    } catch (err: any) {
      setAiNoteErr(err.message || "Failed to generate AI note.");
      playFailureChime();
    } finally {
      setGeneratingNote(false);
    }
  };

  const saveToNotepad = () => {
    if (!noteTitle.trim()) return;
    playClickChime();

    const noteText = editorRef.current?.innerHTML || noteContent;

    if (editingNoteId) {
      // Modify active CustomNote
      const updated = customNotes.map(n => n.id === editingNoteId ? {
        ...n,
        title: noteTitle.trim(),
        content: noteText,
        subject: noteSubject,
        color: noteColor
      } : n);
      onSaveCustomNotes(updated);
    } else {
      // Create fresh CustomNote
      const newNote: CustomNote = {
        id: `custom_note_${Date.now()}`,
        title: noteTitle.trim(),
        content: noteText,
        subject: noteSubject,
        tags: ["Handwritten"],
        color: noteColor,
        createdAt: new Date().toLocaleDateString()
      };
      onSaveCustomNotes([newNote, ...customNotes]);
      setEditingNoteId(newNote.id);
    }

    setIsSavedToast(true);
    playSuccessChime();
    setTimeout(() => setIsSavedToast(false), 3000);
  };

  const startNewNote = () => {
    playClickChime();
    setEditingNoteId(null);
    setNoteTitle('');
    setNoteContent('');
    if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playClickChime();
    const filtered = customNotes.filter(n => n.id !== id);
    onSaveCustomNotes(filtered);
    if (editingNoteId === id) {
      startNewNote();
    }
  };

  const exportNoteAsTxt = (title: string, rawHtml: string) => {
    playClickChime();
    // Simple html tag remover
    const plainText = rawHtml.replace(/<[^>]*>/g, '\n');
    const blob = new Blob([`ETHIOLEARN STUDY NOTE: ${title}\n===================================\n${plainText}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_note.txt`;
    link.click();
    URL.revokeObjectURL(url);
    playSuccessChime();
  };

  const triggerToolbarCommand = (cmd: string) => {
    document.execCommand(cmd, false);
    playClickChime();
  };

  return (
    <div className="space-y-6">
      
      {/* Tab controls */}
      <div className="flex bg-[#161616] p-1.5 rounded-xl border border-[#2A2A2A] self-start justify-start flex-wrap gap-1 w-full md:w-auto">
        <button
          onClick={() => { setActiveTab('prebuilt'); playClickChime(); }}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${activeTab === 'prebuilt' ? 'bg-[#C8962E] text-[#0D0D0D]' : 'text-zinc-400 hover:text-white'}`}
        >
          <BookOpen className="w-4 h-4" /> Academic Handbooks
        </button>

        <button
          onClick={() => { setActiveTab('ai_generator'); playClickChime(); }}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${activeTab === 'ai_generator' ? 'bg-[#1A7A3C] text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          <Sparkles className="w-4 h-4" /> AI Note Builder
        </button>

        <button
          onClick={() => { setActiveTab('notepad'); playClickChime(); }}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${activeTab === 'notepad' ? 'bg-zinc-850 border border-[#2A2A2A] text-[#F0EDE8]' : 'text-zinc-400 hover:text-white'}`}
        >
          <Edit3 className="w-4 h-4" /> Custom Notepad
        </button>
      </div>

      <AnimatePresence mode="wait">
        
        {/* Prebuilt Handbook Tab */}
        {activeTab === 'prebuilt' && (
          <motion.div
            key="prebuilt"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Sidebar list items */}
            <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-serif pl-1">Subjects list</span>
              {PREBUILT_STUDY_NOTES.map((note) => {
                const isSelected = selectedNoteId === note.id;
                return (
                  <button
                    key={note.id}
                    onClick={() => { setSelectedNoteId(note.id as any); playClickChime(); }}
                    className={`w-full text-left p-3 rounded-lg border text-xs cursor-pointer flex flex-col gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#C8962E]/10 border-[#C8962E] text-[#C8962E] font-medium'
                        : 'bg-[#0D0D0D] border-[#2A2A2A] text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">{note.subject}</span>
                    <span>{note.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Note detailed viewer */}
            <div className="lg:col-span-3 bg-[#161616] p-6 rounded-xl border border-[#2A2A2A] space-y-6 shadow-xl relative">
              <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2A] flex-wrap gap-2">
                <div>
                  <span className="text-xs text-[#1A7A3C] font-semibold tracking-wider font-mono uppercase">{selectedNote.subject}</span>
                  <h2 className="font-serif text-xl font-black text-[#F0EDE8]">{selectedNote.title}</h2>
                </div>

                <button
                  onClick={() => exportNoteAsTxt(selectedNote.title, selectedNote.intro + selectedNote.definition + selectedNote.explanation)}
                  className="px-3.5 py-1.5 bg-zinc-900 border border-[#2A2A2A] hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 rounded text-[11px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Export Note
                </button>
              </div>

              {/* Note Content */}
              <div className="space-y-4 text-xs md:text-sm leading-relaxed text-zinc-300">
                <p className="font-sans italic">{selectedNote.intro}</p>

                {/* Key Definition Golden border box */}
                <div className="border-l-4 border-[#C8962E] bg-[#0D0D0D] p-4 rounded-r-xl shadow-inner mt-4">
                  <span className="text-[10px] text-[#C8962E] uppercase font-mono tracking-widest font-bold block mb-1">Key Concept Definition</span>
                  <p className="font-serif leading-relaxed text-zinc-200 font-medium">{selectedNote.definition}</p>
                </div>

                {/* Main explanation content body split */}
                <div className="whitespace-pre-line text-sm mt-4 leading-relaxed font-sans">{selectedNote.explanation}</div>

                {/* Concept diagram ASCII/SVG segment */}
                <div className="mt-8 space-y-2">
                  <span className="text-xs text-[#1A7A3C] font-bold tracking-wider font-mono uppercase">Mechanics Diagram visualization:</span>
                  <pre className="bg-[#0D0D0D] border border-[#2A2A2A] p-4 rounded-xl font-mono text-xs text-center text-[#C8962E] block overflow-x-auto leading-loose selection:bg-zinc-800">
                    {selectedNote.diagram}
                  </pre>
                </div>

                {/* Summary Table block */}
                <div className="mt-8 space-y-3">
                  <span className="text-xs text-[#1A7A3C] font-bold tracking-wider font-mono uppercase">Matrix Summary details:</span>
                  <div className="overflow-x-auto rounded-lg border border-[#2A2A2A]">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-[#0D0D0D] text-zinc-400 text-[10px] uppercase font-mono">
                        <tr>
                          {selectedNote.summaryTable.header.map((h: string) => (
                            <th key={h} className="p-3 border-b border-[#2A2A2A]">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A2A2A] bg-[#161616]">
                        {selectedNote.summaryTable.rows.map((row: string[], rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-zinc-900/60 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3 text-zinc-300">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mnemonics tricks segment */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl flex items-center gap-3 mt-6">
                  <Clipboard className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div className="text-xs text-zinc-300">
                    <span className="font-bold text-emerald-400">Study Mnemonic device: </span>
                    {selectedNote.mnemonics}
                  </div>
                </div>

              </div>

            </div>
          </motion.div>
        )}

        {/* AI Study Note Generator Tab */}
        {activeTab === 'ai_generator' && (
          <motion.div
            key="ai_generator"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto bg-[#161616] border border-[#2A2A2A] p-6 rounded-xl relative shadow-xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-5 opacity-5">
              <Sparkles className="w-32 h-32 text-[#1A7A3C]" />
            </div>

            <div className="max-w-xl space-y-4 relative">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1A7A3C] animate-pulse" />
                <span className="text-xs uppercase font-bold tracking-widest text-[#1A7A3C]">AI Study Notes Synthesizer</span>
              </div>
              <h2 className="font-serif text-lg font-bold text-[#F0EDE8]">Generate In-Depth Handbooks</h2>
              <p className="text-xs text-zinc-500 leading-relaxed">
                Provide a specialized topic from your high school or university modules. OpenRouter will compile structured outlines, custom descriptions, custom mnemonic study cards, and structured markdown diagrams out of the box.
              </p>

              {aiNoteErr && (
                <div className="bg-red-950/20 border border-red-500/20 p-3.5 rounded-xl text-red-400 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{aiNoteErr}</span>
                </div>
              )}

              <form onSubmit={handleTriggerGeneratorAI} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    <label className="text-zinc-500 font-semibold">Subject Context</label>
                    <select
                      value={noteSubject}
                      onChange={(e) => setNoteSubject(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3 text-[#F0EDE8] outline-none cursor-pointer"
                    >
                      {enrolledSubjects.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="text-zinc-500 font-semibold">Topic title / focus area</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GDP expenditure calculation / cellular metabolism"
                      value={aiNoteTopic}
                      onChange={(e) => setAiNoteTopic(e.target.value)}
                      className="w-full bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg p-3 text-[#F0EDE8] outline-none focus:border-[#1A7A3C]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={generatingNote || !aiNoteTopic.trim()}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1A7A3C] to-emerald-500 text-white font-bold text-xs rounded-lg cursor-pointer flex items-center justify-center gap-2 shadow hover:opacity-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-sans uppercase tracking-widest"
                >
                  {generatingNote ? 'Compiling Handbook...' : 'Synthesize Study Note'}
                </button>
              </form>
            </div>
          </motion.div>
        )}

        {/* Custom Notepad Tab */}
        {activeTab === 'notepad' && (
          <motion.div
            key="notepad"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Custom Notes List panel */}
            <div className="bg-[#161616] p-4 rounded-xl border border-[#2A2A2A] space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-[#2A2A2A]">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Your Custom Sheets</span>
                <button
                  onClick={startNewNote}
                  className="p-1 px-2.5 bg-[#C8962E] text-[#0D0D0D] text-[10px] font-bold rounded flex items-center gap-1 hover:opacity-90 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> New Note
                </button>
              </div>

              {customNotes.length === 0 ? (
                <div className="p-8 border border-dashed border-[#2A2A2A] text-center text-xs text-zinc-500 rounded-lg">
                  Use the editor or generate study sheets with the AI Note Builder to build custom flash guides.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {customNotes.map((note) => {
                    const isEditing = editingNoteId === note.id;
                    return (
                      <div
                        key={note.id}
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setNoteTitle(note.title);
                          setNoteContent(note.content);
                          setNoteSubject(note.subject);
                          playClickChime();
                        }}
                        className={`p-3.5 rounded-lg border text-xs cursor-pointer flex justify-between items-start transition-all ${
                          isEditing
                            ? 'bg-[#C8962E]/10 border-[#C8962E] text-[#C8962E] font-medium'
                            : 'bg-[#0D0D0D] border-[#2A2A2A] text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <div className="space-y-1 overflow-hidden pr-3">
                          <p className="font-semibold break-all truncate">{note.title}</p>
                          <span className="text-[9px] text-zinc-500 block uppercase font-mono">{note.subject}</span>
                        </div>

                        <button
                          onClick={(e) => deleteNote(note.id, e)}
                          className="text-zinc-600 hover:text-[#BE1931] p-1 rounded-full transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Note Editor Stage representation */}
            <div className="lg:col-span-2 bg-[#161616] border border-[#2A2A2A] p-5 rounded-xl space-y-4 shadow-xl">
              <div className="flex justify-between items-center pb-2.5 border-b border-[#2A2A2A] flex-wrap gap-2">
                <h3 className="font-serif font-bold text-sm text-[#F0EDE8]">{editingNoteId ? 'Edit Study Note' : 'Draft New Sheet'}</h3>
                
                {isSavedToast && (
                  <span className="text-[10px] bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 py-1 px-2.5 rounded-full flex items-center gap-1 animate-pulse">
                    <Check className="w-3.5 h-3.5" /> File Saved securely
                  </span>
                )}
              </div>

              {/* Title input and configuration selections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="e.g. Mitochondria Respiration Krebs..."
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-xs p-3 outline-none text-[#F0EDE8] focus:border-[#C8962E]"
                />

                <select
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  className="bg-[#0D0D0D] border border-[#2A2A2A] rounded-lg text-xs p-3 outline-none text-[#F0EDE8]"
                >
                  {enrolledSubjects.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Tag/color selectors */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-[10px] text-zinc-500 mr-2 uppercase tracking-wide">Color Category tag:</span>
                {colorsList.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => { setNoteColor(c.class); playClickChime(); }}
                    className={`h-5 w-5 rounded-full border cursor-pointer transition-transform ${c.class.split(' ')[0]} ${noteColor === c.class ? 'scale-125 border-[#C8962E]' : 'border-zinc-800'}`}
                    title={c.name}
                  />
                ))}
              </div>

              {/* Notepad format-rich Toolbar */}
              <div className="flex bg-[#0D0D0D] p-1.5 rounded-lg border border-[#2A2A2A] gap-0.5 max-w-sm">
                <button onClick={() => triggerToolbarCommand('bold')} className="p-1.5 text-xs text-zinc-400 hover:text-[#C8962E] cursor-pointer" title="Bold">B</button>
                <button onClick={() => triggerToolbarCommand('italic')} className="p-1.5 text-xs text-zinc-400 hover:text-[#C8962E] italic cursor-pointer" title="Italic">I</button>
                <button onClick={() => triggerToolbarCommand('underline')} className="p-1.5 text-xs text-zinc-400 hover:text-[#C8962E] underline cursor-pointer" title="Underline">U</button>
                <button onClick={() => triggerToolbarCommand('insertUnorderedList')} className="p-1.5 text-xs text-zinc-400 hover:text-[#C8962E] cursor-pointer" title="Bullet Lists">• List</button>
              </div>

              {/* Rich Contenteditable input textarea */}
              <div
                ref={editorRef}
                contentEditable
                className="w-full h-64 bg-[#0D0D0D] border border-[#2A2A2A] rounded-xl p-4 text-xs overflow-y-auto leading-relaxed outline-none focus:border-zinc-750 font-sans text-zinc-300"
                placeholder="Compose your structured study summary guidelines here..."
                onInput={(e) => setNoteContent(e.currentTarget.innerHTML)}
                dangerouslySetInnerHTML={{ __html: noteContent }}
              />

              {/* Save triggers */}
              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={() => exportNoteAsTxt(noteTitle || "Raw_Note", noteContent)}
                  disabled={!noteTitle.trim()}
                  className="text-[11px] text-zinc-500 hover:text-[#C8962E] flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
                >
                  <Download className="w-3.5 h-3.5" /> Download text
                </button>

                <button
                  onClick={saveToNotepad}
                  disabled={!noteTitle.trim()}
                  className="px-5 py-2.5 bg-[#C8962E] text-[#0D0D0D] font-bold text-xs rounded-lg cursor-pointer flex items-center gap-1.5 hover:opacity-90 disabled:opacity-30 shadow"
                >
                  <Save className="w-3.5 h-3.5" /> Save Note
                </button>
              </div>

            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
