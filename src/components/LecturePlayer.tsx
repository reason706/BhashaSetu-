import React, { useState, useEffect, useMemo } from 'react';
import {
  Volume2,
  Turtle,
  Bookmark,
  BookmarkCheck,
  Mic,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Languages,
  Check,
  Award,
  Eye,
  EyeOff,
  Search,
  BookMarked,
  Printer,
  ChevronDown,
  MessageSquare,
  X,
  Play,
  Square,
  Puzzle,
  Headphones,
  AlertTriangle,
  Plus,
  Trash2,
  FileText,
  XCircle,
  MoreVertical,
  BookOpen,
  PenLine,
  Shuffle,
  ChevronRight,
} from 'lucide-react';
import {
  LectureUnit,
  VocabularyItem,
  PronunciationItem,
  GrammaticalRole,
  ModuleScoreRecord,
  LanguageMode,
  MistakeItem,
} from '../types/curriculum';
import { speechService, PronunciationResult } from '../services/speech';
import {
  ENGLISH_USAGE_TIPS,
  ENGLISH_PRONUNCIATION_RULES,
  ENGLISH_SPELLING_EXPLANATIONS,
  ENGLISH_QUIZ_EXPLANATIONS,
  ENGLISH_GRAMMAR_CONTENT,
} from '../utils/englishExplanations';
import { getMassiveLexicon } from '../data/massiveLexicon';
import { CORE_SYLLABUS } from '../data/syllabus';
import { WordPhoneticsPopover } from './ui/ResponsivePrimitives';
import { toast } from 'sonner';
import {
  scrollBehavior,
  useModalBehavior,
  backdropDismiss,
  MODAL_BACKDROP_CLASS,
} from '../hooks/useModalBehavior';

interface LecturePlayerProps {
  lecture: LectureUnit;
  allLectures?: LectureUnit[];
  savedWordIds: string[];
  masteredWordIds?: string[];
  lectureNote?: string;
  completedUnitIds?: string[];
  completedSteps?: number[];
  mistakeNotebook?: MistakeItem[];
  preferredSpeechRate: number;
  languageMode: LanguageMode;
  isCompleted: boolean;
  initialStep?: ModuleStep;
  onToggleSaveWord: (wordId: string) => void;
  onToggleMasteredWord?: (wordId: string) => void;
  onUpdateLectureNote?: (lectureId: string, note: string) => void;
  onCompleteLecture: (scoreRecord: ModuleScoreRecord) => void;
  onCompleteStep?: (lectureId: string, stepIndex: number) => void;
  onSelectLecture?: (lectureId: string, step?: ModuleStep) => void;
  onRecordMistake?: (mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>) => void;
  onPracticeMistake?: (mistakeId: string, wasCorrect: boolean) => void;
  onRemoveMistake?: (mistakeId: string) => void;
  onUpdateMistakeNote?: (mistakeId: string, userNote: string) => void;
  onUpdateWordSRS?: (wordId: string, wasCorrect: boolean) => void;
  onBackToDashboard: () => void;
  onOpenSectionDictionary?: (lectureNumber: number) => void;
}

export type ModuleStep = 0 | 1 | 2 | 3 | 4;

const MODULE_TABS: {
  step: ModuleStep;
  number: string;
  label: string;
  shortLabel: string;
  description: string;
  Icon: React.ComponentType<{ className?: string }>;
}[] = [
  { step: 0, number: '01', label: 'Vocabulary & Phonics', shortLabel: 'Vocab', description: 'Words with silent-letter phonics', Icon: BookOpen },
  { step: 1, number: '02', label: 'Pronunciation Guide', shortLabel: 'Audio', description: 'Hear it, then say it with the mic', Icon: Mic },
  { step: 2, number: '03', label: 'Spelling & Dictation Bee', shortLabel: 'Spelling', description: 'Spelling rules, dictation & quiz', Icon: PenLine },
  { step: 3, number: '04', label: 'Grammar & Builder', shortLabel: 'Grammar', description: 'SOV → SVO sentence builder', Icon: Shuffle },
  { step: 4, number: '05', label: 'Real-Life Dialogue', shortLabel: 'Dialogue', description: 'Real-life dialogue & comprehension', Icon: MessageSquare },
];

const ROLE_STYLES: Record<
  GrammaticalRole,
  { border: string; bg: string; activeBg: string; text: string; label: string; labelNepali: string }
> = {
  Subject: {
    border: 'border-sky-300 dark:border-sky-700',
    bg: 'bg-sky-50/70 dark:bg-sky-950/40',
    activeBg: 'bg-sky-100 dark:bg-sky-900/70 ring-2 ring-sky-500',
    text: 'text-sky-900 dark:text-sky-200',
    label: 'Subject',
    labelNepali: 'Subject · कर्ता',
  },
  Verb: {
    border: 'border-[#9E2A2B]/35 dark:border-[#F87171]/40',
    bg: 'bg-[#9E2A2B]/5 dark:bg-[#9E2A2B]/15',
    activeBg: 'bg-[#9E2A2B]/15 dark:bg-[#9E2A2B]/30 ring-2 ring-[#9E2A2B]',
    text: 'text-[#872223] dark:text-[#FCA5A5]',
    label: 'Verb',
    labelNepali: 'Verb · क्रिया',
  },
  Object: {
    border: 'border-emerald-300 dark:border-emerald-700',
    bg: 'bg-emerald-50/70 dark:bg-emerald-950/40',
    activeBg: 'bg-emerald-100 dark:bg-emerald-900/70 ring-2 ring-emerald-600',
    text: 'text-emerald-900 dark:text-emerald-200',
    label: 'Object',
    labelNepali: 'Object · कर्म',
  },
  Modifier: {
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50/70 dark:bg-amber-950/40',
    activeBg: 'bg-amber-100 dark:bg-amber-900/70 ring-2 ring-amber-500',
    text: 'text-amber-900 dark:text-amber-200',
    label: 'Modifier',
    labelNepali: 'Modifier · विशेषण/समय',
  },
  Connector: {
    border: 'border-purple-300 dark:border-purple-700',
    bg: 'bg-purple-50/70 dark:bg-purple-950/40',
    activeBg: 'bg-purple-100 dark:bg-purple-900/70 ring-2 ring-purple-500',
    text: 'text-purple-900 dark:text-purple-200',
    label: 'Connector',
    labelNepali: 'Connector · संयोजक',
  },
};

export const LecturePlayer: React.FC<LecturePlayerProps> = ({
  lecture,
  allLectures = CORE_SYLLABUS,
  savedWordIds,
  masteredWordIds = [],
  lectureNote = '',
  completedUnitIds = [],
  completedSteps = [],
  mistakeNotebook = [],
  preferredSpeechRate,
  languageMode,
  isCompleted,
  initialStep = 0,
  onToggleSaveWord,
  onToggleMasteredWord,
  onUpdateLectureNote,
  onCompleteLecture,
  onCompleteStep,
  onSelectLecture,
  onRecordMistake,
  onPracticeMistake,
  onRemoveMistake,
  onUpdateMistakeNote,
  onUpdateWordSRS,
  onBackToDashboard,
  onOpenSectionDictionary,
}) => {
  const [activeModule, setActiveModule] = useState<ModuleStep>(initialStep);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [revealedNepaliWordIds, setRevealedNepaliWordIds] = useState<Record<string, boolean>>({});
  const [showSyntaxNepali, setShowSyntaxNepali] = useState<boolean>(languageMode !== 'english-only');
  const [showExtendedBank, setShowExtendedBank] = useState(false);
  const [bankQuery, setBankQuery] = useState('');
  const [bankCategoryFilter, setBankCategoryFilter] = useState<'all' | 'silent' | 'saved'>('all');
  const [bankPage, setBankPage] = useState(1);

  // Step 01: 10-word batching & Self-Test Word Mask state
  const [visibleVocabCount, setVisibleVocabCount] = useState(10);
  const [selfTestMaskWords, setSelfTestMaskWords] = useState(false);
  const [unmaskedWordIds, setUnmaskedWordIds] = useState<Record<string, boolean>>({});

  // Responsive Top Bar 3-Dot Menu, Personal Scratchpad Drawer, Mistake Notes Drawer & Printable Cheat Sheet state
  const [showMobileOverflowMenu, setShowMobileOverflowMenu] = useState(false);
  // Phone lecture menu is a bottom sheet in the shared modal stack (artifact pattern)
  useModalBehavior(showMobileOverflowMenu, () => setShowMobileOverflowMenu(false));
  const [showScratchpadDrawer, setShowScratchpadDrawer] = useState(false);
  const [scratchpadDraft, setScratchpadDraft] = useState(lectureNote);
  const [scratchpadSavedAt, setScratchpadSavedAt] = useState<string | null>(null);
  const [showMistakeNotesDrawer, setShowMistakeNotesDrawer] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  // Module B: Live mic pronunciation state
  const [listeningWordId, setListeningWordId] = useState<string | null>(null);
  const [micResults, setMicResults] = useState<Record<string, PronunciationResult>>({});
  const [micError, setMicError] = useState<string | null>(null);

  // Module C: Audio Dictation & Spelling Bee state
  const [dictationWordIdx, setDictationWordIdx] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationChecked, setDictationChecked] = useState(false);
  const [dictationShowHint, setDictationShowHint] = useState(false);
  const [dictationResultsByWordId, setDictationResultsByWordId] = useState<
    Record<string, 'correct' | 'wrong'>
  >({});
  const [dictationStreak, setDictationStreak] = useState(0);
  const [dictationNoteDraft, setDictationNoteDraft] = useState('');
  const [dictationNoteSaved, setDictationNoteSaved] = useState(false);

  // Module C: Multiple-choice Spelling quiz state
  const [spellingAnswers, setSpellingAnswers] = useState<Record<string, string>>({});

  // Mistake Notes Interactive State (Custom Note creation + Per-Mistake Note editing + Re-drill)
  const [mistakeScopeFilter, setMistakeScopeFilter] = useState<'lecture' | 'all'>('lecture');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [savedNoteIds, setSavedNoteIds] = useState<Record<string, boolean>>({});
  const [mistakeDrillInputs, setMistakeDrillInputs] = useState<Record<string, string>>({});
  const [showAddCustomNoteForm, setShowAddCustomNoteForm] = useState(false);
  const [customNoteWord, setCustomNoteWord] = useState('');
  const [customNoteWrong, setCustomNoteWrong] = useState('');
  const [customNoteText, setCustomNoteText] = useState('');

  // Module D: Syntax mapper, Interactive Sentence Builder & Capstone quiz state
  const [highlightedRole, setHighlightedRole] = useState<GrammaticalRole | null>('Verb');
  const [grammarAnswers, setGrammarAnswers] = useState<Record<string, string>>({});
  const [builderPlacedIndices, setBuilderPlacedIndices] = useState<Record<string, number[]>>({});
  const [builderChecked, setBuilderChecked] = useState<Record<string, boolean>>({});

  // Module E: Real-life dialogue, two-speaker audio & role-play state
  const [isPlayingFullDialogue, setIsPlayingFullDialogue] = useState(false);
  const [dialoguePlaybackRate, setDialoguePlaybackRate] = useState<number>(
    () => speechService.getDialogueCalibration().dialogueRate
  );
  const [activeDialogueLineIdx, setActiveDialogueLineIdx] = useState<number | null>(null);
  const [rolePlaySpeaker, setRolePlaySpeaker] = useState<'off' | 'A' | 'B'>('off');
  const [showDialogueNepali, setShowDialogueNepali] = useState<boolean>(
    languageMode !== 'english-only'
  );
  const [dialogueAnswers, setDialogueAnswers] = useState<Record<string, string>>({});
  const [listeningDialogueLineIdx, setListeningDialogueLineIdx] = useState<number | null>(null);
  const [dialogueMicResults, setDialogueMicResults] = useState<Record<number, PronunciationResult>>(
    {}
  );

  const [showCompletionSummary, setShowCompletionSummary] = useState(false);

  useEffect(() => {
    setActiveModule(initialStep);
    setShowCompletionSummary(false);
    setIsPlayingFullDialogue(false);
    setActiveDialogueLineIdx(null);
    setRolePlaySpeaker('off');
    setDialogueAnswers({});
    setListeningDialogueLineIdx(null);
    setDialogueMicResults({});
    setDictationWordIdx(0);
    setDictationInput('');
    setDictationChecked(false);
    setDictationShowHint(false);
    setDictationNoteDraft('');
    setDictationNoteSaved(false);
    setVisibleVocabCount(10);
    setSelfTestMaskWords(false);
    setUnmaskedWordIds({});
    setShowMobileOverflowMenu(false);
    setScratchpadDraft(lectureNote || '');
  }, [lecture.id, initialStep, lectureNote]);

  const lectureMistakes = useMemo(
    () => mistakeNotebook.filter((m) => m.lectureId === lecture.id),
    [mistakeNotebook, lecture.id]
  );

  const displayedMistakes = useMemo(
    () => (mistakeScopeFilter === 'lecture' ? lectureMistakes : mistakeNotebook),
    [mistakeScopeFilter, lectureMistakes, mistakeNotebook]
  );

  const sectionBankWords = useMemo(() => {
    const all = getMassiveLexicon(CORE_SYLLABUS);
    return all.filter((w) => w.lectureNumber === lecture.lectureNumber && !w.isCoreLessonWord);
  }, [lecture.lectureNumber]);

  const allStepOneWords: VocabularyItem[] = useMemo(() => {
    return [...lecture.moduleA_vocabulary, ...sectionBankWords];
  }, [lecture.moduleA_vocabulary, sectionBankWords]);

  const visibleStepOneWords = useMemo(() => {
    return allStepOneWords.slice(0, visibleVocabCount);
  }, [allStepOneWords, visibleVocabCount]);

  const filteredBankWords = useMemo(() => {
    const q = bankQuery.toLowerCase().trim();
    return sectionBankWords.filter((w) => {
      if (bankCategoryFilter === 'saved' && !savedWordIds.includes(w.id)) return false;
      if (
        bankCategoryFilter === 'silent' &&
        !w.segments?.some((s) => s.silent) &&
        !w.silentLettersSummary.toLowerCase().includes('silent')
      ) {
        return false;
      }
      if (!q) return true;
      return (
        w.word.toLowerCase().includes(q) ||
        w.nepaliMeaning.toLowerCase().includes(q) ||
        w.ipa.toLowerCase().includes(q)
      );
    });
  }, [sectionBankWords, bankQuery, bankCategoryFilter, savedWordIds]);

  const bankPageSize = 12;
  const bankTotalPages = Math.max(1, Math.ceil(filteredBankWords.length / bankPageSize));
  const currentBankSlice = filteredBankWords.slice(
    (bankPage - 1) * bankPageSize,
    bankPage * bankPageSize
  );

  // Deterministic scramble of Sentence Builder tiles per exercise
  const scrambledBuilders = useMemo(() => {
    const builders = lecture.moduleD_grammar.sentenceBuilders || [];
    return builders.map((b) => {
      const indexed = b.correctTokens.map((tile, idx) => ({
        ...tile,
        originalIndex: idx,
      }));
      const scrambled = [...indexed].sort((a, bItem) => {
        const hashA = (a.text.charCodeAt(0) * 17 + a.originalIndex * 31) % 97;
        const hashB = (bItem.text.charCodeAt(0) * 17 + bItem.originalIndex * 31) % 97;
        return hashA - hashB;
      });
      if (
        scrambled.length > 1 &&
        scrambled.every((item, i) => item.originalIndex === i)
      ) {
        const tmp = scrambled[0];
        scrambled[0] = scrambled[1];
        scrambled[1] = tmp;
      }
      return {
        exercise: b,
        scrambledTiles: scrambled,
        targetSentence: b.correctTokens.map((t) => t.text).join(' '),
      };
    });
  }, [lecture.moduleD_grammar.sentenceBuilders]);

  const isFullNepali = languageMode === 'full-nepali';
  const showWordMeaningsByDefault = languageMode !== 'english-only';

  const currentDictationWord: VocabularyItem | undefined =
    lecture.moduleA_vocabulary[dictationWordIdx] || lecture.moduleA_vocabulary[0];

  const dictationCorrectCount = Object.values(dictationResultsByWordId).filter(
    (v) => v === 'correct'
  ).length;

  const handleSpeak = (
    text: string,
    id: string,
    rate = preferredSpeechRate,
    speakerIndex?: 0 | 1
  ) => {
    setIsPlayingFullDialogue(false);
    setActiveDialogueLineIdx(null);
    setSpeakingId(id);
    speechService.speak(text, {
      rate,
      speakerIndex,
      onEnd: () => setSpeakingId((prev) => (prev === id ? null : prev)),
    });
  };

  const handleSelectDictationWord = (idx: number, autoSpeak = true) => {
    const target = lecture.moduleA_vocabulary[idx];
    setDictationWordIdx(idx);
    setDictationInput('');
    setDictationChecked(false);
    setDictationShowHint(false);
    setDictationNoteDraft('');
    setDictationNoteSaved(false);
    if (autoSpeak && target) {
      handleSpeak(target.word, `dictation-${target.id}`, preferredSpeechRate);
    }
  };

  const handleCheckDictationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDictationWord || dictationChecked || !dictationInput.trim()) return;

    const cleanTyped = dictationInput.trim().toLowerCase();
    const cleanTarget = currentDictationWord.word.trim().toLowerCase();
    const isExact = cleanTyped === cleanTarget;

    if (isExact) {
      speechService.playCorrectTone();
    } else {
      speechService.playWrongTone();
    }

    setDictationChecked(true);
    setDictationResultsByWordId((prev) => ({
      ...prev,
      [currentDictationWord.id]: isExact ? 'correct' : 'wrong',
    }));
    setDictationStreak((prev) => (isExact ? prev + 1 : 0));

    if (onUpdateWordSRS) {
      onUpdateWordSRS(currentDictationWord.id, isExact);
    }

    if (!isExact && onRecordMistake) {
      const englishTip = ENGLISH_USAGE_TIPS[currentDictationWord.id];
      onRecordMistake({
        lectureId: lecture.id,
        lectureNumber: lecture.lectureNumber,
        category: 'dictation',
        sourceType: 'dictation',
        prompt: `Audio Dictation: Spell "${currentDictationWord.nepaliMeaning}" (${currentDictationWord.ipa})`,
        nepaliHint: currentDictationWord.englishExample,
        userWrongAnswer: dictationInput.trim(),
        correctAnswer: currentDictationWord.word,
        explanation:
          englishTip ||
          `${currentDictationWord.silentLettersSummary}. ${currentDictationWord.usageTipNepali}`,
      });
    }
  };

  const handleSaveDictationMistakeNote = () => {
    if (!currentDictationWord || !dictationNoteDraft.trim() || !onRecordMistake) return;
    const englishTip = ENGLISH_USAGE_TIPS[currentDictationWord.id];
    onRecordMistake({
      lectureId: lecture.id,
      lectureNumber: lecture.lectureNumber,
      category: 'dictation',
      sourceType: 'dictation',
      prompt: `Audio Dictation: Spell "${currentDictationWord.nepaliMeaning}" (${currentDictationWord.ipa})`,
      nepaliHint: currentDictationWord.englishExample,
      userWrongAnswer: dictationInput.trim() || 'Missed silent letter',
      correctAnswer: currentDictationWord.word,
      explanation:
        englishTip ||
        `${currentDictationWord.silentLettersSummary}. ${currentDictationWord.usageTipNepali}`,
      userNote: dictationNoteDraft.trim(),
    });
    setDictationNoteSaved(true);
  };

  const handleCreateCustomMistakeNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNoteWord.trim() || !customNoteText.trim() || !onRecordMistake) return;
    onRecordMistake({
      lectureId: lecture.id,
      lectureNumber: lecture.lectureNumber,
      category: 'spelling',
      sourceType: 'custom-note',
      prompt: `Study Note: ${customNoteWord.trim()}`,
      userWrongAnswer: customNoteWrong.trim() || 'Watch out for tricky spelling/pronunciation',
      correctAnswer: customNoteWord.trim(),
      explanation: customNoteText.trim(),
      userNote: customNoteText.trim(),
    });
    setCustomNoteWord('');
    setCustomNoteWrong('');
    setCustomNoteText('');
    setShowAddCustomNoteForm(false);
  };

  const handlePlayFullDialogue = (
    speedRate: number = speechService.getDialogueCalibration().dialogueRate
  ) => {
    const lines = lecture.moduleE_dialogue?.lines || [];
    if (lines.length === 0) return;

    if (isPlayingFullDialogue && dialoguePlaybackRate === speedRate) {
      speechService.stop();
      setIsPlayingFullDialogue(false);
      setActiveDialogueLineIdx(null);
      return;
    }

    speechService.stop();
    const calibration = speechService.setDialogueCalibration({ dialogueRate: speedRate });
    setDialoguePlaybackRate(speedRate);
    setIsPlayingFullDialogue(true);
    let idx = 0;

    const playNext = () => {
      if (idx >= lines.length) {
        setIsPlayingFullDialogue(false);
        setActiveDialogueLineIdx(null);
        return;
      }
      const line = lines[idx];
      const speakerIdx = (idx % 2) as 0 | 1;
      setActiveDialogueLineIdx(idx);

      // In Role-Play Shadowing mode (Listen -> Record -> Compare), automatically trigger microphone recording on the learner's own character turn!
      const isUserRoleTurn =
        (rolePlaySpeaker === 'A' && speakerIdx === 0) ||
        (rolePlaySpeaker === 'B' && speakerIdx === 1);

      if (isUserRoleTurn) {
        if (speechService.isRecognitionSupported()) {
          const lineIndexForTurn = idx;
          speechService
            .evaluatePronunciation(line.english, (listening) => {
              setListeningDialogueLineIdx(listening ? lineIndexForTurn : null);
            })
            .then((result) => {
              setDialogueMicResults((prev) => ({ ...prev, [lineIndexForTurn]: result }));
            })
            .catch(() => {
              setListeningDialogueLineIdx(null);
            })
            .finally(() => {
              window.setTimeout(() => {
                idx += 1;
                playNext();
              }, 600);
            });
        } else {
          window.setTimeout(() => {
            idx += 1;
            playNext();
          }, 2800);
        }
        return;
      }

      speechService.speak(line.english, {
        rate: speedRate,
        pitch: speakerIdx === 0 ? calibration.speakerAPitch : calibration.speakerBPitch,
        speakerIndex: speakerIdx,
        onEnd: () => {
          window.setTimeout(() => {
            idx += 1;
            playNext();
          }, calibration.turnPauseMs);
        },
      });
    };

    playNext();
  };

  const handleDialogueLineMicPractice = async (lineIdx: number, englishSentence: string) => {
    setMicError(null);
    if (!speechService.isRecognitionSupported()) {
      setMicError(
        'Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari with microphone permissions.'
      );
      return;
    }

    try {
      const result = await speechService.evaluatePronunciation(englishSentence, (listening) => {
        setListeningDialogueLineIdx(listening ? lineIdx : null);
      });
      if (result.passed) {
        speechService.playCorrectTone();
      } else {
        speechService.playWrongTone();
      }
      setDialogueMicResults((prev) => ({ ...prev, [lineIdx]: result }));
    } catch (err: unknown) {
      setListeningDialogueLineIdx(null);
      setMicError(err instanceof Error ? err.message : 'Could not access microphone.');
    }
  };

  const handleMicPractice = async (item: PronunciationItem) => {
    setMicError(null);
    if (!speechService.isRecognitionSupported()) {
      setMicError(
        'Voice recognition is not supported in this browser. Please use Chrome, Edge, or Safari with microphone permissions.'
      );
      return;
    }

    try {
      const result = await speechService.evaluatePronunciation(item.word, (listening) => {
        setListeningWordId(listening ? item.id : null);
      });
      if (result.passed) {
        speechService.playCorrectTone();
      } else {
        speechService.playWrongTone();
      }
      setMicResults((prev) => ({ ...prev, [item.id]: result }));
      if (onUpdateWordSRS) {
        onUpdateWordSRS(item.id, result.passed);
      }
    } catch (err: unknown) {
      setListeningWordId(null);
      setMicError(err instanceof Error ? err.message : 'Could not access microphone.');
    }
  };

  const spellingQuizzes = lecture.moduleC_spelling.quizzes;
  const spellingCorrectCount = spellingQuizzes.filter(
    (q) => spellingAnswers[q.id] === q.correctAnswer
  ).length;

  const grammarExercises = lecture.moduleD_grammar.capstoneExercises;
  const grammarCorrectCount = grammarExercises.filter(
    (ex) => grammarAnswers[ex.id] === ex.correctAnswer
  ).length;

  const handleSelectSpellingAnswer = (
    quiz: (typeof spellingQuizzes)[number],
    selectedOption: string
  ) => {
    setSpellingAnswers((prev) => ({ ...prev, [quiz.id]: selectedOption }));
    const isCorrect = selectedOption === quiz.correctAnswer;
    if (isCorrect) {
      speechService.playCorrectTone();
    } else {
      speechService.playWrongTone();
    }
    if (!isCorrect && onRecordMistake) {
      const englishExpl = ENGLISH_QUIZ_EXPLANATIONS[quiz.id];
      onRecordMistake({
        lectureId: lecture.id,
        lectureNumber: lecture.lectureNumber,
        category: 'spelling',
        sourceType: 'spelling',
        prompt: quiz.promptEnglish || quiz.prompt || '',
        nepaliHint: quiz.promptNepaliHint || quiz.nepaliHint,
        userWrongAnswer: selectedOption,
        correctAnswer: quiz.correctAnswer,
        options: quiz.options,
        explanation: englishExpl || quiz.commonMistakeExplanationNepali || quiz.explanationNepali || '',
      });
    }
  };

  const handleSelectGrammarAnswer = (
    ex: (typeof grammarExercises)[number],
    selectedOption: string
  ) => {
    setGrammarAnswers((prev) => ({ ...prev, [ex.id]: selectedOption }));
    const isCorrect = selectedOption === ex.correctAnswer;
    if (isCorrect) {
      speechService.playCorrectTone();
    } else {
      speechService.playWrongTone();
    }
    if (!isCorrect && onRecordMistake) {
      const englishExpl = ENGLISH_GRAMMAR_CONTENT[lecture.id]?.exerciseExplanationsEnglish[ex.id];
      onRecordMistake({
        lectureId: lecture.id,
        lectureNumber: lecture.lectureNumber,
        category: 'grammar',
        sourceType: 'grammar',
        prompt: ex.questionPrompt,
        nepaliHint: ex.nepaliContext,
        userWrongAnswer: selectedOption,
        correctAnswer: ex.correctAnswer,
        options: ex.options,
        explanation: englishExpl || ex.explanationNepali,
      });
    }
  };

  const handleToggleBuilderTile = (exerciseId: string, scrambledIdx: number) => {
    setBuilderChecked((prev) => ({ ...prev, [exerciseId]: false }));
    setBuilderPlacedIndices((prev) => {
      const current = prev[exerciseId] || [];
      if (current.includes(scrambledIdx)) {
        return {
          ...prev,
          [exerciseId]: current.filter((i) => i !== scrambledIdx),
        };
      }
      return {
        ...prev,
        [exerciseId]: [...current, scrambledIdx],
      };
    });
  };

  const handleResetBuilder = (exerciseId: string) => {
    setBuilderChecked((prev) => ({ ...prev, [exerciseId]: false }));
    setBuilderPlacedIndices((prev) => ({ ...prev, [exerciseId]: [] }));
  };

  const dialogueQuestions = lecture.moduleE_dialogue?.comprehensionQuestions || [];
  const dialogueCorrectCount = dialogueQuestions.filter(
    (q) => dialogueAnswers[q.id] === q.correctAnswer
  ).length;

  const handleSelectDialogueAnswer = (
    q: (typeof dialogueQuestions)[number],
    selectedOption: string
  ) => {
    setDialogueAnswers((prev) => ({ ...prev, [q.id]: selectedOption }));
    const isCorrect = selectedOption === q.correctAnswer;
    if (isCorrect) {
      speechService.playCorrectTone();
    } else {
      speechService.playWrongTone();
    }
    if (!isCorrect && onRecordMistake) {
      onRecordMistake({
        lectureId: lecture.id,
        lectureNumber: lecture.lectureNumber,
        category: 'dialogue',
        sourceType: 'dialogue',
        prompt: q.question,
        nepaliHint: q.nepaliQuestion,
        userWrongAnswer: selectedOption,
        correctAnswer: q.correctAnswer,
        options: q.options,
        explanation: isFullNepali ? q.explanationNepali : q.explanationEnglish,
      });
    }
  };

  const handleFinishLecture = () => {
    if (onCompleteStep) {
      onCompleteStep(lecture.id, activeModule);
    }
    const scoreRecord: ModuleScoreRecord = {
      unitId: lecture.id,
      spellingScore: spellingCorrectCount + dictationCorrectCount,
      spellingTotal: spellingQuizzes.length + Object.keys(dictationResultsByWordId).length,
      grammarScore: grammarCorrectCount,
      grammarTotal: grammarExercises.length,
      dialogueScore: dialogueCorrectCount,
      dialogueTotal: dialogueQuestions.length,
      pronunciationPracticed:
        Object.keys(micResults).length + Object.keys(dialogueMicResults).length,
      completedAt: new Date().toISOString(),
    };
    onCompleteLecture(scoreRecord);
    setShowCompletionSummary(true);
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  const goToModule = (nextStep: ModuleStep, markCurrentComplete = false) => {
    if (markCurrentComplete && onCompleteStep) {
      onCompleteStep(lecture.id, activeModule);
    }
    speechService.stop();
    setIsPlayingFullDialogue(false);
    setActiveDialogueLineIdx(null);
    setActiveModule(nextStep);
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
  };

  const englishGrammar = ENGLISH_GRAMMAR_CONTENT[lecture.id];

  // Shared Renderer for the Interactive Mistake Notes Section
  const renderMistakeNotesSection = () => (
    <div className="card p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E0D6] dark:border-[#2E2924] pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
            <FileText className="w-4 h-4" />
            <span>Lecture Mistake Notes & Weak-Words Vault</span>
          </div>
          <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
            Mistake Notes ({lectureMistakes.length} in Lecture {String(lecture.lectureNumber).padStart(2, '0')} · {mistakeNotebook.length} Total)
          </h3>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
            Review words or questions you missed during Audio Dictation, Spelling, or Grammar, write your own personal mnemonic note, and re-drill them twice in a row (2/2) to master them.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-[#F2ECE1] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
            <button
              type="button"
              onClick={() => setMistakeScopeFilter('lecture')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mistakeScopeFilter === 'lecture'
                  ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                  : 'text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              This Lecture ({lectureMistakes.length})
            </button>
            <button
              type="button"
              onClick={() => setMistakeScopeFilter('all')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                mistakeScopeFilter === 'all'
                  ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                  : 'text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              All Lectures ({mistakeNotebook.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddCustomNoteForm((prev) => !prev)}
            className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Mistake Note</span>
          </button>
        </div>
      </div>

      {/* Custom Mistake Note Creation Form */}
      {showAddCustomNoteForm && (
        <form
          onSubmit={handleCreateCustomMistakeNote}
          className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Add a Personal Mistake Note for Lecture {String(lecture.lectureNumber).padStart(2, '0')}
            </span>
            <button
              type="button"
              onClick={() => setShowAddCustomNoteForm(false)}
              className="text-xs text-[#57534E] hover:text-[#1C1917]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={customNoteWord}
              onChange={(e) => setCustomNoteWord(e.target.value)}
              placeholder="Target Word or Rule (e.g., Knight / Pneumonia)"
              required
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm"
            />
            <input
              type="text"
              value={customNoteWrong}
              onChange={(e) => setCustomNoteWrong(e.target.value)}
              placeholder="Common Error to Avoid (e.g., Night / Numonia)"
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={customNoteText}
              onChange={(e) => setCustomNoteText(e.target.value)}
              placeholder="Your personal memory trick or note (e.g., Silent K before N + silent GH)..."
              required
              className="flex-1 min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm"
            />
            <button
              type="submit"
              className="min-h-[40px] px-5 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold shrink-0"
            >
              Save Mistake Note
            </button>
          </div>
        </form>
      )}

      {displayedMistakes.length === 0 ? (
        <div className="p-6 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-center space-y-1.5">
          <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
            No mistake notes recorded for this view yet
          </div>
          <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
            Any word you misspell in the Audio Dictation Bee or miss in the quizzes is automatically saved here with its rule explanation, or you can click “Add Mistake Note” above.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedMistakes.map((item) => {
            const currentDraft =
              noteDrafts[item.id] !== undefined ? noteDrafts[item.id] : item.userNote || '';
            const drillAttempt = mistakeDrillInputs[item.id] || '';
            const badgeLabel = item.sourceType || item.category || 'spelling';

            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-ipa font-semibold uppercase px-2 py-0.5 rounded bg-[#9E2A2B]/10 text-[#9E2A2B] dark:text-[#F87171]">
                      {badgeLabel}
                    </span>
                    <span className="font-ipa text-[#57534E] dark:text-[#A8A29E]">
                      Lecture {String(item.lectureNumber).padStart(2, '0')}
                    </span>
                    <span>·</span>
                    <span className="text-[#57534E] dark:text-[#A8A29E]">
                      Mistake: <del className="text-[#9E2A2B] font-ipa">{item.userWrongAnswer}</del>
                    </span>
                    <span>→</span>
                    <span className="font-ipa font-semibold text-[#2D6A4F] dark:text-emerald-400">
                      Correct: {item.correctAnswer}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className="font-ipa text-xs font-semibold text-[#2D6A4F] dark:text-emerald-400">
                      Re-Drill Streak: {item.consecutiveCorrect}/2
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        speechService.speak(item.correctAnswer, { rate: preferredSpeechRate })
                      }
                      className="p-1.5 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-[#9E2A2B]"
                      title="Listen to correct answer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    {onRemoveMistake && (
                      <button
                        type="button"
                        onClick={() => onRemoveMistake(item.id)}
                        className="p-1.5 rounded-lg text-[#57534E] hover:text-[#9E2A2B]"
                        title="Delete mistake note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  {item.prompt}
                </div>

                <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                  <strong className="text-[#1C1917] dark:text-[#F5F2EB]">Rule Note: </strong>
                  {item.explanation}
                </div>

                {/* Personal Mistake Note Input / Editor */}
                <div className="pt-2 border-t border-[#E7E0D6] dark:border-[#2E2924] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={currentDraft}
                    onChange={(e) => {
                      setNoteDrafts((prev) => ({ ...prev, [item.id]: e.target.value }));
                      setSavedNoteIds((prev) => ({ ...prev, [item.id]: false }));
                    }}
                    placeholder="Write your personal mistake note or memory trick here..."
                    className="flex-1 min-h-[38px] px-3 py-1.5 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#1C1917] dark:text-[#F5F2EB]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateMistakeNote) {
                        onUpdateMistakeNote(item.id, currentDraft.trim());
                        setSavedNoteIds((prev) => ({ ...prev, [item.id]: true }));
                      }
                    }}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold shrink-0"
                  >
                    {savedNoteIds[item.id] ? '✓ Note Saved' : 'Save Note'}
                  </button>
                </div>

                {/* Quick Re-Drill Bar to Graduate Item */}
                {onPracticeMistake && (
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={drillAttempt}
                      onChange={(e) =>
                        setMistakeDrillInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      placeholder={`Re-type "${item.correctAnswer}" to practice...`}
                      className="min-h-[36px] px-3 py-1 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] font-ipa text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!drillAttempt.trim()) return;
                        const ok =
                          drillAttempt.trim().toLowerCase() ===
                          item.correctAnswer.trim().toLowerCase();
                        if (ok) {
                          speechService.playCorrectTone();
                        } else {
                          speechService.playWrongTone();
                        }
                        onPracticeMistake(item.id, ok);
                        setMistakeDrillInputs((prev) => ({ ...prev, [item.id]: '' }));
                      }}
                      className="min-h-[2.25rem] px-[0.75rem] py-[0.25rem] rounded-lg bg-[#2D6A4F] text-white text-xs font-semibold"
                    >
                      Verify Re-Drill
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // =========================================================================
  // PRINTABLE STUDY CHEAT SHEET MODAL / VIEW
  // =========================================================================
  if (showCheatSheet) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
          <button
            onClick={() => setShowCheatSheet(false)}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Interactive Lecture</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => window.print()}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save Study Sheet as PDF</span>
            </button>
          </div>
        </div>

        <div className="bg-white text-[#1C1917] border border-[#E7E0D6] rounded-2xl p-6 sm:p-10 space-y-8 print:border-0 print:p-0">
          {/* Header */}
          <div className="border-b-2 border-[#1C1917] pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="text-xs font-ipa uppercase tracking-wider text-[#9E2A2B] font-semibold">
                BhashaSetu Printable Study Cheat Sheet · Lecture {String(lecture.lectureNumber).padStart(2, '0')} ({lecture.level})
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mt-1">{lecture.title}</h1>
              <p className="font-nepali text-sm text-[#57534E] mt-0.5">{lecture.nepaliTitle}</p>
            </div>
            <div className="text-xs font-ipa text-[#57534E]">
              {lecture.category} · {lecture.moduleA_vocabulary.length} Core Words
            </div>
          </div>

          {/* Section 1: 12 Core Words Table */}
          <div>
            <h2 className="text-base font-bold uppercase tracking-wider text-[#9E2A2B] mb-3">
              1. Core Vocabulary & Silent-Letter Phonics ({lecture.moduleA_vocabulary.length} Words)
            </h2>
            <div className="overflow-x-auto border border-[#E7E0D6] rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#E7E0D6]">
                    <th className="py-2.5 px-3 font-semibold">Word (Silent in Red)</th>
                    <th className="py-2.5 px-3 font-semibold">IPA & Pos</th>
                    <th className="py-2.5 px-3 font-semibold">Silent Rule</th>
                    <th className="py-2.5 px-3 font-semibold">Nepali Meaning</th>
                    <th className="py-2.5 px-3 font-semibold">Example Sentence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0D6]">
                  {lecture.moduleA_vocabulary.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-bold text-sm">
                        {item.segments?.map((seg, i) =>
                          seg.silent ? (
                            <span
                              key={i}
                              className="text-[#9E2A2B] underline decoration-dotted font-extrabold"
                            >
                              {seg.text}
                            </span>
                          ) : (
                            <span key={i}>{seg.text}</span>
                          )
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-ipa text-xs">
                        {item.ipa} ({item.partOfSpeech})
                      </td>
                      <td className="py-2.5 px-3 text-xs text-[#9E2A2B]">
                        {item.silentLettersSummary}
                      </td>
                      <td className="py-2.5 px-3 font-nepali font-medium">{item.nepaliMeaning}</td>
                      <td className="py-2.5 px-3 text-xs italic">“{item.englishExample}”</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Spelling Formula & Key Examples */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7E0D6] space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                2. Orthographic Spelling Rule
              </div>
              <h3 className="text-base font-bold">{lecture.moduleC_spelling.ruleTitle}</h3>
              <div className="p-2.5 rounded-lg bg-white border border-[#E7E0D6] font-ipa text-xs font-semibold">
                {lecture.moduleC_spelling.formula}
              </div>
              <ul className="space-y-1 text-xs pt-1">
                {lecture.moduleC_spelling.examples.map((ex, i) => (
                  <li key={i}>
                    • <strong>{ex.baseWord}</strong> →{' '}
                    <span className="text-[#2D6A4F] font-semibold">{ex.correctSpelling}</span> (NOT{' '}
                    <span className="line-through text-[#9E2A2B]">{ex.commonWrongSpelling}</span>)
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3: Grammar Capstone Summary */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E7E0D6] space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                3. Grammar & Syntax Capstone
              </div>
              <h3 className="text-base font-bold">{lecture.moduleD_grammar.topicTitle}</h3>
              <ul className="space-y-1 text-xs">
                {(englishGrammar
                  ? englishGrammar.keyTakeawaysEnglish
                  : lecture.moduleD_grammar.keyTakeawaysNepali
                ).map((pt, i) => (
                  <li key={i}>• {pt}</li>
                ))}
              </ul>
              {lecture.moduleD_grammar.syntaxComparisons[0] && (
                <div className="p-2.5 rounded-lg bg-white border border-[#E7E0D6] text-xs mt-2">
                  <div>
                    <strong>EN:</strong> “{lecture.moduleD_grammar.syntaxComparisons[0].englishFullSentence}”
                  </div>
                  <div className="font-nepali text-[#57534E] mt-0.5">
                    <strong>NP:</strong> “{lecture.moduleD_grammar.syntaxComparisons[0].nepaliFullSentence}”
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Personal Lecture Notes Scratchpad (Printed on Study Sheet) */}
          {scratchpadDraft.trim() && (
            <div className="p-5 rounded-xl bg-[#FAF7F2] border border-[#E7E0D6] space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#9E2A2B]">
                4. My Personal Nepali-English Lecture Notes
              </div>
              <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-nepali text-[#1C1917]">
                {scratchpadDraft}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showCompletionSummary) {
    const totalQuestions =
      spellingQuizzes.length +
      grammarExercises.length +
      dialogueQuestions.length +
      Object.keys(dictationResultsByWordId).length;
    const totalCorrect =
      spellingCorrectCount +
      grammarCorrectCount +
      dialogueCorrectCount +
      dictationCorrectCount;
    const accuracyPercent =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 100;

    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="card p-6 sm:p-10 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#2D6A4F]/10 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center mx-auto mb-5">
            <Award className="w-8 h-8" />
          </div>
          <p className="text-xs font-medium text-[#9E2A2B] dark:text-[#F87171] mb-2">
            Lecture {String(lecture.lectureNumber).padStart(2, '0')} Completed
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
            {lecture.title}
          </h2>
          <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] mb-8">
            Great work! You have completed all five modules: 12 Core Words, Pronunciation, Audio Dictation & Spelling, Grammar Builder, and Real-Life Conversation Dialogue.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
              <div className="font-ipa text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                {accuracyPercent}%
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                Overall Accuracy
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
              <div className="font-ipa text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                {spellingCorrectCount + dictationCorrectCount}/
                {spellingQuizzes.length + Object.keys(dictationResultsByWordId).length}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                Spelling & Dictation
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
              <div className="font-ipa text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                {grammarCorrectCount}/{grammarExercises.length}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                Grammar Capstone
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
              <div className="font-ipa text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                {dialogueCorrectCount}/{dialogueQuestions.length}
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                Dialogue Quiz
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setShowCompletionSummary(false);
                setActiveModule(0);
              }}
              className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB] hover:bg-[#FAF7F2] dark:hover:bg-[#2E2924]/50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-4 h-4" />
              Review Modules Again
            </button>
            <button
              onClick={onBackToDashboard}
              className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-[#9E2A2B] text-white text-sm font-medium hover:bg-[#872223] transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
            >
              Back to Syllabus Lectures
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[82rem] mx-auto px-[0.625rem] sm:px-[1rem] lg:px-[1.5rem] py-[0.875rem] sm:py-[1.25rem] pb-24">
      {/* Top Action Bar: Back to All Lectures (Left) + Lecture Progress % Bar & Responsive Mistake Notes / Cheat Sheet (Right) */}
      <div className="mb-4 sm:mb-5">
        {/* .lm-head: back · eyebrow + serif title · tools · progress ring · phone menu */}
        {(() => {
          const uniqueDoneSteps = new Set(completedSteps);
          const lectureProgressPercent = isCompleted
            ? 100
            : Math.min(100, Math.round((uniqueDoneSteps.size / 5) * 100));
          const ringLen = 2 * Math.PI * 14;
          const levelName =
            lecture.level === 'C1' ? 'Advanced' : lecture.level === 'B2' ? 'Workplace' : 'Foundation';
          return (
            <header className="flex items-center gap-2.5 md:gap-3.5 mb-3 md:mb-4">
              <button
                type="button"
                onClick={onBackToDashboard}
                aria-label="Back to all lectures"
                title="Back to all lectures"
                className="ibtn !rounded-full"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#9E2A2B] dark:text-[#F87171] truncate">
                  Lecture {String(lecture.lectureNumber).padStart(2, '0')} · {lecture.level} {levelName}
                  {isCompleted && <span className="text-[#2D6A4F] dark:text-emerald-400"> · Completed</span>}
                </div>
                <h1 className="serif m-0 text-[17px] md:text-2xl leading-[1.2] text-[#1C1917] dark:text-[#F5F2EB] truncate">
                  {lecture.title}
                </h1>
                <p
                  className={`hidden md:block m-0 text-sm muted truncate ${isFullNepali ? 'np' : ''}`}
                >
                  {isFullNepali ? lecture.nepaliTitle : lecture.subtitle}
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowScratchpadDrawer((prev) => !prev)}
                  aria-pressed={showScratchpadDrawer}
                  className={`btn btn-g btn-sm xl:hidden ${showScratchpadDrawer ? '!border-[#2D6A4F] !text-[#1F5C3D]' : ''}`}
                >
                  <FileText className="w-4 h-4" />
                  My notes{scratchpadDraft.trim() ? ' ✓' : ''}
                </button>
                <button
                  type="button"
                  onClick={() => setShowMistakeNotesDrawer((prev) => !prev)}
                  aria-pressed={showMistakeNotesDrawer}
                  className={`btn btn-g btn-sm ${showMistakeNotesDrawer ? '!border-[#9E2A2B] !text-[#9E2A2B]' : ''}`}
                >
                  <AlertTriangle className="w-4 h-4" />
                  Mistakes ({lectureMistakes.length})
                </button>
                <button type="button" onClick={() => setShowCheatSheet(true)} className="btn btn-g btn-sm">
                  <Printer className="w-4 h-4" />
                  Cheat sheet
                </button>
              </div>

              <svg
                width="46"
                height="46"
                viewBox="0 0 36 36"
                role="img"
                aria-label={`Lecture progress ${lectureProgressPercent}%`}
                className="shrink-0"
              >
                <circle cx="18" cy="18" r="14" fill="none" strokeWidth="4" className="stroke-[#EFE9DD] dark:stroke-[#2E2924]" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="none"
                  stroke="#2D6A4F"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={`${(lectureProgressPercent / 100) * ringLen} ${ringLen}`}
                  transform="rotate(-90 18 18)"
                  style={{ transition: 'stroke-dasharray .4s' }}
                />
                <text x="18" y="21.5" textAnchor="middle" fontSize="9" fontWeight="700" className="fill-[#1C1917] dark:fill-[#F5F2EB]">
                  {lectureProgressPercent}%
                </text>
              </svg>

              <button
                type="button"
                onClick={() => setShowMobileOverflowMenu(true)}
                aria-label="Notes, mistakes and cheat sheet"
                aria-haspopup="dialog"
                className="ibtn !rounded-full lg:hidden"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </header>
          );
        })()}

        {/* Phone menu: bottom sheet with blurred backdrop (artifact SHEETS) */}
        {showMobileOverflowMenu && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Lecture tools"
            onMouseDown={backdropDismiss(() => setShowMobileOverflowMenu(false))}
            className={`fixed inset-0 z-50 flex flex-col justify-end items-center ${MODAL_BACKDROP_CLASS} animate-fade-up`}
          >
            <div className="w-full max-w-[560px] bg-white dark:bg-[#1A1714] rounded-t-[26px] px-[18px] pt-2.5 pb-7 flex flex-col gap-1">
              <span aria-hidden="true" className="w-10 h-[5px] rounded-full bg-[#DFD7C8] dark:bg-[#3A332D] self-center mb-1" />
              {[
                {
                  key: 'notes',
                  tone: 'i-ochre',
                  Icon: FileText,
                  title: 'My notes',
                  sub: scratchpadDraft.trim() ? 'Saved · personal scratchpad for this lecture' : 'Personal scratchpad for this lecture',
                  onClick: () => setShowScratchpadDrawer((prev) => !prev),
                },
                {
                  key: 'mist',
                  tone: 'i-crim',
                  Icon: AlertTriangle,
                  title: 'Mistake notes',
                  sub: `${lectureMistakes.length} to re-drill · add your own`,
                  onClick: () => setShowMistakeNotesDrawer((prev) => !prev),
                },
                {
                  key: 'cheat',
                  tone: 'i-sage',
                  Icon: Printer,
                  title: 'Study cheat sheet',
                  sub: 'Printable one-page summary',
                  onClick: () => setShowCheatSheet(true),
                },
              ].map(({ key, tone, Icon, title, sub, onClick }, i) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    onClick();
                    setShowMobileOverflowMenu(false);
                  }}
                  className={`flex items-center gap-3.5 min-h-[64px] text-left ${i > 0 ? 'border-t border-[#EFE9DD] dark:border-[#2E2924]' : ''}`}
                >
                  <span className={`ico sm ${tone}`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <strong className="block text-[15px] text-[#1C1917] dark:text-[#F5F2EB]">{title}</strong>
                    <span className="muted block text-xs">{sub}</span>
                  </span>
                  <ChevronRight className="w-[18px] h-[18px] muted" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Persistent Personal Lecture Notes Scratchpad Drawer */}
        {showScratchpadDrawer && (
          <div className="mb-5 card p-5 space-y-3 xl:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2D6A4F] dark:text-emerald-400">
                  <FileText className="w-4 h-4" />
                  <span>Personal Lecture Notes Scratchpad (Auto-Saved & Included on Printable Study Sheet)</span>
                </div>
                <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                  Jot down your own Nepali-English grammar reminders, silent-letter memory tricks, or pronunciation cues for Lecture {String(lecture.lectureNumber).padStart(2, '0')}.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {scratchpadSavedAt && (
                  <span className="font-ipa text-[11px] text-[#2D6A4F] dark:text-emerald-400 font-semibold">
                    ✓ Auto-saved ({scratchpadSavedAt})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setShowScratchpadDrawer(false)}
                  className="p-1.5 rounded-lg text-[#57534E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={scratchpadDraft}
              onChange={(e) => {
                const val = e.target.value;
                setScratchpadDraft(val);
                if (onUpdateLectureNote) {
                  onUpdateLectureNote(lecture.id, val);
                  setScratchpadSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
                }
              }}
              placeholder="Write your personal notes for this lecture here (e.g., Remember: in 'knight', K and GH are silent; Nepali SOV -> English SVO)..."
              className="w-full p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>
        )}

        {/* Collapsible Mistake Notes Drawer */}
        {showMistakeNotesDrawer && (
          <div className="mb-5">{renderMistakeNotesSection()}</div>
        )}

        {/* 5-Step Stepper: icon dots joined by a progress line; Done / Now / Next on wider screens */}
        {(() => {
          const doneCount = MODULE_TABS.filter(
            (t) => isCompleted || completedSteps.includes(t.step)
          ).length;
          return (
            <nav
              aria-label="Lecture steps"
              className="relative grid grid-cols-5 pb-4 sm:pb-5 border-b border-[#E7E0D6] dark:border-[#2E2924]"
            >
              <div
                aria-hidden="true"
                className="absolute left-[10%] right-[10%] top-[1.1875rem] sm:top-6 h-0.5 bg-[#E6E0D4] dark:bg-[#2E2924]"
              />
              <div
                aria-hidden="true"
                className="absolute left-[10%] top-[1.1875rem] sm:top-6 h-0.5 bg-[#2D6A4F] transition-all duration-500"
                style={{ width: `${(Math.min(4, doneCount) / 4) * 80}%` }}
              />
              {MODULE_TABS.map((tab) => {
                const isActive = activeModule === tab.step;
                const isStepDone = isCompleted || completedSteps.includes(tab.step);
                const statusLabel = isActive ? 'Now' : isStepDone ? 'Done' : 'Next';
                const TabIcon = tab.Icon;
                return (
                  <button
                    key={tab.step}
                    type="button"
                    aria-current={isActive ? 'step' : undefined}
                    aria-label={`Step ${tab.number}: ${tab.label} (${statusLabel})`}
                    onClick={() => {
                      speechService.triggerHaptic('light');
                      goToModule(tab.step);
                    }}
                    className="group relative flex flex-col items-center gap-1 min-h-[3.5rem] px-0.5 text-center"
                  >
                    <span
                      className={`relative w-[2.375rem] h-[2.375rem] sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                        isActive
                          ? 'bg-[#9E2A2B] text-white shadow-[0_0_0_4px_#F8E7E3] dark:shadow-[0_0_0_4px_rgba(158,42,43,0.3)]'
                          : isStepDone
                          ? 'bg-[#2D6A4F] text-white'
                          : 'bg-white dark:bg-[#1F1C18] border border-[#DFD7C8] dark:border-[#3A332D] text-[#6E685F] dark:text-[#A8A29E] group-hover:border-[#9E2A2B] group-hover:text-[#9E2A2B]'
                      }`}
                    >
                      {isStepDone && !isActive ? (
                        <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                      ) : (
                        <TabIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </span>
                    <span
                      className={`text-[0.6875rem] sm:text-sm font-bold leading-tight ${
                        isActive
                          ? 'text-[#9E2A2B] dark:text-[#F87171]'
                          : 'text-[#3D342B] dark:text-[#D6CFC4]'
                      }`}
                    >
                      <span className="md:hidden">{tab.shortLabel}</span>
                      <span className="hidden md:inline">{tab.label}</span>
                    </span>
                    <span
                      className={`hidden md:block text-[0.625rem] font-extrabold uppercase tracking-[0.08em] ${
                        isActive
                          ? 'text-[#9E2A2B] dark:text-[#F87171]'
                          : isStepDone
                          ? 'text-[#1F5C3D] dark:text-emerald-400'
                          : 'text-[#8C857B]'
                      }`}
                    >
                      {statusLabel}
                    </span>
                    <span className="hidden lg:block text-[0.6875rem] leading-snug text-[#6E685F] dark:text-[#A8A29E] max-w-[11rem]">
                      {tab.description}
                    </span>
                  </button>
                );
              })}
            </nav>
          );
        })()}
      </div>

      {/* .lm-body: step content + 330px sticky rail on wide screens */}
      <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-7 xl:items-start">
      <div className="min-w-0">
      {/* ===================================================================== */}
      {/* MODULE A: VOCABULARY & SILENT-LETTER PHONICS (10 WORDS PER BATCH)     */}
      {/* ===================================================================== */}
      {activeModule === 0 && (
        <div className="space-y-6 animate-fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card p-[1rem] sm:p-[1.25rem]">
            <div>
              <h2 className="fluid-title-lg font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                01. Vocabulary & Silent-Letter Phonics
              </h2>
              <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                Crimson dotted letters are <strong>silent letters</strong>—written in spelling, silent in speech.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelfTestMaskWords((prev) => !prev);
                  setUnmaskedWordIds({});
                }}
                className={`min-h-[38px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  selfTestMaskWords
                    ? 'border-[#9E2A2B] bg-[#9E2A2B] text-white'
                    : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]'
                }`}
              >
                {selfTestMaskWords ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{selfTestMaskWords ? 'Show All Words' : 'Self-Test Word Mask'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visibleStepOneWords.map((item: VocabularyItem, index: number) => {
              const isSaved = savedWordIds.includes(item.id);
              const isWordMastered = masteredWordIds.includes(item.id);
              const isNormalSpeaking = speakingId === `${item.id}-normal`;
              const isSlowSpeaking = speakingId === `${item.id}-slow`;
              const isSentenceSpeaking = speakingId === `${item.id}-sentence`;
              const showNepaliForWord =
                showWordMeaningsByDefault || Boolean(revealedNepaliWordIds[item.id]);
              const englishTip = ENGLISH_USAGE_TIPS[item.id];
              const isMasked = selfTestMaskWords && !unmaskedWordIds[item.id];

              return (
                <article
                  key={item.id}
                  className="card p-4 sm:p-5 flex flex-col justify-between gap-2.5"
                >
                  <div className="space-y-2.5">
                    {/* Compact Header Row: Word Number · POS · Silent Rule + Mastered Checkmark & Icon-Only Bookmark */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs text-[#57534E] dark:text-[#A8A29E] truncate">
                        <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span>{item.partOfSpeech}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className="text-[#9E2A2B] dark:text-[#F87171] font-medium">
                          {item.silentLettersSummary}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {onToggleMasteredWord && (
                          <button
                            type="button"
                            onClick={() => onToggleMasteredWord(item.id)}
                            aria-label={isWordMastered ? 'Unmark mastered word' : 'Mark word as mastered'}
                            title={
                              isWordMastered
                                ? 'Mastered! Counts toward 50 Words Mastered badge'
                                : 'Mark word as Mastered'
                            }
                            className={`min-h-[36px] px-2.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                              isWordMastered
                                ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white'
                                : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E] hover:border-[#2D6A4F]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">
                              {isWordMastered ? 'Mastered' : 'Master'}
                            </span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleSaveWord(item.id)}
                          aria-label={isSaved ? 'Remove bookmark' : 'Bookmark word'}
                          title={isSaved ? 'Bookmarked' : 'Bookmark word'}
                          className={`min-h-[36px] min-w-[36px] rounded-xl border flex items-center justify-center transition-colors shrink-0 ${
                            isSaved
                              ? 'border-[#9E2A2B]/40 bg-[#9E2A2B]/10 text-[#9E2A2B] dark:text-[#F87171]'
                              : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E] hover:text-[#9E2A2B]'
                          }`}
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Headword + IPA on Left | Compact 1.0x & 0.65x Audio Controls on Right */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-wrap items-baseline gap-2 min-w-0">
                        {isMasked ? (
                          <button
                            type="button"
                            onClick={() =>
                              setUnmaskedWordIds((prev) => ({ ...prev, [item.id]: true }))
                            }
                            className="px-3 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-dashed border-[#9E2A2B] text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]"
                          >
                            Tap to Reveal Word
                          </button>
                        ) : (
                          <WordPhoneticsPopover
                            word={item.word}
                            ipa={item.ipa}
                            partOfSpeech={item.partOfSpeech}
                            nepaliMeaning={item.nepaliMeaning}
                            silentLettersSummary={item.silentLettersSummary}
                            englishExample={item.englishExample}
                            segments={item.segments}
                            isSaved={isSaved}
                            preferredSpeechRate={preferredSpeechRate}
                            onToggleSave={() => onToggleSaveWord(item.id)}
                          >
                            <button
                              type="button"
                              title="Tap for instant phonetics & silent-letter card"
                              className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1C1917] dark:text-[#F5F2EB] text-left hover:opacity-85 transition-opacity"
                            >
                              {item.segments && item.segments.length > 0
                                ? item.segments.map((seg, idx) =>
                                    seg.silent ? (
                                      <span
                                        key={idx}
                                        title="Silent letter (not pronounced)"
                                        className="text-[#9E2A2B] dark:text-[#F87171] bg-[#9E2A2B]/10 dark:bg-[#9E2A2B]/25 underline decoration-dotted decoration-2 underline-offset-4 px-0.5 rounded"
                                      >
                                        {seg.text}
                                      </span>
                                    ) : (
                                      <span key={idx}>{seg.text}</span>
                                    )
                                  )
                                : item.word}
                            </button>
                          </WordPhoneticsPopover>
                        )}
                        <span className="font-ipa text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                          {item.ipa}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeak(item.word, `${item.id}-normal`, preferredSpeechRate)
                          }
                          title="Tap to listen (1.0x)"
                          className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                            isNormalSpeaking
                              ? 'bg-[#9E2A2B] text-white'
                              : 'bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B] dark:text-[#F87171]" />
                          <span className="font-ipa">1.0x</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSpeak(item.word, `${item.id}-slow`, 0.6)}
                          title="Slow phonics pitch (0.65x)"
                          className={`min-h-[38px] px-2.5 py-1.5 rounded-xl text-xs font-medium inline-flex items-center gap-1 transition-all ${
                            isSlowSpeaking
                              ? 'bg-[#D97706] text-white'
                              : 'bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E] hover:border-[#D97706]'
                          }`}
                        >
                          <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                          <span className="font-ipa text-[11px]">0.65x</span>
                        </button>

                        {languageMode === 'english-only' && (
                          <button
                            type="button"
                            onClick={() =>
                              setRevealedNepaliWordIds((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id],
                              }))
                            }
                            title={showNepaliForWord ? 'Hide Nepali' : 'Show Nepali Meaning'}
                            className="min-h-[38px] min-w-[38px] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] flex items-center justify-center text-[#57534E] dark:text-[#A8A29E]"
                          >
                            {showNepaliForWord ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Concise Nepali Meaning Line */}
                    {showNepaliForWord && (
                      <div className="flex items-baseline gap-2 py-1.5 border-t border-b border-[#E7E0D6]/70 dark:border-[#2E2924]">
                        <span className="font-nepali text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                          {item.nepaliMeaning}
                        </span>
                        {isFullNepali && item.nepaliTransliteration && (
                          <span className="font-nepali text-xs text-[#D97706] dark:text-amber-400">
                            ({item.nepaliTransliteration})
                          </span>
                        )}
                      </div>
                    )}

                    {/* Concise Example Sentence + Mini Audio Button */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <p className="text-xs sm:text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB] leading-snug">
                          “{item.englishExample}”
                        </p>
                        {isFullNepali && (
                          <p className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                            “{item.nepaliExampleTranslation}”
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleSpeak(item.englishExample, `${item.id}-sentence`, preferredSpeechRate)
                        }
                        aria-label="Listen to example sentence"
                        className={`min-h-[32px] min-w-[32px] rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          isSentenceSpeaking
                            ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                            : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] hover:text-[#9E2A2B]'
                        }`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Most Important Takeaway: Prominent Phonics Tip Box (Hairline Border) */}
                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
                    {englishTip && !isFullNepali ? (
                      <p className="text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] leading-relaxed">
                        <strong className="text-[#9E2A2B] dark:text-[#F87171]">Phonics Tip: </strong>
                        {englishTip}
                      </p>
                    ) : (
                      <p className="font-nepali text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] leading-relaxed">
                        <strong className="text-[#9E2A2B] dark:text-[#F87171]">Phonics Tip: </strong>
                        {item.usageTipNepali}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Load More Words (+10) Batch Footer */}
          {visibleVocabCount < allStepOneWords.length && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924]">
              <div className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                Showing <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB]">{visibleStepOneWords.length}</span> of{' '}
                <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB]">{allStepOneWords.length.toLocaleString()}</span> section vocabulary words
              </div>
              <button
                type="button"
                onClick={() => setVisibleVocabCount((prev) => prev + 10)}
                className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:bg-[#9E2A2B] dark:hover:bg-[#9E2A2B] dark:hover:text-white transition-colors inline-flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Load More Words (+10)</span>
              </button>
            </div>
          )}

          {/* Clean Section Vocabulary Bank Card */}
          <div className="card p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="font-ipa text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                  Section {String(lecture.lectureNumber).padStart(2, '0')} Vocabulary Bank
                </div>
                <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                  { lecture.category } · {sectionBankWords.length.toLocaleString()} Words
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => setShowExtendedBank((prev) => !prev)}
                  className="min-h-[40px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]"
                >
                  {showExtendedBank ? 'Hide Word Bank' : 'Search Section Word Bank'}
                </button>
                {onOpenSectionDictionary && (
                  <button
                    onClick={() => onOpenSectionDictionary(lecture.lectureNumber)}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold inline-flex items-center gap-1.5"
                  >
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>Open in Dictionary</span>
                  </button>
                )}
              </div>
            </div>

            {showExtendedBank && (
              <div className="pt-4 border-t border-[#E7E0D6] dark:border-[#2E2924] space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#57534E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={bankQuery}
                      onChange={(e) => {
                        setBankQuery(e.target.value);
                        setBankPage(1);
                      }}
                      placeholder={`Search Lecture ${String(lecture.lectureNumber).padStart(2, '0')} vocabulary...`}
                      className="w-full min-h-[40px] pl-10 pr-4 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
                      {(
                        [
                          { id: 'all', label: 'All' },
                          { id: 'silent', label: 'Silent Letters' },
                          { id: 'saved', label: 'Saved' },
                        ] as const
                      ).map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setBankCategoryFilter(tab.id);
                            setBankPage(1);
                          }}
                          className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                            bankCategoryFilter === tab.id
                              ? 'bg-white dark:bg-[#1F1C18] text-[#9E2A2B] dark:text-[#F87171] shadow-xs'
                              : 'text-[#57534E] dark:text-[#A8A29E]'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-ipa shrink-0">
                      <button
                        onClick={() => setBankPage((p) => Math.max(1, p - 1))}
                        disabled={bankPage <= 1}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <span>
                        {bankPage}/{bankTotalPages}
                      </span>
                      <button
                        onClick={() => setBankPage((p) => Math.min(bankTotalPages, p + 1))}
                        disabled={bankPage >= bankTotalPages}
                        className="min-h-[34px] px-2.5 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentBankSlice.map((bw) => {
                    const saved = savedWordIds.includes(bw.id);
                    return (
                      <div
                        key={bw.id}
                        className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-col justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                              {bw.word}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  speechService.speak(bw.word, { rate: preferredSpeechRate })
                                }
                                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-[#9E2A2B]"
                                title="Listen"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onToggleSaveWord(bw.id)}
                                className={`p-1.5 rounded-lg ${
                                  saved ? 'text-[#9E2A2B]' : 'text-[#57534E]'
                                }`}
                                title="Bookmark word"
                              >
                                {saved ? (
                                  <BookmarkCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <Bookmark className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="font-ipa text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                            {bw.ipa} · {bw.partOfSpeech}
                          </div>
                          {languageMode !== 'english-only' && (
                            <div className="font-nepali text-xs font-medium text-[#1C1917] dark:text-[#F5F2EB] mt-1">
                              {bw.nepaliMeaning}
                            </div>
                          )}
                        </div>
                        <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] italic">
                          “{bw.englishExample}”
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Step 01 navigation is handled by the unified Sticky Bottom Action Bar */}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODULE B: PRONUNCIATION GUIDE & LIVE MICROPHONE PRACTICE              */}
      {/* ===================================================================== */}
      {activeModule === 1 && (
        <div className="space-y-6 animate-fade-up">
          <div className="card p-[1rem] sm:p-[1.25rem]">
            <h2 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              02. Syllable Breakdown, Simplified Phonetics & Voice Check ({lecture.moduleB_pronunciation.length} Words)
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
              Tap the syllable blocks to hear how each word breaks down. Capitalized blocks show <strong>primary stress</strong>. Use the microphone button to practice speaking aloud.
            </p>
            {micError && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{micError}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {lecture.moduleB_pronunciation.map((item: PronunciationItem) => {
              const isListening = listeningWordId === item.id;
              const micResult = micResults[item.id];
              const englishRule = ENGLISH_PRONUNCIATION_RULES[item.id];

              return (
                <div
                  key={item.id}
                  className="card p-5 sm:p-6"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div className="lg:col-span-7 space-y-4">
                      {/* Artifact "SAY THIS WORD" dark card */}
                      <section className="relative overflow-hidden rounded-[22px] bg-[#1C1917] text-[#F5F2EB] dark:bg-[#F5F2EB] dark:text-[#1C1917] px-[18px] py-[22px] flex flex-col items-center gap-3 text-center">
                        <div
                          aria-hidden="true"
                          className="absolute w-[260px] h-[260px] rounded-full border border-white/10 shadow-[0_0_0_30px_rgba(255,255,255,0.03)] -top-[120px] -right-[90px] dark:border-black/10"
                        />
                        <span className="text-[11px] font-bold tracking-[0.12em] text-[#E9C77B] dark:text-[#8C6527]">SAY THIS WORD</span>
                        <h3 className="serif m-0 text-[40px] md:text-[48px] leading-[1.1]">{item.word}</h3>
                        <span className="mono text-[#C9C1B4] dark:text-[#57534E]">
                          {item.ipa} · {item.syllables.length} {item.syllables.length === 1 ? 'syllable' : 'syllables'}
                        </span>
                        <div className="grid grid-cols-2 gap-2 w-full max-w-[420px]">
                          <button
                            type="button"
                            onClick={() => handleSpeak(item.word, `${item.id}-pron-norm`, preferredSpeechRate)}
                            className="btn !min-h-[50px] bg-[#F5F2EB] text-[#1C1917] hover:bg-white dark:bg-[#1C1917] dark:text-[#F5F2EB]"
                          >
                            <Volume2 className="w-[18px] h-[18px]" />
                            Normal
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSpeak(item.word, `${item.id}-pron-slow`, 0.55)}
                            className="btn !min-h-[50px] bg-[#2A2520] text-[#F5F2EB] hover:bg-[#3A332C] dark:bg-[#E6E0D4] dark:text-[#1C1917]"
                          >
                            <Turtle className="w-[18px] h-[18px]" />
                            Slow 0.6×
                          </button>
                        </div>
                      </section>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
                        <div>
                          <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mb-2">
                            Tap Syllables (CAPS = Stressed Syllable)
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            {item.syllables.map((syl, sIdx) => {
                              const isStressed = sIdx === item.stressedSyllableIndex;
                              return (
                                <React.Fragment key={sIdx}>
                                  <button
                                    onClick={() => handleSpeak(item.word, `${item.id}-syl-${sIdx}`, 0.65)}
                                    className={`min-h-[44px] px-3.5 rounded-xl text-[15px] border transition-transform active:scale-95 ${
                                      isStressed
                                        ? 'bg-[#9E2A2B] border-[#9E2A2B] text-white font-bold'
                                        : 'bg-white dark:bg-[#1F1C18] border-[#E6E0D4] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB]'
                                    }`}
                                  >
                                    {isStressed ? syl.toUpperCase() : syl}
                                  </button>
                                  {sIdx < item.syllables.length - 1 && (
                                    <span className="text-[#57534E] font-bold">·</span>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mb-1">
                            Sounds Like (Simplified Phonetics)
                          </div>
                          <div className="font-ipa text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            “{item.simplifiedPhonetic}”
                          </div>
                          {languageMode !== 'english-only' && (
                            <div className="font-nepali text-xs font-medium text-[#D97706] dark:text-amber-400 mt-0.5">
                              Sound cue: {item.nepaliPhoneticHint}
                            </div>
                          )}
                          <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                            Avoid: <span className="line-through">{item.commonMispronunciation}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-3">
                      <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
                        <div className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] mb-1">
                          Rule: {item.ruleTitle}
                        </div>
                        {englishRule && !isFullNepali ? (
                          <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                            {englishRule}
                          </p>
                        ) : (
                          <p className="font-nepali text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                            {item.ruleExplanationNepali}
                          </p>
                        )}
                      </div>

                      <div className="p-4 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              Live Pronunciation Check
                            </div>
                            <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                              Tap the mic and say “{item.word}” aloud
                            </div>
                          </div>
                          <button
                            onClick={() => handleMicPractice(item)}
                            disabled={isListening}
                            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                              isListening
                                ? 'bg-[#D97706] text-white'
                                : 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] hover:opacity-90'
                            }`}
                          >
                            <Mic className="w-4 h-4" />
                            <span>{isListening ? 'Listening... Speak Now' : 'Tap to Speak'}</span>
                          </button>
                        </div>

                        {micResult && (
                          <div
                            className={`p-3 rounded-lg border text-xs ${
                              micResult.passed
                                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                                : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                            }`}
                          >
                            <div className="flex items-center justify-between font-semibold mb-1">
                              <span className="inline-flex items-center gap-1.5">
                                {micResult.passed ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] dark:text-emerald-400" />
                                ) : (
                                  <AlertCircle className="w-4 h-4 text-[#D97706]" />
                                )}
                                <span>{micResult.passed ? 'Matched!' : 'Keep Practicing'}</span>
                              </span>
                              <span className="font-ipa">Match: {micResult.score}%</span>
                            </div>
                            <p>{isFullNepali ? micResult.feedbackNepali : micResult.feedbackEnglish}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 02 navigation is handled by the unified Sticky Bottom Action Bar */}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODULE C: SPELLING RULES, AUDIO DICTATION BEE & QUIZZES               */}
      {/* ===================================================================== */}
      {activeModule === 2 && (
        <div className="space-y-6 animate-fade-up">
          {/* Spelling Rule Master Card */}
          <div className="card p-[1rem] sm:p-[1.5rem]">
            <div className="text-xs font-medium text-[#9E2A2B] dark:text-[#F87171] mb-1">
              03. Core Orthographic Rule
            </div>
            <h2 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              {lecture.moduleC_spelling.ruleTitle}
            </h2>
            {isFullNepali && (
              <p className="font-nepali text-[0.875rem] sm:text-[1rem] leading-snug font-medium text-[#57534E] dark:text-[#A8A29E] mt-1">
                {lecture.moduleC_spelling.nepaliRuleTitle}
              </p>
            )}

            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] my-4">
              <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mb-1">
                Spelling Formula
              </div>
              <div className="font-ipa text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                {lecture.moduleC_spelling.formula}
              </div>
            </div>

            {ENGLISH_SPELLING_EXPLANATIONS[lecture.id] && !isFullNepali ? (
              <p className="text-sm sm:text-base text-[#1C1917] dark:text-[#F5F2EB] whitespace-pre-line leading-relaxed mb-6">
                {ENGLISH_SPELLING_EXPLANATIONS[lecture.id]}
              </p>
            ) : (
              <p className="font-nepali text-sm sm:text-base text-[#1C1917] dark:text-[#F5F2EB] whitespace-pre-line mb-6">
                {lecture.moduleC_spelling.nepaliExplanation}
              </p>
            )}

            <div className="overflow-x-auto border border-[#E7E0D6] dark:border-[#2E2924] rounded-xl mb-5">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#FAF7F2] dark:bg-[#141210] border-b border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                    <th className="py-3 px-4 font-semibold">Base Word</th>
                    <th className="py-3 px-4 font-semibold">Pattern / Rule</th>
                    <th className="py-3 px-4 font-semibold text-[#2D6A4F] dark:text-emerald-400">
                      Correct Spelling
                    </th>
                    <th className="py-3 px-4 font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                      Common Error
                    </th>
                    {languageMode !== 'english-only' && (
                      <th className="py-3 px-4 font-semibold">Nepali Note</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E0D6] dark:divide-[#2E2924]">
                  {lecture.moduleC_spelling.examples.map((ex, idx) => (
                    <tr key={idx}>
                      <td className="py-3 px-4 font-ipa font-medium">{ex.baseWord}</td>
                      <td className="py-3 px-4 text-xs text-[#57534E] dark:text-[#A8A29E]">
                        {ex.transformation}
                      </td>
                      <td className="py-3 px-4 font-ipa font-semibold text-[#2D6A4F] dark:text-emerald-400">
                        ✓ {ex.correctSpelling}
                      </td>
                      <td className="py-3 px-4 font-ipa text-[#9E2A2B] dark:text-[#F87171] line-through">
                        {ex.commonWrongSpelling}
                      </td>
                      {languageMode !== 'english-only' && (
                        <td className="py-3 px-4 font-nepali text-xs sm:text-sm">
                          {ex.nepaliMeaning}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {lecture.moduleC_spelling.exceptions.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                <div className="text-xs font-semibold text-[#D97706] dark:text-amber-400 mb-1.5">
                  Important Exceptions to Watch Out For:
                </div>
                <ul className="space-y-1 text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                  {lecture.moduleC_spelling.exceptions.map((exc, i) => (
                    <li key={i}>• {exc}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* INTERACTIVE AUDIO DICTATION & SPELLING BEE LAB (IN LECTUREPLAYER) */}
          {/* ================================================================= */}
          {currentDictationWord && (
            <div className="card p-[1rem] sm:p-[1.5rem] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E0D6] dark:border-[#2E2924] pb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                    <Headphones className="w-4 h-4" />
                    <span>Interactive Audio Dictation & Spelling Bee</span>
                  </div>
                  <h3 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                    Listen to the Word Audio & Type the Exact Spelling
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                    Tap play to hear the word, type its spelling including any silent letters, and get instant letter-by-letter feedback.
                  </p>
                </div>

                <div className="font-ipa text-xs sm:text-sm flex items-center gap-3 shrink-0">
                  <span>
                    Dictation Score: <strong>{dictationCorrectCount}</strong>/
                    {lecture.moduleA_vocabulary.length}
                  </span>
                  <span className="text-[#D97706] font-semibold">
                    Streak: {dictationStreak}
                  </span>
                </div>
              </div>

              {/* 12-Word Selector Progress Strip */}
              <div className="flex flex-wrap items-center gap-1.5">
                {lecture.moduleA_vocabulary.map((w, idx) => {
                  const status = dictationResultsByWordId[w.id];
                  const isCurrent = idx === dictationWordIdx;
                  let pillClass =
                    'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-[#57534E] dark:text-[#A8A29E]';
                  if (status === 'correct') {
                    pillClass =
                      'border-[#2D6A4F] bg-emerald-50 dark:bg-emerald-950/50 text-[#2D6A4F] dark:text-emerald-300 font-semibold';
                  } else if (status === 'wrong') {
                    pillClass =
                      'border-[#9E2A2B] bg-red-50 dark:bg-red-950/50 text-[#9E2A2B] dark:text-red-300 font-semibold';
                  }
                  if (isCurrent) {
                    pillClass += ' ring-2 ring-[#9E2A2B]';
                  }

                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleSelectDictationWord(idx, true)}
                      className={`min-h-[36px] px-3 py-1 rounded-lg border font-ipa text-xs transition-all inline-flex items-center gap-1 ${pillClass}`}
                    >
                      <span>Word {String(idx + 1).padStart(2, '0')}</span>
                      {status === 'correct' && <span>✓</span>}
                      {status === 'wrong' && <span>✗</span>}
                    </button>
                  );
                })}
              </div>

              {/* Dictation Audio Controls + Clues */}
              <div className="p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          currentDictationWord.word,
                          `dictation-${currentDictationWord.id}`,
                          preferredSpeechRate
                        )
                      }
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs sm:text-sm font-semibold hover:bg-[#872223] inline-flex items-center gap-2"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>Play Word Audio (1.0x)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          currentDictationWord.word,
                          `dictation-slow-${currentDictationWord.id}`,
                          0.6
                        )
                      }
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1.5"
                    >
                      <Turtle className="w-4 h-4 text-[#D97706]" />
                      <span>Slow Audio (0.65x)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleSpeak(
                          currentDictationWord.englishExample,
                          `dictation-sent-${currentDictationWord.id}`,
                          preferredSpeechRate
                        )
                      }
                      className="min-h-[44px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] inline-flex items-center gap-1.5"
                    >
                      <Volume2 className="w-4 h-4 text-[#9E2A2B]" />
                      <span>Hear in Context Sentence</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDictationShowHint((prev) => !prev)}
                    className="min-h-[38px] px-3 py-1.5 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-medium text-[#57534E] dark:text-[#A8A29E]"
                  >
                    {dictationShowHint ? 'Hide Letter Hint' : 'Show First-Letter Hint'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E7E0D6] dark:border-[#2E2924] text-xs">
                  <div>
                    <span className="text-[#57534E] dark:text-[#A8A29E]">Nepali Meaning: </span>
                    <strong className="font-nepali text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                      {currentDictationWord.nepaliMeaning}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#57534E] dark:text-[#A8A29E]">Phonics & IPA Clue: </span>
                    <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {currentDictationWord.ipa} ({currentDictationWord.partOfSpeech})
                    </span>{' '}
                    ·{' '}
                    <span className="text-[#9E2A2B] dark:text-[#F87171] font-semibold">
                      {currentDictationWord.silentLettersSummary}
                    </span>
                  </div>
                </div>

                {dictationShowHint && (
                  <div className="p-3 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] font-ipa text-xs text-[#1C1917] dark:text-[#F5F2EB]">
                    Letter Clue: Starts with <strong>“{currentDictationWord.word.charAt(0)}”</strong> ·{' '}
                    <strong>{currentDictationWord.word.length} letters</strong> total (
                    {currentDictationWord.word
                      .split('')
                      .map((ch, i) => (i === 0 || i === currentDictationWord.word.length - 1 ? ch : '_'))
                      .join(' ')}
                    )
                  </div>
                )}

                {/* User Text Input Form */}
                <form onSubmit={handleCheckDictationSubmit} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={dictationInput}
                    onChange={(e) => setDictationInput(e.target.value)}
                    disabled={dictationChecked}
                    placeholder="Type the word you heard..."
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] font-ipa text-base text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#9E2A2B]"
                  />

                  {!dictationChecked ? (
                    <button
                      type="submit"
                      disabled={!dictationInput.trim()}
                      className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs sm:text-sm font-semibold disabled:opacity-40 shrink-0"
                    >
                      Check Spelling
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setDictationChecked(false);
                          setDictationInput('');
                        }}
                        className="min-h-[48px] px-4 py-2.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]"
                      >
                        Retry Word
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          handleSelectDictationWord(
                            (dictationWordIdx + 1) % lecture.moduleA_vocabulary.length,
                            true
                          )
                        }
                        className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#9E2A2B] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5"
                      >
                        <span>Next Word</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </form>

                {/* Instant Character-by-Character Feedback */}
                {dictationChecked && (
                  <div
                    className={`p-4 rounded-xl border space-y-3 ${
                      dictationInput.trim().toLowerCase() ===
                      currentDictationWord.word.trim().toLowerCase()
                        ? 'animate-correct-pop bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                        : 'animate-wrong-shake bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      {dictationInput.trim().toLowerCase() ===
                      currentDictationWord.word.trim().toLowerCase() ? (
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#2D6A4F] dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Exact Spelling Match! Great ear for silent letters.</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                          <XCircle className="w-4 h-4" />
                          <span>
                            Spelling Difference Detected (Automatically added to Mistake Notes)
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Letter-by-Letter Diff Comparison */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#57534E]">Your Input:</span>
                        <div className="inline-flex items-center gap-1 font-ipa">
                          {dictationInput
                            .trim()
                            .split('')
                            .map((ch, idx) => {
                              const targetCh = currentDictationWord.word.charAt(idx);
                              const matches =
                                targetCh && ch.toLowerCase() === targetCh.toLowerCase();
                              return (
                                <span
                                  key={idx}
                                  className={`px-1.5 py-0.5 rounded font-bold ${
                                    matches
                                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-[#2D6A4F] dark:text-emerald-300'
                                      : 'bg-red-100 dark:bg-red-900/60 text-[#9E2A2B] dark:text-red-300 underline'
                                  }`}
                                >
                                  {ch}
                                </span>
                              );
                            })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-[#57534E]">Target Word (Silent in Crimson):</span>
                        <span className="text-lg font-bold font-ipa text-[#1C1917] dark:text-[#F5F2EB]">
                          {currentDictationWord.segments?.map((seg, idx) =>
                            seg.silent ? (
                              <span
                                key={idx}
                                className="text-[#9E2A2B] dark:text-[#F87171] bg-[#9E2A2B]/15 underline decoration-dotted px-0.5 rounded"
                              >
                                {seg.text}
                              </span>
                            ) : (
                              <span key={idx}>{seg.text}</span>
                            )
                          )}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                      <strong className="text-[#1C1917] dark:text-[#F5F2EB]">Phonics Note: </strong>
                      {ENGLISH_USAGE_TIPS[currentDictationWord.id] && !isFullNepali
                        ? ENGLISH_USAGE_TIPS[currentDictationWord.id]
                        : currentDictationWord.usageTipNepali}
                    </p>

                    {/* Quick Mistake Note Input right inside Dictation Feedback */}
                    <div className="pt-2 border-t border-[#E7E0D6]/80 dark:border-[#2E2924] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={dictationNoteDraft}
                        onChange={(e) => {
                          setDictationNoteDraft(e.target.value);
                          setDictationNoteSaved(false);
                        }}
                        placeholder={`Add a personal mistake note for "${currentDictationWord.word}" (e.g., remember ${currentDictationWord.silentLettersSummary})...`}
                        className="flex-1 min-h-[38px] px-3 py-1.5 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#1C1917] dark:text-[#F5F2EB]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveDictationMistakeNote}
                        disabled={!dictationNoteDraft.trim()}
                        className="min-h-[38px] px-4 py-1.5 rounded-lg bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold disabled:opacity-40 shrink-0"
                      >
                        {dictationNoteSaved ? '✓ Saved to Mistake Notes' : 'Save to Mistake Notes'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Interactive Spelling Mini-Quizzes */}
          <div className="card p-[1rem] sm:p-[1.5rem]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Interactive Spelling Drills
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                  Choose the correct spelling. Any missed item is automatically saved to your Mistake Notes below for re-drilling.
                </p>
              </div>
              <div className="font-ipa text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Score: {spellingCorrectCount} / {spellingQuizzes.length}
              </div>
            </div>

            <div className="space-y-5">
              {spellingQuizzes.map((quiz, qIdx) => {
                const selected = spellingAnswers[quiz.id];
                const isCorrect = selected === quiz.correctAnswer;
                const englishQuizExpl = ENGLISH_QUIZ_EXPLANATIONS[quiz.id];

                return (
                  <div
                    key={quiz.id}
                    className="p-[1rem] sm:p-[1.25rem] rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]"
                  >
                    <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mb-1">
                      Question 0{qIdx + 1} ·{' '}
                      {quiz.type === 'fill-blank' ? 'Fill in the Blank' : 'Spot the Correct Spelling'}
                    </div>
                    <p className="text-[0.9375rem] sm:text-[1rem] font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-3">
                      {quiz.promptEnglish}
                    </p>
                    {isFullNepali && (
                      <p className="font-nepali text-sm text-[#57534E] dark:text-[#A8A29E] mb-3">
                        {quiz.promptNepaliHint}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {quiz.options.map((opt) => {
                        const isThisSelected = selected === opt;
                        const isThisRight = opt === quiz.correctAnswer;

                        let btnStyle =
                          'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]';

                        if (selected) {
                          if (isThisRight) {
                            btnStyle = `bg-emerald-50 dark:bg-emerald-950/50 border-[#2D6A4F] text-[#2D6A4F] dark:text-emerald-300 font-semibold ${
                              isThisSelected ? 'animate-correct-pop' : ''
                            }`;
                          } else if (isThisSelected && !isThisRight) {
                            btnStyle =
                              'bg-red-50 dark:bg-red-950/50 border-[#9E2A2B] text-[#9E2A2B] dark:text-red-300 line-through animate-wrong-shake';
                          }
                        }

                        return (
                          <button
                            key={opt}
                            onClick={() => handleSelectSpellingAnswer(quiz, opt)}
                            className={`min-h-[2.75rem] px-[1rem] py-[0.625rem] rounded-xl border text-left font-ipa text-sm transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {selected && isThisRight && (
                              <span className="text-xs font-sans font-semibold inline-flex items-center gap-1">
                                <Check className="w-4 h-4" /> Correct
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selected && (
                      <div
                        className={`mt-4 p-3.5 rounded-xl border text-xs sm:text-sm animate-fade-up ${
                          isCorrect
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                        }`}
                      >
                        <div className="font-semibold mb-0.5">
                          {isCorrect
                            ? '✓ Correct Spelling!'
                            : `✗ Correct Answer: "${quiz.correctAnswer}" (Added to Mistake Notes)`}
                        </div>
                        <p className={isFullNepali ? 'font-nepali' : ''}>
                          {englishQuizExpl && !isFullNepali
                            ? englishQuizExpl
                            : quiz.commonMistakeExplanationNepali}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Embedded Lecture Mistake Notes Section in Step 03 */}
          {renderMistakeNotesSection()}

          {/* Step 03 navigation is handled by the unified Sticky Bottom Action Bar */}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODULE D: GRAMMAR CAPSTONE & INTERACTIVE SENTENCE BUILDER             */}
      {/* ===================================================================== */}
      {activeModule === 3 && (
        <div className="space-y-6 animate-fade-up">
          <div className="card p-[1rem] sm:p-[1.5rem]">
            <div className="flex items-center gap-2 text-xs font-medium text-[#9E2A2B] dark:text-[#F87171] mb-1">
              <Languages className="w-4 h-4" />
              <span>04. Practical Grammar Capstone & Sentence Builder</span>
            </div>
            <h2 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
              {lecture.moduleD_grammar.topicTitle}
            </h2>
            {isFullNepali && (
              <p className="font-nepali text-[0.875rem] sm:text-[1rem] font-medium text-[#57534E] dark:text-[#A8A29E] mb-3">
                {lecture.moduleD_grammar.nepaliTopicTitle}
              </p>
            )}

            {englishGrammar && !isFullNepali ? (
              <p className="text-sm sm:text-base text-[#1C1917] dark:text-[#F5F2EB] whitespace-pre-line leading-relaxed mb-5">
                {englishGrammar.explanationEnglish}
              </p>
            ) : (
              <p className="font-nepali text-sm sm:text-base text-[#1C1917] dark:text-[#F5F2EB] whitespace-pre-line mb-5">
                {lecture.moduleD_grammar.explanationNepali}
              </p>
            )}

            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
              <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
                Key Grammar Rules to Remember:
              </div>
              <ul className="space-y-1.5">
                {(englishGrammar && !isFullNepali
                  ? englishGrammar.keyTakeawaysEnglish
                  : lecture.moduleD_grammar.keyTakeawaysNepali
                ).map((point, idx) => (
                  <li
                    key={idx}
                    className={`text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] flex items-start gap-2 ${
                      isFullNepali ? 'font-nepali' : ''
                    }`}
                  >
                    <span className="text-[#9E2A2B] font-bold">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Interactive Sentence Structure Mapper */}
          <div className="card p-[1rem] sm:p-[1.5rem]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Interactive Sentence Structure Breakdown
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                  Click any grammatical block (Subject, Verb, Object, Modifier) to highlight its position in English vs. Nepali.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {languageMode === 'english-only' && (
                  <button
                    onClick={() => setShowSyntaxNepali((prev) => !prev)}
                    className="min-h-[38px] px-3 py-1 rounded-lg text-xs font-medium border border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E] inline-flex items-center gap-1.5"
                  >
                    {showSyntaxNepali ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showSyntaxNepali ? 'Hide Nepali Comparison' : 'Compare with Nepali Order'}</span>
                  </button>
                )}

                {(['Subject', 'Verb', 'Object', 'Modifier'] as GrammaticalRole[]).map((role) => {
                  const active = highlightedRole === role;
                  return (
                    <button
                      key={role}
                      onClick={() => setHighlightedRole(active ? null : role)}
                      className={`min-h-[38px] px-3 py-1 rounded-lg text-xs font-medium border transition-all whitespace-nowrap shrink-0 ${
                        active
                          ? 'bg-[#1C1917] text-white dark:bg-[#F5F2EB] dark:text-[#1C1917] border-transparent'
                          : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                      }`}
                    >
                      {isFullNepali ? ROLE_STYLES[role].labelNepali : ROLE_STYLES[role].label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5">
              {lecture.moduleD_grammar.syntaxComparisons.map((comp) => {
                const englishNote = englishGrammar?.comparisonNotesEnglish[comp.id];

                return (
                  <div
                    key={comp.id}
                    className="p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                        {comp.contextLabel}
                      </span>
                      <button
                        onClick={() =>
                          handleSpeak(comp.englishFullSentence || '', `${comp.id}-audio`, preferredSpeechRate)
                        }
                        className="min-h-[38px] px-3 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-medium inline-flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                        <span>Listen English</span>
                      </button>
                    </div>

                    <div
                      className={`grid grid-cols-1 ${
                        showSyntaxNepali ? 'md:grid-cols-2' : ''
                      } gap-4`}
                    >
                      <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924]">
                        <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mb-2">
                          English Structure: <strong className="font-ipa">{comp.englishOrderFormula}</strong>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {comp.tokens.map((tok, tIdx) => {
                            const style = ROLE_STYLES[tok.role] || ROLE_STYLES.Modifier;
                            const isHighlighted = highlightedRole === tok.role;
                            return (
                              <button
                                key={tIdx}
                                onClick={() => setHighlightedRole(tok.role)}
                                className={`px-3 py-2 rounded-lg border text-left transition-all ${
                                  style.border
                                } ${isHighlighted ? style.activeBg : style.bg}`}
                              >
                                <div className={`text-sm font-semibold ${style.text}`}>
                                  {tok.englishText}
                                </div>
                                <div className="text-[10px] text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                                  {tok.role}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {showSyntaxNepali && (
                        <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924]">
                          <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mb-2">
                            Nepali Comparison: <strong className="font-nepali">{comp.nepaliOrderFormula}</strong>
                          </div>
                          <p className="font-nepali text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
                            “{comp.nepaliFullSentence}”
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {comp.tokens.map((tok, tIdx) => {
                              const style = ROLE_STYLES[tok.role] || ROLE_STYLES.Modifier;
                              const isHighlighted = highlightedRole === tok.role;
                              return (
                                <button
                                  key={tIdx}
                                  onClick={() => setHighlightedRole(tok.role)}
                                  className={`px-3 py-1.5 rounded-lg border text-left transition-all ${
                                    style.border
                                  } ${isHighlighted ? style.activeBg : style.bg}`}
                                >
                                  <div className={`font-nepali text-xs sm:text-sm font-semibold ${style.text}`}>
                                    {tok.nepaliText}
                                  </div>
                                  <div className="text-[10px] text-[#57534E] dark:text-[#A8A29E]">
                                    {isFullNepali ? tok.nepaliRoleLabel : tok.role}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <p
                      className={`text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] ${
                        isFullNepali ? 'font-nepali' : ''
                      }`}
                    >
                      <strong className="text-[#1C1917] dark:text-[#F5F2EB]">Takeaway: </strong>
                      {englishNote && !isFullNepali ? englishNote : comp.structuralNoteNepali}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================================================================= */}
          {/* INTERACTIVE SENTENCE BUILDER (REORDER PHRASE TILES)               */}
          {/* ================================================================= */}
          {scrambledBuilders.length > 0 && (
            <div className="card p-[1rem] sm:p-[1.5rem] space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                  <Puzzle className="w-4 h-4" />
                  <span>Interactive English Sentence Builder (SVO Word-Order Lab)</span>
                </div>
                <h3 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                  Tap the Scrambled Phrase Tiles to Construct the English Sentence
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                  Translate the Nepali thought into natural English word order by tapping the color-coded grammatical blocks in sequence.
                </p>
              </div>

              <div className="space-y-5">
                {scrambledBuilders.map(({ exercise, scrambledTiles, targetSentence }, bIdx) => {
                  const placed = builderPlacedIndices[exercise.id] || [];
                  const isChecked = Boolean(builderChecked[exercise.id]);
                  const builtWords = placed.map((idx) => scrambledTiles[idx]?.text || '');
                  const builtSentence = builtWords.join(' ').trim();
                  const isExactMatch =
                    builtSentence.toLowerCase() === targetSentence.toLowerCase();

                  return (
                    <div
                      key={exercise.id}
                      className="p-[1rem] sm:p-[1.25rem] rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-ipa font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                            Sentence Builder 0{bIdx + 1}
                          </span>
                          <span className="mx-2 text-xs text-[#57534E]">·</span>
                          <span className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                            {exercise.englishContextHint}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleSpeak(targetSentence, `${exercise.id}-listen`, preferredSpeechRate)
                          }
                          className="min-h-[2.25rem] px-[0.75rem] py-[0.25rem] rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                          <span>Hear Target Audio</span>
                        </button>
                      </div>

                      <div className="font-nepali text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        Prompt: “{exercise.nepaliPrompt}”
                      </div>

                      {/* Target Construction Tray */}
                      <div className="min-h-[4rem] p-3.5 rounded-xl bg-white dark:bg-[#1F1C18] border-2 border-dashed border-[#E7E0D6] dark:border-[#2E2924] flex flex-wrap items-center gap-2">
                        {placed.length === 0 ? (
                          <span className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                            Tap phrase blocks below in English SVO order to build your sentence here...
                          </span>
                        ) : (
                          placed.map((scrIdx, orderIdx) => {
                            const tile = scrambledTiles[scrIdx];
                            if (!tile) return null;
                            const style = ROLE_STYLES[tile.role] || ROLE_STYLES.Modifier;
                            return (
                              <button
                                key={`${scrIdx}-${orderIdx}`}
                                onClick={() => handleToggleBuilderTile(exercise.id, scrIdx)}
                                className={`px-3 py-1.5 rounded-lg border text-left transition-all ${style.border} ${style.bg}`}
                                title="Tap to remove block"
                              >
                                <div className={`text-xs sm:text-sm font-semibold ${style.text}`}>
                                  {tile.text}
                                </div>
                                <div className="text-[0.625rem] text-[#57534E] dark:text-[#A8A29E]">
                                  {tile.role}
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>

                      {/* Available Scrambled Tiles Pool */}
                      <div className="flex flex-wrap items-center gap-2">
                        {scrambledTiles.map((tile, scrIdx) => {
                          const isUsed = placed.includes(scrIdx);
                          const style = ROLE_STYLES[tile.role] || ROLE_STYLES.Modifier;
                          return (
                            <button
                              key={scrIdx}
                              onClick={() => handleToggleBuilderTile(exercise.id, scrIdx)}
                              disabled={isUsed}
                              className={`px-3.5 py-2 rounded-xl border text-left transition-all ${
                                isUsed
                                  ? 'opacity-30 border-[#E7E0D6] bg-transparent cursor-not-allowed'
                                  : `${style.border} ${style.bg} hover:scale-[1.02]`
                              }`}
                            >
                              <div className={`text-xs sm:text-sm font-semibold ${style.text}`}>
                                {tile.text}
                              </div>
                              <div className="text-[0.625rem] text-[#57534E] dark:text-[#A8A29E]">
                                {tile.role}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Builder Action Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <button
                          onClick={() => handleResetBuilder(exercise.id)}
                          className="min-h-[2.375rem] px-3.5 py-1.5 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Tiles</span>
                        </button>

                        <button
                          onClick={() => {
                            if (isExactMatch) {
                              speechService.playCorrectTone();
                            } else {
                              speechService.playWrongTone();
                            }
                            setBuilderChecked((prev) => ({ ...prev, [exercise.id]: true }));
                          }}
                          disabled={placed.length === 0}
                          className="min-h-[2.5rem] px-5 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold disabled:opacity-40"
                        >
                          Check Sentence Order
                        </button>
                      </div>

                      {isChecked && (
                        <div
                          className={`p-3.5 rounded-xl border text-xs sm:text-sm ${
                            isExactMatch
                              ? 'animate-correct-pop bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                              : 'animate-wrong-shake bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                          }`}
                        >
                          <div className="font-semibold mb-1">
                            {isExactMatch
                              ? '✓ Perfect English Sentence Order!'
                              : `Target Order: "${targetSentence}"`}
                          </div>
                          <p>{exercise.grammarTip}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Capstone Synthesis Exercises */}
          <div className="card p-[1rem] sm:p-[1.5rem]">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
              <div>
                <h3 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Capstone Synthesis Exercises
                </h3>
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                  Apply the vocabulary, spelling rules, and grammar structures from this lecture.
                </p>
              </div>
              <div className="font-ipa text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Capstone Score: {grammarCorrectCount} / {grammarExercises.length}
              </div>
            </div>

            <div className="space-y-5">
              {grammarExercises.map((ex, idx) => {
                const selected = grammarAnswers[ex.id];
                const isCorrect = selected === ex.correctAnswer;
                const englishExExpl = englishGrammar?.exerciseExplanationsEnglish[ex.id];

                return (
                  <div
                    key={ex.id}
                    className="p-[1rem] sm:p-[1.25rem] rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]"
                  >
                    <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mb-1">
                      Capstone Challenge 0{idx + 1}
                    </div>
                    <p className="text-[0.9375rem] sm:text-[1rem] font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-3">
                      {ex.questionPrompt}
                    </p>
                    {isFullNepali && (
                      <p className="font-nepali text-sm text-[#57534E] dark:text-[#A8A29E] mb-3">
                        {ex.nepaliContext}
                      </p>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ex.options.map((opt) => {
                        const isThisSelected = selected === opt;
                        const isThisRight = opt === ex.correctAnswer;

                        let btnStyle =
                          'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]';

                        if (selected) {
                          if (isThisRight) {
                            btnStyle = `bg-emerald-50 dark:bg-emerald-950/50 border-[#2D6A4F] text-[#2D6A4F] dark:text-emerald-300 font-semibold ${
                              isThisSelected ? 'animate-correct-pop' : ''
                            }`;
                          } else if (isThisSelected && !isThisRight) {
                            btnStyle =
                              'bg-red-50 dark:bg-red-950/50 border-[#9E2A2B] text-[#9E2A2B] dark:text-red-300 line-through animate-wrong-shake';
                          }
                        }

                        return (
                          <button
                            key={opt}
                            onClick={() => handleSelectGrammarAnswer(ex, opt)}
                            className={`min-h-[2.75rem] px-[1rem] py-[0.625rem] rounded-xl border text-left text-sm transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {selected && isThisRight && (
                              <span className="text-xs font-semibold inline-flex items-center gap-1 shrink-0">
                                <Check className="w-4 h-4" /> Correct
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selected && (
                      <div
                        className={`mt-4 p-3.5 rounded-xl border text-xs sm:text-sm animate-fade-up ${
                          isCorrect
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                        }`}
                      >
                        <div className="font-semibold mb-0.5">
                          {isCorrect
                            ? '✓ Spot On!'
                            : `✗ Correct Answer: "${ex.correctAnswer}" (Added to Mistake Notes)`}
                        </div>
                        <p className={isFullNepali ? 'font-nepali' : ''}>
                          {englishExExpl && !isFullNepali ? englishExExpl : ex.explanationNepali}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 04 navigation is handled by the unified Sticky Bottom Action Bar */}
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODULE E (STEP 05): REAL-LIFE CONVERSATION DIALOGUE LAB               */}
      {/* ===================================================================== */}
      {activeModule === 4 && (
        <div className="space-y-6 animate-fade-up">
          {/* Dialogue header + player: artifact dark espresso card */}
          <div className="rounded-[22px] bg-[#1C1917] dark:bg-[#0F0D0B] dark:border dark:border-[#2E2924] text-[#F5F2EB] p-4 sm:p-6 [&_h2]:!text-[#F5F2EB] [&_h2]:font-serif [&_p]:!text-[#C9C1B4] [&_strong]:!text-[#F5F2EB]">
            <div className="flex flex-col gap-4 pb-5 border-b border-[#3A332C]">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.12em] uppercase text-[#E9C77B] mb-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>05. Real-Life Conversation Dialogue & Comprehension</span>
                </div>
                <h2 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  {lecture.moduleE_dialogue?.title || `Real-Life Conversation: ${lecture.title}`}
                </h2>
                {showDialogueNepali && lecture.moduleE_dialogue?.nepaliTitle && (
                  <p className="font-nepali text-sm font-medium text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                    {lecture.moduleE_dialogue.nepaliTitle}
                  </p>
                )}
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1.5">
                  <strong className="text-[#1C1917] dark:text-[#F5F2EB]">Context: </strong>
                  {lecture.moduleE_dialogue?.setting ||
                    'Read and listen to how the target silent-letter words and grammar structures from this lecture are used in natural conversation.'}
                </p>
                {showDialogueNepali && lecture.moduleE_dialogue?.nepaliSetting && (
                  <p className="font-nepali text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                    {lecture.moduleE_dialogue.nepaliSetting}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {lecture.moduleE_dialogue && (
                  <>
                    {(
                      [
                        { rate: 1.0 as const, label: '1.0x Natural' },
                        { rate: 0.75 as const, label: '0.75x Careful' },
                        { rate: 0.5 as const, label: '0.5x Phoneme Slow' },
                      ]
                    ).map((btn) => {
                      const activeThisSpeed =
                        isPlayingFullDialogue && dialoguePlaybackRate === btn.rate;
                      return (
                        <button
                          key={btn.rate}
                          onClick={() => handlePlayFullDialogue(btn.rate)}
                          className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                            activeThisSpeed
                              ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                              : btn.rate === dialoguePlaybackRate && !isPlayingFullDialogue
                              ? 'bg-[#E9C77B] text-[#1C1917] border-[#E9C77B] hover:bg-[#F1D592]'
                              : 'border-[#3A332C] bg-[#2A2520] text-[#F5F2EB] hover:border-[#E9C77B]'
                          }`}
                        >
                          {activeThisSpeed ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-current" />
                              <span>Stop ({btn.rate}x)</span>
                            </>
                          ) : btn.rate === 1.0 ? (
                            <>
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>{btn.label}</span>
                            </>
                          ) : (
                            <>
                              <Turtle className="w-3.5 h-3.5 text-current" />
                              <span>{btn.label}</span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </>
                )}

                <button
                  onClick={() => setShowDialogueNepali((prev) => !prev)}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-[#3A332C] bg-[#2A2520] text-xs font-medium text-[#F5F2EB] hover:border-[#E9C77B] inline-flex items-center gap-1.5"
                >
                  {showDialogueNepali ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Hide Nepali</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Show Nepali</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Interactive Two-Person Role-Play & Shadowing Selector (Listen -> Record -> Compare) */}
            {lecture.moduleE_dialogue && lecture.moduleE_dialogue.lines.length >= 2 && (
              <div className="mt-4 pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-[#57534E] dark:text-[#A8A29E]">
                  <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                    Dialogue Shadowing Mode (Listen → Record → Compare):
                  </strong>{' '}
                  Pick Speaker A ({lecture.moduleE_dialogue.lines[0]?.speaker}) or Speaker B (
                  {lecture.moduleE_dialogue.lines[1]?.speaker}) and click Play — the app speaks your partner&apos;s line and records your voice on your turn!
                </span>
                <div className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
                  {(
                    [
                      { id: 'off', label: 'Listen Both Voices' },
                      {
                        id: 'A',
                        label: `Shadow as ${lecture.moduleE_dialogue.lines[0]?.speaker || 'Speaker A'}`,
                      },
                      {
                        id: 'B',
                        label: `Shadow as ${lecture.moduleE_dialogue.lines[1]?.speaker || 'Speaker B'}`,
                      },
                    ] as const
                  ).map((rp) => (
                    <button
                      key={rp.id}
                      type="button"
                      onClick={() => setRolePlaySpeaker(rp.id)}
                      className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        rolePlaySpeaker === rp.id
                          ? 'bg-white dark:bg-[#1F1C18] text-[#9E2A2B] dark:text-[#F87171] shadow-xs'
                          : 'text-[#57534E] dark:text-[#A8A29E]'
                      }`}
                    >
                      {rp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Full-Dialogue Playback Indicator Bar */}
            {isPlayingFullDialogue &&
              activeDialogueLineIdx !== null &&
              lecture.moduleE_dialogue?.lines[activeDialogueLineIdx] && (
                <div className="mt-4 p-3.5 rounded-xl bg-[#9E2A2B]/10 dark:bg-[#9E2A2B]/20 border border-[#9E2A2B]/30 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 text-xs font-semibold text-[#9E2A2B] dark:text-[#FCA5A5]">
                    <Volume2 className="w-4 h-4 animate-pulse shrink-0" />
                    <span>
                      Playing Turn {activeDialogueLineIdx + 1} of{' '}
                      {lecture.moduleE_dialogue.lines.length}:{' '}
                      {lecture.moduleE_dialogue.lines[activeDialogueLineIdx].speaker} (
                      {lecture.moduleE_dialogue.lines[activeDialogueLineIdx].role})
                    </span>
                  </div>
                  <span className="font-ipa text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                    Speed: {dialoguePlaybackRate === 0.75 ? '0.75x Slow' : dialoguePlaybackRate === 0.5 ? '0.5x Slow' : '1.0x Natural'}
                  </span>
                </div>
              )}

            {micError && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* Dialogue Turn Cards */}
            {lecture.moduleE_dialogue && lecture.moduleE_dialogue.lines.length > 0 ? (
              <div className="space-y-4 pt-5">
                {lecture.moduleE_dialogue.lines.map((line, idx) => {
                  const lineId = `dlg-${lecture.id}-${idx}`;
                  const isLineActive =
                    activeDialogueLineIdx === idx ||
                    speakingId === `${lineId}-norm` ||
                    speakingId === `${lineId}-slow`;
                  const isEven = idx % 2 === 0;
                  const speakerIdx = (idx % 2) as 0 | 1;
                  const isListeningThisLine = listeningDialogueLineIdx === idx;
                  const lineMicResult = dialogueMicResults[idx];

                  return (
                    <div
                      key={lineId}
                      className={`p-5 rounded-2xl border transition-all ${
                        isLineActive
                          ? 'border-[#9E2A2B] bg-[#9E2A2B]/5 dark:bg-[#9E2A2B]/15 ring-1 ring-[#9E2A2B]'
                          : isEven
                          ? 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210]'
                          : 'border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18]'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                              isEven
                                ? 'bg-[#9E2A2B] text-white'
                                : 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917]'
                            }`}
                          >
                            {line.speaker.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              {line.speaker}
                            </span>
                            <span className="mx-1.5 text-xs text-[#57534E]">·</span>
                            <span className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                              {line.role}
                            </span>
                            <span className="mx-1.5 text-xs text-[#57534E]">·</span>
                            <span className="font-ipa text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                              Turn 0{idx + 1}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            onClick={() =>
                              handleSpeak(
                                line.english,
                                `${lineId}-norm`,
                                preferredSpeechRate,
                                speakerIdx
                              )
                            }
                            className={`min-h-[36px] px-3 py-1 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                              speakingId === `${lineId}-norm`
                                ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                                : 'border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B] dark:text-[#F87171]" />
                            <span>Listen Line</span>
                          </button>

                          <button
                            onClick={() =>
                              handleSpeak(line.english, `${lineId}-slow`, 0.65, speakerIdx)
                            }
                            className={`min-h-[36px] px-2.5 py-1 rounded-lg border text-xs font-medium inline-flex items-center gap-1 transition-colors ${
                              speakingId === `${lineId}-slow`
                                ? 'bg-[#D97706] text-white border-[#D97706]'
                                : 'border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-[#57534E] dark:text-[#A8A29E]'
                            }`}
                          >
                            <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                            <span>0.65x</span>
                          </button>

                          <button
                            onClick={() => handleDialogueLineMicPractice(idx, line.english)}
                            disabled={isListeningThisLine}
                            className={`min-h-[36px] px-3 py-1 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
                              isListeningThisLine
                                ? 'bg-[#9E2A2B] text-white border-[#9E2A2B] animate-pulse'
                                : 'border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]'
                            }`}
                          >
                            <Mic className="w-3.5 h-3.5 text-[#9E2A2B] dark:text-[#F87171]" />
                            <span>{isListeningThisLine ? 'Listening...' : 'Speak Line'}</span>
                          </button>
                        </div>
                      </div>

                      <p className="text-sm sm:text-base font-medium text-[#1C1917] dark:text-[#F5F2EB] leading-relaxed mb-2">
                        “{line.english}”
                      </p>

                      {showDialogueNepali && (
                        <p className="font-nepali text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mb-2">
                          “{line.nepali}”
                        </p>
                      )}

                      {lineMicResult && (
                        <div
                          className={`mt-2 mb-2 p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                            lineMicResult.passed
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                              : 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                          }`}
                        >
                          <span>
                            {lineMicResult.passed ? '✓ Great role-play delivery! ' : 'Keep practicing! '}
                            You said: “{lineMicResult.transcript}”
                          </span>
                          <span className="font-ipa font-semibold shrink-0">
                            {lineMicResult.score}% Match
                          </span>
                        </div>
                      )}

                      {line.highlightedWords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[#E7E0D6]/60 dark:border-[#2E2924]">
                          <span className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                            Tap Key Words for Phonetics:
                          </span>
                          {line.highlightedWords.map((hw, hIdx) => {
                            const matchedVocab = lecture.moduleA_vocabulary.find(
                              (v) => v.word.toLowerCase() === hw.toLowerCase()
                            );
                            if (matchedVocab) {
                              return (
                                <WordPhoneticsPopover
                                  key={hIdx}
                                  word={matchedVocab.word}
                                  ipa={matchedVocab.ipa}
                                  partOfSpeech={matchedVocab.partOfSpeech}
                                  nepaliMeaning={matchedVocab.nepaliMeaning}
                                  silentLettersSummary={matchedVocab.silentLettersSummary}
                                  englishExample={matchedVocab.englishExample}
                                  segments={matchedVocab.segments}
                                  isSaved={savedWordIds.includes(matchedVocab.id)}
                                  preferredSpeechRate={preferredSpeechRate}
                                  onToggleSave={() => onToggleSaveWord(matchedVocab.id)}
                                >
                                  <button
                                    type="button"
                                    className="text-[11px] font-ipa font-semibold text-[#9E2A2B] dark:text-[#F87171] bg-[#9E2A2B]/10 hover:bg-[#9E2A2B]/20 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 transition-colors"
                                  >
                                    <Volume2 className="w-3 h-3" />
                                    <span>{hw}</span>
                                    <span className="opacity-75 font-normal">
                                      ({matchedVocab.ipa})
                                    </span>
                                  </button>
                                </WordPhoneticsPopover>
                              );
                            }
                            return (
                              <button
                                key={hIdx}
                                type="button"
                                onClick={() =>
                                  handleSpeak(hw, `${lineId}-hw-${hIdx}`, preferredSpeechRate)
                                }
                                className="text-[11px] font-ipa font-semibold text-[#9E2A2B] dark:text-[#F87171] bg-[#9E2A2B]/10 hover:bg-[#9E2A2B]/20 px-2.5 py-0.5 rounded-md inline-flex items-center gap-1 transition-colors"
                              >
                                <Volume2 className="w-3 h-3" />
                                <span>{hw}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-[#57534E] dark:text-[#A8A29E]">
                Practice speaking the example sentences from Module A aloud to reinforce your situational fluency.
              </div>
            )}
          </div>

          {/* ================================================================= */}
          {/* DIALOGUE COMPREHENSION QUESTIONS SECTION                          */}
          {/* ================================================================= */}
          {dialogueQuestions.length > 0 && (
            <div className="card p-[1rem] sm:p-[1.5rem] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E7E0D6] dark:border-[#2E2924] pb-4">
                <div>
                  <div className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] mb-0.5">
                    Reading & Listening Comprehension Check
                  </div>
                  <h3 className="fluid-title-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    Dialogue Comprehension Questions
                  </h3>
                  <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                    Answer these context-specific questions based on the conversation above to test your understanding of the dialogue, silent-letter vocabulary, and grammar in action.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] font-ipa text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    Comprehension Score: {dialogueCorrectCount} / {dialogueQuestions.length}
                  </div>
                  {Object.keys(dialogueAnswers).length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDialogueAnswers({})}
                      className="min-h-[2.375rem] px-3 py-1.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Quiz</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-5">
                {dialogueQuestions.map((q, qIdx) => {
                  const selected = dialogueAnswers[q.id];
                  const isCorrect = selected === q.correctAnswer;

                  return (
                    <div
                      key={q.id}
                      className="p-[1rem] sm:p-[1.25rem] rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-ipa text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                          Comprehension Question 0{qIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleSpeak(q.question, `${q.id}-speak`, preferredSpeechRate)
                          }
                          className="min-h-[2rem] px-2.5 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-[0.6875rem] font-medium inline-flex items-center gap-1 text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917]"
                        >
                          <Volume2 className="w-3 h-3 text-[#9E2A2B]" />
                          <span>Listen Question</span>
                        </button>
                      </div>

                      <p className="text-[0.9375rem] sm:text-[1rem] font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-1.5">
                        {q.question}
                      </p>

                      {showDialogueNepali && q.nepaliQuestion && (
                        <p className="font-nepali text-sm text-[#57534E] dark:text-[#A8A29E] mb-3.5">
                          {q.nepaliQuestion}
                        </p>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3">
                        {q.options.map((opt) => {
                          const isThisSelected = selected === opt;
                          const isThisRight = opt === q.correctAnswer;

                          let btnStyle =
                            'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]';

                          if (selected) {
                            if (isThisRight) {
                              btnStyle = `bg-emerald-50 dark:bg-emerald-950/50 border-[#2D6A4F] text-[#2D6A4F] dark:text-emerald-300 font-semibold ${
                                isThisSelected ? 'animate-correct-pop' : ''
                              }`;
                            } else if (isThisSelected && !isThisRight) {
                              btnStyle =
                                'bg-red-50 dark:bg-red-950/50 border-[#9E2A2B] text-[#9E2A2B] dark:text-red-300 line-through animate-wrong-shake';
                            }
                          }

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleSelectDialogueAnswer(q, opt)}
                              className={`min-h-[2.875rem] px-[1rem] py-[0.625rem] rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {selected && isThisRight && (
                                <span className="text-xs font-semibold inline-flex items-center gap-1 shrink-0">
                                  <Check className="w-4 h-4" /> Correct
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {selected && (
                        <div
                          className={`mt-4 p-3.5 rounded-xl border text-xs sm:text-sm space-y-1 animate-fade-up ${
                            isCorrect
                              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                          }`}
                        >
                          <div className="font-semibold">
                            {isCorrect
                              ? '✓ Spot On! You understood the dialogue context.'
                              : `✗ Correct Answer: "${q.correctAnswer}" (Saved to Mistake Notes)`}
                          </div>
                          <p>{q.explanationEnglish}</p>
                          {showDialogueNepali && q.explanationNepali && (
                            <p className="font-nepali opacity-90 pt-1 border-t border-current/15">
                              {q.explanationNepali}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 05 navigation is handled by the unified Sticky Bottom Action Bar */}
        </div>
      )}

      </div>

      {/* .lm-rail (desktop): notes, mistake notes, study cheat sheet */}
      <aside className="hidden xl:flex flex-col gap-3.5 sticky top-20 self-start" aria-label="Notes and tools">
        <section className="card !p-4 flex flex-col gap-2.5">
          <div className="sec">
            <h2 className="h3 inline-flex gap-2 items-center text-[#1C1917] dark:text-[#F5F2EB]">
              <span className="ico xs i-ochre">
                <FileText className="w-3.5 h-3.5" />
              </span>
              My lecture notes
            </h2>
            <span className="muted text-[11px]">{scratchpadDraft.trim().length} chars</span>
          </div>
          <textarea
            rows={5}
            aria-label="Lecture notes"
            value={scratchpadDraft}
            onChange={(e) => {
              const val = e.target.value;
              setScratchpadDraft(val);
              if (onUpdateLectureNote) {
                onUpdateLectureNote(lecture.id, val);
                setScratchpadSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
              }
            }}
            placeholder="Your own reminders, memory tricks, pronunciation cues…"
            className="w-full text-sm border border-[#DFD7C8] dark:border-[#3A332D] rounded-[14px] p-3 bg-[#FAF8F4] dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] resize-y focus:outline-none focus:border-[#9E2A2B]"
          />
          <span className="muted text-xs inline-flex gap-1.5 items-center">
            <Check className="w-3.5 h-3.5" />
            {scratchpadSavedAt ? `Auto-saved ${scratchpadSavedAt}` : 'Auto-saved'} · printed on your study sheet
          </span>
        </section>
        <section className="card !p-4 flex flex-col gap-2.5">
          <div className="sec">
            <h2 className="h3 inline-flex gap-2 items-center text-[#1C1917] dark:text-[#F5F2EB]">
              <span className="ico xs i-crim">
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
              Mistake notes
            </h2>
            <span className="tag t-crim">{lectureMistakes.length}</span>
          </div>
          {lectureMistakes.length === 0 ? (
            <div className="tag t-sage !px-3 !py-2.5 !text-[13px] !whitespace-normal">
              <CheckCircle2 className="w-4 h-4" />
              No mistakes logged for this lecture yet
            </div>
          ) : (
            lectureMistakes.slice(0, 3).map((m) => (
              <div
                key={m.id}
                className="border border-[#EFE9DD] dark:border-[#2E2924] rounded-[14px] px-3 py-2.5 flex flex-col gap-2 bg-white dark:bg-[#141210]"
              >
                <div className="flex justify-between gap-2">
                  <span className="min-w-0">
                    <strong className="block text-sm text-[#1C1917] dark:text-[#F5F2EB] truncate">{m.correctAnswer}</strong>
                    <span className="muted block text-xs line-clamp-2">{m.userNote || m.explanation}</span>
                  </span>
                  <span className="muted text-[11px] whitespace-nowrap">{m.consecutiveCorrect}/2</span>
                </div>
                <span className="track !h-1">
                  <span className="fill" style={{ width: `${Math.min(100, (m.consecutiveCorrect / 2) * 100)}%`, background: '#2D6A4F' }} />
                </span>
              </div>
            ))
          )}
          <button
            type="button"
            onClick={() => {
              setShowMistakeNotesDrawer(true);
              window.scrollTo({ top: 0, behavior: scrollBehavior() });
            }}
            className="btn btn-g btn-sm"
          >
            <Plus className="w-4 h-4" />
            Re-drill & add notes
          </button>
        </section>
        <section className="card ink !p-4 flex flex-col gap-2.5">
          <h2 className="h3 inline-flex gap-2 items-center">
            <span className="ico xs bg-[#3A2F22] text-[#E9C77B] dark:bg-[#F2EBDC] dark:text-[#8C6527]">
              <Printer className="w-3.5 h-3.5" />
            </span>
            Study cheat sheet
          </h2>
          <div className="flex flex-col gap-1.5 text-[12.5px] leading-[1.5] text-[#C9C1B4] dark:text-[#57534E]">
            <span>
              <strong className="text-[#F5F2EB] dark:text-[#1C1917]">{lecture.moduleA_vocabulary.length} core words</strong> ·{' '}
              {lecture.moduleA_vocabulary.slice(0, 5).map((v) => v.word.toLowerCase()).join(', ')}…
            </span>
            <span>
              <strong className="text-[#F5F2EB] dark:text-[#1C1917]">Spelling</strong> · {lecture.moduleC_spelling.ruleTitle}
            </span>
            <span>
              <strong className="text-[#F5F2EB] dark:text-[#1C1917]">Grammar</strong> · {lecture.moduleD_grammar.topicTitle}
            </span>
            <span>
              <strong className="text-[#F5F2EB] dark:text-[#1C1917]">Your notes</strong> · {scratchpadDraft.trim() ? 'included' : 'none yet'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowCheatSheet(true)}
            className="btn bg-[#F5F2EB] text-[#1C1917] hover:bg-white dark:bg-[#1C1917] dark:text-[#F5F2EB]"
          >
            <Printer className="w-4 h-4" />
            Print / save PDF
          </button>
        </section>
      </aside>
      </div>

      {/* ===================================================================== */}
      {/* UNIFIED STICKY BOTTOM ACTION BAR (Mobile & Desktop Safe-Area Footer)  */}
      {/* ===================================================================== */}
      <div className="sticky bottom-16 md:bottom-0 z-30 -mx-[0.625rem] sm:-mx-[1rem] lg:-mx-[1.5rem] mt-6 bg-white dark:bg-[#1A1714] border-t border-[#EAE4D8] dark:border-[#2E2924] shadow-[0_-10px_24px_-18px_rgba(28,25,23,0.4)]">
        <div className="flex items-center gap-2.5 px-3.5 md:px-8 pt-2.5 pb-3 md:py-3 max-w-[1180px] mx-auto">
          <button
            type="button"
            aria-label="Previous step"
            disabled={activeModule === 0}
            onClick={() => {
              if (activeModule === 0) return;
              speechService.triggerHaptic('light');
              goToModule((activeModule - 1) as ModuleStep);
            }}
            className={`btn btn-g !min-h-[50px] !rounded-2xl !px-3.5 ${activeModule === 0 ? 'opacity-45 cursor-default' : ''}`}
          >
            <ArrowLeft className="w-[18px] h-[18px]" />
            <span className="hidden md:inline">Previous</span>
          </button>

          <div className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
            <span className="flex gap-[5px] items-center" aria-hidden="true">
              {MODULE_TABS.map((t) => {
                const done = isCompleted || completedSteps.includes(t.step);
                const cur = t.step === activeModule;
                return (
                  <span
                    key={t.step}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      cur ? 'w-[22px] bg-[#9E2A2B]' : done ? 'w-2 bg-[#2D6A4F]' : 'w-2 bg-[#E6E0D4] dark:bg-[#3A332D]'
                    }`}
                  />
                );
              })}
            </span>
            <span className="muted text-[11px] font-semibold truncate">
              Step {activeModule + 1} of 5 · {MODULE_TABS[activeModule].shortLabel}
            </span>
          </div>

          {activeModule < 4 ? (
            <button
              type="button"
              onClick={() => {
                speechService.triggerHaptic('light');
                toast.success(`Step ${MODULE_TABS[activeModule].number} completed`, {
                  duration: 2000,
                });
                goToModule((activeModule + 1) as ModuleStep, true);
              }}
              className="btn btn-p !min-h-[50px] !rounded-2xl"
            >
              <span className="md:hidden">Continue</span>
              <span className="hidden md:inline">Continue to step {activeModule + 2}</span>
              <ArrowRight className="w-[18px] h-[18px]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                speechService.playCelebrationChime();
                toast.success(`Lecture ${String(lecture.lectureNumber).padStart(2, '0')} Completed!`, {
                  description: 'Your progress and quiz scores have been saved.',
                });
                handleFinishLecture();
              }}
              className="btn btn-p !min-h-[50px] !rounded-2xl"
            >
              <span>Finish lecture</span>
              <CheckCircle2 className="w-[18px] h-[18px]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

