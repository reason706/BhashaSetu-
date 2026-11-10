import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  Turtle,
  Bookmark,
  BookOpen,
  BookmarkCheck,
  RotateCw,
  Layers,
  List,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  XCircle,
  Filter,
  Headphones,
  AlertTriangle,
  Sparkles,
  Trash2,
  Check,
  Play,
  Square,
  Radio,
  SkipForward,
  Printer,
  FileDown,
  Mic,
  Shuffle,
  Trophy,
  Loader2,
  ChevronDown,
  X,
  SlidersHorizontal,
  Timer,
} from 'lucide-react';
import {
  LectureUnit,
  LanguageMode,
  SRSRecord,
  SRSRating,
  MistakeItem,
} from '../types/curriculum';
import { speechService, PronunciationResult } from '../services/speech';
import { getMassiveLexicon, EnrichedLexiconItem } from '../data/massiveLexicon';
import {
  shuffleWithSeed,
  NAATI_TRANSLATION_BANK,
} from '../data/arenaPracticeSets';
import {
  PrintableStudySheetModal,
  StudySheetFocusMode,
} from './PrintableStudySheetModal';
import {
  exportSavedWordsToCSV,
  exportMistakeNotebookToCSV,
} from '../services/studySheetExport';
import {
  ResponsiveSelectSheet,
  WordPhoneticsPopover,
  SelectSheetOption,
} from './ui/ResponsivePrimitives';
import { scrollBehavior } from '../hooks/useModalBehavior';

interface DictionaryViewProps {
  lectures: LectureUnit[];
  savedWordIds: string[];
  masteredWordIds?: string[];
  wordSRS?: Record<string, SRSRecord>;
  mistakeNotebook?: MistakeItem[];
  preferredSpeechRate: number;
  languageMode: LanguageMode;
  initialLectureFilter?: number | null;
  onToggleSaveWord: (wordId: string) => void;
  onToggleMasteredWord?: (wordId: string) => void;
  onUpdateWordSRS?: (wordId: string, ratingOrCorrect: boolean | SRSRating) => void;
  onRecordMistake?: (mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>) => void;
  onPracticeMistake?: (mistakeId: string, wasCorrect: boolean) => void;
  onRemoveMistake?: (mistakeId: string) => void;
  onOpenLecture: (lectureId: string) => void;
}

type FilterMode =
  | 'all'
  | 'core'
  | 'srs'
  | 'saved'
  | 'mistakes-pool'
  | 'mastered'
  | 'silent'
  | 'B1'
  | 'B2'
  | 'C1';
type ViewMode = 'list' | 'table' | 'flashcards' | 'match' | 'dictation' | 'quiz' | 'mistakes';
type SilentPatternFilter =
  | 'ALL'
  | 'K'
  | 'B'
  | 'W'
  | 'L'
  | 'GH'
  | 'T'
  | 'P'
  | 'H'
  | 'G'
  | 'N';

const SILENT_PATTERN_PILLS: { id: SilentPatternFilter; label: string; example: string }[] = [
  { id: 'ALL', label: 'All Patterns', example: 'All' },
  { id: 'K', label: 'Silent K', example: 'kn- (knight)' },
  { id: 'B', label: 'Silent B', example: '-mb/-bt (doubt)' },
  { id: 'W', label: 'Silent W', example: 'wr-/wh- (write)' },
  { id: 'L', label: 'Silent L', example: '-lk/-lm (calm)' },
  { id: 'GH', label: 'Silent GH', example: '-igh/-ough (thought)' },
  { id: 'T', label: 'Silent T', example: '-stle/-sten (listen)' },
  { id: 'P', label: 'Silent P', example: 'ps-/pn- (psychology)' },
  { id: 'H', label: 'Silent H', example: 'honest / hour' },
  { id: 'G', label: 'Silent G', example: 'gn-/-gn (foreign)' },
  { id: 'N', label: 'Silent N', example: '-mn (autumn)' },
];

const PAGE_SIZE = 24;

export const DictionaryView: React.FC<DictionaryViewProps> = ({
  lectures,
  savedWordIds,
  masteredWordIds = [],
  wordSRS = {},
  mistakeNotebook = [],
  preferredSpeechRate,
  languageMode,
  initialLectureFilter = null,
  onToggleSaveWord,
  onToggleMasteredWord,
  onUpdateWordSRS,
  onRecordMistake,
  onPracticeMistake,
  onRemoveMistake,
  onOpenLecture,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [silentPatternFilter, setSilentPatternFilter] = useState<SilentPatternFilter>('ALL');
  const [selectedLectureNum, setSelectedLectureNum] = useState<number | null>(initialLectureFilter);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentPage, setCurrentPage] = useState(1);

  // Shuffle seed that randomizes questions and options every time a practice mode opens or reshuffles
  const [dictShuffleSeed, setDictShuffleSeed] = useState<number>(
    () => Math.floor(Math.random() * 1000000) + 17
  );

  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardQuizPicked, setFlashcardQuizPicked] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  // Phones: example sentence + phonics footer fold behind a per-card toggle
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});
  const [flashcardAutoSpeak, setFlashcardAutoSpeak] = useState(false);
  const [flashcardSessionReviewed, setFlashcardSessionReviewed] = useState(0);
  const [flashcardMicListening, setFlashcardMicListening] = useState(false);
  const [flashcardMicResult, setFlashcardMicResult] = useState<PronunciationResult | null>(null);

  // Interactive Silent-Letter Match Game state (+ 60s Timer Challenge)
  const [matchBoardRound, setMatchBoardRound] = useState(0);
  const [selectedMatchWordId, setSelectedMatchWordId] = useState<string | null>(null);
  const [selectedMatchMeaningId, setSelectedMatchMeaningId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [wrongMatchFlash, setWrongMatchFlash] = useState(false);
  const [matchTimerRunning, setMatchTimerRunning] = useState(false);
  const [matchSecondsLeft, setMatchSecondsLeft] = useState(60);
  const [matchGameStats, setMatchGameStats] = useState({
    score: 0,
    combo: 0,
    boardsCleared: 0,
    roundsCompleted: 0,
    pairsMatched: 0,
    mistakes: 0,
    streak: 0,
  });

  // Quick Vocab Speed Quiz state (+ Question Mode & 60s Timer Challenge)
  const [quizModeType, setQuizModeType] = useState<
    'en-to-ne' | 'ne-to-en' | 'silent-rule' | 'naati-set'
  >('en-to-ne');
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0, streak: 0 });
  const [quizTimerRunning, setQuizTimerRunning] = useState(false);
  const [quizTimerDuration, setQuizTimerDuration] = useState<0 | 30 | 60>(0);
  const [quizSecondsLeft, setQuizSecondsLeft] = useState(60);
  const [quizTimerFinished, setQuizTimerFinished] = useState(false);
  const [quizMissedWords, setQuizMissedWords] = useState<EnrichedLexiconItem[]>([]);
  const [quizPracticeMissedOnly, setQuizPracticeMissedOnly] = useState<
    EnrichedLexiconItem[] | null
  >(null);

  // Audio Dictation & Spelling Bee state (+ 4-Option Multiple Choice vs Typing + 60s Timer)
  const [dictationMode, setDictationMode] = useState<'options' | 'type'>('options');
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationSubmitted, setDictationSubmitted] = useState(false);
  const [dictationStats, setDictationStats] = useState({ correct: 0, total: 0, streak: 0 });
  const [dictationTimerRunning, setDictationTimerRunning] = useState(false);
  const [dictationSecondsLeft, setDictationSecondsLeft] = useState(60);
  const [dictationMissedWords, setDictationMissedWords] = useState<EnrichedLexiconItem[]>([]);

  // Mistake Notebook Drill state
  const [mistakeAnswers, setMistakeAnswers] = useState<Record<string, string>>({});

  // Hands-Free "Commuter Audio Mode" (Podcast Player) state
  const [commuterOpen, setCommuterOpen] = useState(false);
  const [commuterPlaying, setCommuterPlaying] = useState(false);
  const [commuterPlaylistSource, setCommuterPlaylistSource] = useState<'filtered' | 'saved' | 'mistakes'>('filtered');
  const [commuterIndex, setCommuterIndex] = useState(0);
  const [commuterPhase, setCommuterPhase] = useState<'idle' | 'word-1x' | 'pause-2s' | 'word-075x' | 'sentence'>('idle');
  const commuterCancelRef = useRef(false);

  // Printable PDF & CSV Study Sheet Modal state
  const [studySheetModalMode, setStudySheetModalMode] = useState<StudySheetFocusMode | null>(null);

  // AI Silent-Letter & Pronunciation Explainer state per word ID
  const [aiWordExplanations, setAiWordExplanations] = useState<
    Record<
      string,
      {
        silentReasonNepali: string;
        mouthPositionNepali: string;
        nepaliSoundComparison: string;
        memoryTrickNepali: string;
        extraExampleEnglish: string;
        extraExampleNepali: string;
      }
    >
  >({});
  const [aiWordLoadingId, setAiWordLoadingId] = useState<string | null>(null);

  const handleExplainDictionaryWord = async (item: EnrichedLexiconItem) => {
    if (aiWordExplanations[item.id] || aiWordLoadingId === item.id) return;
    setAiWordLoadingId(item.id);
    try {
      const res = await fetch('/api/ai/word-explainer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: item.word,
          ipa: item.ipa,
          silentLettersSummary: item.silentLettersSummary,
          level: item.level,
        }),
      });
      const data = await res.json();
      if (res.ok && data.explanation) {
        setAiWordExplanations((prev) => ({
          ...prev,
          [item.id]: data.explanation,
        }));
      }
    } catch {
      // Ignore transient errors
    } finally {
      setAiWordLoadingId(null);
    }
  };

  useEffect(() => {
    if (initialLectureFilter !== undefined) {
      setSelectedLectureNum(initialLectureFilter);
      setCurrentPage(1);
    }
  }, [initialLectureFilter]);

  const isFullNepali = languageMode === 'full-nepali';
  const showMeaningsByDefault = languageMode !== 'english-only';

  // Load the 10,400+ vocabulary lexicon distributed across all 12 lectures
  const allWords: EnrichedLexiconItem[] = useMemo(() => {
    return getMassiveLexicon(lectures);
  }, [lectures]);

  const coreWordsCount = useMemo(
    () => allWords.filter((w) => w.isCoreLessonWord).length,
    [allWords]
  );

  const srsTrackedCount = useMemo(() => Object.keys(wordSRS).length, [wordSRS]);

  // Helper to get Mastery Level tag for any word
  const getWordMasteryStatus = (wordId: string): {
    label: 'New' | 'Learning' | 'Reviewing' | 'Mastered';
    isMastered: boolean;
    badgeClass: string;
  } => {
    const rec = wordSRS[wordId];
    const explicitlyMastered = masteredWordIds.includes(wordId) || rec?.stage === 'mastered' || (rec?.intervalDays ?? 0) >= 7;
    if (explicitlyMastered) {
      return {
        label: 'Mastered',
        isMastered: true,
        badgeClass: 'bg-[#2D6A4F]/12 text-[#2D6A4F] dark:text-emerald-400 border-[#2D6A4F]/30',
      };
    }
    if (rec?.stage === 'review' || (rec?.intervalDays ?? 0) >= 3) {
      return {
        label: 'Reviewing',
        isMastered: false,
        badgeClass: 'bg-sky-500/12 text-sky-700 dark:text-sky-300 border-sky-500/30',
      };
    }
    if (rec?.stage === 'learning' || (rec?.repetitions ?? 0) > 0) {
      return {
        label: 'Learning',
        isMastered: false,
        badgeClass: 'bg-amber-500/12 text-amber-700 dark:text-amber-300 border-amber-500/30',
      };
    }
    return {
      label: 'New',
      isMastered: false,
      badgeClass: 'bg-[#F2ECE1] dark:bg-[#141210] text-[#57534E] dark:text-[#A8A29E] border-[#E7E0D6] dark:border-[#2E2924]',
    };
  };

  // Count words per lecture section for the Section Distribution Bar
  const lectureWordCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const item of allWords) {
      counts[item.lectureNumber] = (counts[item.lectureNumber] || 0) + 1;
    }
    return counts;
  }, [allWords]);

  const filteredWords = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allWords.filter((w) => {
      if (selectedLectureNum !== null && w.lectureNumber !== selectedLectureNum) return false;
      if (filterMode === 'core' && !w.isCoreLessonWord) return false;
      if (filterMode === 'srs') {
        const rec = wordSRS[w.id];
        if (!rec && !w.isCoreLessonWord) return false;
      }
      if (filterMode === 'saved' && !savedWordIds.includes(w.id)) return false;
      if (filterMode === 'mistakes-pool') {
        const mistakeWords = new Set(
          mistakeNotebook.map((m) => m.correctAnswer.trim().toLowerCase())
        );
        if (!mistakeWords.has(w.word.toLowerCase())) return false;
      }
      if (filterMode === 'mastered') {
        const rec = wordSRS[w.id];
        const isMast = masteredWordIds.includes(w.id) || rec?.stage === 'mastered' || (rec?.intervalDays ?? 0) >= 7;
        if (!isMast) return false;
      }
      if (filterMode === 'silent' && !w.segments?.some((s) => s.silent)) return false;
      if ((filterMode === 'B1' || filterMode === 'B2' || filterMode === 'C1') && w.level !== filterMode) {
        return false;
      }

      if (silentPatternFilter !== 'ALL') {
        const targetSilent = silentPatternFilter.toLowerCase();
        const hasSilentSegment = w.segments?.some(
          (seg) => seg.silent && seg.text.toLowerCase().includes(targetSilent)
        );
        const summaryMatch = w.silentLettersSummary
          ?.toLowerCase()
          .includes(`silent ${targetSilent}`);
        if (!hasSilentSegment && !summaryMatch) return false;
      }

      if (!q) return true;
      return (
        w.word.toLowerCase().includes(q) ||
        w.nepaliMeaning.toLowerCase().includes(q) ||
        w.ipa.toLowerCase().includes(q) ||
        w.category.toLowerCase().includes(q) ||
        w.englishExample.toLowerCase().includes(q)
      );
    });
  }, [
    allWords,
    selectedLectureNum,
    filterMode,
    silentPatternFilter,
    savedWordIds,
    masteredWordIds,
    searchQuery,
    wordSRS,
  ]);

  // Build playlist for Commuter Audio Mode
  const commuterPlaylist = useMemo(() => {
    if (commuterPlaylistSource === 'saved') {
      const savedList = allWords.filter((w) => savedWordIds.includes(w.id));
      return savedList.length > 0 ? savedList : filteredWords.slice(0, 50);
    }
    if (commuterPlaylistSource === 'mistakes') {
      const mistakeTargetWords = new Set(
        mistakeNotebook.map((m) => m.correctAnswer.trim().toLowerCase())
      );
      const matched = allWords.filter((w) => mistakeTargetWords.has(w.word.toLowerCase()));
      return matched.length > 0 ? matched : filteredWords.slice(0, 50);
    }
    return filteredWords.slice(0, 100);
  }, [commuterPlaylistSource, allWords, savedWordIds, mistakeNotebook, filteredWords]);

  const currentCommuterWord =
    commuterPlaylist[commuterIndex % Math.max(1, commuterPlaylist.length)] || null;

  // Hands-Free Commuter Audio Loop: 1.0x -> 2s Mental Recall Pause -> 0.75x -> Example Sentence
  useEffect(() => {
    if (!commuterPlaying || !currentCommuterWord) {
      setCommuterPhase('idle');
      return;
    }

    commuterCancelRef.current = false;
    let pauseTimer: number | null = null;
    let nextTimer: number | null = null;

    const runSequence = () => {
      if (commuterCancelRef.current) return;
      setCommuterPhase('word-1x');
      speechService.speak(currentCommuterWord.word, {
        rate: 1.0,
        onEnd: () => {
          if (commuterCancelRef.current) return;
          setCommuterPhase('pause-2s');
          pauseTimer = window.setTimeout(() => {
            if (commuterCancelRef.current) return;
            setCommuterPhase('word-075x');
            speechService.speak(currentCommuterWord.word, {
              rate: 0.75,
              onEnd: () => {
                if (commuterCancelRef.current) return;
                setCommuterPhase('sentence');
                speechService.speak(currentCommuterWord.englishExample, {
                  rate: preferredSpeechRate,
                  onEnd: () => {
                    if (commuterCancelRef.current) return;
                    nextTimer = window.setTimeout(() => {
                      if (!commuterCancelRef.current) {
                        setCommuterIndex((prev) => (prev + 1) % Math.max(1, commuterPlaylist.length));
                      }
                    }, 900);
                  },
                });
              },
            });
          }, 2000);
        },
      });
    };

    runSequence();

    return () => {
      commuterCancelRef.current = true;
      if (pauseTimer) window.clearTimeout(pauseTimer);
      if (nextTimer) window.clearTimeout(nextTimer);
      speechService.stop();
    };
  }, [commuterPlaying, commuterIndex, currentCommuterWord, commuterPlaylist.length, preferredSpeechRate]);

  // 60s Countdown Timers for Speed Quiz, Dictation, and Match Game
  useEffect(() => {
    if (!quizTimerRunning) return;
    if (quizSecondsLeft <= 0) {
      setQuizTimerRunning(false);
      setQuizTimerFinished(true);
      return;
    }
    const t = window.setTimeout(() => setQuizSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [quizTimerRunning, quizSecondsLeft]);

  useEffect(() => {
    if (!dictationTimerRunning) return;
    if (dictationSecondsLeft <= 0) {
      setDictationTimerRunning(false);
      return;
    }
    const t = window.setTimeout(() => setDictationSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [dictationTimerRunning, dictationSecondsLeft]);

  useEffect(() => {
    if (!matchTimerRunning) return;
    if (matchSecondsLeft <= 0) {
      setMatchTimerRunning(false);
      return;
    }
    const t = window.setTimeout(() => setMatchSecondsLeft((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [matchTimerRunning, matchSecondsLeft]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedWords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, safePage]);

  // Shuffled pool of practice words for Flashcards, Dictation, Match, and Quiz
  const shuffledPracticePool = useMemo(() => {
    if (quizPracticeMissedOnly && quizPracticeMissedOnly.length > 0 && viewMode === 'quiz') {
      return quizPracticeMissedOnly;
    }
    const base =
      filteredWords.length > 0
        ? filteredWords.slice(0, 240)
        : allWords.filter((w) => w.isCoreLessonWord).slice(0, 120);
    return shuffleWithSeed(base, dictShuffleSeed);
  }, [filteredWords, allWords, dictShuffleSeed, quizPracticeMissedOnly, viewMode]);

  const currentFlashcard =
    shuffledPracticePool[cardIndex % Math.max(1, shuffledPracticePool.length)] || null;

  const flashcardQuizOptions = useMemo(() => {
    if (!currentFlashcard) return [];
    const distractors = shuffleWithSeed(
      shuffledPracticePool
        .filter((w) => w.id !== currentFlashcard.id)
        .map((w) => w.nepaliMeaning),
      dictShuffleSeed + cardIndex * 31 + 7
    ).slice(0, 3);
    return shuffleWithSeed(
      [currentFlashcard.nepaliMeaning, ...distractors],
      dictShuffleSeed + cardIndex * 47 + 13
    );
  }, [currentFlashcard, shuffledPracticePool, dictShuffleSeed, cardIndex]);

  const currentDictationWord =
    shuffledPracticePool[dictationIndex % Math.max(1, shuffledPracticePool.length)] || null;

  // Build 4 shuffled spelling options for Audio Dictation (1 exact + 3 realistic silent-letter distractors)
  const dictationSpellingOptions = useMemo(() => {
    if (!currentDictationWord) return [];
    const w = currentDictationWord.word;
    const lower = w.toLowerCase();
    const candidates = new Set<string>();

    // Generate plausible orthographic distractors by dropping/swapping silent segments
    if (currentDictationWord.segments?.some((s) => s.silent)) {
      const withoutSilent = currentDictationWord.segments
        .filter((s) => !s.silent)
        .map((s) => s.text)
        .join('');
      if (withoutSilent.toLowerCase() !== lower && withoutSilent.length >= 2) {
        candidates.add(withoutSilent);
      }
    }
    if (lower.includes('ie')) candidates.add(w.replace(/ie/i, 'ei'));
    if (lower.includes('ei')) candidates.add(w.replace(/ei/i, 'ie'));
    if (lower.includes('gh')) candidates.add(w.replace(/gh/i, 'g'));
    if (lower.endsWith('le')) candidates.add(w.slice(0, -2) + 'el');
    if (lower.endsWith('ce')) candidates.add(w.slice(0, -2) + 'se');
    candidates.add(w + 'e');
    if (w.length > 3) {
      candidates.add(w.slice(0, 2) + w[2] + w.slice(2));
      candidates.add(w.slice(0, -1));
    }

    const validDistractors = Array.from(candidates)
      .filter((c) => c.toLowerCase() !== lower)
      .slice(0, 3);

    while (validDistractors.length < 3 && shuffledPracticePool.length > 3) {
      const other =
        shuffledPracticePool[
          (dictationIndex + validDistractors.length + 1) % shuffledPracticePool.length
        ]?.word;
      if (other && other.toLowerCase() !== lower && !validDistractors.includes(other)) {
        validDistractors.push(other);
      } else {
        break;
      }
    }

    return shuffleWithSeed(
      [w, ...validDistractors.slice(0, 3)],
      dictShuffleSeed + dictationIndex * 53 + 19
    );
  }, [currentDictationWord, shuffledPracticePool, dictShuffleSeed, dictationIndex]);

  // Build Shuffled 4-Option Question for Speed Quiz (supports 4 quiz modes + NAATI set!)
  const currentQuizQuestion = useMemo(() => {
    if (quizModeType === 'naati-set') {
      const shuffledNaati = shuffleWithSeed(NAATI_TRANSLATION_BANK, dictShuffleSeed + 303);
      const item = shuffledNaati[quizIndex % shuffledNaati.length];
      const distractors = shuffleWithSeed(
        shuffledNaati.filter((n) => n.id !== item.id).map((n) => n.nepali),
        dictShuffleSeed + quizIndex * 29
      ).slice(0, 3);
      const options = shuffleWithSeed(
        [item.nepali, ...distractors],
        dictShuffleSeed + quizIndex * 43
      );
      const syntheticTarget: EnrichedLexiconItem = {
        id: item.id,
        word: item.english,
        ipa: item.ipa,
        partOfSpeech: item.domainLabel,
        nepaliMeaning: item.nepali,
        englishExample: item.contextSentence,
        nepaliExampleTranslation: item.nepaliSentence,
        silentLettersSummary: `NAATI ${item.domainLabel}`,
        segments: [{ text: item.english, silent: false }],
        lectureId: lectures[0]?.id || 'lecture-1-silent-consonants',
        lectureNumber: 1,
        lectureTitle: item.domainLabel,
        category: item.domainLabel,
        level: 'B2',
        isCoreLessonWord: true,
        usageTipNepali: item.nepaliSentence,
      };
      return {
        target: syntheticTarget,
        promptTitle: 'Choose the accurate NAATI Nepali translation:',
        promptMain: item.english,
        promptSub: `${item.ipa} · ${item.domainLabel}`,
        correctAnswer: item.nepali,
        options,
        isNepaliOption: true,
      };
    }

    if (shuffledPracticePool.length === 0) return null;
    const target = shuffledPracticePool[quizIndex % shuffledPracticePool.length];

    if (quizModeType === 'ne-to-en') {
      const distractors = shuffleWithSeed(
        shuffledPracticePool.filter((w) => w.id !== target.id).map((w) => w.word),
        dictShuffleSeed + quizIndex * 31
      ).slice(0, 3);
      const options = shuffleWithSeed(
        [target.word, ...distractors],
        dictShuffleSeed + quizIndex * 47
      );
      return {
        target,
        promptTitle: 'Choose the English word for this Nepali meaning:',
        promptMain: target.nepaliMeaning,
        promptSub: `${target.partOfSpeech} · L${String(target.lectureNumber).padStart(2, '0')} (${target.level})`,
        correctAnswer: target.word,
        options,
        isNepaliOption: false,
      };
    }

    if (quizModeType === 'silent-rule') {
      const rulePool = [
        target.silentLettersSummary,
        'Silent k before n at the start of a word',
        'Silent b after m at the end of a root word',
        'Silent w before r at the start of a word',
        'Silent l before m, k, or d',
        'Silent t in -stle and -sten endings',
        'Silent g before n in root words',
        'Silent p before s or t',
      ];
      const distractors = shuffleWithSeed(
        Array.from(new Set(rulePool)).filter((r) => r !== target.silentLettersSummary),
        dictShuffleSeed + quizIndex * 37
      ).slice(0, 3);
      const options = shuffleWithSeed(
        [target.silentLettersSummary, ...distractors],
        dictShuffleSeed + quizIndex * 59
      );
      return {
        target,
        promptTitle: 'Identify the phonics / silent-letter rule for:',
        promptMain: target.word,
        promptSub: `${target.ipa} · ${target.nepaliMeaning}`,
        correctAnswer: target.silentLettersSummary,
        options,
        isNepaliOption: false,
      };
    }

    // Default: 'en-to-ne'
    const distractors = shuffleWithSeed(
      shuffledPracticePool
        .filter((w) => w.id !== target.id && w.nepaliMeaning !== target.nepaliMeaning)
        .map((w) => w.nepaliMeaning),
      dictShuffleSeed + quizIndex * 23
    ).slice(0, 3);
    const options = shuffleWithSeed(
      [target.nepaliMeaning, ...distractors],
      dictShuffleSeed + quizIndex * 41
    );
    return {
      target,
      promptTitle: 'Choose the correct Nepali meaning:',
      promptMain: target.word,
      promptSub: `${target.ipa} · ${target.partOfSpeech}`,
      correctAnswer: target.nepaliMeaning,
      options,
      isNepaliOption: true,
    };
  }, [shuffledPracticePool, quizIndex, quizModeType, dictShuffleSeed, lectures]);

  const handleReshuffleDictionaryPractice = () => {
    setDictShuffleSeed(Math.floor(Math.random() * 1000000) + (Date.now() % 100000));
    setCardIndex(0);
    setIsFlipped(false);
    setFlashcardQuizPicked(null);
    setFlashcardMicResult(null);
    setMatchedPairIds([]);
    setSelectedMatchWordId(null);
    setSelectedMatchMeaningId(null);
    setDictationIndex(0);
    setDictationInput('');
    setDictationSubmitted(false);
    setQuizIndex(0);
    setQuizSelectedOption(null);
    setQuizTimerFinished(false);
  };

  const handleStartQuizTimedChallenge = (durationSec: 30 | 60) => {
    setDictShuffleSeed(Math.floor(Math.random() * 1000000) + (Date.now() % 100000));
    setQuizPracticeMissedOnly(null);
    setQuizMissedWords([]);
    setQuizIndex(0);
    setQuizSelectedOption(null);
    setQuizScore({ correct: 0, total: 0, streak: 0 });
    setQuizTimerDuration(durationSec);
    setQuizSecondsLeft(durationSec);
    setQuizTimerFinished(false);
    setQuizTimerRunning(true);
  };

  const handleStartDictationTimed = (durationSec: 60) => {
    setDictShuffleSeed(Math.floor(Math.random() * 1000000) + (Date.now() % 100000));
    setDictationMissedWords([]);
    setDictationIndex(0);
    setDictationInput('');
    setDictationSubmitted(false);
    setDictationStats({ correct: 0, total: 0, streak: 0 });
    setDictationSecondsLeft(durationSec);
    setDictationTimerRunning(true);
  };

  const handleStartMatchTimed = (durationSec: 60) => {
    setDictShuffleSeed(Math.floor(Math.random() * 1000000) + (Date.now() % 100000));
    setMatchedPairIds([]);
    setSelectedMatchWordId(null);
    setSelectedMatchMeaningId(null);
    setMatchSecondsLeft(durationSec);
    setMatchTimerRunning(true);
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setFlashcardQuizPicked(null);
    setFlashcardMicResult(null);
    const nextIdx = shuffledPracticePool.length
      ? (cardIndex + 1) % shuffledPracticePool.length
      : 0;
    setCardIndex(nextIdx);
    if (flashcardAutoSpeak && shuffledPracticePool[nextIdx]) {
      speechService.speak(shuffledPracticePool[nextIdx].word, { rate: preferredSpeechRate });
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setFlashcardQuizPicked(null);
    setFlashcardMicResult(null);
    const prevIdx = shuffledPracticePool.length
      ? (cardIndex - 1 + shuffledPracticePool.length) % shuffledPracticePool.length
      : 0;
    setCardIndex(prevIdx);
    if (flashcardAutoSpeak && shuffledPracticePool[prevIdx]) {
      speechService.speak(shuffledPracticePool[prevIdx].word, { rate: preferredSpeechRate });
    }
  };

  const handleShuffleFlashcard = () => {
    setDictShuffleSeed(Math.floor(Math.random() * 1000000) + (Date.now() % 100000));
    setIsFlipped(false);
    setFlashcardQuizPicked(null);
    setFlashcardMicResult(null);
    setCardIndex(0);
  };

  const handleRateFlashcardSRS = (ratingOrCorrect: boolean | SRSRating) => {
    if (currentFlashcard && onUpdateWordSRS) {
      onUpdateWordSRS(currentFlashcard.id, ratingOrCorrect);
    }
    setFlashcardSessionReviewed((prev) => prev + 1);
    handleNextCard();
  };

  const handleFlashcardMicTest = () => {
    if (!currentFlashcard || flashcardMicListening) return;
    setFlashcardMicListening(true);
    setFlashcardMicResult(null);
    speechService.listenAndEvaluate(
      currentFlashcard.word,
      (res) => {
        setFlashcardMicResult(res);
        setFlashcardMicListening(false);
      },
      () => {
        setFlashcardMicListening(false);
      }
    );
  };

  // Interactive 6-Pair Silent-Letter Match Game Board (Shuffled every round)
  const matchBoardData = useMemo(() => {
    const pool =
      shuffledPracticePool.length >= 6
        ? shuffledPracticePool
        : shuffleWithSeed(allWords.slice(0, 80), dictShuffleSeed + matchBoardRound * 19);
    const startIdx = (matchBoardRound * 6) % Math.max(1, pool.length - 6);
    const pairs = shuffleWithSeed(
      pool.slice(startIdx, startIdx + 6),
      dictShuffleSeed + matchBoardRound * 37
    );
    const shuffledMeanings = shuffleWithSeed(
      pairs,
      dictShuffleSeed + matchBoardRound * 73 + 11
    );
    return { pairs, shuffledMeanings };
  }, [shuffledPracticePool, allWords, matchBoardRound, dictShuffleSeed]);

  const handleSelectMatchWord = (wordId: string) => {
    if (matchedPairIds.includes(wordId)) return;
    const wordObj = matchBoardData.pairs.find((w) => w.id === wordId);
    if (wordObj) {
      speechService.speak(wordObj.word, { rate: preferredSpeechRate });
    }
    setSelectedMatchWordId(wordId);
    if (selectedMatchMeaningId) {
      if (selectedMatchMeaningId === wordId) {
        speechService.playCorrectTone();
        const nextMatched = [...matchedPairIds, wordId];
        setMatchedPairIds(nextMatched);
        setSelectedMatchWordId(null);
        setSelectedMatchMeaningId(null);
        if (onUpdateWordSRS) onUpdateWordSRS(wordId, true);
        setMatchGameStats((prev) => ({
          ...prev,
          roundsCompleted:
            nextMatched.length === matchBoardData.pairs.length
              ? prev.roundsCompleted + 1
              : prev.roundsCompleted,
          pairsMatched: prev.pairsMatched + 1,
          mistakes: prev.mistakes,
          streak: prev.streak + 1,
        }));
      } else {
        speechService.playWrongTone();
        setWrongMatchFlash(true);
        setMatchGameStats((prev) => ({
          ...prev,
          mistakes: prev.mistakes + 1,
          streak: 0,
        }));
        setTimeout(() => {
          setWrongMatchFlash(false);
          setSelectedMatchWordId(null);
          setSelectedMatchMeaningId(null);
        }, 550);
      }
    }
  };

  const handleSelectMatchMeaning = (wordId: string) => {
    if (matchedPairIds.includes(wordId)) return;
    setSelectedMatchMeaningId(wordId);
    if (selectedMatchWordId) {
      if (selectedMatchWordId === wordId) {
        speechService.playCorrectTone();
        const nextMatched = [...matchedPairIds, wordId];
        setMatchedPairIds(nextMatched);
        setSelectedMatchWordId(null);
        setSelectedMatchMeaningId(null);
        if (onUpdateWordSRS) onUpdateWordSRS(wordId, true);
        setMatchGameStats((prev) => ({
          ...prev,
          roundsCompleted:
            nextMatched.length === matchBoardData.pairs.length
              ? prev.roundsCompleted + 1
              : prev.roundsCompleted,
          pairsMatched: prev.pairsMatched + 1,
          mistakes: prev.mistakes,
          streak: prev.streak + 1,
        }));
      } else {
        speechService.playWrongTone();
        setWrongMatchFlash(true);
        setMatchGameStats((prev) => ({
          ...prev,
          mistakes: prev.mistakes + 1,
          streak: 0,
        }));
        setTimeout(() => {
          setWrongMatchFlash(false);
          setSelectedMatchWordId(null);
          setSelectedMatchMeaningId(null);
        }, 550);
      }
    }
  };

  const handleNextMatchRound = () => {
    setDictShuffleSeed(Math.floor(Math.random() * 1000000) + (Date.now() % 100000));
    setMatchedPairIds([]);
    setSelectedMatchWordId(null);
    setSelectedMatchMeaningId(null);
    setMatchBoardRound((prev) => prev + 1);
  };

  const handleAnswerQuiz = (option: string) => {
    if (quizSelectedOption || !currentQuizQuestion) return;
    setQuizSelectedOption(option);
    const isCorrect = option === currentQuizQuestion.correctAnswer;
    if (isCorrect) {
      speechService.playCorrectTone();
      speechService.speak(currentQuizQuestion.target.word, { rate: preferredSpeechRate });
    } else {
      speechService.playWrongTone();
    }
    setQuizScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    if (onUpdateWordSRS) {
      onUpdateWordSRS(currentQuizQuestion.target.id, isCorrect);
    }
    if (!isCorrect) {
      setQuizMissedWords((prev) =>
        prev.some((w) => w.id === currentQuizQuestion.target.id)
          ? prev
          : [...prev, currentQuizQuestion.target]
      );
      if (onRecordMistake) {
        onRecordMistake({
          lectureId: currentQuizQuestion.target.lectureId,
          lectureNumber: currentQuizQuestion.target.lectureNumber,
          sourceType: 'vocab-quiz',
          prompt: `${currentQuizQuestion.promptTitle} "${currentQuizQuestion.promptMain}"`,
          nepaliHint: currentQuizQuestion.target.englishExample,
          userWrongAnswer: option,
          correctAnswer: currentQuizQuestion.correctAnswer,
          options: currentQuizQuestion.options,
          explanation: `"${currentQuizQuestion.target.word}" means "${currentQuizQuestion.target.nepaliMeaning}". Phonics: ${currentQuizQuestion.target.silentLettersSummary}.`,
        });
      }
    }
    if (quizTimerRunning) {
      window.setTimeout(() => {
        setQuizSelectedOption(null);
        setQuizIndex((prev) => prev + 1);
      }, 450);
    }
  };

  const handleNextQuizQuestion = () => {
    setQuizSelectedOption(null);
    setQuizIndex((prev) => prev + 1);
  };

  const handleSubmitDictationAnswer = (answerText: string) => {
    if (!currentDictationWord || dictationSubmitted || !answerText.trim()) return;
    setDictationInput(answerText);
    setDictationSubmitted(true);
    const cleanUser = answerText.trim().toLowerCase();
    const cleanTarget = currentDictationWord.word.trim().toLowerCase();
    const isExact = cleanUser === cleanTarget;

    if (isExact) {
      speechService.playCorrectTone();
      speechService.speak(currentDictationWord.word, { rate: preferredSpeechRate });
    } else {
      speechService.playWrongTone();
    }

    setDictationStats((prev) => ({
      correct: prev.correct + (isExact ? 1 : 0),
      total: prev.total + 1,
      streak: isExact ? prev.streak + 1 : 0,
    }));

    if (onUpdateWordSRS) {
      onUpdateWordSRS(currentDictationWord.id, isExact);
    }

    if (!isExact) {
      setDictationMissedWords((prev) =>
        prev.some((w) => w.id === currentDictationWord.id) ? prev : [...prev, currentDictationWord]
      );
      if (onRecordMistake) {
        onRecordMistake({
          lectureId: currentDictationWord.lectureId,
          lectureNumber: currentDictationWord.lectureNumber,
          sourceType: 'dictation',
          prompt: `Spell the English word meaning "${currentDictationWord.nepaliMeaning}" (${currentDictationWord.ipa}):`,
          nepaliHint: currentDictationWord.englishExample,
          userWrongAnswer: answerText.trim(),
          correctAnswer: currentDictationWord.word,
          explanation: `Correct spelling: "${currentDictationWord.word}". Silent-letter rule: ${currentDictationWord.silentLettersSummary}.`,
        });
      }
    }

    if (dictationTimerRunning) {
      window.setTimeout(() => {
        setDictationSubmitted(false);
        setDictationInput('');
        setDictationIndex((prev) => prev + 1);
      }, 480);
    }
  };

  // Keyboard shortcuts (1-4) for Speed Quiz and 4-Option Dictation on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (viewMode === 'quiz' && currentQuizQuestion && !quizSelectedOption) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = Number(e.key) - 1;
          const opt = currentQuizQuestion.options[idx];
          if (opt) {
            e.preventDefault();
            handleAnswerQuiz(opt);
          }
        }
      } else if (
        viewMode === 'dictation' &&
        dictationMode === 'options' &&
        !dictationSubmitted &&
        dictationSpellingOptions.length > 0
      ) {
        if (['1', '2', '3', '4'].includes(e.key)) {
          const idx = Number(e.key) - 1;
          const opt = dictationSpellingOptions[idx];
          if (opt) {
            e.preventDefault();
            handleSubmitDictationAnswer(opt);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const handleCheckDictation = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitDictationAnswer(dictationInput);
  };

  const handleNextDictationWord = () => {
    setDictationSubmitted(false);
    setDictationInput('');
    setDictationIndex((prev) => prev + 1);
  };

  const savedWordsObjects = useMemo(() => {
    const matched = allWords.filter((w) => savedWordIds.includes(w.id));
    return matched.length > 0 ? matched : allWords.filter((w) => w.isCoreLessonWord).slice(0, 20);
  }, [allWords, savedWordIds]);

  // Dropdown states for clean, non-congested toolbar
  const [sectionDropdownOpen, setSectionDropdownOpen] = useState(false);
  const [moreFiltersDropdownOpen, setMoreFiltersDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const sectionDropdownRef = useRef<HTMLDivElement | null>(null);
  const moreFiltersDropdownRef = useRef<HTMLDivElement | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (sectionDropdownRef.current && !sectionDropdownRef.current.contains(target)) {
        setSectionDropdownOpen(false);
      }
      if (moreFiltersDropdownRef.current && !moreFiltersDropdownRef.current.contains(target)) {
        setMoreFiltersDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(target)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const selectedLectureObj = useMemo(
    () =>
      selectedLectureNum !== null
        ? lectures.find((l) => l.lectureNumber === selectedLectureNum) || null
        : null,
    [lectures, selectedLectureNum]
  );

  // Build options for ResponsiveSelectSheet (12 Managed Lecture Banks)
  const sectionSheetOptions: SelectSheetOption[] = useMemo(() => {
    const base: SelectSheetOption[] = [
      {
        value: 'ALL',
        label: 'All 12 Curriculum Sections',
        sublabel: `Complete lexicon (${allWords.length.toLocaleString()} words)`,
        badge: '12 banks',
      },
    ];
    for (const lec of lectures.slice(0, 12)) {
      const count = lectureWordCounts[lec.lectureNumber] || 0;
      base.push({
        value: String(lec.lectureNumber),
        label: `L${String(lec.lectureNumber).padStart(2, '0')} · ${lec.category}`,
        sublabel: lec.title,
        badge: `${lec.level} · ${count}w`,
      });
    }
    return base;
  }, [lectures, allWords.length, lectureWordCounts]);

  const isSecondaryFilterActive =
    filterMode === 'mastered' ||
    filterMode === 'B1' ||
    filterMode === 'B2' ||
    filterMode === 'C1' ||
    silentPatternFilter !== 'ALL';

  const activeSecondaryFilterLabel = useMemo(() => {
    const parts: string[] = [];
    if (filterMode === 'mastered') parts.push(`Mastered (${masteredWordIds.length})`);
    if (filterMode === 'B1' || filterMode === 'B2' || filterMode === 'C1') {
      parts.push(`Level ${filterMode}`);
    }
    if (silentPatternFilter !== 'ALL') {
      const found = SILENT_PATTERN_PILLS.find((p) => p.id === silentPatternFilter);
      if (found) parts.push(found.label);
    }
    return parts.length > 0 ? parts.join(' · ') : 'More Filters';
  }, [filterMode, masteredWordIds.length, silentPatternFilter]);

  if (studySheetModalMode) {
    return (
      <PrintableStudySheetModal
        initialFocusMode={studySheetModalMode}
        allLexiconWords={allWords}
        savedWordIds={savedWordIds}
        masteredWordIds={masteredWordIds}
        wordSRS={wordSRS}
        mistakeNotebook={mistakeNotebook}
        onClose={() => setStudySheetModalMode(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-[82rem] mx-auto px-[0.625rem] sm:px-[1rem] lg:px-[1.5rem] py-[0.875rem] sm:py-[1.25rem] pb-24">
      {/* ===================================================================== */}
      {/* 1. CLEAN EDITORIAL HEADER + COMPACT UTILITY ACTIONS                   */}
      {/* ===================================================================== */}
      <div className="flex items-center justify-between gap-3 mb-5">
        <h1 className="serif m-0 text-[28px] md:text-[34px] leading-[1.1] text-[#1C1917] dark:text-[#F5F2EB]">
          Dictionary
        </h1>

        {/* Compact Utility Bar: Audio Loop & Export Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            aria-label="Commuter audio"
            aria-pressed={commuterOpen}
            onClick={() => setCommuterOpen((prev) => !prev)}
            className={`btn btn-g !min-h-[42px] !w-[42px] md:!w-auto !px-0 md:!px-3.5 !text-[13px] !rounded-xl md:!rounded-[14px] ${
              commuterOpen || commuterPlaying ? '!bg-[#9E2A2B] !text-white !border-[#9E2A2B]' : ''
            }`}
          >
            <Radio
              className={`w-3.5 h-3.5 ${
                commuterPlaying
                  ? 'animate-pulse text-white'
                  : commuterOpen
                  ? 'text-white'
                  : 'text-[#9E2A2B]'
              }`}
            />
            <span className="hidden md:inline">{commuterPlaying ? 'Audio playing' : 'Commuter audio'}</span>
          </button>

          {/* Export / Study Sheet Dropdown */}
          <div ref={exportDropdownRef} className="relative">
            <button
              type="button"
              aria-label="Export"
              aria-expanded={exportDropdownOpen}
              onClick={() => setExportDropdownOpen((prev) => !prev)}
              className="btn btn-g !min-h-[42px] !w-[42px] md:!w-auto !px-0 md:!px-3.5 !text-[13px] !rounded-xl md:!rounded-[14px]"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden md:inline">Export</span>
              <ChevronDown
                className={`hidden md:block w-3.5 h-3.5 text-[#8E877E] transition-transform ${
                  exportDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 z-40 mt-2 w-60 rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E8E0D2] dark:border-[#2C2621] shadow-xl p-1.5 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    setStudySheetModalMode(filterMode === 'saved' ? 'saved' : 'combined');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[#1E1B18] dark:text-[#F5F2EB] hover:bg-[#F3EFE6] dark:hover:bg-[#141210] flex items-center gap-2.5 transition-colors"
                >
                  <Printer className="w-4 h-4 text-[#9E2A2B] shrink-0" />
                  <div>
                    <div className="font-semibold">Print / PDF Study Sheet</div>
                    <div className="text-[11px] text-[#8E877E]">Formatted vocabulary handout</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setExportDropdownOpen(false);
                    exportSavedWordsToCSV(savedWordsObjects, masteredWordIds, wordSRS);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl text-left text-xs font-medium text-[#1E1B18] dark:text-[#F5F2EB] hover:bg-[#F3EFE6] dark:hover:bg-[#141210] flex items-center gap-2.5 transition-colors"
                >
                  <FileDown className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                  <div>
                    <div className="font-semibold">Download Saved Words (.CSV)</div>
                    <div className="text-[11px] text-[#8E877E]">{savedWordIds.length} bookmarked words</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* .ls-stats: words / learned / saved */}
      <section
        aria-label="Your lexicon"
        className="card !px-3 !py-2.5 md:!px-5 md:!py-3 !rounded-2xl md:!rounded-[20px] flex items-center justify-between gap-2 mb-4"
      >
        {[
          { key: 'w', tone: 'i-ink', Icon: BookOpen, v: allWords.length.toLocaleString(), l: 'Words' },
          { key: 'm', tone: 'i-sage', Icon: CheckCircle2, v: masteredWordIds.length.toLocaleString(), l: 'Learned' },
          { key: 's', tone: 'i-crim', Icon: Bookmark, v: savedWordIds.length.toLocaleString(), l: 'Saved' },
        ].map((st, i) => (
          <React.Fragment key={st.key}>
            {i > 0 && <span aria-hidden="true" className="w-px h-7 bg-[#EAE4D8] dark:bg-[#2E2924]" />}
            <div className="flex items-center gap-[7px] md:gap-2.5 min-w-0">
              <span className={`ico xs ${st.tone} hidden md:flex`}>
                <st.Icon className="w-3.5 h-3.5" />
              </span>
              <span>
                <span className="serif block text-lg md:text-xl leading-[1.1] text-[#1C1917] dark:text-[#F5F2EB]">{st.v}</span>
                <span className="muted block text-[10px] md:text-[11px] font-semibold whitespace-nowrap">{st.l}</span>
              </span>
            </div>
          </React.Fragment>
        ))}
      </section>

      {/* .ls-resume: SRS review */}
      <button
        type="button"
        onClick={() => {
          setViewMode('flashcards');
          handleReshuffleDictionaryPractice();
        }}
        className="w-full mb-4 flex items-center gap-3 p-2.5 pr-3 rounded-[18px] bg-[#1C1917] dark:bg-[#F5F2EB] text-[#F5F2EB] dark:text-[#1C1917] text-left shadow-[0_14px_28px_-18px_rgba(28,25,23,0.6)] hover:-translate-y-px transition-transform"
      >
        <span className="w-10 h-10 shrink-0 rounded-xl bg-[#2D6A4F] text-white flex items-center justify-center">
          <Layers className="w-[18px] h-[18px]" />
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-[11px] font-extrabold tracking-[0.1em] text-[#E9C77B] dark:text-[#2D6A4F]">SRS REVIEW · ~3 MIN</span>
          <span className="block text-sm font-bold truncate">Review your deck with flashcards</span>
        </span>
        <span className="w-10 h-10 shrink-0 rounded-full bg-[#E9C77B] text-[#1C1917] flex items-center justify-center">
          <Play className="w-3.5 h-3.5 fill-current" />
        </span>
      </button>

      {/* ===================================================================== */}
      {/* 2. MODE SWITCHER TABS (Scrollable on Mobile, Clean Pills on Desktop)  */}
      {/* ===================================================================== */}
      <div className="flex items-center gap-5 overflow-x-auto mb-4 border-b border-[#EAE4D8] dark:border-[#2E2924] no-scrollbar" role="tablist" aria-label="Dictionary mode">
        {(
          [
            {
              id: 'list',
              label: 'Lexicon Cards',
              badge: filteredWords.length.toLocaleString(),
              icon: List,
            },
            {
              id: 'table',
              label: 'Vocab Table',
              icon: List,
            },
            {
              id: 'flashcards',
              label: 'SRS Flashcards',
              icon: Layers,
            },
            {
              id: 'match',
              label: 'Match Game',
              icon: Trophy,
            },
            {
              id: 'dictation',
              label: 'Audio Dictation',
              icon: Headphones,
            },
            {
              id: 'quiz',
              label: 'Speed Quiz',
              icon: Zap,
            },
            {
              id: 'mistakes',
              label: 'Mistakes',
              badge: mistakeNotebook.length > 0 ? String(mistakeNotebook.length) : undefined,
              icon: AlertTriangle,
            },
          ] as {
            id: ViewMode;
            label: string;
            badge?: string;
            icon: React.ComponentType<{ className?: string }>;
          }[]
        ).map((tab) => {
          const IconComponent = tab.icon;
          const active = viewMode === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setViewMode(tab.id);
                if (
                  tab.id === 'flashcards' ||
                  tab.id === 'match' ||
                  tab.id === 'dictation' ||
                  tab.id === 'quiz'
                ) {
                  handleReshuffleDictionaryPractice();
                }
              }}
              role="tab"
              aria-selected={active}
              className={`relative shrink-0 pt-2 pb-2.5 text-[13px] inline-flex items-center gap-1.5 whitespace-nowrap transition-colors after:absolute after:left-0 after:right-0 after:-bottom-px after:h-[3px] after:rounded-t-[3px] after:bg-[#9E2A2B] after:transition-transform after:duration-200 ${
                active
                  ? 'font-bold text-[#1C1917] dark:text-[#F5F2EB] after:scale-x-100'
                  : 'font-semibold text-[#6E685F] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] after:scale-x-0'
              }`}
            >
              <IconComponent
                className={`w-4 h-4 ${active ? 'text-[#9E2A2B] dark:text-[#F87171]' : 'text-current'}`}
              />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`px-1.5 py-px rounded-full text-[10px] font-bold ${
                    active
                      ? 'bg-[#F8E7E3] text-[#9E2A2B] dark:bg-red-950/40 dark:text-[#FCA5A5]'
                      : 'bg-[#EFE9DD] text-[#6E685F] dark:bg-[#2E2924] dark:text-[#A8A29E]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ===================================================================== */}
      {/* 3. STREAMLINED SEARCH & FILTER BAR (Hidden in Mistake Notebook)       */}
      {/* ===================================================================== */}
      {viewMode !== 'mistakes' && (
        <div className="mb-5 space-y-2.5">
          {/* ROW 1: Search Bar + Curriculum Section Dropdown (12 Managed Lecture Banks) in Same Line */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-0">
              <Search className="w-[18px] h-[18px] text-[#8E877E] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                  setCardIndex(0);
                }}
                aria-label="Search words"
                placeholder="Search English, नेपाली or IPA…"
                className="w-full h-12 pl-10 pr-9 rounded-[14px] bg-white dark:bg-[#1A1714] border border-[#DFD7C8] dark:border-[#3A332D] text-base md:text-[15px] text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#8E877E] focus:outline-none focus:border-[#9E2A2B] focus:shadow-[0_0_0_4px_#F8E7E3] dark:focus:shadow-[0_0_0_4px_rgba(158,42,43,0.25)] transition-shadow"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setCurrentPage(1);
                    setCardIndex(0);
                  }}
                  aria-label="Clear search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[#8E877E] hover:text-[#1E1B18] dark:hover:text-[#F5F2EB]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Curriculum Section Selector (Mobile Bottom Sheet / Desktop Popover) */}
            <div className="w-full md:w-[310px] shrink-0">
              <ResponsiveSelectSheet
                value={selectedLectureNum !== null ? String(selectedLectureNum) : 'ALL'}
                onChange={(val) => {
                  setSelectedLectureNum(val === 'ALL' ? null : Number(val));
                  setCurrentPage(1);
                  setCardIndex(0);
                }}
                options={sectionSheetOptions}
                title="Filter by Curriculum Section (12 Lecture Banks)"
                icon={<Filter className="w-3.5 h-3.5 text-[#9E2A2B] shrink-0" />}
              />
            </div>
          </div>

          {/* ROW 2: Primary Useful Filters Outside + Secondary/Pattern Filters in Dropdown */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            {/* Primary Quick Filters (Outside — Mobile Scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-full pb-0.5">
              {(
                [
                  { id: 'all', label: 'All Words', count: allWords.length.toLocaleString() },
                  { id: 'core', label: 'Core Lesson', count: String(coreWordsCount) },
                  {
                    id: 'srs',
                    label: 'SRS Deck',
                    count: String(Math.max(coreWordsCount, srsTrackedCount)),
                  },
                  { id: 'saved', label: 'Saved Words', count: String(savedWordIds.length) },
                  {
                    id: 'mistakes-pool',
                    label: 'My Mistake Notebook',
                    count: String(mistakeNotebook.length),
                  },
                  { id: 'silent', label: 'Silent Letters' },
                ] as { id: FilterMode; label: string; count?: string }[]
              ).map((pill) => {
                const active = filterMode === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      setFilterMode(pill.id);
                      setCurrentPage(1);
                      setCardIndex(0);
                      setIsFlipped(false);
                    }}
                    aria-pressed={active}
                    className={`min-h-[32px] px-3 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 border ${
                      active
                        ? 'bg-[#F8E7E3] border-[#EBC9C1] text-[#9E2A2B] dark:bg-red-950/40 dark:border-red-900/50 dark:text-[#FCA5A5]'
                        : 'bg-white dark:bg-[#1F1C18] text-[#3D342B] dark:text-[#D6CFC4] border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] hover:text-[#9E2A2B]'
                    }`}
                  >
                    <span>{pill.label}</span>
                    {pill.count !== undefined && (
                      <span
                        className={`text-[10px] font-ipa ${
                          active ? 'text-[#9E2A2B]/80 dark:text-[#FCA5A5]/80' : 'text-[#8E877E]'
                        }`}
                      >
                        {pill.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Secondary Filters Dropdown (Mastered, CEFR Levels B1/B2/C1, Silent-Letter Families) */}
            <div className="flex items-center gap-2 ml-auto">
              {(selectedLectureNum !== null ||
                filterMode !== 'all' ||
                silentPatternFilter !== 'ALL' ||
                searchQuery.trim() !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterMode('all');
                    setSelectedLectureNum(null);
                    setSilentPatternFilter('ALL');
                    setCurrentPage(1);
                    setCardIndex(0);
                  }}
                  className="min-h-[34px] px-2.5 py-1 rounded-full text-[11px] font-medium text-[#9E2A2B] dark:text-[#F87171] hover:bg-[#F9E6E6]/50 transition-colors"
                >
                  Reset
                </button>
              )}

              <div ref={moreFiltersDropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMoreFiltersDropdownOpen((prev) => !prev)}
                  className={`min-h-[34px] px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1.5 border transition-all ${
                    isSecondaryFilterActive
                      ? 'bg-[#F9E6E6]/70 dark:bg-[#9E2A2B]/25 border-[#9E2A2B]/40 text-[#9E2A2B] dark:text-[#F87171] font-semibold'
                      : 'bg-[#FAF8F5] dark:bg-[#141210] border-[#E8E0D2] dark:border-[#2C2621] text-[#5E5850] dark:text-[#A8A29E] hover:border-[#9E2A2B]/40'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span className="max-w-[170px] truncate">{activeSecondaryFilterLabel}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      moreFiltersDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {moreFiltersDropdownOpen && (
                  <div className="absolute right-0 z-40 mt-2 w-72 sm:w-80 rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E8E0D2] dark:border-[#2C2621] shadow-xl p-3 space-y-3 max-h-[380px] overflow-y-auto">
                    {/* Mastery & CEFR Level Section */}
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E] mb-1.5 px-1">
                        Level &amp; Mastery Status
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(
                          [
                            { id: 'mastered', label: `Mastered (${masteredWordIds.length})` },
                            { id: 'B1', label: 'Level B1 · Foundation' },
                            { id: 'B2', label: 'Level B2 · Workplace' },
                            { id: 'C1', label: 'Level C1 · Advanced' },
                          ] as { id: FilterMode; label: string }[]
                        ).map((opt) => {
                          const active = filterMode === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setFilterMode(active ? 'all' : opt.id);
                                setCurrentPage(1);
                                setCardIndex(0);
                              }}
                              className={`px-2.5 py-2 rounded-xl text-left text-xs font-medium border flex items-center justify-between transition-colors ${
                                active
                                  ? 'bg-[#F9E6E6]/70 dark:bg-[#9E2A2B]/25 border-[#9E2A2B]/40 text-[#9E2A2B] dark:text-[#F87171] font-semibold'
                                  : 'bg-[#FAF8F5] dark:bg-[#141210] border-[#E8E0D2] dark:border-[#2C2621] text-[#1E1B18] dark:text-[#F5F2EB] hover:border-[#9E2A2B]/40'
                              }`}
                            >
                              <span className="truncate">{opt.label}</span>
                              {active && <Check className="w-3.5 h-3.5 shrink-0 text-[#9E2A2B]" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Silent-Letter Pattern Filter inside Dropdown */}
                    <div className="pt-2 border-t border-[#E8E0D2] dark:border-[#2C2621]">
                      <div className="flex items-center justify-between mb-1.5 px-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E877E]">
                          Silent-Letter Pattern Family
                        </span>
                        {silentPatternFilter !== 'ALL' && (
                          <button
                            type="button"
                            onClick={() => setSilentPatternFilter('ALL')}
                            className="text-[10px] font-semibold text-[#9E2A2B] hover:underline"
                          >
                            Clear pattern
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        {SILENT_PATTERN_PILLS.map((pill) => {
                          const isSelected = silentPatternFilter === pill.id;
                          return (
                            <button
                              key={pill.id}
                              type="button"
                              onClick={() => {
                                setSilentPatternFilter(pill.id);
                                setCurrentPage(1);
                                setCardIndex(0);
                                setMoreFiltersDropdownOpen(false);
                              }}
                              className={`w-full px-2.5 py-2 rounded-xl text-left text-xs flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'bg-[#F9E6E6]/70 dark:bg-[#9E2A2B]/25 text-[#9E2A2B] dark:text-[#F87171] font-semibold'
                                  : 'hover:bg-[#F3EFE6] dark:hover:bg-[#141210] text-[#1E1B18] dark:text-[#F5F2EB]'
                              }`}
                            >
                              <span>{pill.label}</span>
                              <div className="flex items-center gap-2">
                                {pill.id !== 'ALL' && (
                                  <span className="font-ipa text-[11px] text-[#8E877E]">
                                    {pill.example}
                                  </span>
                                )}
                                {isSelected && <Check className="w-3.5 h-3.5 text-[#9E2A2B]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hands-Free Commuter Audio Mode Drawer (Only shown when toggled open) */}
          {commuterOpen && (
            <div className="pt-3 border-t border-[#E8E0D2] dark:border-[#2C2621] bg-[#FAF8F5] dark:bg-[#141210] rounded-xl p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                    <Headphones className="w-3.5 h-3.5" />
                    <span>Hands-Free Commuter Audio Loop</span>
                  </div>
                  <p className="text-[11px] text-[#5E5850] dark:text-[#A8A29E]">
                    Plays 1.0x Word → 2s recall pause → 0.75x slow phoneme → example sentence.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {(
                    [
                      { id: 'filtered', label: `Current (${Math.min(100, filteredWords.length)})` },
                      { id: 'saved', label: `Saved (${savedWordIds.length})` },
                      { id: 'mistakes', label: `Mistakes (${mistakeNotebook.length})` },
                    ] as const
                  ).map((src) => (
                    <button
                      key={src.id}
                      type="button"
                      onClick={() => {
                        setCommuterPlaylistSource(src.id);
                        setCommuterIndex(0);
                      }}
                      className={`min-h-[30px] px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                        commuterPlaylistSource === src.id
                          ? 'bg-[#1E1B18] dark:bg-[#F5F2EB] text-white dark:text-[#1E1B18] border-transparent'
                          : 'bg-white dark:bg-[#1F1C18] border-[#E8E0D2] dark:border-[#2C2621] text-[#5E5850] dark:text-[#A8A29E]'
                      }`}
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              {currentCommuterWord ? (
                <div className="p-3 rounded-xl bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-ipa text-[#8E877E]">
                        Track {(commuterIndex % Math.max(1, commuterPlaylist.length)) + 1}/
                        {commuterPlaylist.length}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#F9E6E6] dark:bg-[#9E2A2B]/20 text-[#9E2A2B] dark:text-[#F87171] font-semibold">
                        {commuterPhase === 'word-1x' && 'Speaking 1.0x...'}
                        {commuterPhase === 'pause-2s' && '2s Recall Pause...'}
                        {commuterPhase === 'word-075x' && 'Slow 0.75x...'}
                        {commuterPhase === 'sentence' && 'Reading Sentence...'}
                        {commuterPhase === 'idle' && 'Ready'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-base font-bold text-[#1E1B18] dark:text-[#F5F2EB]">
                        {currentCommuterWord.word}
                      </span>
                      <span className="font-ipa text-xs text-[#8E877E]">
                        {currentCommuterWord.ipa}
                      </span>
                      <span className="font-nepali text-xs font-semibold text-[#2D6A4F] dark:text-emerald-400">
                        {currentCommuterWord.nepaliMeaning}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        if (commuterPlaying) {
                          setCommuterPlaying(false);
                          speechService.stop();
                        } else {
                          setCommuterPlaying(true);
                        }
                      }}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${
                        commuterPlaying
                          ? 'bg-[#1E1B18] dark:bg-[#F5F2EB] text-white dark:text-[#1E1B18]'
                          : 'bg-[#9E2A2B] text-white'
                      }`}
                    >
                      {commuterPlaying ? (
                        <>
                          <Square className="w-3 h-3" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3" />
                          <span>Play</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCommuterIndex(
                          (prev) => (prev + 1) % Math.max(1, commuterPlaylist.length)
                        )
                      }
                      className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <SkipForward className="w-3.5 h-3.5" />
                      <span>Next</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8E877E]">No words in the selected playlist source.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MISTAKE NOTEBOOK VIEW                                              */}
      {/* ===================================================================== */}
      {viewMode === 'mistakes' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9E2A2B] dark:text-[#F87171]">
                Targeted Weak-Word Review
              </div>
              <h2 className="font-serif text-xl sm:text-2xl text-[#1E1B18] dark:text-[#F5F2EB] mt-0.5">
                Mistake notebook ({mistakeNotebook.length})
              </h2>
              <p className="text-xs sm:text-sm text-[#5E5850] dark:text-[#A8A29E] mt-1">
                Answer any missed item accurately <strong>twice in a row (2/2)</strong> to graduate it out of your notebook.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setStudySheetModalMode('mistakes')}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Sheet</span>
              </button>
              <button
                type="button"
                onClick={() => exportMistakeNotebookToCSV(mistakeNotebook)}
                className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E8E0D2] dark:border-[#2C2621] bg-[#FAF8F5] dark:bg-[#141210] text-xs font-semibold text-[#1E1B18] dark:text-[#F5F2EB] inline-flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          {mistakeNotebook.length === 0 ? (
            <div className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl p-8 sm:p-10 text-center space-y-2.5">
              <div className="w-11 h-11 rounded-2xl bg-[#E3EFE8] text-[#2D6A4F] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg text-[#1E1B18] dark:text-[#F5F2EB]">
                Your mistake notebook is clear
              </h3>
              <p className="text-xs sm:text-sm text-[#5E5850] dark:text-[#A8A29E] max-w-md mx-auto">
                Any tricky words you miss during Audio Dictation or Speed Quiz will automatically appear here for review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {mistakeNotebook.map((item) => {
                const selectedAns = mistakeAnswers[item.id];
                const isCorrect =
                  selectedAns?.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase();

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl p-4 sm:p-5 space-y-3.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#F9E6E6] dark:bg-[#9E2A2B]/20 text-[#9E2A2B] dark:text-[#F87171] font-semibold uppercase text-[10px]">
                          {item.sourceType}
                        </span>
                        <button
                          onClick={() => onOpenLecture(item.lectureId)}
                          className="font-semibold hover:underline text-[#1E1B18] dark:text-[#F5F2EB]"
                        >
                          L{String(item.lectureNumber).padStart(2, '0')}
                        </button>
                        <span className="text-[#8E877E]">·</span>
                        <span className="text-[#5E5850] dark:text-[#A8A29E]">
                          Missed: <del className="text-[#9E2A2B]">{item.userWrongAnswer}</del>
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-ipa text-[11px] text-[#2D6A4F] dark:text-emerald-400 font-semibold">
                          Streak {item.consecutiveCorrect}/2
                        </span>
                        {onRemoveMistake && (
                          <button
                            onClick={() => onRemoveMistake(item.id)}
                            className="p-1 rounded-lg text-[#8E877E] hover:text-[#9E2A2B]"
                            title="Remove from notebook"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm sm:text-base font-semibold text-[#1E1B18] dark:text-[#F5F2EB]">
                      {item.prompt}
                    </p>
                    {item.nepaliHint && (
                      <p className="font-nepali text-xs text-[#5E5850] dark:text-[#A8A29E]">
                        Hint: “{item.nepaliHint}”
                      </p>
                    )}

                    {item.options && item.options.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {item.options.map((opt) => {
                          const isThisSelected = selectedAns === opt;
                          const isThisRight = opt === item.correctAnswer;
                          let style =
                            'bg-[#FAF8F5] dark:bg-[#141210] border-[#E8E0D2] dark:border-[#2C2621]';
                          if (selectedAns) {
                            if (isThisRight) {
                              style =
                                'bg-[#E3EFE8] dark:bg-emerald-950/40 border-[#2D6A4F] text-[#2D6A4F] font-semibold animate-correct-pop';
                            } else if (isThisSelected) {
                              style =
                                'bg-[#F9E6E6] dark:bg-red-950/40 border-[#9E2A2B] text-[#9E2A2B] line-through animate-wrong-shake';
                            }
                          }
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                setMistakeAnswers((prev) => ({ ...prev, [item.id]: opt }));
                                const right = opt === item.correctAnswer;
                                if (right) {
                                  speechService.playCorrectTone();
                                } else {
                                  speechService.playWrongTone();
                                }
                                if (onPracticeMistake) {
                                  onPracticeMistake(item.id, right);
                                }
                              }}
                              className={`min-h-[2.5rem] px-3.5 py-2 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                            >
                              <span>{opt}</span>
                              {selectedAns && isThisRight && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <button
                          onClick={() =>
                            speechService.speak(item.correctAnswer, { rate: preferredSpeechRate })
                          }
                          className="min-h-[2.5rem] px-3.5 py-2 rounded-xl border border-[#E8E0D2] dark:border-[#2C2621] bg-[#FAF8F5] dark:bg-[#141210] text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                          <span>Hear Word</span>
                        </button>
                        <input
                          type="text"
                          value={mistakeAnswers[item.id] || ''}
                          onChange={(e) =>
                            setMistakeAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Type exact spelling..."
                          className="flex-1 min-h-[2.5rem] px-3.5 py-2 rounded-xl border border-[#E8E0D2] dark:border-[#2C2621] bg-[#FAF8F5] dark:bg-[#141210] text-sm font-ipa"
                        />
                        <button
                          onClick={() => {
                            if (mistakeAnswers[item.id]) {
                              if (isCorrect) {
                                speechService.playCorrectTone();
                              } else {
                                speechService.playWrongTone();
                              }
                              if (onPracticeMistake) {
                                onPracticeMistake(item.id, isCorrect);
                              }
                            }
                          }}
                          className="min-h-[2.5rem] px-4 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold"
                        >
                          Verify
                        </button>
                      </div>
                    )}

                    {selectedAns && (
                      <div className="p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs text-[#5E5850] dark:text-[#A8A29E]">
                        <strong className="text-[#1E1B18] dark:text-[#F5F2EB]">
                          Answer: “{item.correctAnswer}” —{' '}
                        </strong>
                        {item.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. AUDIO DICTATION BEE MODE                                           */}
      {/* ===================================================================== */}
      {viewMode === 'dictation' && currentDictationWord && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#E8E0D2] dark:border-[#2C2621] text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <Headphones className="w-4 h-4 text-[#9E2A2B]" />
                <span className="font-semibold text-[#1E1B18] dark:text-[#F5F2EB]">
                  Audio Dictation
                </span>
                <span className="text-[#8E877E]">·</span>
                <span className="text-[#5E5850] dark:text-[#A8A29E]">
                  Set Item #{(dictationIndex % Math.max(1, shuffledPracticePool.length)) + 1} · L
                  {String(currentDictationWord.lectureNumber).padStart(2, '0')} (
                  {currentDictationWord.level})
                </span>
              </div>
              <div className="font-ipa flex flex-wrap items-center gap-2.5 text-xs">
                {dictationTimerRunning ? (
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                      dictationSecondsLeft <= 10
                        ? 'bg-[#F9E6E6] text-[#9E2A2B] animate-pulse'
                        : 'bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-[#1E1B18] dark:text-[#F5F2EB]'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>{dictationSecondsLeft}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartDictationTimed(60)}
                    className="px-2.5 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#9E2A2B] font-semibold inline-flex items-center gap-1 text-[#1E1B18] dark:text-[#F5F2EB]"
                  >
                    <Timer className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>60s Challenge</span>
                  </button>
                )}
                <span>
                  Score: <strong>{dictationStats.correct}</strong>/{dictationStats.total}
                </span>
                <span className="text-[#B8863B] font-semibold">
                  Streak {dictationStats.streak}
                </span>
                <button
                  type="button"
                  onClick={handleReshuffleDictionaryPractice}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#9E2A2B] font-semibold inline-flex items-center gap-1"
                  title="Shuffle questions and options"
                >
                  <Shuffle className="w-3 h-3 text-[#9E2A2B]" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            {/* Dictation Mode Toggle: 4-Option Spelling Check vs Type Exact Spelling */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex rounded-xl p-1 bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621]">
                <button
                  type="button"
                  onClick={() => {
                    setDictationMode('options');
                    setDictationSubmitted(false);
                    setDictationInput('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    dictationMode === 'options'
                      ? 'bg-[#1E1B18] dark:bg-[#F5F2EB] text-white dark:text-[#1E1B18]'
                      : 'text-[#5E5850] dark:text-[#A8A29E]'
                  }`}
                >
                  4-Option Spelling Check
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDictationMode('type');
                    setDictationSubmitted(false);
                    setDictationInput('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    dictationMode === 'type'
                      ? 'bg-[#1E1B18] dark:bg-[#F5F2EB] text-white dark:text-[#1E1B18]'
                      : 'text-[#5E5850] dark:text-[#A8A29E]'
                  }`}
                >
                  Type Exact Spelling
                </button>
              </div>
              {dictationSecondsLeft === 0 && !dictationTimerRunning && dictationStats.total > 0 && (
                <span className="text-xs font-semibold text-[#9E2A2B]">
                  Time&apos;s up! Final 60s Score: {dictationStats.correct}/{dictationStats.total}
                </span>
              )}
            </div>

            <div className="text-center space-y-4">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    speechService.speak(currentDictationWord.word, { rate: preferredSpeechRate })
                  }
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#822021]"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Play Word</span>
                </button>

                <button
                  type="button"
                  onClick={() => speechService.speak(currentDictationWord.word, { rate: 0.6 })}
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Turtle className="w-4 h-4 text-[#B8863B]" />
                  <span>Slow (0.6x)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    speechService.speak(currentDictationWord.englishExample, {
                      rate: preferredSpeechRate,
                    })
                  }
                  className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-medium inline-flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#5E5850]" />
                  <span>Sentence</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] max-w-lg mx-auto space-y-1">
                <div className="font-nepali text-sm sm:text-base font-semibold text-[#1E1B18] dark:text-[#F5F2EB]">
                  {currentDictationWord.nepaliMeaning}
                </div>
                <div className="font-ipa text-xs text-[#5E5850] dark:text-[#A8A29E]">
                  {currentDictationWord.ipa} · {currentDictationWord.partOfSpeech} ·{' '}
                  <strong className="text-[#9E2A2B] dark:text-[#F87171]">
                    {currentDictationWord.silentLettersSummary}
                  </strong>
                </div>
              </div>
            </div>

            {dictationMode === 'options' ? (
              <div className="space-y-3">
                <div className="text-xs text-center text-[#5E5850] dark:text-[#A8A29E]">
                  Select the correct silent-letter English spelling:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {dictationSpellingOptions.map((opt, idx) => {
                    const isSelected = dictationInput === opt;
                    const isCorrect =
                      opt.trim().toLowerCase() === currentDictationWord.word.trim().toLowerCase();
                    let optClass =
                      'border-[#E8E0D2] dark:border-[#2C2621] bg-[#FAF8F5] dark:bg-[#141210] hover:border-[#9E2A2B]';
                    if (dictationSubmitted) {
                      if (isCorrect) {
                        optClass =
                          'border-[#2D6A4F] bg-[#E3EFE8] dark:bg-emerald-950/40 text-[#2D6A4F] dark:text-emerald-300 font-semibold animate-correct-pop';
                      } else if (isSelected) {
                        optClass =
                          'border-[#9E2A2B] bg-[#F9E6E6] dark:bg-red-950/40 text-[#9E2A2B] dark:text-red-300 animate-wrong-shake';
                      }
                    }
                    return (
                      <button
                        key={`${opt}-${idx}`}
                        type="button"
                        disabled={dictationSubmitted}
                        onClick={() => {
                          handleSubmitDictationAnswer(opt);
                        }}
                        className={`min-h-[2.875rem] px-4 py-2.5 rounded-xl border font-ipa text-sm sm:text-base flex items-center justify-between gap-2 transition-all ${optClass}`}
                      >
                        <span>{opt}</span>
                        {dictationSubmitted && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                        )}
                        {dictationSubmitted && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-[#9E2A2B] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
                {dictationSubmitted && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleNextDictationWord}
                      className="min-h-[42px] px-5 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      <span>Next Word</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleCheckDictation} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={dictationInput}
                    onChange={(e) => setDictationInput(e.target.value)}
                    disabled={dictationSubmitted}
                    placeholder="Type the English spelling..."
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] font-ipa text-sm sm:text-base text-[#1E1B18] dark:text-[#F5F2EB] focus:outline-none focus:border-[#9E2A2B]"
                  />
                  {!dictationSubmitted ? (
                    <button
                      type="submit"
                      disabled={!dictationInput.trim()}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#1E1B18] dark:bg-[#F5F2EB] text-white dark:text-[#1E1B18] text-xs sm:text-sm font-semibold disabled:opacity-40"
                    >
                      Check
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNextDictationWord}
                      className="min-h-[44px] px-5 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                    >
                      <span>Next Word</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </form>
            )}

            {dictationSubmitted && (
              <div className="p-4 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] space-y-2">
                {dictationInput.trim().toLowerCase() ===
                currentDictationWord.word.trim().toLowerCase() ? (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#2D6A4F] dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Exact spelling match!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                    <XCircle className="w-4 h-4" />
                    <span>
                      You answered “{dictationInput.trim()}” (Added to Mistake Notebook)
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-baseline gap-2.5">
                  <span className="text-xs text-[#8E877E]">Spelling:</span>
                  <span className="text-xl font-bold font-ipa text-[#1E1B18] dark:text-[#F5F2EB]">
                    {currentDictationWord.segments?.map((seg, idx) =>
                      seg.silent ? (
                        <span
                          key={idx}
                          className="text-[#9E2A2B] dark:text-[#F87171] bg-[#9E2A2B]/10 underline decoration-dotted px-0.5 rounded"
                        >
                          {seg.text}
                        </span>
                      ) : (
                        <span key={idx}>{seg.text}</span>
                      )
                    )}
                  </span>
                </div>
                <p className="text-xs text-[#5E5850] dark:text-[#A8A29E]">
                  “{currentDictationWord.englishExample}”
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. EMPTY STATE                                                        */}
      {/* ===================================================================== */}
      {viewMode !== 'mistakes' && filteredWords.length === 0 && (
        <div className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl p-8 sm:p-10 text-center">
          <p className="font-serif text-lg text-[#1E1B18] dark:text-[#F5F2EB] mb-1">
            No matching words found
          </p>
          <p className="text-xs sm:text-sm text-[#5E5850] dark:text-[#A8A29E] mb-4">
            Try clearing your search or switching your active curriculum section filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterMode('all');
              setSelectedLectureNum(null);
              setSilentPatternFilter('ALL');
              setCurrentPage(1);
            }}
            className="min-h-[40px] px-4 py-2 rounded-full bg-[#9E2A2B] text-white text-xs font-semibold"
          >
            Reset all filters
          </button>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. SPEED QUIZ DRILL MODE                                              */}
      {/* ===================================================================== */}
      {viewMode === 'quiz' && currentQuizQuestion && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-[#E8E0D2] dark:border-[#2C2621] text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[#9E2A2B] dark:text-[#F87171]">
                  Speed Quiz
                </span>
                <span className="text-[#8E877E]">·</span>
                <span className="text-[#5E5850] dark:text-[#A8A29E]">
                  Q#{quizIndex + 1} · L
                  {String(currentQuizQuestion.target.lectureNumber).padStart(2, '0')} (
                  {currentQuizQuestion.target.level})
                </span>
              </div>
              <div className="font-ipa flex flex-wrap items-center gap-2.5">
                {quizTimerRunning ? (
                  <span
                    className={`px-2.5 py-1 rounded-full font-bold inline-flex items-center gap-1 ${
                      quizSecondsLeft <= 10
                        ? 'bg-[#F9E6E6] text-[#9E2A2B] animate-pulse'
                        : 'bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-[#1E1B18] dark:text-[#F5F2EB]'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>{quizSecondsLeft}s</span>
                  </span>
                ) : (
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartQuizTimedChallenge(60)}
                      className="px-2.5 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#9E2A2B] font-semibold inline-flex items-center gap-1 text-[#1E1B18] dark:text-[#F5F2EB]"
                    >
                      <Timer className="w-3.5 h-3.5 text-[#9E2A2B]" />
                      <span>60s Challenge</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStartQuizTimedChallenge(30)}
                      className="px-2 py-1 rounded-full bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#B8863B] font-semibold text-[11px] text-[#5E5850] dark:text-[#A8A29E]"
                    >
                      30s Blitz
                    </button>
                  </div>
                )}
                <span>
                  Score: <strong>{quizScore.correct}</strong>/{quizScore.total}
                </span>
                <span className="text-[#B8863B] font-semibold">Streak {quizScore.streak}</span>
                <button
                  type="button"
                  onClick={handleReshuffleDictionaryPractice}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#9E2A2B] font-semibold inline-flex items-center gap-1"
                  title="Shuffle questions and options"
                >
                  <Shuffle className="w-3 h-3 text-[#9E2A2B]" />
                  <span>Shuffle</span>
                </button>
              </div>
            </div>

            {/* Question Set Mode Selector */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'en-to-ne', label: 'English → Nepali' },
                    { id: 'ne-to-en', label: 'Nepali → English' },
                    { id: 'silent-rule', label: 'Silent-Letter Rule' },
                    { id: 'naati-set', label: 'NAATI Vocab Set' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => {
                      setQuizModeType(mode.id);
                      setQuizSelectedOption(null);
                      setDictShuffleSeed((s) => s + 1);
                      setQuizIndex(0);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      quizModeType === mode.id
                        ? 'bg-[#1E1B18] dark:bg-[#F5F2EB] text-white dark:text-[#1E1B18] border-[#1E1B18] dark:border-[#F5F2EB]'
                        : 'bg-[#FAF8F5] dark:bg-[#141210] text-[#5E5850] dark:text-[#A8A29E] border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#9E2A2B]'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
              {quizSecondsLeft === 0 && !quizTimerRunning && quizScore.total > 0 && (
                <span className="text-xs font-semibold text-[#9E2A2B]">
                  Time&apos;s up! Timed Score: {quizScore.correct}/{quizScore.total}
                </span>
              )}
            </div>

            <div className="text-center space-y-2.5">
              <div className="text-xs text-[#5E5850] dark:text-[#A8A29E]">
                {currentQuizQuestion.promptTitle}
              </div>
              <div className="font-serif text-2xl sm:text-4xl text-[#1E1B18] dark:text-[#F5F2EB]">
                {quizModeType === 'en-to-ne' || quizModeType === 'silent-rule'
                  ? currentQuizQuestion.target.segments?.map((seg, i) =>
                      seg.silent && quizModeType === 'en-to-ne' ? (
                        <span
                          key={i}
                          className="text-[#9E2A2B] dark:text-[#F87171] underline decoration-dotted"
                        >
                          {seg.text}
                        </span>
                      ) : (
                        <span key={i}>{seg.text}</span>
                      )
                    )
                  : currentQuizQuestion.promptMain}
              </div>
              <div className="font-ipa text-xs sm:text-sm text-[#8E877E]">
                {currentQuizQuestion.promptSub}
              </div>
              <div className="pt-1">
                <button
                  onClick={() =>
                    speechService.speak(currentQuizQuestion.target.word, {
                      rate: preferredSpeechRate,
                    })
                  }
                  className="min-h-[36px] px-3.5 py-1.5 rounded-full bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>Listen</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {currentQuizQuestion.options.map((opt, idx) => {
                const isSelected = quizSelectedOption === opt;
                const isAnswer = opt === currentQuizQuestion.correctAnswer;
                let btnStyle =
                  'border-[#E8E0D2] dark:border-[#2C2621] bg-[#FAF8F5] dark:bg-[#141210] hover:border-[#9E2A2B]';
                if (quizSelectedOption) {
                  if (isAnswer) {
                    btnStyle =
                      'border-[#2D6A4F] bg-[#E3EFE8] dark:bg-emerald-950/40 text-[#2D6A4F] dark:text-emerald-300 font-semibold animate-correct-pop';
                  } else if (isSelected) {
                    btnStyle =
                      'border-[#9E2A2B] bg-[#F9E6E6] dark:bg-red-950/40 text-[#9E2A2B] dark:text-red-300 animate-wrong-shake';
                  }
                }
                return (
                  <button
                    key={`${opt}-${idx}`}
                    onClick={() => handleAnswerQuiz(opt)}
                    disabled={Boolean(quizSelectedOption)}
                    className={`min-h-[3rem] px-4 py-2.5 rounded-xl border text-left font-nepali text-sm sm:text-base flex items-center justify-between gap-3 transition-all ${btnStyle}`}
                  >
                    <span className="flex items-center gap-2.5 min-w-0">
                      <span className="hidden sm:inline-flex w-5 h-5 rounded-md bg-black/5 dark:bg-white/10 text-[10px] font-ipa font-semibold items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{opt}</span>
                    </span>
                    {quizSelectedOption && isAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                    )}
                    {quizSelectedOption && isSelected && !isAnswer && (
                      <XCircle className="w-4 h-4 text-[#9E2A2B] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {quizSelectedOption && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs space-y-0.5">
                  <div className="font-semibold text-[#1E1B18] dark:text-[#F5F2EB]">
                    “{currentQuizQuestion.target.englishExample}”
                  </div>
                  <div className="text-[#8E877E]">
                    {currentQuizQuestion.target.word} ({currentQuizQuestion.target.nepaliMeaning}) ·{' '}
                    {currentQuizQuestion.target.silentLettersSummary}
                  </div>
                </div>
                <button
                  onClick={handleNextQuizQuestion}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* End-of-Round Mistake Review when Timed Challenge Finishes */}
            {quizTimerFinished && !quizTimerRunning && (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#9E2A2B]/30 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#9E2A2B]">
                      {quizTimerDuration}s Timed Challenge Complete
                    </div>
                    <h4 className="font-serif text-lg text-[#1E1B18] dark:text-[#F5F2EB]">
                      Final Score: {quizScore.correct} / {quizScore.total}
                    </h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {quizMissedWords.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuizPracticeMissedOnly(quizMissedWords);
                          setQuizIndex(0);
                          setQuizSelectedOption(null);
                          setQuizTimerFinished(false);
                        }}
                        className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Practice Missed Words Only ({quizMissedWords.length})</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleStartQuizTimedChallenge(quizTimerDuration || 60)}
                      className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-semibold"
                    >
                      Play Again
                    </button>
                  </div>
                </div>

                {quizMissedWords.length > 0 && (
                  <div className="pt-2 border-t border-[#E8E0D2] dark:border-[#2C2621] space-y-1.5">
                    <div className="text-xs font-semibold text-[#5E5850] dark:text-[#A8A29E]">
                      Words missed in this round:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quizMissedWords.map((mw) => (
                        <WordPhoneticsPopover
                          key={mw.id}
                          word={mw.word}
                          ipa={mw.ipa}
                          partOfSpeech={mw.partOfSpeech}
                          nepaliMeaning={mw.nepaliMeaning}
                          silentLettersSummary={mw.silentLettersSummary}
                          englishExample={mw.englishExample}
                          segments={mw.segments}
                          isSaved={savedWordIds.includes(mw.id)}
                          preferredSpeechRate={preferredSpeechRate}
                          onToggleSave={() => onToggleSaveWord(mw.id)}
                        >
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] text-xs inline-flex items-center gap-1.5 hover:border-[#9E2A2B]"
                          >
                            <span className="font-semibold text-[#9E2A2B]">{mw.word}</span>
                            <span className="font-nepali text-[#2D6A4F]">{mw.nepaliMeaning}</span>
                          </button>
                        </WordPhoneticsPopover>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. SRS FLASHCARDS MODE                                                */}
      {/* ===================================================================== */}
      {viewMode === 'flashcards' && currentFlashcard && (
        <div className="max-w-2xl mx-auto">
          {/* Compact Session Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5E5850] dark:text-[#A8A29E] mb-3 bg-white dark:bg-[#191715] px-4 py-2.5 rounded-xl border border-[#E8E0D2] dark:border-[#2C2621]">
            <div className="flex items-center gap-2.5">
              <span className="font-ipa font-semibold text-[#1E1B18] dark:text-[#F5F2EB]">
                {(cardIndex + 1).toLocaleString()} / {shuffledPracticePool.length.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#E3EFE8] dark:bg-emerald-950/40 text-[11px] font-semibold text-[#2D6A4F] dark:text-emerald-300">
                Reviewed: {flashcardSessionReviewed}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setFlashcardAutoSpeak((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 transition-colors ${
                  flashcardAutoSpeak
                    ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                    : 'bg-[#FAF8F5] dark:bg-[#141210] border-[#E8E0D2] dark:border-[#2C2621] text-[#5E5850] dark:text-[#A8A29E]'
                }`}
              >
                <Volume2 className="w-3 h-3" />
                <span>Auto {flashcardAutoSpeak ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={handleShuffleFlashcard}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-[11px] font-semibold text-[#1E1B18] dark:text-[#F5F2EB] inline-flex items-center gap-1 hover:border-[#9E2A2B]"
              >
                <Shuffle className="w-3 h-3 text-[#9E2A2B]" />
                <span>Shuffle Deck &amp; Options</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl p-5 sm:p-8 min-h-[340px] flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-[11px] font-semibold text-[#1E1B18] dark:text-[#F5F2EB]">
                  L{String(currentFlashcard.lectureNumber).padStart(2, '0')} · {currentFlashcard.level}
                </span>
                <span className="text-xs text-[#8E877E]">
                  {currentFlashcard.partOfSpeech} · {currentFlashcard.silentLettersSummary}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {onToggleMasteredWord && (
                  <button
                    onClick={() => onToggleMasteredWord(currentFlashcard.id)}
                    className={`min-h-[34px] px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                      masteredWordIds.includes(currentFlashcard.id)
                        ? 'bg-[#E3EFE8] border-[#2D6A4F]/30 text-[#2D6A4F]'
                        : 'border-[#E8E0D2] dark:border-[#2C2621] text-[#5E5850] dark:text-[#A8A29E]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{masteredWordIds.includes(currentFlashcard.id) ? 'Mastered' : 'Master'}</span>
                  </button>
                )}
                <button
                  onClick={() => onToggleSaveWord(currentFlashcard.id)}
                  className="min-h-[34px] px-2.5 rounded-lg border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-medium inline-flex items-center gap-1"
                >
                  {savedWordIds.includes(currentFlashcard.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-[#9E2A2B]" />
                  ) : (
                    <Bookmark className="w-4 h-4 text-[#8E877E]" />
                  )}
                </button>
              </div>
            </div>

            <div className="my-5 text-center">
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="cursor-pointer select-none inline-block px-5 py-2.5 rounded-2xl hover:bg-[#FAF8F5] dark:hover:bg-[#141210] transition-colors"
              >
                <div className="font-serif font-bold text-3xl sm:text-5xl text-[#1E1B18] dark:text-[#F5F2EB] mb-1.5">
                  {currentFlashcard.segments?.map((seg, i) =>
                    seg.silent ? (
                      <span
                        key={i}
                        className="text-[#9E2A2B] dark:text-[#F87171] bg-[#9E2A2B]/10 underline decoration-dotted decoration-2 underline-offset-6 px-0.5 rounded"
                      >
                        {seg.text}
                      </span>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )}
                </div>
                <div className="font-ipa text-sm sm:text-base text-[#8E877E]">
                  {currentFlashcard.ipa}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 my-3">
                <button
                  onClick={() =>
                    speechService.speak(currentFlashcard.word, { rate: preferredSpeechRate })
                  }
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-[#9E2A2B]"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                  <span>Listen</span>
                </button>
                <button
                  onClick={() => speechService.speak(currentFlashcard.word, { rate: 0.6 })}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-medium inline-flex items-center gap-1.5 hover:border-[#B8863B]"
                >
                  <Turtle className="w-3.5 h-3.5 text-[#B8863B]" />
                  <span>Slow</span>
                </button>
                <button
                  onClick={handleFlashcardMicTest}
                  disabled={flashcardMicListening}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                    flashcardMicListening
                      ? 'bg-[#9E2A2B] text-white border-[#9E2A2B] animate-pulse'
                      : 'bg-[#F9E6E6] dark:bg-red-950/40 border-[#9E2A2B]/30 text-[#9E2A2B] dark:text-red-300'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{flashcardMicListening ? 'Listening...' : 'Speak'}</span>
                </button>
              </div>

              {flashcardMicResult && (
                <div className="max-w-md mx-auto mb-4 p-3 rounded-xl bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs">
                  <div className="flex items-center justify-between font-semibold mb-0.5">
                    <span>Heard: “{flashcardMicResult.transcript || '—'}”</span>
                    <span
                      className={
                        flashcardMicResult.score >= 80 ? 'text-[#2D6A4F]' : 'text-[#B8863B]'
                      }
                    >
                      {flashcardMicResult.score}%
                    </span>
                  </div>
                  <p className="text-[#5E5850] dark:text-[#A8A29E]">
                    {flashcardMicResult.feedback || flashcardMicResult.feedbackEnglish}
                  </p>
                </div>
              )}

              {/* 4-Option Shuffled Quick Meaning Check before flipping */}
              {!isFlipped && flashcardQuizOptions.length > 1 && (
                <div className="max-w-lg mx-auto my-3 space-y-2">
                  <div className="text-[11px] font-medium text-[#8E877E]">
                    Test your recall (4 shuffled options) or flip directly:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {flashcardQuizOptions.map((opt, idx) => {
                      const isChosen = flashcardQuizPicked === opt;
                      const isRight = opt === currentFlashcard.nepaliMeaning;
                      return (
                        <button
                          key={`${opt}-${idx}`}
                          type="button"
                          onClick={() => {
                            if (isRight) {
                              speechService.playCorrectTone();
                            } else {
                              speechService.playWrongTone();
                            }
                            setFlashcardQuizPicked(opt);
                            setIsFlipped(true);
                          }}
                          className={`min-h-[2.5rem] px-3 py-2 rounded-xl border text-left font-nepali text-xs sm:text-sm transition-all flex items-center justify-between gap-2 ${
                            isChosen
                              ? isRight
                                ? 'border-[#2D6A4F] bg-[#E3EFE8] text-[#2D6A4F] font-semibold animate-correct-pop'
                                : 'border-[#9E2A2B] bg-[#F9E6E6] text-[#9E2A2B] animate-wrong-shake'
                              : 'border-[#E8E0D2] dark:border-[#2C2621] bg-[#FAF8F5] dark:bg-[#141210] hover:border-[#9E2A2B]'
                          }`}
                        >
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {isFlipped ? (
                <div className="pt-4 border-t border-[#E8E0D2] dark:border-[#2C2621] space-y-2.5 text-center">
                  {flashcardQuizPicked && (
                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        flashcardQuizPicked === currentFlashcard.nepaliMeaning
                          ? 'bg-[#E3EFE8] text-[#2D6A4F]'
                          : 'bg-[#F9E6E6] text-[#9E2A2B]'
                      }`}
                    >
                      {flashcardQuizPicked === currentFlashcard.nepaliMeaning ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Correct recall!</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>You picked “{flashcardQuizPicked}”</span>
                        </>
                      )}
                    </div>
                  )}
                  <div className="font-nepali text-xl sm:text-2xl font-semibold text-[#2D6A4F] dark:text-emerald-400">
                    {currentFlashcard.nepaliMeaning}
                  </div>
                  <p className="text-xs sm:text-sm text-[#1E1B18] dark:text-[#F5F2EB]">
                    “{currentFlashcard.englishExample}”
                  </p>
                  {isFullNepali && (
                    <p className="font-nepali text-xs text-[#5E5850] dark:text-[#A8A29E]">
                      {currentFlashcard.nepaliExampleTranslation}
                    </p>
                  )}

                  <div className="pt-2.5 space-y-2">
                    <div className="text-[11px] font-medium text-[#78716C] dark:text-[#A8A29E]">
                      Rate your recall to schedule next review:
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
                      <button
                        type="button"
                        onClick={() => handleRateFlashcardSRS('again')}
                        className="min-h-[42px] px-3 py-1.5 rounded-xl border border-[#9E2A2B]/35 bg-[#F9E6E6] dark:bg-red-950/40 text-[#9E2A2B] dark:text-red-200 text-xs font-semibold flex flex-col items-center justify-center leading-tight hover:opacity-90 transition-opacity"
                      >
                        <span>Again</span>
                        <span className="text-[10px] opacity-80 font-normal">1h retry</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRateFlashcardSRS('hard')}
                        className="min-h-[42px] px-3 py-1.5 rounded-xl border border-[#B8863B]/40 bg-[#FBF3E4] dark:bg-amber-950/40 text-[#8A5A19] dark:text-amber-200 text-xs font-semibold flex flex-col items-center justify-center leading-tight hover:opacity-90 transition-opacity"
                      >
                        <span>Hard</span>
                        <span className="text-[10px] opacity-80 font-normal">6h review</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRateFlashcardSRS('good')}
                        className="min-h-[42px] px-3 py-1.5 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold flex flex-col items-center justify-center leading-tight hover:opacity-95 transition-opacity"
                      >
                        <span>Good</span>
                        <span className="text-[10px] opacity-85 font-normal">1d–3d</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRateFlashcardSRS('easy')}
                        className="min-h-[42px] px-3 py-1.5 rounded-xl bg-[#1E1B18] dark:bg-[#F5F2EB] text-white dark:text-[#1E1B18] text-xs font-semibold flex flex-col items-center justify-center leading-tight hover:opacity-95 transition-opacity"
                      >
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Easy
                        </span>
                        <span className="text-[10px] opacity-80 font-normal">2d–4d</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="mt-2 min-h-[40px] px-5 py-2 rounded-full bg-[#1E1B18] dark:bg-[#F5F2EB] text-white dark:text-[#1E1B18] text-xs font-semibold inline-flex items-center gap-2"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Flip to reveal Nepali meaning</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 border-t border-[#E8E0D2] dark:border-[#2C2621]">
              <button
                onClick={handlePrevCard}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <div className="flex flex-col items-center text-[11px] text-[#8E877E]">
                <span>
                  SRS Stage:{' '}
                  <strong className="uppercase text-[#9E2A2B] dark:text-[#F87171]">
                    {wordSRS[currentFlashcard.id]?.stage || 'new'}
                  </strong>
                </span>
                <span className="text-[10px]">
                  {wordSRS[currentFlashcard.id]
                    ? `Streak ${wordSRS[currentFlashcard.id].correctStreak} · Due ${new Date(
                        wordSRS[currentFlashcard.id].nextReviewDue
                      ).toLocaleDateString()}`
                    : 'Why due: New unreviewed word'}
                </span>
              </div>
              <button
                onClick={handleNextCard}
                className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 9. SILENT-LETTER MATCH GAME MODE                                      */}
      {/* ===================================================================== */}
      {viewMode === 'match' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl p-4 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#E8E0D2] dark:border-[#2C2621] mb-5">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#9E2A2B] mb-0.5">
                  Word Pairing · Shuffled Set #{matchBoardRound + 1}
                </div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1E1B18] dark:text-[#F5F2EB]">
                  Match silent-letter words with Nepali meanings
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {matchTimerRunning ? (
                  <span
                    className={`px-2.5 py-1 rounded-lg font-ipa text-xs font-bold inline-flex items-center gap-1 ${
                      matchSecondsLeft <= 10
                        ? 'bg-[#F9E6E6] text-[#9E2A2B] animate-pulse'
                        : 'bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621]'
                    }`}
                  >
                    <Timer className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>{matchSecondsLeft}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleStartMatchTimed(60)}
                    className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#9E2A2B] text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Timer className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>60s Challenge</span>
                  </button>
                )}
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-semibold">
                  Matched: <strong className="text-[#2D6A4F]">{matchedPairIds.length}/6</strong>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs font-semibold">
                  Streak: <strong className="text-[#9E2A2B]">{matchGameStats.streak}</strong>
                </span>
                <button
                  onClick={handleNextMatchRound}
                  className="min-h-[34px] px-3 py-1 rounded-lg bg-[#9E2A2B] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Shuffle New Set</span>
                </button>
              </div>
            </div>

            {matchedPairIds.length === matchBoardData.pairs.length &&
            matchBoardData.pairs.length > 0 ? (
              <div className="text-center py-8 space-y-3 bg-[#FAF8F5] dark:bg-[#141210] rounded-2xl border border-[#E8E0D2] dark:border-[#2C2621]">
                <div className="w-11 h-11 rounded-full bg-[#E3EFE8] text-[#2D6A4F] flex items-center justify-center mx-auto">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-xl text-[#1E1B18] dark:text-[#F5F2EB]">
                  All 6 pairs matched!
                </h3>
                <p className="text-xs sm:text-sm text-[#5E5850] dark:text-[#A8A29E]">
                  These words have been advanced in your Spaced Repetition deck.
                </p>
                <button
                  onClick={handleNextMatchRound}
                  className="min-h-[40px] px-5 py-2 rounded-full bg-[#9E2A2B] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <span>Play Next Shuffled Round</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {/* Left Column: English Words */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#8E877E] mb-1">
                    1. Tap English Word
                  </div>
                  {matchBoardData.pairs.map((item) => {
                    const isMatched = matchedPairIds.includes(item.id);
                    const isSelected = selectedMatchWordId === item.id;
                    return (
                      <button
                        key={`word-${item.id}`}
                        disabled={isMatched}
                        onClick={() => handleSelectMatchWord(item.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isMatched
                            ? 'bg-[#E3EFE8]/60 dark:bg-emerald-950/20 border-[#2D6A4F]/30 opacity-60 cursor-default animate-correct-pop'
                            : isSelected
                            ? wrongMatchFlash
                              ? 'bg-red-100 border-red-500 text-red-900 animate-wrong-shake'
                              : 'bg-[#F9E6E6] dark:bg-red-950/40 border-[#9E2A2B] ring-1 ring-[#9E2A2B]/30'
                            : 'bg-[#FAF8F5] dark:bg-[#141210] border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#9E2A2B]'
                        }`}
                      >
                        <div>
                          <div className="text-sm sm:text-base font-bold text-[#1E1B18] dark:text-[#F5F2EB]">
                            {item.segments?.map((seg, idx) =>
                              seg.silent ? (
                                <span
                                  key={idx}
                                  className="text-[#9E2A2B] underline decoration-dotted underline-offset-4"
                                >
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={idx}>{seg.text}</span>
                              )
                            )}
                          </div>
                          <div className="text-[0.6875rem] font-ipa text-[#8E877E]">
                            {item.ipa} · {item.silentLettersSummary}
                          </div>
                        </div>
                        {isMatched ? (
                          <CheckCircle2 className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                        ) : (
                          <Volume2 className="w-4 h-4 text-[#9E2A2B] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Nepali Meanings */}
                <div className="space-y-2">
                  <div className="text-[0.6875rem] font-bold uppercase tracking-wider text-[#8E877E] mb-1">
                    2. Match Nepali Meaning
                  </div>
                  {matchBoardData.shuffledMeanings.map((item) => {
                    const isMatched = matchedPairIds.includes(item.id);
                    const isSelected = selectedMatchMeaningId === item.id;
                    return (
                      <button
                        key={`meaning-${item.id}`}
                        disabled={isMatched}
                        onClick={() => handleSelectMatchMeaning(item.id)}
                        className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between min-h-[3.75rem] ${
                          isMatched
                            ? 'bg-[#E3EFE8]/60 dark:bg-emerald-950/20 border-[#2D6A4F]/30 opacity-60 cursor-default animate-correct-pop'
                            : isSelected
                            ? wrongMatchFlash
                              ? 'bg-red-100 border-red-500 text-red-900 animate-wrong-shake'
                              : 'bg-[#F9E6E6] dark:bg-red-950/40 border-[#9E2A2B] ring-1 ring-[#9E2A2B]/30'
                            : 'bg-[#FAF8F5] dark:bg-[#141210] border-[#E8E0D2] dark:border-[#2C2621] hover:border-[#9E2A2B]'
                        }`}
                      >
                        <div>
                          <div className="font-nepali text-sm sm:text-base font-semibold text-[#2D6A4F] dark:text-emerald-400">
                            {item.nepaliMeaning}
                          </div>
                          <div className="text-[11px] text-[#8E877E]">
                            {item.partOfSpeech} · {item.level}
                          </div>
                        </div>
                        {isMatched && <Check className="w-4 h-4 text-[#2D6A4F] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 10. LEXICON CARDS & VOCAB TABLE MODES (Clean & Mobile-Ergonomic)      */}
      {/* ===================================================================== */}
      {(viewMode === 'list' || viewMode === 'table') && filteredWords.length > 0 && (
        <div className="space-y-4">
          {/* Compact Count & Pagination Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#5E5850] dark:text-[#A8A29E] px-1">
            <div>
              Showing{' '}
              <strong className="text-[#1E1B18] dark:text-[#F5F2EB]">
                {((safePage - 1) * PAGE_SIZE + 1).toLocaleString()}–
                {Math.min(safePage * PAGE_SIZE, filteredWords.length).toLocaleString()}
              </strong>{' '}
              of{' '}
              <strong className="text-[#1E1B18] dark:text-[#F5F2EB]">
                {filteredWords.length.toLocaleString()}
              </strong>{' '}
              words
              {selectedLectureObj
                ? ` · L${String(selectedLectureObj.lectureNumber).padStart(2, '0')} ${selectedLectureObj.category}`
                : ''}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="min-h-[32px] px-2.5 py-1 rounded-lg border border-[#E8E0D2] dark:border-[#2C2621] bg-white dark:bg-[#191715] font-semibold disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-ipa text-[11px] px-1">
                {safePage} / {totalPages.toLocaleString()}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="min-h-[32px] px-2.5 py-1 rounded-lg border border-[#E8E0D2] dark:border-[#2C2621] bg-white dark:bg-[#191715] font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="bg-white dark:bg-[#191715] border border-[#E8E0D2] dark:border-[#2C2621] rounded-2xl overflow-hidden">
              {/* Mobile Compact Row List (< sm) so there is zero horizontal overflow congestion */}
              <div className="sm:hidden divide-y divide-[#E8E0D2] dark:divide-[#2C2621]">
                {paginatedWords.map((item) => {
                  const isSaved = savedWordIds.includes(item.id);
                  const mastery = getWordMasteryStatus(item.id);
                  return (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-serif text-base font-bold text-[#1E1B18] dark:text-[#F5F2EB]">
                            {item.segments?.map((seg, idx) =>
                              seg.silent ? (
                                <span
                                  key={idx}
                                  className="text-[#9E2A2B] dark:text-[#F87171] underline decoration-dotted underline-offset-4"
                                >
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={idx}>{seg.text}</span>
                              )
                            )}
                          </span>
                          <span className="font-ipa text-[11px] text-[#8E877E]">{item.ipa}</span>
                          <span className="text-[10px] font-ipa px-1.5 py-0.2 rounded bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-[#5E5850]">
                            L{String(item.lectureNumber).padStart(2, '0')} · {item.level}
                          </span>
                        </div>
                        <div className="font-nepali text-xs font-semibold text-[#2D6A4F] dark:text-emerald-400 mt-0.5 truncate">
                          {item.nepaliMeaning}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            speechService.speak(item.word, { rate: preferredSpeechRate })
                          }
                          className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] flex items-center justify-center"
                          aria-label="Listen"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleSaveWord(item.id)}
                          className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                            isSaved
                              ? 'border-[#9E2A2B]/40 bg-[#F9E6E6] text-[#9E2A2B]'
                              : 'border-[#E8E0D2] dark:border-[#2C2621] text-[#8E877E]'
                          }`}
                          aria-label="Bookmark"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-3.5 h-3.5" />
                          ) : (
                            <Bookmark className="w-3.5 h-3.5" />
                          )}
                        </button>
                        {onToggleMasteredWord && (
                          <button
                            type="button"
                            onClick={() => onToggleMasteredWord(item.id)}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center ${
                              mastery.isMastered
                                ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white'
                                : 'border-[#E8E0D2] dark:border-[#2C2621] text-[#8E877E]'
                            }`}
                            aria-label="Master"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Tablet/Desktop Clean Editorial Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF8F5] dark:bg-[#141210] border-b border-[#E8E0D2] dark:border-[#2C2621] text-[11px] uppercase tracking-wider text-[#8E877E]">
                      <th className="py-3 px-4 font-semibold">Word</th>
                      <th className="py-3 px-4 font-semibold">IPA &amp; POS</th>
                      <th className="py-3 px-4 font-semibold">Nepali Meaning</th>
                      <th className="py-3 px-4 font-semibold">Unit</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E0D2] dark:divide-[#2C2621]">
                    {paginatedWords.map((item) => {
                      const isSaved = savedWordIds.includes(item.id);
                      const mastery = getWordMasteryStatus(item.id);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#FAF8F5]/70 dark:hover:bg-[#141210]/40 transition-colors"
                        >
                          <td className="py-3 px-4 font-serif font-bold text-base text-[#1E1B18] dark:text-[#F5F2EB]">
                            {item.segments?.map((seg, idx) =>
                              seg.silent ? (
                                <span
                                  key={idx}
                                  className="text-[#9E2A2B] dark:text-[#F87171] underline decoration-dotted decoration-2 underline-offset-4"
                                >
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={idx}>{seg.text}</span>
                              )
                            )}
                          </td>
                          <td className="py-3 px-4 font-ipa text-xs text-[#5E5850] dark:text-[#A8A29E]">
                            {item.ipa} · <span className="italic">{item.partOfSpeech}</span>
                          </td>
                          <td className="py-3 px-4 font-nepali font-semibold text-[#2D6A4F] dark:text-emerald-400">
                            {item.nepaliMeaning}
                          </td>
                          <td className="py-3 px-4 font-ipa text-xs">
                            <button
                              type="button"
                              onClick={() => onOpenLecture(item.lectureId)}
                              className="hover:underline font-medium text-[#1E1B18] dark:text-[#F5F2EB]"
                            >
                              L{String(item.lectureNumber).padStart(2, '0')} · {item.level}
                            </button>
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-ipa text-[10px] font-semibold ${mastery.badgeClass}`}
                            >
                              {mastery.isMastered && <CheckCircle2 className="w-2.5 h-2.5" />}
                              <span>{mastery.label}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() =>
                                  speechService.speak(item.word, { rate: preferredSpeechRate })
                                }
                                title="Listen (1.0x)"
                                className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] inline-flex items-center justify-center hover:border-[#9E2A2B]"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => speechService.speak(item.word, { rate: 0.6 })}
                                title="Slow (0.6x)"
                                className="w-8 h-8 rounded-lg bg-[#FAF8F5] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] inline-flex items-center justify-center hover:border-[#B8863B]"
                              >
                                <Turtle className="w-3.5 h-3.5 text-[#B8863B]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onToggleSaveWord(item.id)}
                                title="Bookmark word"
                                className={`w-8 h-8 rounded-lg border inline-flex items-center justify-center ${
                                  isSaved
                                    ? 'border-[#9E2A2B]/40 bg-[#F9E6E6] text-[#9E2A2B]'
                                    : 'border-[#E8E0D2] dark:border-[#2C2621] text-[#8E877E]'
                                }`}
                              >
                                {isSaved ? (
                                  <BookmarkCheck className="w-3.5 h-3.5" />
                                ) : (
                                  <Bookmark className="w-3.5 h-3.5" />
                                )}
                              </button>
                              {onToggleMasteredWord && (
                                <button
                                  type="button"
                                  onClick={() => onToggleMasteredWord(item.id)}
                                  title={mastery.isMastered ? 'Mastered' : 'Mark as Mastered'}
                                  className={`w-8 h-8 rounded-lg border inline-flex items-center justify-center ${
                                    mastery.isMastered
                                      ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white'
                                      : 'border-[#E8E0D2] dark:border-[#2C2621] text-[#8E877E] hover:border-[#2D6A4F]'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* .dc-list of .dc-w word cards (artifact). Phones: one bordered list. */
            <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-0 md:gap-3 items-start bg-white dark:bg-[#1A1714] md:bg-transparent md:dark:bg-transparent border border-[#E6E0D4] dark:border-[#2E2924] md:border-0 rounded-[18px] md:rounded-none overflow-hidden md:overflow-visible">
              {paginatedWords.map((item, cardIdx) => {
                const isSaved = savedWordIds.includes(item.id);
                const showMeaning = showMeaningsByDefault || Boolean(revealedIds[item.id]);
                const mastery = getWordMasteryStatus(item.id);
                const isOpen = Boolean(expandedCardIds[item.id]) || Boolean(aiWordExplanations[item.id]);
                const statusTone = mastery.isMastered
                  ? 't-sage'
                  : /new/i.test(mastery.label)
                  ? 't-ink'
                  : 't-ochre';
                const toggleOpen = () =>
                  setExpandedCardIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }));

                return (
                  <article
                    key={item.id}
                    className={`card !p-0 overflow-hidden !rounded-none md:!rounded-[20px] !border-0 md:!border !shadow-none md:!shadow-[0_1px_2px_rgba(60,40,20,.04)] md:hover:!border-[#CDBFA8] md:hover:!shadow-[0_14px_30px_-20px_rgba(60,40,20,.35)] ${
                      cardIdx > 0 ? 'border-t border-t-[#EFE9DD] dark:border-t-[#2E2924] md:border-t-[#E6E0D4]' : ''
                    }`}
                  >
                    <div className="flex items-center md:items-start gap-2 pl-3.5 pr-2.5 py-3 md:pl-[18px] md:pr-3.5 md:pt-4 md:pb-3.5">
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={isOpen}
                        aria-label={`${item.word} details`}
                        onClick={toggleOpen}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleOpen();
                          }
                        }}
                        className="flex-1 min-w-0 flex flex-col gap-1.5 cursor-pointer text-left"
                      >
                        <span className="flex items-baseline gap-2.5 flex-wrap">
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
                              title="Tap for instant phonetics card"
                              onClick={(e) => e.stopPropagation()}
                              className="serif text-[21px] md:text-[28px] leading-[1.15] text-[#1C1917] dark:text-[#F5F2EB] text-left hover:opacity-85"
                            >
                              {item.segments?.map((seg, idx) =>
                                seg.silent ? (
                                  <span key={idx} className="sil">
                                    {seg.text}
                                  </span>
                                ) : (
                                  <span key={idx}>{seg.text}</span>
                                )
                              )}
                            </button>
                          </WordPhoneticsPopover>
                          <span className="mono muted text-[11px] md:text-[13px]">{item.ipa}</span>
                        </span>
                        {showMeaning ? (
                          <span className="np text-[13px] md:text-[15px] text-[#3D342B] dark:text-[#D6CFC4] truncate md:whitespace-normal">
                            {item.nepaliMeaning}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRevealedIds((prev) => ({ ...prev, [item.id]: true }));
                            }}
                            className="self-start inline-flex items-center gap-1 text-xs font-semibold text-[#8C6527] dark:text-[#E9C77B]"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Show meaning
                          </button>
                        )}
                        <span className="hidden md:flex gap-1.5 mt-0.5 flex-wrap items-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenLecture(item.lectureId);
                            }}
                            className="tag t-ink hover:!text-[#9E2A2B]"
                            title="Open lecture"
                          >
                            L{String(item.lectureNumber).padStart(2, '0')}
                          </button>
                          <span className="tag t-ink">{item.level}</span>
                          <span className={`tag ${statusTone}`}>
                            {mastery.isMastered && <CheckCircle2 className="w-3 h-3" />}
                            {mastery.label}
                          </span>
                        </span>
                      </div>
                      <div className="flex flex-row md:flex-col gap-1.5 shrink-0">
                        <button
                          type="button"
                          aria-label={`Play ${item.word}`}
                          onClick={() => speechService.speak(item.word, { rate: preferredSpeechRate })}
                          className="ibtn !w-[38px] !h-[38px] !rounded-full"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label={isSaved ? 'Saved' : 'Save word'}
                          aria-pressed={isSaved}
                          onClick={() => onToggleSaveWord(item.id)}
                          className="ibtn !w-[38px] !h-[38px] !rounded-full"
                        >
                          {isSaved ? (
                            <BookmarkCheck className="w-4 h-4 text-[#9E2A2B] dark:text-[#F87171]" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="flex flex-col gap-2.5 px-3.5 md:px-[18px] pt-3 pb-3.5 md:pb-4 border-t border-dashed border-[#E6E0D4] dark:border-[#2E2924] animate-fade-up">
                        <span className="tag t-crim self-start !whitespace-normal">
                          <Sparkles className="w-3 h-3 shrink-0" />
                          {item.silentLettersSummary} · {item.partOfSpeech}
                        </span>
                        <div className="flex gap-2.5 items-center bg-[#FAF8F4] dark:bg-[#141210] rounded-xl py-2.5 pr-2.5 pl-3">
                          <span className="flex-1 text-[13.5px] leading-[1.5] text-[#1C1917] dark:text-[#F5F2EB]">
                            “{item.englishExample}”
                            {isFullNepali && item.nepaliExampleTranslation && (
                              <span className="np block text-xs muted mt-0.5">{item.nepaliExampleTranslation}</span>
                            )}
                          </span>
                          <button
                            type="button"
                            aria-label="Play example"
                            onClick={() => speechService.speak(item.englishExample, { rate: preferredSpeechRate })}
                            className="ibtn !w-10 !h-10 !rounded-full !text-[#9E2A2B] dark:!text-[#F87171]"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => speechService.speak(item.word, { rate: 0.6 })}
                            className="btn btn-g btn-sm"
                          >
                            <Turtle className="w-4 h-4" />
                            0.65×
                          </button>
                          {onToggleMasteredWord && (
                            <button
                              type="button"
                              aria-pressed={mastery.isMastered}
                              onClick={() => onToggleMasteredWord(item.id)}
                              className={`btn btn-sm ${mastery.isMastered ? '!bg-[#2D6A4F] !text-white' : 'btn-g'}`}
                            >
                              <Check className="w-4 h-4" />
                              {mastery.isMastered ? 'Mastered' : 'Mark mastered'}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleExplainDictionaryWord(item)}
                            disabled={aiWordLoadingId === item.id}
                            className="btn btn-g btn-sm"
                          >
                            {aiWordLoadingId === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            {aiWordLoadingId === item.id
                              ? 'Asking AI…'
                              : aiWordExplanations[item.id]
                              ? 'AI explained ✓'
                              : 'AI explain'}
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenLecture(item.lectureId)}
                            className="btn btn-g btn-sm md:hidden"
                          >
                            Lecture {String(item.lectureNumber).padStart(2, '0')}
                          </button>
                        </div>
                    {aiWordExplanations[item.id] && (
                      <div className="p-3 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E8E0D2] dark:border-[#2C2621] text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[#9E2A2B]">
                            AI Phonetic Guide
                          </span>
                          <span className="font-nepali font-semibold text-[#2D6A4F] dark:text-emerald-400">
                            उच्चारण: {aiWordExplanations[item.id].nepaliSoundComparison}
                          </span>
                        </div>
                        <p className="font-nepali text-[#1E1B18] dark:text-[#F5F2EB]">
                          <strong>किन साइलेन्ट:</strong>{' '}
                          {aiWordExplanations[item.id].silentReasonNepali}
                        </p>
                        <p className="font-nepali text-[#5E5850] dark:text-[#A8A29E]">
                          <strong>जिब्रो र मुख:</strong>{' '}
                          {aiWordExplanations[item.id].mouthPositionNepali}
                        </p>
                        <p className="font-nepali text-[#2D6A4F] dark:text-emerald-400">
                          <strong>सम्झने तरिका:</strong>{' '}
                          {aiWordExplanations[item.id].memoryTrickNepali}
                        </p>
                      </div>
                    )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}

          {/* Bottom Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#E8E0D2] dark:border-[#2C2621]">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: scrollBehavior() });
                }}
                disabled={safePage <= 1}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl border border-[#E8E0D2] dark:border-[#2C2621] bg-white dark:bg-[#191715] text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-ipa">
                <span className="text-[#8E877E]">Page</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={safePage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 1 && val <= totalPages) {
                      setCurrentPage(val);
                    }
                  }}
                  className="w-14 min-h-[34px] px-2 py-1 text-center rounded-lg border border-[#E8E0D2] dark:border-[#2C2621] bg-white dark:bg-[#191715]"
                />
                <span className="text-[#8E877E]">of {totalPages.toLocaleString()}</span>
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: scrollBehavior() });
                }}
                disabled={safePage >= totalPages}
                className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

