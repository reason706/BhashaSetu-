import React, { useState, useMemo } from 'react';
import {
  Printer,
  FileDown,
  ArrowLeft,
  BookmarkCheck,
  AlertTriangle,
  Layers,
  CheckSquare,
  Eye,
  EyeOff,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { EnrichedLexiconItem } from '../data/massiveLexicon';
import { MistakeItem, SRSRecord } from '../types/curriculum';
import {
  exportSavedWordsToCSV,
  exportMistakeNotebookToCSV,
  exportCombinedStudySheetToCSV,
  getMasteryLabelForExport,
} from '../services/studySheetExport';

export type StudySheetFocusMode = 'saved' | 'mistakes' | 'combined';

interface PrintableStudySheetModalProps {
  initialFocusMode?: StudySheetFocusMode;
  allLexiconWords: EnrichedLexiconItem[];
  savedWordIds: string[];
  masteredWordIds?: string[];
  wordSRS?: Record<string, SRSRecord>;
  mistakeNotebook: MistakeItem[];
  onClose: () => void;
}

export const PrintableStudySheetModal: React.FC<PrintableStudySheetModalProps> = ({
  initialFocusMode = 'combined',
  allLexiconWords,
  savedWordIds,
  masteredWordIds = [],
  wordSRS = {},
  mistakeNotebook,
  onClose,
}) => {
  const [sheetFocus, setSheetFocus] = useState<StudySheetFocusMode>(initialFocusMode);
  const [selfTestBlankMode, setSelfTestBlankMode] = useState<boolean>(false);
  const [includeCoreFallbackIfEmpty, setIncludeCoreFallbackIfEmpty] = useState<boolean>(true);
  const [exportBanner, setExportBanner] = useState<string | null>(null);

  const savedWordsList = useMemo(() => {
    const matched = allLexiconWords.filter((w) => savedWordIds.includes(w.id));
    if (matched.length > 0) return matched;
    if (includeCoreFallbackIfEmpty) {
      return allLexiconWords.filter((w) => w.isCoreLessonWord).slice(0, 20);
    }
    return [];
  }, [allLexiconWords, savedWordIds, includeCoreFallbackIfEmpty]);

  const isUsingStarterFallback = savedWordIds.length === 0 && includeCoreFallbackIfEmpty;

  const handleCSVExport = (type: 'saved' | 'mistakes' | 'combined') => {
    if (type === 'saved') {
      exportSavedWordsToCSV(savedWordsList, masteredWordIds, wordSRS);
      setExportBanner(
        `Downloaded Saved Words CSV (${savedWordsList.length} words) with Nepali & IPA encoding.`
      );
    } else if (type === 'mistakes') {
      exportMistakeNotebookToCSV(mistakeNotebook);
      setExportBanner(
        `Downloaded Mistake Notebook CSV (${mistakeNotebook.length} items) for spreadsheet review.`
      );
    } else {
      exportCombinedStudySheetToCSV(savedWordsList, mistakeNotebook, masteredWordIds, wordSRS);
      setExportBanner(
        `Downloaded Combined Study Sheet CSV (${savedWordsList.length} words + ${mistakeNotebook.length} mistakes).`
      );
    }
  };

  const showSavedSection = sheetFocus === 'saved' || sheetFocus === 'combined';
  const showMistakesSection = sheetFocus === 'mistakes' || sheetFocus === 'combined';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-6">
      {/* Top Interactive Controls Toolbar (Hidden when printing to PDF/Paper) */}
      <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 space-y-4 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B] inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#9E2A2B]" />
            <span>Back to Workspace</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] inline-flex items-center gap-2 shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as Formatted PDF</span>
            </button>

            <button
              type="button"
              onClick={() => handleCSVExport('saved')}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Saved Words (.CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCSVExport('mistakes')}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Mistake Notebook (.CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => handleCSVExport('combined')}
              className="min-h-[42px] px-3.5 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B] inline-flex items-center gap-1.5 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-[#9E2A2B]" />
              <span>Combined (.CSV)</span>
            </button>
          </div>
        </div>

        {/* Sheet Focus & Worksheet Format Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Sheet Type Switcher */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#FAF7F2] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
            <button
              type="button"
              onClick={() => setSheetFocus('combined')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                sheetFocus === 'combined'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                Combined Review Sheet ({savedWordsList.length} Words + {mistakeNotebook.length} Mistakes)
              </span>
            </button>
            <button
              type="button"
              onClick={() => setSheetFocus('saved')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                sheetFocus === 'saved'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Saved Words Only ({savedWordsList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSheetFocus('mistakes')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                sheetFocus === 'mistakes'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Mistake Notebook Only ({mistakeNotebook.length})</span>
            </button>
          </div>

          {/* Self-Test Worksheet Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelfTestBlankMode((prev) => !prev)}
              className={`min-h-[36px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                selfTestBlankMode
                  ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-950 dark:text-amber-200'
                  : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              {selfTestBlankMode ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-[#D97706]" />
                  <span>Self-Test Worksheet Mode (Blank Recall Lines)</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-[#2D6A4F]" />
                  <span>Full Answer Reference Sheet</span>
                </>
              )}
            </button>

            {savedWordIds.length === 0 && (
              <button
                type="button"
                onClick={() => setIncludeCoreFallbackIfEmpty((prev) => !prev)}
                className="min-h-[36px] px-3 py-1.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>
                  {includeCoreFallbackIfEmpty
                    ? 'Showing 20 Core Silent-Letter Starter Words'
                    : 'Include 20 Starter Words'}
                </span>
              </button>
            )}
          </div>
        </div>

        {exportBanner && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-[#2D6A4F] dark:text-emerald-300 flex items-center justify-between">
            <span>✓ {exportBanner}</span>
            <button
              type="button"
              onClick={() => setExportBanner(null)}
              className="text-[11px] underline ml-3"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* PRINTABLE A4 / LETTER PHYSICAL STUDY SHEET SURFACE                  */}
      {/* =================================================================== */}
      <div className="bg-white text-[#1C1917] border-2 border-[#1C1917] rounded-2xl p-6 sm:p-10 space-y-8 print:border-0 print:p-0 print:rounded-none shadow-xs">
        {/* Sheet Header */}
        <div className="border-b-2 border-[#1C1917] pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-ipa text-xs uppercase tracking-widest text-[#9E2A2B] font-bold">
              BhashaSetu · Physical On-The-Go Study & Self-Test Worksheet
            </div>
            <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C1917] mt-1">
              {sheetFocus === 'saved'
                ? 'Saved Vocabulary & Silent-Letter Study Sheet'
                : sheetFocus === 'mistakes'
                ? 'Mistake Notebook & Error-Correction Study Sheet'
                : 'Personal Saved Words & Mistake Notebook Review Sheet'}
            </h1>
            <p className="text-xs text-[#57534E] mt-1">
              Red underlined letters indicate silent consonants/vowels. Check off each box as you review aloud on the go.
            </p>
          </div>

          <div className="text-xs font-ipa space-y-1 sm:text-right shrink-0 bg-[#FAF7F2] border border-[#E7E0D6] rounded-xl p-3">
            <div>
              <strong>Date:</strong> {new Date().toLocaleDateString()}
            </div>
            <div>
              <strong>Saved Words:</strong> {savedWordsList.length}{' '}
              {isUsingStarterFallback ? '(Core Starter Set)' : ''}
            </div>
            <div>
              <strong>Mistake Items:</strong> {mistakeNotebook.length}
            </div>
            <div className="text-[11px] text-[#57534E]">
              Mode: {selfTestBlankMode ? 'Self-Test Recall' : 'Complete Study Key'}
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* SECTION 1: SAVED WORDS & SILENT-LETTER PHONICS TABLE              */}
        {/* ================================================================= */}
        {showSavedSection && (
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#E7E0D6] pb-2">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-[#9E2A2B]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1C1917]">
                  Part I · Saved Vocabulary & Silent-Letter Phonics ({savedWordsList.length} Words)
                </h2>
              </div>
              <span className="font-ipa text-[11px] text-[#57534E]">
                3-Pass Check: [ ] Read Aloud · [ ] Spell Without Looking · [ ] Used in Sentence
              </span>
            </div>

            {savedWordsList.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#E7E0D6] text-center text-xs text-[#57534E]">
                No saved words selected. Bookmark words in the Dictionary or enable "Include 20 Starter Words" above.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#1C1917] bg-[#FAF7F2] text-[#1C1917]">
                      <th className="py-2.5 px-2 font-bold w-10">#</th>
                      <th className="py-2.5 px-2.5 font-bold">Word & Silent Letters</th>
                      <th className="py-2.5 px-2.5 font-bold">IPA & Level</th>
                      <th className="py-2.5 px-2.5 font-bold">Silent-Letter / Phonics Rule</th>
                      <th className="py-2.5 px-2.5 font-bold">
                        {selfTestBlankMode
                          ? 'Write Nepali Meaning (Self-Test)'
                          : 'Nepali Meaning (नेपाली अर्थ)'}
                      </th>
                      <th className="py-2.5 px-2.5 font-bold">Contextual Example Sentence</th>
                      <th className="py-2.5 px-2 font-bold text-center w-24">3-Pass Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E0D6]">
                    {savedWordsList.map((item, idx) => {
                      const status = getMasteryLabelForExport(
                        item.id,
                        masteredWordIds,
                        wordSRS
                      );
                      return (
                        <tr key={item.id} className=" break-inside-avoid">
                          <td className="py-2.5 px-2 font-ipa text-[#57534E] align-top">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-2.5 align-top">
                            <div className="font-bold text-sm text-[#1C1917]">
                              {item.segments && item.segments.length > 0
                                ? item.segments.map((seg, i) =>
                                    seg.silent ? (
                                      <span
                                        key={i}
                                        className="text-[#9E2A2B] underline decoration-2"
                                      >
                                        {seg.text}
                                      </span>
                                    ) : (
                                      <span key={i}>{seg.text}</span>
                                    )
                                  )
                                : item.word}
                            </div>
                            <div className="text-[10px] font-ipa text-[#57534E]">
                              {item.partOfSpeech} · {status}
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 font-ipa align-top">
                            <div className="font-semibold text-[#1C1917]">{item.ipa}</div>
                            <div className="text-[10px] text-[#57534E]">
                              L{String(item.lectureNumber).padStart(2, '0')} · {item.level}
                            </div>
                          </td>
                          <td className="py-2.5 px-2.5 text-[#57534E] align-top">
                            {item.silentLettersSummary || 'Standard phonetic articulation'}
                          </td>
                          <td className="py-2.5 px-2.5 align-top">
                            {selfTestBlankMode ? (
                              <div className="h-6 border-b border-dashed border-[#1C1917]/60 w-36" />
                            ) : (
                              <span className="font-nepali font-semibold text-[#2D6A4F] text-xs">
                                {item.nepaliMeaning}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2.5 text-[#1C1917] align-top">
                            <div>“{item.englishExample}”</div>
                            {!selfTestBlankMode && (item.nepaliExampleTranslation || item.nepaliExample) && (
                              <div className="font-nepali text-[11px] text-[#57534E] mt-0.5">
                                {item.nepaliExampleTranslation || item.nepaliExample}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-2 font-ipa text-[11px] text-center align-top whitespace-nowrap">
                            ☐ ☐ ☐
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ================================================================= */}
        {/* SECTION 2: MISTAKE NOTEBOOK ERROR-CORRECTION TABLE                */}
        {/* ================================================================= */}
        {showMistakesSection && (
          <section className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-b border-[#E7E0D6] pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#9E2A2B]" />
                <h2 className="text-base sm:text-lg font-bold text-[#1C1917]">
                  Part II · Mistake Notebook Error-Correction Log ({mistakeNotebook.length} Items)
                </h2>
              </div>
              <span className="font-ipa text-[11px] text-[#57534E]">
                Graduation Rule: Answer accurately 2 times in a row
              </span>
            </div>

            {mistakeNotebook.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-[#E7E0D6] text-center text-xs text-[#57534E]">
                Your Mistake Notebook is currently clear (0 pending errors). Any missed quiz, dictation, or grammar questions will automatically appear here for printing.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#1C1917] bg-[#FAF7F2] text-[#1C1917]">
                      <th className="py-2.5 px-2 font-bold w-10">#</th>
                      <th className="py-2.5 px-2.5 font-bold">Source & Unit</th>
                      <th className="py-2.5 px-2.5 font-bold">Question / Prompt</th>
                      <th className="py-2.5 px-2.5 font-bold">Previous Mistake</th>
                      <th className="py-2.5 px-2.5 font-bold">
                        {selfTestBlankMode
                          ? 'Write Correct Answer (Self-Test)'
                          : 'Correct Target Answer'}
                      </th>
                      <th className="py-2.5 px-2.5 font-bold">Rule Explanation & Personal Note</th>
                      <th className="py-2.5 px-2 font-bold text-center w-20">Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E0D6]">
                    {mistakeNotebook.map((m, idx) => (
                      <tr key={m.id} className="break-inside-avoid">
                        <td className="py-2.5 px-2 font-ipa text-[#57534E] align-top">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-2.5 font-ipa align-top">
                          <div className="font-bold uppercase text-[#9E2A2B]">
                            {m.sourceType}
                          </div>
                          <div className="text-[10px] text-[#57534E]">
                            Lecture {String(m.lectureNumber).padStart(2, '0')}
                          </div>
                        </td>
                        <td className="py-2.5 px-2.5 align-top font-medium text-[#1C1917]">
                          <div>{m.prompt}</div>
                          {m.nepaliHint && (
                            <div className="font-nepali text-[11px] text-[#57534E] mt-0.5">
                              “{m.nepaliHint}”
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 align-top font-ipa text-[#9E2A2B] line-through">
                          {m.userWrongAnswer}
                        </td>
                        <td className="py-2.5 px-2.5 align-top">
                          {selfTestBlankMode ? (
                            <div className="h-6 border-b border-dashed border-[#1C1917]/60 w-36" />
                          ) : (
                            <span className="font-ipa font-bold text-[#2D6A4F]">
                              {m.correctAnswer}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2.5 align-top text-[#57534E]">
                          <div>{m.explanation}</div>
                          {m.userNote && (
                            <div className="mt-1 font-nepali text-[#1C1917] italic">
                              Note: {m.userNote}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-ipa text-[11px] text-center align-top whitespace-nowrap">
                          ☐ ☐
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ================================================================= */}
        {/* SECTION 3: LINED HANDWRITING & SENTENCE PRACTICE GRID             */}
        {/* ================================================================= */}
        <section className="space-y-3 pt-4 border-t-2 border-[#1C1917] break-inside-avoid">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1C1917]">
              Part III · On-The-Go Handwriting, Dictation & SVO Sentence Practice Lines
            </h3>
            <span className="font-ipa text-[11px] text-[#57534E]">
              Write 4 original English SVO sentences using your target words above
            </span>
          </div>

          <div className="space-y-5 pt-2">
            {[1, 2, 3, 4].map((lineNum) => (
              <div
                key={lineNum}
                className="flex items-end gap-2 border-b border-dashed border-[#1C1917]/50 pb-1"
              >
                <span className="font-ipa text-xs font-bold text-[#57534E] w-5">
                  {lineNum}.
                </span>
                <div className="flex-1 h-5" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
