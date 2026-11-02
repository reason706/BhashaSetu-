import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Volume2,
  Turtle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  X,
  Flame,
  Clock,
  Award,
  RotateCcw,
} from 'lucide-react';
import {
  LectureUnit,
  LanguageMode,
  SRSRecord,
  MistakeItem,
  VocabularyItem,
} from '../types/curriculum';
import { speechService } from '../services/speech';

interface DailyChallengeModalProps {
  isOpen: boolean;
  lectures: LectureUnit[];
  completedUnitIds: string[];
  completedStepsByLecture: Record<string, number[]>;
  savedWordIds: string[];
  wordSRS: Record<string, SRSRecord>;
  dailyChallengeStreak: number;
  lastDailyChallengeAt?: string | null;
  preferredSpeechRate: number;
  languageMode: LanguageMode;
  onClose: () => void;
  onCompleteChallenge: (correctCount: number) => void;
  onUpdateWordSRS: (wordId: string, wasCorrect: boolean) => void;
  onRecordMistake: (mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>) => void;
}

interface EnrichedPoolWord extends VocabularyItem {
  lectureId: string;
  lectureNumber: number;
}

interface ChallengeQuestion {
  id: string;
  stepNumber: 1 | 2 | 3;
  type: 'audio-spelling' | 'context-meaning' | 'silent-phonics';
  badge: string;
  targetWord: EnrichedPoolWord;
  prompt: string;
  subPrompt: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

function buildSpellingDistractors(word: string): string[] {
  const lower = word.toLowerCase();
  const candidates = new Set<string>();

  // Common silent-letter omission or swap traps
  if (lower.startsWith('kn')) candidates.add(word.slice(1));
  if (lower.startsWith('wr')) candidates.add(word.slice(1));
  if (lower.startsWith('ps')) candidates.add(word.slice(1));
  if (lower.includes('bt')) candidates.add(word.replace(/bt/i, 't'));
  if (lower.includes('mb')) candidates.add(word.replace(/mb/i, 'm'));
  if (lower.includes('stle')) candidates.add(word.replace(/stle/i, 'sle'));
  if (lower.includes('sten')) candidates.add(word.replace(/sten/i, 'sen'));
  if (lower.includes('gh')) candidates.add(word.replace(/gh/i, 'g'));
  if (lower.includes('ei')) candidates.add(word.replace(/ei/i, 'ie'));
  if (lower.includes('ie')) candidates.add(word.replace(/ie/i, 'ei'));
  if (lower.includes('sc')) candidates.add(word.replace(/sc/i, 's'));
  if (lower.includes('mn')) candidates.add(word.replace(/mn/i, 'm'));
  if (lower.includes('gn')) candidates.add(word.replace(/gn/i, 'n'));
  if (lower.includes('pt')) candidates.add(word.replace(/pt/i, 't'));

  // Generic phonetic fallbacks so we always have 3 unique distractors
  candidates.add(`${word}e`);
  if (word.endsWith('e') && word.length > 4) {
    candidates.add(word.slice(0, -1));
  }
  if (word.length > 3) {
    const mid = Math.floor(word.length / 2);
    candidates.add(word.slice(0, mid) + word[mid] + word.slice(mid));
    candidates.add(word.slice(0, mid) + word.slice(mid + 1));
  }

  candidates.delete(word);
  return Array.from(candidates).slice(0, 3);
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  isOpen,
  lectures,
  completedUnitIds,
  completedStepsByLecture,
  savedWordIds,
  wordSRS,
  dailyChallengeStreak,
  lastDailyChallengeAt,
  preferredSpeechRate,
  languageMode,
  onClose,
  onCompleteChallenge,
  onUpdateWordSRS,
  onRecordMistake,
}) => {
  const [seedOffset, setSeedOffset] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedSpelling, setTypedSpelling] = useState('');
  const [useTypingMode, setUseTypingMode] = useState(false);
  const [answersRecord, setAnswersRecord] = useState<
    { question: ChallengeQuestion; userAnswer: string; isCorrect: boolean }[]
  >([]);
  const [isCompletedView, setIsCompletedView] = useState(false);

  const isFullNepali = languageMode === 'full-nepali';

  // Gather all words from learned lectures, saved words, and SRS words (with fallback to Lecture 01-03)
  const learnedWordPool = useMemo(() => {
    const pool: EnrichedPoolWord[] = [];
    const seen = new Set<string>();

    const addFromLecture = (lec: LectureUnit, filterFn?: (w: VocabularyItem) => boolean) => {
      for (const item of lec.moduleA_vocabulary) {
        if (filterFn && !filterFn(item)) continue;
        if (!seen.has(item.id)) {
          seen.add(item.id);
          pool.push({
            ...item,
            lectureId: lec.id,
            lectureNumber: lec.lectureNumber,
          });
        }
      }
    };

    // 1. Words from completed lectures or lectures with completed steps
    for (const lec of lectures) {
      const hasCompletedSteps = (completedStepsByLecture[lec.id]?.length || 0) > 0;
      if (completedUnitIds.includes(lec.id) || hasCompletedSteps) {
        addFromLecture(lec);
      }
    }

    // 2. Words in SRS or Saved Bookmarks
    for (const lec of lectures) {
      addFromLecture(
        lec,
        (w) => Boolean(wordSRS[w.id]) || savedWordIds.includes(w.id)
      );
    }

    // 3. Fallback to first 2 lectures if user has fewer than 6 learned words so far
    if (pool.length < 6) {
      for (const lec of lectures.slice(0, 2)) {
        addFromLecture(lec);
      }
    }

    return pool;
  }, [lectures, completedUnitIds, completedStepsByLecture, savedWordIds, wordSRS]);

  // Build 3 deterministic questions for today's challenge
  const questions: ChallengeQuestion[] = useMemo(() => {
    if (learnedWordPool.length === 0) return [];
    const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24)) + seedOffset * 7;

    const pickWord = (offset: number): EnrichedPoolWord => {
      return learnedWordPool[(daySeed + offset) % learnedWordPool.length];
    };

    const w1 = pickWord(0);
    let w2 = pickWord(3);
    if (w2.id === w1.id && learnedWordPool.length > 1) {
      w2 = learnedWordPool[(daySeed + 1) % learnedWordPool.length];
    }
    let w3 = pickWord(7);
    if ((w3.id === w1.id || w3.id === w2.id) && learnedWordPool.length > 2) {
      w3 = learnedWordPool[(daySeed + 2) % learnedWordPool.length];
    }

    // Q1: Audio Dictation & Orthography
    const q1Distractors = buildSpellingDistractors(w1.word);
    const q1RawOptions = [w1.word, ...q1Distractors];
    const q1Shift = daySeed % q1RawOptions.length;
    const q1Options = [...q1RawOptions.slice(q1Shift), ...q1RawOptions.slice(0, q1Shift)];

    // Q2: Contextual Meaning & Sentence Usage
    const meaningDistractors: string[] = [];
    for (let i = 1; i < learnedWordPool.length && meaningDistractors.length < 3; i++) {
      const candidate = learnedWordPool[(daySeed + i * 2) % learnedWordPool.length].nepaliMeaning;
      if (candidate !== w2.nepaliMeaning && !meaningDistractors.includes(candidate)) {
        meaningDistractors.push(candidate);
      }
    }
    const q2RawOptions = [w2.nepaliMeaning, ...meaningDistractors];
    const q2Shift = (daySeed + 1) % q2RawOptions.length;
    const q2Options = [...q2RawOptions.slice(q2Shift), ...q2RawOptions.slice(0, q2Shift)];

    // Q3: Silent-Letter & Phonics Rule Identification
    const silentRuleDistractors = [
      'Silent initial "k" before "n" (/n/)',
      'Silent "b" after "m" or before "t"',
      'Silent "t" in "-stle" / "-sten" cluster',
      'Silent "p" before "s" or "t"',
      'Silent "c" after "s" (/s/)',
      'Silent "g" before "n" (/n/)',
    ].filter((r) => r.toLowerCase() !== w3.silentLettersSummary.toLowerCase());

    const q3RawOptions = [w3.silentLettersSummary, ...silentRuleDistractors.slice(0, 3)];
    const q3Shift = (daySeed + 2) % q3RawOptions.length;
    const q3Options = [...q3RawOptions.slice(q3Shift), ...q3RawOptions.slice(0, q3Shift)];

    return [
      {
        id: `dc-q1-${w1.id}`,
        stepNumber: 1,
        type: 'audio-spelling',
        badge: 'Question 1 of 3 · Audio Dictation & Spelling',
        targetWord: w1,
        prompt: `Listen to the word meaning "${w1.nepaliMeaning}" (${w1.ipa}) and choose or type its exact English spelling:`,
        subPrompt: `Example: "${w1.englishExample.replace(new RegExp(w1.word, 'gi'), '_____')}"`,
        options: q1Options,
        correctAnswer: w1.word,
        explanation: `"${w1.word}" (${w1.ipa}) — ${w1.silentLettersSummary}.`,
      },
      {
        id: `dc-q2-${w2.id}`,
        stepNumber: 2,
        type: 'context-meaning',
        badge: 'Question 2 of 3 · Contextual Vocabulary Retention',
        targetWord: w2,
        prompt: `What is the accurate Nepali meaning of "${w2.word}" (${w2.ipa})?`,
        subPrompt: `Context: “${w2.englishExample}”`,
        options: q2Options,
        correctAnswer: w2.nepaliMeaning,
        explanation: `"${w2.word}" means "${w2.nepaliMeaning}". Phonics: ${w2.silentLettersSummary}.`,
      },
      {
        id: `dc-q3-${w3.id}`,
        stepNumber: 3,
        type: 'silent-phonics',
        badge: 'Question 3 of 3 · Silent-Letter Phonics Trap',
        targetWord: w3,
        prompt: `Which phonics or silent-letter rule applies to the word "${w3.word}" (${w3.ipa})?`,
        subPrompt: `Meaning: ${w3.nepaliMeaning} — “${w3.englishExample}”`,
        options: q3Options,
        correctAnswer: w3.silentLettersSummary,
        explanation: `In "${w3.word}" (${w3.ipa}), the rule is: ${w3.silentLettersSummary}.`,
      },
    ];
  }, [learnedWordPool, seedOffset]);

  const currentQuestion = questions[currentIdx] || null;

  // Auto-play audio on Q1 when modal opens
  useEffect(() => {
    if (isOpen && currentQuestion && currentIdx === 0 && !selectedOption && !isCompletedView) {
      const timer = window.setTimeout(() => {
        speechService.speak(currentQuestion.targetWord.word, { rate: preferredSpeechRate });
      }, 250);
      return () => window.clearTimeout(timer);
    }
  }, [isOpen, currentIdx, currentQuestion, preferredSpeechRate, selectedOption, isCompletedView]);

  if (!isOpen || !currentQuestion) return null;

  const handleSelectAnswer = (answer: string) => {
    if (selectedOption) return;
    const cleanUser = answer.trim();
    if (!cleanUser) return;

    setSelectedOption(cleanUser);
    const isCorrect =
      cleanUser.toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    onUpdateWordSRS(currentQuestion.targetWord.id, isCorrect);

    if (!isCorrect) {
      onRecordMistake({
        lectureId: currentQuestion.targetWord.lectureId,
        lectureNumber: currentQuestion.targetWord.lectureNumber,
        category: currentQuestion.type === 'audio-spelling' ? 'dictation' : 'vocabulary',
        sourceType: currentQuestion.type === 'audio-spelling' ? 'dictation' : 'vocab-quiz',
        prompt: currentQuestion.prompt,
        nepaliHint: currentQuestion.subPrompt,
        userWrongAnswer: cleanUser,
        correctAnswer: currentQuestion.correctAnswer,
        options: currentQuestion.options,
        explanation: currentQuestion.explanation,
      });
    }

    setAnswersRecord((prev) => [
      ...prev,
      { question: currentQuestion, userAnswer: cleanUser, isCorrect },
    ]);
  };

  const handleNextStep = () => {
    if (currentIdx + 1 < questions.length) {
      setSelectedOption(null);
      setTypedSpelling('');
      setCurrentIdx((prev) => prev + 1);
    } else {
      const totalRight = answersRecord.filter((a) => a.isCorrect).length;
      setIsCompletedView(true);
      onCompleteChallenge(totalRight);
    }
  };

  const handleStartFreshSet = () => {
    setSeedOffset((prev) => prev + 1);
    setCurrentIdx(0);
    setSelectedOption(null);
    setTypedSpelling('');
    setAnswersRecord([]);
    setIsCompletedView(false);
  };

  const correctCount = answersRecord.filter((a) => a.isCorrect).length;

  // Calculate hours since last challenge
  const hoursUntilNextAuto = lastDailyChallengeAt
    ? Math.max(
        0,
        Math.ceil(24 - (Date.now() - Date.parse(lastDailyChallengeAt)) / (1000 * 60 * 60))
      )
    : 24;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-challenge-title"
    >
      <div className="bg-[#FAF7F2] dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl space-y-5 my-auto">
        {/* Top Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
              <Sparkles className="w-4 h-4" />
              <span>24-Hour Spaced-Retention Pop-Up Quiz</span>
              <span>·</span>
              <span className="inline-flex items-center gap-1 text-[#D97706]">
                <Flame className="w-3.5 h-3.5" />
                {dailyChallengeStreak} Challenge Streak
              </span>
            </div>
            <h2
              id="daily-challenge-title"
              className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5"
            >
              Daily 3-Question Vocabulary Challenge
            </h2>
            {isFullNepali && (
              <p className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                दीर्घकालीन स्मरणका लागि तपाईंले सिक्नुभएका शब्दहरूबाट ३-प्रश्नको दैनिक अभ्यास
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Daily Challenge"
            className="p-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isCompletedView ? (
          <>
            {/* 3-Step Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
                  {currentQuestion.badge}
                </span>
                <span className="font-ipa text-[#57534E] dark:text-[#A8A29E]">
                  From Lecture {String(currentQuestion.targetWord.lectureNumber).padStart(2, '0')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((step) => {
                  const answered = answersRecord[step];
                  let barColor = 'bg-[#E7E0D6] dark:bg-[#2E2924]';
                  if (answered) {
                    barColor = answered.isCorrect ? 'bg-[#15803D]' : 'bg-[#B91C1C]';
                  } else if (step === currentIdx) {
                    barColor = 'bg-[#D97706]';
                  }
                  return <div key={step} className={`h-2 rounded-full ${barColor}`} />;
                })}
              </div>
            </div>

            {/* Question Card Body */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-4">
              {/* Audio Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      speechService.speak(currentQuestion.targetWord.word, {
                        rate: preferredSpeechRate,
                      })
                    }
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#991B1B]"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Hear Word (1.0x)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      speechService.speak(currentQuestion.targetWord.word, { rate: 0.6 })
                    }
                    className="min-h-[40px] px-3 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Slow (0.65x)</span>
                  </button>
                </div>

                {currentQuestion.type === 'audio-spelling' && !selectedOption && (
                  <button
                    type="button"
                    onClick={() => setUseTypingMode((prev) => !prev)}
                    className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] hover:underline"
                  >
                    {useTypingMode ? 'Switch to 4 Options' : 'Type Spelling Directly'}
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  {currentQuestion.prompt}
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] font-nepali">
                  {currentQuestion.subPrompt}
                </p>
              </div>

              {/* Answer Input Area */}
              {currentQuestion.type === 'audio-spelling' && useTypingMode && !selectedOption ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSelectAnswer(typedSpelling);
                  }}
                  className="flex flex-col sm:flex-row gap-2.5 pt-1"
                >
                  <input
                    type="text"
                    value={typedSpelling}
                    onChange={(e) => setTypedSpelling(e.target.value)}
                    placeholder="Type the exact English spelling..."
                    autoFocus
                    className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] font-ipa text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!typedSpelling.trim()}
                    className="min-h-[44px] px-5 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold disabled:opacity-40"
                  >
                    Check Spelling
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {currentQuestion.options.map((opt, idx) => {
                    const isSelected =
                      selectedOption?.toLowerCase() === opt.trim().toLowerCase();
                    const isRight =
                      opt.trim().toLowerCase() ===
                      currentQuestion.correctAnswer.trim().toLowerCase();

                    let btnClass =
                      'bg-[#FAF7F2] dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C]';
                    if (selectedOption) {
                      if (isRight) {
                        btnClass =
                          'bg-emerald-50 dark:bg-emerald-950/40 border-[#15803D] text-[#15803D] dark:text-emerald-300 font-semibold';
                      } else if (isSelected) {
                        btnClass =
                          'bg-red-50 dark:bg-red-950/40 border-[#B91C1C] text-[#B91C1C] dark:text-red-300 line-through';
                      }
                    }

                    return (
                      <button
                        key={`${opt}-${idx}`}
                        type="button"
                        disabled={Boolean(selectedOption)}
                        onClick={() => handleSelectAnswer(opt)}
                        className={`min-h-[46px] px-4 py-2.5 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${btnClass}`}
                      >
                        <span className="font-nepali">{opt}</span>
                        {selectedOption && isRight && (
                          <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                        )}
                        {selectedOption && isSelected && !isRight && (
                          <XCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Instant Explanation Banner */}
              {selectedOption && (
                <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                        {currentQuestion.targetWord.segments?.map((seg, i) =>
                          seg.silent ? (
                            <span
                              key={i}
                              className="text-[#B91C1C] dark:text-[#F87171] underline decoration-dotted"
                            >
                              {seg.text}
                            </span>
                          ) : (
                            <span key={i}>{seg.text}</span>
                          )
                        )}
                      </span>
                      <span className="font-ipa text-[#57534E] dark:text-[#A8A29E]">
                        {currentQuestion.targetWord.ipa}
                      </span>
                    </div>
                    <p className="text-[#57534E] dark:text-[#A8A29E]">
                      {currentQuestion.explanation}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="min-h-[42px] px-5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <span>
                      {currentIdx + 1 < questions.length ? 'Next Question' : 'Finish Challenge'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Challenge Completed Summary View */
          <div className="p-6 rounded-2xl bg-white dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-[#15803D]/12 text-[#15803D] flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="text-xs font-semibold text-[#15803D] dark:text-emerald-400">
                Daily Retention Check Complete!
              </div>
              <h3 className="text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                You Scored {correctCount} / {questions.length} Today
              </h3>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] max-w-md mx-auto">
                Your Spaced Repetition (SRS) boxes have been updated. Any missed words were automatically added to your Mistake Notebook.
              </p>
            </div>

            {/* 3 Reviewed Words Recap */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-left">
              {answersRecord.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                      {rec.question.targetWord.word}
                    </span>
                    {rec.isCorrect ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#B91C1C]" />
                    )}
                  </div>
                  <div className="font-ipa text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                    {rec.question.targetWord.ipa}
                  </div>
                  <div className="font-nepali text-xs text-[#15803D] dark:text-emerald-400">
                    {rec.question.targetWord.nepaliMeaning}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924]">
              <div className="inline-flex items-center gap-1.5 text-xs text-[#57534E] dark:text-[#A8A29E]">
                <Clock className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Next auto pop-up in ~{hoursUntilNextAuto} hours</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartFreshSet}
                  className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Bonus 3-Question Set</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="min-h-[42px] px-5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold"
                >
                  Continue to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
