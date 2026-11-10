import React, { useState } from 'react';
import { X, Loader2, Wand2, AlertCircle } from 'lucide-react';
import { CEFRLevel, LectureUnit, LanguageMode } from '../types/curriculum';
import { useModalBehavior, backdropDismiss, MODAL_BACKDROP_CLASS } from '../hooks/useModalBehavior';

interface AILessonModalProps {
  isOpen: boolean;
  isOnline: boolean;
  nextLectureNumber: number;
  defaultLevel: CEFRLevel;
  languageMode: LanguageMode;
  onClose: () => void;
  onLectureGenerated: (lecture: LectureUnit) => void;
}

const TOPIC_PRESETS = [
  {
    label: 'Hospitality & Trekking Tourism',
    nepali: 'पर्यटन र अतिथि सत्कार',
    topic: 'Hospitality, Trekking Tourism, and Guest Communication in Nepal',
  },
  {
    label: 'Tech & Job Interviews',
    nepali: 'रोजगारी अन्तर्वार्ता र अफिस',
    topic: 'Job Interviews, Software Workplace Etiquette, and Career Growth',
  },
  {
    label: 'IELTS & Academic Essays',
    nepali: 'शैक्षिक लेखन र IELTS शब्दहरू',
    topic: 'Academic Essay Connectors, Critical Thinking, and University Vocabulary',
  },
  {
    label: 'Healthcare & Medical English',
    nepali: 'स्वास्थ्य र चिकित्सा संवाद',
    topic: 'Healthcare, Hospital Consultations, and Medical Terms with Silent Letters',
  },
  {
    label: 'Banking & Personal Finance',
    nepali: 'बैंकिङ र वित्तीय कारोबार',
    topic: 'Banking, Remittance, Investments, and Financial Agreements',
  },
];

export const AILessonModal: React.FC<AILessonModalProps> = ({
  isOpen,
  isOnline,
  nextLectureNumber,
  defaultLevel,
  languageMode,
  onClose,
  onLectureGenerated,
}) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<CEFRLevel>(defaultLevel);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestClose = () => {
    if (!isGenerating) onClose();
  };
  useModalBehavior(isOpen, requestClose);

  if (!isOpen) return null;

  const isFullNepali = languageMode === 'full-nepali';

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError('Please enter or select a topic for your custom lecture.');
      return;
    }
    if (!isOnline) {
      setError('You are currently offline. Connect to the internet to generate a new AI lecture.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/lessons/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          level,
          lectureNumber: nextLectureNumber,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.lecture) {
        throw new Error(data.error || 'Failed to generate AI lecture. Please try again.');
      }

      onLectureGenerated(data.lecture as LectureUnit);
      setTopic('');
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong while generating.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={backdropDismiss(requestClose)}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center ${MODAL_BACKDROP_CLASS} p-0 sm:p-4 animate-fade-up`}
    >
      <div className="pp-sheet max-w-xl">
        <span className="pp-grab" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
          <div>
            <div className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] mb-0.5">
              Dynamic Curriculum Builder
            </div>
            <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Generate Custom 4-Step Lecture
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
              Choose any topic or career scenario—AI will build a 4-module lecture and save it for offline study.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            aria-label="Close modal"
            className="min-h-[40px] min-w-[40px] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] flex items-center justify-center text-[#57534E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5 mt-5">
          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
              Quick Topic Ideas:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TOPIC_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTopic(preset.topic)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    topic === preset.topic
                      ? 'border-[#9E2A2B] bg-[#9E2A2B]/8 dark:bg-[#9E2A2B]/20'
                      : 'border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#141210] hover:border-[#9E2A2B]/50'
                  }`}
                >
                  <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    {preset.label}
                  </div>
                  {isFullNepali && (
                    <div className="font-nepali text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                      {preset.nepali}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div>
            <label
              htmlFor="custom-topic-input"
              className="block text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-1.5"
            >
              Or Describe Any Custom Topic or Scenario:
            </label>
            <input
              id="custom-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Aviation & Airport Travel, Legal Contracts, Customer Support..."
              className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#9E2A2B]"
            />
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
              Difficulty Level:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'B1', title: 'B1 Lower-Int', sub: 'Foundation' },
                  { id: 'B2', title: 'B2 Upper-Int', sub: 'Workplace' },
                  { id: 'C1', title: 'C1 Advanced', sub: 'Professional' },
                ] as { id: CEFRLevel; title: string; sub: string }[]
              ).map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setLevel(lvl.id)}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-center transition-all ${
                    level === lvl.id
                      ? 'bg-[#1C1917] text-white dark:bg-[#F5F2EB] dark:text-[#1C1917] border-transparent'
                      : 'bg-white dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                  }`}
                >
                  <div className="text-xs font-semibold">{lvl.title}</div>
                  <div className="text-[10px] opacity-80">{lvl.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924]">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold text-[#57534E] dark:text-[#A8A29E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !isOnline}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] disabled:opacity-50 inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Building 4-Module Lecture (~10s)...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate & Save Offline</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
