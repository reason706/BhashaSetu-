import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search,
  Volume2,
  Turtle,
  Bookmark,
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
} from 'lucide-react';
import {
  LectureUnit,
  LanguageMode,
  SRSRecord,
  MistakeItem,
} from '../types/curriculum';
import { speechService, PronunciationResult } from '../services/speech';
import { getMassiveLexicon, EnrichedLexiconItem } from '../data/massiveLexicon';
import {
  PrintableStudySheetModal,
  StudySheetFocusMode,
} from './PrintableStudySheetModal';
import {
  exportSavedWordsToCSV,
  exportMistakeNotebookToCSV,
} from '../services/studySheetExport';

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
  onUpdateWordSRS?: (wordId: string, wasCorrect: boolean) => void;
  onRecordMistake?: (mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>) => void;
  onPracticeMistake?: (mistakeId: string, wasCorrect: boolean) => void;
  onRemoveMistake?: (mistakeId: string) => void;
  onOpenLecture: (lectureId: string) => void;
}

type FilterMode = 'all' | 'core' | 'srs' | 'saved' | 'mastered' | 'silent' | 'B1' | 'B2' | 'C1';
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
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [flashcardAutoSpeak, setFlashcardAutoSpeak] = useState(false);
  const [flashcardSessionReviewed, setFlashcardSessionReviewed] = useState(0);
  const [flashcardMicListening, setFlashcardMicListening] = useState(false);
  const [flashcardMicResult, setFlashcardMicResult] = useState<PronunciationResult | null>(null);

  // Interactive Silent-Letter Match Game state
  const [matchBoardRound, setMatchBoardRound] = useState(0);
  const [selectedMatchWordId, setSelectedMatchWordId] = useState<string | null>(null);
  const [selectedMatchMeaningId, setSelectedMatchMeaningId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<string[]>([]);
  const [wrongMatchFlash, setWrongMatchFlash] = useState(false);
  const [matchGameStats, setMatchGameStats] = useState({ score: 0, combo: 0, boardsCleared: 0 });

  // Quick Vocab Speed Quiz state
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState({ correct: 0, total: 0, streak: 0 });

  // Audio Dictation & Spelling Bee state
  const [dictationIndex, setDictationIndex] = useState(0);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationSubmitted, setDictationSubmitted] = useState(false);
  const [dictationStats, setDictationStats] = useState({ correct: 0, total: 0, streak: 0 });

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
        badgeClass: 'bg-[#15803D]/12 text-[#15803D] dark:text-emerald-400 border-[#15803D]/30',
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

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedWords = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredWords.slice(start, start + PAGE_SIZE);
  }, [filteredWords, safePage]);

  const currentFlashcard = filteredWords[cardIndex] || filteredWords[0] || null;
  const currentDictationWord =
    filteredWords[dictationIndex % Math.max(1, filteredWords.length)] || null;

  // Build deterministic 4-option multiple choice question for Vocab Speed Quiz
  const currentQuizQuestion = useMemo(() => {
    if (filteredWords.length === 0) return null;
    const target = filteredWords[quizIndex % filteredWords.length];
    const distractors: string[] = [];
    const step = Math.max(1, Math.floor(allWords.length / 7));
    let ptr = (quizIndex * 13 + 5) % allWords.length;
    while (distractors.length < 3 && distractors.length < allWords.length - 1) {
      const candidate = allWords[ptr].nepaliMeaning;
      if (candidate !== target.nepaliMeaning && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      ptr = (ptr + step) % allWords.length;
    }
    const rawOptions = [target.nepaliMeaning, ...distractors];
    const shift = quizIndex % rawOptions.length;
    const options = [...rawOptions.slice(shift), ...rawOptions.slice(0, shift)];
    return {
      target,
      options,
    };
  }, [filteredWords, allWords, quizIndex]);

  const handleNextCard = () => {
    setIsFlipped(false);
    setFlashcardMicResult(null);
    const nextIdx = filteredWords.length ? (cardIndex + 1) % filteredWords.length : 0;
    setCardIndex(nextIdx);
    if (flashcardAutoSpeak && filteredWords[nextIdx]) {
      speechService.speak(filteredWords[nextIdx].word, { rate: preferredSpeechRate });
    }
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setFlashcardMicResult(null);
    const prevIdx = filteredWords.length
      ? (cardIndex - 1 + filteredWords.length) % filteredWords.length
      : 0;
    setCardIndex(prevIdx);
    if (flashcardAutoSpeak && filteredWords[prevIdx]) {
      speechService.speak(filteredWords[prevIdx].word, { rate: preferredSpeechRate });
    }
  };

  const handleShuffleFlashcard = () => {
    if (!filteredWords.length) return;
    setIsFlipped(false);
    setFlashcardMicResult(null);
    const randomIdx = Math.floor(Math.random() * filteredWords.length);
    setCardIndex(randomIdx);
    if (flashcardAutoSpeak && filteredWords[randomIdx]) {
      speechService.speak(filteredWords[randomIdx].word, { rate: preferredSpeechRate });
    }
  };

  const handleRateFlashcardSRS = (wasCorrect: boolean) => {
    if (currentFlashcard && onUpdateWordSRS) {
      onUpdateWordSRS(currentFlashcard.id, wasCorrect);
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

  // Interactive 6-Pair Silent-Letter Match Game Board
  const matchBoardData = useMemo(() => {
    const pool = filteredWords.length >= 6 ? filteredWords : allWords.slice(0, 60);
    const startIdx = (matchBoardRound * 6) % Math.max(1, pool.length - 6);
    const pairs = pool.slice(startIdx, startIdx + 6);
    const shift = (matchBoardRound * 2 + 3) % Math.max(1, pairs.length);
    const shuffledMeanings = [...pairs.slice(shift), ...pairs.slice(0, shift)];
    return { pairs, shuffledMeanings };
  }, [filteredWords, allWords, matchBoardRound]);

  const handleSelectMatchWord = (wordId: string) => {
    if (matchedPairIds.includes(wordId)) return;
    const wordObj = matchBoardData.pairs.find((w) => w.id === wordId);
    if (wordObj) {
      speechService.speak(wordObj.word, { rate: preferredSpeechRate });
    }
    setSelectedMatchWordId(wordId);
    if (selectedMatchMeaningId) {
      if (selectedMatchMeaningId === wordId) {
        const nextMatched = [...matchedPairIds, wordId];
        setMatchedPairIds(nextMatched);
        setSelectedMatchWordId(null);
        setSelectedMatchMeaningId(null);
        if (onUpdateWordSRS) onUpdateWordSRS(wordId, true);
        setMatchGameStats((prev) => ({
          roundsCompleted:
            nextMatched.length === matchBoardData.pairs.length
              ? prev.roundsCompleted + 1
              : prev.roundsCompleted,
          pairsMatched: prev.pairsMatched + 1,
          mistakes: prev.mistakes,
          streak: prev.streak + 1,
        }));
      } else {
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
        const nextMatched = [...matchedPairIds, wordId];
        setMatchedPairIds(nextMatched);
        setSelectedMatchWordId(null);
        setSelectedMatchMeaningId(null);
        if (onUpdateWordSRS) onUpdateWordSRS(wordId, true);
        setMatchGameStats((prev) => ({
          roundsCompleted:
            nextMatched.length === matchBoardData.pairs.length
              ? prev.roundsCompleted + 1
              : prev.roundsCompleted,
          pairsMatched: prev.pairsMatched + 1,
          mistakes: prev.mistakes,
          streak: prev.streak + 1,
        }));
      } else {
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
    setMatchedPairIds([]);
    setSelectedMatchWordId(null);
    setSelectedMatchMeaningId(null);
    setMatchBoardRound((prev) => prev + 1);
  };

  const handleAnswerQuiz = (option: string) => {
    if (quizSelectedOption || !currentQuizQuestion) return;
    setQuizSelectedOption(option);
    const isCorrect = option === currentQuizQuestion.target.nepaliMeaning;
    setQuizScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
    }));
    if (onUpdateWordSRS) {
      onUpdateWordSRS(currentQuizQuestion.target.id, isCorrect);
    }
    if (!isCorrect && onRecordMistake) {
      onRecordMistake({
        lectureId: currentQuizQuestion.target.lectureId,
        lectureNumber: currentQuizQuestion.target.lectureNumber,
        sourceType: 'vocab-quiz',
        prompt: `What is the Nepali meaning of "${currentQuizQuestion.target.word}" (${currentQuizQuestion.target.ipa})?`,
        nepaliHint: currentQuizQuestion.target.englishExample,
        userWrongAnswer: option,
        correctAnswer: currentQuizQuestion.target.nepaliMeaning,
        options: currentQuizQuestion.options,
        explanation: `"${currentQuizQuestion.target.word}" means "${currentQuizQuestion.target.nepaliMeaning}". Phonics: ${currentQuizQuestion.target.silentLettersSummary}.`,
      });
    }
  };

  const handleNextQuizQuestion = () => {
    setQuizSelectedOption(null);
    setQuizIndex((prev) => prev + 1);
  };

  const handleCheckDictation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentDictationWord || dictationSubmitted || !dictationInput.trim()) return;
    setDictationSubmitted(true);
    const cleanUser = dictationInput.trim().toLowerCase();
    const cleanTarget = currentDictationWord.word.trim().toLowerCase();
    const isExact = cleanUser === cleanTarget;

    setDictationStats((prev) => ({
      correct: prev.correct + (isExact ? 1 : 0),
      total: prev.total + 1,
      streak: isExact ? prev.streak + 1 : 0,
    }));

    if (onUpdateWordSRS) {
      onUpdateWordSRS(currentDictationWord.id, isExact);
    }

    if (!isExact && onRecordMistake) {
      onRecordMistake({
        lectureId: currentDictationWord.lectureId,
        lectureNumber: currentDictationWord.lectureNumber,
        sourceType: 'dictation',
        prompt: `Spell the English word meaning "${currentDictationWord.nepaliMeaning}" (${currentDictationWord.ipa}):`,
        nepaliHint: currentDictationWord.englishExample,
        userWrongAnswer: dictationInput.trim(),
        correctAnswer: currentDictationWord.word,
        explanation: `Correct spelling: "${currentDictationWord.word}". Silent-letter rule: ${currentDictationWord.silentLettersSummary}.`,
      });
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-6 border-b border-[#E7E0D6] dark:border-[#2E2924] mb-6">
        <div>
          <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mb-1">
            <span>Offline Vocabulary Lexicon</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              {allWords.length.toLocaleString()}+ Total Words
            </span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>{coreWordsCount} Core Lesson Words</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span className="font-ipa text-[#B91C1C] dark:text-[#F87171]">
              {savedWordIds.length} Saved · {srsTrackedCount} in SRS
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
            10,000+ Word Lexicon, Audio Dictation & SRS Drill Hub
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] mt-1">
            Explore {allWords.length.toLocaleString()} vocabulary entries, practice Spaced Repetition flashcards, test your spelling in Audio Dictation Bee, or review your Mistake Notebook.
          </p>
        </div>

        {/* 6-Mode Switcher: Lexicon Cards | Vocab List Table | SRS Flashcards | Audio Dictation | Speed Quiz | Mistake Notebook */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F2ECE1] dark:bg-[#1F1C18] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] self-start">
          <button
            onClick={() => setViewMode('list')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Lexicon Cards ({filteredWords.length.toLocaleString()})</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'table'
                ? 'bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E]'
            }`}
          >
            <List className="w-3.5 h-3.5 text-[#B91C1C]" />
            <span>Vocab List Table</span>
          </button>

          <button
            onClick={() => {
              setViewMode('flashcards');
              setCardIndex(0);
              setIsFlipped(false);
            }}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'flashcards'
                ? 'bg-[#A82020] text-white shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>SRS Flashcards</span>
          </button>

          <button
            onClick={() => {
              setViewMode('match');
              setMatchedPairIds([]);
              setSelectedMatchWordId(null);
              setSelectedMatchMeaningId(null);
            }}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'match'
                ? 'bg-[#A82020] text-white shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Match Game</span>
          </button>

          <button
            onClick={() => {
              setViewMode('dictation');
              setDictationSubmitted(false);
              setDictationInput('');
            }}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'dictation'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Audio Dictation Bee</span>
          </button>

          <button
            onClick={() => {
              setViewMode('quiz');
              setQuizSelectedOption(null);
            }}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'quiz'
                ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#D97706]" />
            <span>Speed Quiz</span>
          </button>

          <button
            onClick={() => setViewMode('mistakes')}
            className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
              viewMode === 'mistakes'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E]'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Mistake Notebook ({mistakeNotebook.length})</span>
          </button>
        </div>
      </div>

      {/* Section-by-Section Distribution Filter Bar (Hidden when in Mistake Notebook view) */}
      {viewMode !== 'mistakes' && (
        <>
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                <Filter className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Filter by Curriculum Section (12 Managed Lecture Banks):</span>
              </div>
              {selectedLectureNum !== null && (
                <button
                  onClick={() => {
                    setSelectedLectureNum(null);
                    setCurrentPage(1);
                  }}
                  className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] hover:underline"
                >
                  Show All 12 Sections ({allWords.length.toLocaleString()} words)
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {lectures.slice(0, 12).map((lec) => {
                const count = lectureWordCounts[lec.lectureNumber] || 0;
                const isSelected = selectedLectureNum === lec.lectureNumber;
                return (
                  <button
                    key={lec.id}
                    onClick={() => {
                      setSelectedLectureNum(isSelected ? null : lec.lectureNumber);
                      setCurrentPage(1);
                      setCardIndex(0);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-[#B91C1C] bg-[#B91C1C]/10 dark:bg-[#B91C1C]/20 ring-1 ring-[#B91C1C]'
                        : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#B91C1C]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-ipa">
                      <span className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
                        L{String(lec.lectureNumber).padStart(2, '0')} · {lec.level}
                      </span>
                      <span className="text-[#57534E] dark:text-[#A8A29E]">{count}w</span>
                    </div>
                    <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate mt-0.5">
                      {lec.category}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Category Filter Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#57534E] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                  setCardIndex(0);
                }}
                placeholder="Search 10,400+ English words, Nepali meanings, IPA, or topics (e.g. knight, plumber, sovereign)..."
                className="w-full min-h-[46px] pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-sm text-[#1C1917] dark:text-[#F5F2EB] placeholder:text-[#57534E]/70 focus:outline-none focus:border-[#B91C1C]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F2ECE1] dark:bg-[#1F1C18] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
              {(
                [
                  { id: 'all', label: `All (${allWords.length.toLocaleString()})` },
                  { id: 'core', label: `Core Lesson (${coreWordsCount})` },
                  { id: 'srs', label: `SRS Deck (${Math.max(coreWordsCount, srsTrackedCount)})` },
                  { id: 'silent', label: 'Silent Letters' },
                  { id: 'saved', label: `Saved (${savedWordIds.length})` },
                  { id: 'mastered', label: `Mastered (${masteredWordIds.length})` },
                  { id: 'B1', label: 'B1' },
                  { id: 'B2', label: 'B2' },
                  { id: 'C1', label: 'C1' },
                ] as { id: FilterMode; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setFilterMode(tab.id);
                    setCurrentPage(1);
                    setCardIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    filterMode === tab.id
                      ? 'bg-white dark:bg-[#141210] text-[#1C1917] dark:text-[#F5F2EB] font-semibold shadow-xs'
                      : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Silent-Letter Family Filter Pills + Commuter Audio Mode Toggle Bar */}
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-4 mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                <Sparkles className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Silent-Letter Orthographic Family Filter Pills:</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setStudySheetModalMode(filterMode === 'saved' ? 'saved' : 'combined')
                  }
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:bg-[#B91C1C] dark:hover:bg-[#B91C1C] dark:hover:text-white inline-flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Export / Print Study Sheet (PDF / CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportSavedWordsToCSV(savedWordsObjects, masteredWordIds, wordSRS)}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C] inline-flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Saved Words (.CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCommuterOpen((prev) => !prev)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                    commuterOpen || commuterPlaying
                      ? 'bg-[#B91C1C] text-white'
                      : 'bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB]'
                  }`}
                >
                  <Radio className={`w-3.5 h-3.5 ${commuterPlaying ? 'animate-pulse' : 'text-[#B91C1C]'}`} />
                  <span>
                    {commuterPlaying
                      ? 'Commuter Audio Playing'
                      : 'Commuter Audio Mode'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
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
                    }}
                    className={`min-h-[36px] px-3 py-1 rounded-xl border text-xs font-medium transition-all inline-flex items-center gap-1.5 ${
                      isSelected
                        ? 'border-[#B91C1C] bg-[#B91C1C] text-white font-semibold shadow-xs'
                        : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-[#57534E] dark:text-[#A8A29E] hover:border-[#B91C1C]/50'
                    }`}
                  >
                    <span>{pill.label}</span>
                    {pill.id !== 'ALL' && (
                      <span
                        className={`font-ipa text-[10px] ${
                          isSelected ? 'text-white/80' : 'text-[#B91C1C] dark:text-[#F87171]'
                        }`}
                      >
                        ({pill.example})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hands-Free Commuter Audio Mode (Podcast Player) Drawer */}
            {commuterOpen && (
              <div className="pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] rounded-xl p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                      <Headphones className="w-4 h-4" />
                      <span>Hands-Free Commuter Audio Mode (Podcast Loop)</span>
                    </div>
                    <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                      Loops automatically: <strong>1.0x Word</strong> → <strong>2s Mental Recall Pause</strong> → <strong>0.75x Slow Phoneme</strong> → <strong>Example Sentence</strong>.
                    </p>
                  </div>

                  {/* Playlist Source Selector */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        { id: 'filtered', label: `Current Filter (${Math.min(100, filteredWords.length)})` },
                        { id: 'saved', label: `Saved Words (${savedWordIds.length})` },
                        { id: 'mistakes', label: `Mistake Notebook (${mistakeNotebook.length})` },
                      ] as const
                    ).map((src) => (
                      <button
                        key={src.id}
                        type="button"
                        onClick={() => {
                          setCommuterPlaylistSource(src.id);
                          setCommuterIndex(0);
                        }}
                        className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          commuterPlaylistSource === src.id
                            ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] border-transparent'
                            : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                        }`}
                      >
                        {src.label}
                      </button>
                    ))}
                  </div>
                </div>

                {currentCommuterWord ? (
                  <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                          Track {(commuterIndex % Math.max(1, commuterPlaylist.length)) + 1} / {commuterPlaylist.length}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#B91C1C]/10 text-[#B91C1C] dark:text-[#F87171] font-ipa text-[11px] font-semibold">
                          {commuterPhase === 'word-1x' && '1/4 · Speaking Word (1.0x)...'}
                          {commuterPhase === 'pause-2s' && '2/4 · 2s Mental Recall Pause...'}
                          {commuterPhase === 'word-075x' && '3/4 · Slow Articulation (0.75x)...'}
                          {commuterPhase === 'sentence' && '4/4 · Reading Example Sentence...'}
                          {commuterPhase === 'idle' && 'Ready to Play'}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-baseline gap-2.5">
                        <span className="text-xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                          {currentCommuterWord.word}
                        </span>
                        <span className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                          {currentCommuterWord.ipa}
                        </span>
                        <span className="font-nepali text-sm font-semibold text-[#15803D] dark:text-emerald-400">
                          {currentCommuterWord.nepaliMeaning}
                        </span>
                      </div>
                      <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                        “{currentCommuterWord.englishExample}”
                      </p>
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
                        className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 ${
                          commuterPlaying
                            ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917]'
                            : 'bg-[#B91C1C] text-white'
                        }`}
                      >
                        {commuterPlaying ? (
                          <>
                            <Square className="w-3.5 h-3.5" />
                            <span>Stop Loop</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5" />
                            <span>Start Loop</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCommuterIndex((prev) => (prev + 1) % Math.max(1, commuterPlaylist.length))
                        }
                        className="min-h-[42px] px-3 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        <span>Next</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    No words in the selected playlist source. Try switching to Current Filter.
                  </p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ===================================================================== */}
      {/* MISTAKE NOTEBOOK (WEAK-WORDS & MISSED QUIZ VAULT)                     */}
      {/* ===================================================================== */}
      {viewMode === 'mistakes' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                  Personal Weak-Words & Missed Quiz Vault
                </div>
                <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                  Mistake Notebook ({mistakeNotebook.length} Active Review Items)
                </h2>
                <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
                  Every time you miss a Spelling Quiz, Grammar Capstone, Speed Quiz, or Audio Dictation item, it is saved here. Answer an item accurately <strong>twice in a row (2/2)</strong> to graduate it out of your notebook!
                </p>
              </div>

              {/* Export & Print Mistake Notebook Controls */}
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setStudySheetModalMode('mistakes')}
                  className="min-h-[40px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] inline-flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF Study Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={() => exportMistakeNotebookToCSV(mistakeNotebook)}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C] inline-flex items-center gap-1.5 transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Export Mistakes (.CSV)</span>
                </button>
              </div>
            </div>
          </div>

          {mistakeNotebook.length === 0 ? (
            <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#15803D]/10 text-[#15803D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Your Mistake Notebook is Clear!
              </h3>
              <p className="text-sm text-[#57534E] dark:text-[#A8A29E] max-w-md mx-auto">
                You have no pending missed items. Practice Audio Dictation Bee, Speed Quiz, or Lecture Quizzes—any tricky words you miss will automatically appear here for targeted review.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {mistakeNotebook.map((item) => {
                const selectedAns = mistakeAnswers[item.id];
                const isCorrect =
                  selectedAns?.trim().toLowerCase() === item.correctAnswer.trim().toLowerCase();

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171] uppercase">
                          {item.sourceType}
                        </span>
                        <span>·</span>
                        <button
                          onClick={() => onOpenLecture(item.lectureId)}
                          className="font-semibold hover:underline text-[#1C1917] dark:text-[#F5F2EB]"
                        >
                          Lecture {String(item.lectureNumber).padStart(2, '0')}
                        </button>
                        <span>·</span>
                        <span className="text-[#57534E] dark:text-[#A8A29E]">
                          Previous mistake: <del className="text-[#B91C1C]">{item.userWrongAnswer}</del>
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-ipa text-xs text-[#15803D] dark:text-emerald-400 font-semibold">
                          Mastery Streak: {item.consecutiveCorrect} / 2
                        </span>
                        {onRemoveMistake && (
                          <button
                            onClick={() => onRemoveMistake(item.id)}
                            className="p-1.5 rounded-lg text-[#57534E] hover:text-[#B91C1C]"
                            title="Remove from notebook"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {item.prompt}
                    </p>
                    {item.nepaliHint && (
                      <p className="font-nepali text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                        Hint / Context: “{item.nepaliHint}”
                      </p>
                    )}

                    {item.options && item.options.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {item.options.map((opt) => {
                          const isThisSelected = selectedAns === opt;
                          const isThisRight = opt === item.correctAnswer;
                          let style =
                            'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]';
                          if (selectedAns) {
                            if (isThisRight) {
                              style =
                                'bg-emerald-50 dark:bg-emerald-950/40 border-[#15803D] text-[#15803D] font-semibold';
                            } else if (isThisSelected) {
                              style =
                                'bg-red-50 dark:bg-red-950/40 border-[#B91C1C] text-[#B91C1C] line-through';
                            }
                          }
                          return (
                            <button
                              key={opt}
                              onClick={() => {
                                setMistakeAnswers((prev) => ({ ...prev, [item.id]: opt }));
                                if (onPracticeMistake) {
                                  onPracticeMistake(item.id, opt === item.correctAnswer);
                                }
                              }}
                              className={`min-h-[42px] px-4 py-2 rounded-xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between ${style}`}
                            >
                              <span>{opt}</span>
                              {selectedAns && isThisRight && <Check className="w-4 h-4" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      /* Free-text re-drill for Dictation items */
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() =>
                            speechService.speak(item.correctAnswer, { rate: preferredSpeechRate })
                          }
                          className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold inline-flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                          <span>Hear Word</span>
                        </button>
                        <input
                          type="text"
                          value={mistakeAnswers[item.id] || ''}
                          onChange={(e) =>
                            setMistakeAnswers((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Type the exact spelling..."
                          className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-sm font-ipa"
                        />
                        <button
                          onClick={() => {
                            if (onPracticeMistake && mistakeAnswers[item.id]) {
                              onPracticeMistake(item.id, isCorrect);
                            }
                          }}
                          className="min-h-[40px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold"
                        >
                          Verify Spelling
                        </button>
                      </div>
                    )}

                    {selectedAns && (
                      <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                        <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                          Target Answer: “{item.correctAnswer}” —{' '}
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
      {/* AUDIO DICTATION & SPELLING BEE TYPING MODE                            */}
      {/* ===================================================================== */}
      {viewMode === 'dictation' && currentDictationWord && (
        <div className="max-w-2xl mx-auto py-2">
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924] text-xs">
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#B91C1C]" />
                <span className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
                  Audio Dictation & Silent-Letter Spelling Bee
                </span>
                <span>·</span>
                <span>
                  Lecture {String(currentDictationWord.lectureNumber).padStart(2, '0')} (
                  {currentDictationWord.level})
                </span>
              </div>
              <div className="font-ipa flex items-center gap-3">
                <span>
                  Score: <strong>{dictationStats.correct}</strong>/{dictationStats.total}
                </span>
                <span className="text-[#D97706]">Streak: {dictationStats.streak}</span>
              </div>
            </div>

            <div className="text-center space-y-4 py-2">
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                Listen carefully to the word and type its exact English spelling (including silent letters!):
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    speechService.speak(currentDictationWord.word, { rate: preferredSpeechRate })
                  }
                  className="min-h-[48px] px-5 py-2.5 rounded-xl bg-[#B91C1C] text-white text-xs sm:text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#991B1B]"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>Play Word (1.0x)</span>
                </button>

                <button
                  type="button"
                  onClick={() => speechService.speak(currentDictationWord.word, { rate: 0.6 })}
                  className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm font-semibold inline-flex items-center gap-2"
                >
                  <Turtle className="w-4 h-4 text-[#D97706]" />
                  <span>Slow Audio (0.65x)</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    speechService.speak(currentDictationWord.englishExample, {
                      rate: preferredSpeechRate,
                    })
                  }
                  className="min-h-[48px] px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-medium inline-flex items-center gap-2"
                >
                  <Volume2 className="w-4 h-4 text-[#57534E]" />
                  <span>Hear in Sentence</span>
                </button>
              </div>

              {/* Meaning & Phonics Hint Card */}
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] max-w-lg mx-auto space-y-1">
                <div className="font-nepali text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Meaning: {currentDictationWord.nepaliMeaning}
                </div>
                <div className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                  IPA: {currentDictationWord.ipa} · {currentDictationWord.partOfSpeech} · Hint:{' '}
                  <strong className="text-[#B91C1C] dark:text-[#F87171]">
                    {currentDictationWord.silentLettersSummary}
                  </strong>
                </div>
              </div>
            </div>

            <form onSubmit={handleCheckDictation} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={dictationInput}
                  onChange={(e) => setDictationInput(e.target.value)}
                  disabled={dictationSubmitted}
                  placeholder="Type the English word here..."
                  autoCapitalize="none"
                  autoComplete="off"
                  spellCheck={false}
                  className="flex-1 min-h-[48px] px-4 py-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] font-ipa text-base text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#B91C1C]"
                />
                {!dictationSubmitted ? (
                  <button
                    type="submit"
                    disabled={!dictationInput.trim()}
                    className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs sm:text-sm font-semibold disabled:opacity-40"
                  >
                    Check Spelling
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNextDictationWord}
                    className="min-h-[48px] px-6 py-2.5 rounded-xl bg-[#B91C1C] text-white text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <span>Next Word</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>

            {dictationSubmitted && (
              <div className="p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
                {dictationInput.trim().toLowerCase() ===
                currentDictationWord.word.trim().toLowerCase() ? (
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#15803D] dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Exact Spelling Match!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    <XCircle className="w-4 h-4" />
                    <span>
                      Not quite — You typed “{dictationInput.trim()}” (Saved to Mistake Notebook)
                    </span>
                  </div>
                )}

                {/* Visual Silent-Letter Breakdown of Target Word */}
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="text-xs text-[#57534E]">Correct Orthography:</span>
                  <span className="text-2xl font-bold font-ipa text-[#1C1917] dark:text-[#F5F2EB]">
                    {currentDictationWord.segments?.map((seg, idx) =>
                      seg.silent ? (
                        <span
                          key={idx}
                          className="text-[#B91C1C] dark:text-[#F87171] bg-[#B91C1C]/12 underline decoration-dotted px-0.5 rounded"
                        >
                          {seg.text}
                        </span>
                      ) : (
                        <span key={idx}>{seg.text}</span>
                      )
                    )}
                  </span>
                </div>

                <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                  Example: “{currentDictationWord.englishExample}”
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty State */}
      {viewMode !== 'mistakes' && filteredWords.length === 0 && (
        <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-10 text-center">
          <p className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-1">
            No matching vocabulary words found
          </p>
          <p className="text-sm text-[#57534E] dark:text-[#A8A29E] mb-4">
            Try searching for another word or resetting your active section filter.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterMode('all');
              setSelectedLectureNum(null);
              setCurrentPage(1);
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* SPEED QUIZ DRILL MODE */}
      {viewMode === 'quiz' && currentQuizQuestion && (
        <div className="max-w-2xl mx-auto py-2">
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924] text-xs">
              <div>
                <span className="font-semibold text-[#B91C1C] dark:text-[#F87171]">
                  Vocabulary Speed Quiz
                </span>
                <span className="mx-2">·</span>
                <span>
                  Lecture {String(currentQuizQuestion.target.lectureNumber).padStart(2, '0')} (
                  {currentQuizQuestion.target.level})
                </span>
              </div>
              <div className="font-ipa flex items-center gap-3">
                <span>
                  Score: <strong>{quizScore.correct}</strong>/{quizScore.total}
                </span>
                <span className="text-[#D97706]">Streak: {quizScore.streak}</span>
              </div>
            </div>

            <div className="text-center space-y-3 py-2">
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                Select the accurate Nepali meaning for:
              </div>
              <div className="text-3xl sm:text-4xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                {currentQuizQuestion.target.segments?.map((seg, i) =>
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
              </div>
              <div className="font-ipa text-sm text-[#57534E] dark:text-[#A8A29E]">
                {currentQuizQuestion.target.ipa} · {currentQuizQuestion.target.partOfSpeech}
              </div>
              <div className="flex justify-center gap-2 pt-1">
                <button
                  onClick={() =>
                    speechService.speak(currentQuizQuestion.target.word, {
                      rate: preferredSpeechRate,
                    })
                  }
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                  <span>Listen</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {currentQuizQuestion.options.map((opt, idx) => {
                const isSelected = quizSelectedOption === opt;
                const isAnswer = opt === currentQuizQuestion.target.nepaliMeaning;
                let btnStyle =
                  'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#B91C1C]';
                if (quizSelectedOption) {
                  if (isAnswer) {
                    btnStyle =
                      'border-[#15803D] bg-emerald-50/80 dark:bg-emerald-950/40 text-[#15803D] dark:text-emerald-300 font-semibold';
                  } else if (isSelected) {
                    btnStyle =
                      'border-[#B91C1C] bg-red-50/80 dark:bg-red-950/40 text-[#B91C1C] dark:text-red-300';
                  }
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswerQuiz(opt)}
                    disabled={Boolean(quizSelectedOption)}
                    className={`min-h-[48px] p-3.5 rounded-xl border text-left font-nepali text-sm sm:text-base flex items-center justify-between gap-3 transition-all ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {quizSelectedOption && isAnswer && (
                      <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    )}
                    {quizSelectedOption && isSelected && !isAnswer && (
                      <XCircle className="w-4 h-4 text-[#B91C1C] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {quizSelectedOption && (
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs space-y-1">
                  <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    Example: “{currentQuizQuestion.target.englishExample}”
                  </div>
                  <div className="text-[#57534E] dark:text-[#A8A29E]">
                    Phonics: {currentQuizQuestion.target.silentLettersSummary}
                  </div>
                </div>
                <button
                  onClick={handleNextQuizQuestion}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FLASHCARD + SRS DRILL MODE */}
      {viewMode === 'flashcards' && currentFlashcard && (
        <div className="max-w-2xl mx-auto py-4">
          {/* Interactive Session Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E] dark:text-[#A8A29E] mb-3 bg-[#F4F0E8] dark:bg-[#1A1714] px-4 py-2.5 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924]">
            <div className="flex items-center gap-3">
              <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Card {(cardIndex + 1).toLocaleString()} of {filteredWords.length.toLocaleString()}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-[11px] font-medium text-[#15803D] dark:text-emerald-400">
                Session Reviewed: {flashcardSessionReviewed}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFlashcardAutoSpeak((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold inline-flex items-center gap-1 transition-colors ${
                  flashcardAutoSpeak
                    ? 'bg-[#A82020] text-white border-[#A82020]'
                    : 'bg-white dark:bg-[#141210] border-[#E6E0D4] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                }`}
              >
                <Volume2 className="w-3 h-3" />
                <span>Auto-Speak {flashcardAutoSpeak ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={handleShuffleFlashcard}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-[11px] font-semibold text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1 hover:border-[#A82020]"
              >
                <Shuffle className="w-3 h-3 text-[#A82020]" />
                <span>Shuffle Card</span>
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 sm:p-10 min-h-[380px] flex flex-col justify-between shadow-xs transition-all">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4F0E8] dark:bg-[#141210] text-[11px] font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Lecture {String(currentFlashcard.lectureNumber).padStart(2, '0')} · {currentFlashcard.level}
                </span>
                <span className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                  {currentFlashcard.partOfSpeech} · {currentFlashcard.silentLettersSummary}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {onToggleMasterWord && (
                  <button
                    onClick={() => onToggleMasterWord(currentFlashcard.id)}
                    className={`min-h-[36px] px-3 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                      masteredWordIds.includes(currentFlashcard.id)
                        ? 'bg-[#E2EFE7] border-[#2E6F4E]/30 text-[#1F5C3D] dark:bg-emerald-950/50 dark:text-emerald-300'
                        : 'border-[#E6E0D4] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{masteredWordIds.includes(currentFlashcard.id) ? 'Mastered ✓' : 'Mark Mastered'}</span>
                  </button>
                )}
                <button
                  onClick={() => onToggleSaveWord(currentFlashcard.id)}
                  className="min-h-[36px] px-3 rounded-lg border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium inline-flex items-center gap-1.5"
                >
                  {savedWordIds.includes(currentFlashcard.id) ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-[#A82020]" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="my-8 text-center">
              <div
                onClick={() => setIsFlipped((prev) => !prev)}
                className="cursor-pointer select-none group inline-block px-6 py-3 rounded-2xl hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors"
                title="Click card to flip"
              >
                <div className="text-3xl sm:text-5xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
                  {currentFlashcard.segments?.map((seg, i) =>
                    seg.silent ? (
                      <span
                        key={i}
                        className="text-[#A82020] dark:text-[#F87171] bg-[#A82020]/10 underline decoration-dotted decoration-2 underline-offset-6 px-0.5 rounded"
                      >
                        {seg.text}
                      </span>
                    ) : (
                      <span key={i}>{seg.text}</span>
                    )
                  )}
                </div>
                <div className="font-ipa text-lg text-[#57534E] dark:text-[#A8A29E]">
                  {currentFlashcard.ipa}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 my-5">
                <button
                  onClick={() =>
                    speechService.speak(currentFlashcard.word, { rate: preferredSpeechRate })
                  }
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-2 hover:border-[#A82020]"
                >
                  <Volume2 className="w-4 h-4 text-[#A82020]" />
                  <span>Listen ({preferredSpeechRate}x)</span>
                </button>
                <button
                  onClick={() => speechService.speak(currentFlashcard.word, { rate: 0.6 })}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium inline-flex items-center gap-2 hover:border-[#D97706]"
                >
                  <Turtle className="w-4 h-4 text-[#D97706]" />
                  <span>Slow (0.6x)</span>
                </button>
                <button
                  onClick={handleFlashcardMicTest}
                  disabled={flashcardMicListening}
                  className={`min-h-[42px] px-4 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                    flashcardMicListening
                      ? 'bg-[#A82020] text-white border-[#A82020] animate-pulse'
                      : 'bg-[#FBE9E7] dark:bg-red-950/40 border-[#A82020]/30 text-[#A82020] dark:text-red-300 hover:bg-[#A82020] hover:text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{flashcardMicListening ? 'Listening... Speak now' : 'Speak & Score'}</span>
                </button>
              </div>

              {flashcardMicResult && (
                <div className="max-w-md mx-auto mb-5 p-3 rounded-xl bg-[#F4F0E8] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs">
                  <div className="flex items-center justify-between font-semibold mb-1">
                    <span className="text-[#1C1917] dark:text-[#F5F2EB]">
                      Heard: “{flashcardMicResult.transcript || '—'}”
                    </span>
                    <span
                      className={
                        flashcardMicResult.score >= 80
                          ? 'text-[#1F5C3D] dark:text-emerald-400'
                          : 'text-[#D97706]'
                      }
                    >
                      {flashcardMicResult.score}% Match
                    </span>
                  </div>
                  <p className="text-[#57534E] dark:text-[#A8A29E]">{flashcardMicResult.feedback}</p>
                </div>
              )}

              {isFlipped ? (
                <div className="pt-5 border-t border-[#E6E0D4] dark:border-[#2E2924] space-y-3 text-center">
                  <div className="font-nepali text-2xl font-semibold text-[#1F5C3D] dark:text-emerald-400">
                    {currentFlashcard.nepaliMeaning}
                  </div>
                  <p className="text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                    “{currentFlashcard.englishExample}”
                  </p>
                  {isFullNepali && (
                    <p className="font-nepali text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                      {currentFlashcard.nepaliExampleTranslation}
                    </p>
                  )}

                  {/* SRS Self-Rating Buttons */}
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => handleRateFlashcardSRS(false)}
                      className="min-h-[42px] px-4 py-2 rounded-xl border border-amber-400 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-semibold"
                    >
                      Needs Practice (Repeat Soon)
                    </button>
                    <button
                      onClick={() => handleRateFlashcardSRS(true)}
                      className="min-h-[42px] px-5 py-2 rounded-xl bg-[#2E6F4E] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Got It! (Advance SRS Stage)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsFlipped(true)}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold inline-flex items-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>Flip Card to Reveal Nepali Meaning</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E6E0D4] dark:border-[#2E2924]">
              <button
                onClick={handlePrevCard}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              <span className="text-[11px] text-[#78716C] hidden sm:inline">
                SRS Stage:{' '}
                <strong className="uppercase text-[#A82020] dark:text-[#F87171]">
                  {wordSRS[currentFlashcard.id]?.stage || 'new'}
                </strong>
              </span>
              <button
                onClick={handleNextCard}
                className="min-h-[42px] px-5 py-2 rounded-xl bg-[#A82020] text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <span>Skip / Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIVE SILENT-LETTER MATCH GAME MODE */}
      {viewMode === 'match' && (
        <div className="max-w-4xl mx-auto py-4">
          <div className="bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#E6E0D4] dark:border-[#2E2924] mb-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#A82020] mb-1">
                  Interactive Word Pairing Game · Round #{matchBoardRound + 1}
                </div>
                <h2 className="text-xl font-serif font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Match Silent-Letter Words with Their Nepali Meanings
                </h2>
                <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                  Click an English word on the left (hears pronunciation) and match it with its Nepali translation on the right.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="px-3 py-1.5 rounded-xl bg-[#F4F0E8] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Matched: <span className="text-[#1F5C3D]">{matchedPairIds.length}/6</span>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-[#F4F0E8] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Streak: <span className="text-[#A82020]">{matchGameStats.streak} 🔥</span>
                </div>
                <button
                  onClick={handleNextMatchRound}
                  className="min-h-[38px] px-4 py-1.5 rounded-xl bg-[#A82020] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>New Board</span>
                </button>
              </div>
            </div>

            {matchedPairIds.length === matchBoardData.pairs.length && matchBoardData.pairs.length > 0 ? (
              <div className="text-center py-10 space-y-4 bg-[#FAF8F4] dark:bg-[#141210] rounded-2xl border border-[#E6E0D4] dark:border-[#2E2924]">
                <div className="w-12 h-12 rounded-full bg-[#E2EFE7] text-[#1F5C3D] flex items-center justify-center mx-auto">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Board Cleared! All 6 Silent-Letter Pairs Matched
                </h3>
                <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">
                  All 6 words have been advanced in your Spaced Repetition (SRS) deck.
                </p>
                <button
                  onClick={handleNextMatchRound}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-[#A82020] text-white text-xs font-semibold inline-flex items-center gap-2"
                >
                  <span>Play Next Round (6 New Words)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: English Words with Silent Letters Highlighted */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-2">
                    1. Select English Word (Plays Audio)
                  </div>
                  {matchBoardData.pairs.map((item) => {
                    const isMatched = matchedPairIds.includes(item.id);
                    const isSelected = selectedMatchWordId === item.id;
                    return (
                      <button
                        key={`word-${item.id}`}
                        disabled={isMatched}
                        onClick={() => handleSelectMatchWord(item.id)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                          isMatched
                            ? 'bg-[#E2EFE7]/60 dark:bg-emerald-950/20 border-[#2E6F4E]/30 opacity-60 cursor-default'
                            : isSelected
                            ? wrongMatchFlash
                              ? 'bg-red-100 border-red-500 text-red-900'
                              : 'bg-[#FBE9E7] dark:bg-red-950/40 border-[#A82020] ring-2 ring-[#A82020]/20'
                            : 'bg-[#FAF8F4] dark:bg-[#141210] border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020]'
                        }`}
                      >
                        <div>
                          <div className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            {item.segments?.map((seg, idx) =>
                              seg.silent ? (
                                <span
                                  key={idx}
                                  className="text-[#A82020] underline decoration-dotted underline-offset-4"
                                >
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={idx}>{seg.text}</span>
                              )
                            )}
                          </div>
                          <div className="text-xs font-ipa text-[#78716C]">
                            {item.ipa} · {item.silentLettersSummary}
                          </div>
                        </div>
                        {isMatched ? (
                          <span className="text-xs font-semibold text-[#1F5C3D] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" /> Matched
                          </span>
                        ) : (
                          <Volume2 className="w-4 h-4 text-[#A82020]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Shuffled Nepali Meanings */}
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#78716C] mb-2">
                    2. Match Nepali Meaning (नेपाली अर्थ)
                  </div>
                  {matchBoardData.shuffledMeanings.map((item) => {
                    const isMatched = matchedPairIds.includes(item.id);
                    const isSelected = selectedMatchMeaningId === item.id;
                    return (
                      <button
                        key={`meaning-${item.id}`}
                        disabled={isMatched}
                        onClick={() => handleSelectMatchMeaning(item.id)}
                        className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between min-h-[66px] ${
                          isMatched
                            ? 'bg-[#E2EFE7]/60 dark:bg-emerald-950/20 border-[#2E6F4E]/30 opacity-60 cursor-default'
                            : isSelected
                            ? wrongMatchFlash
                              ? 'bg-red-100 border-red-500 text-red-900'
                              : 'bg-[#FBE9E7] dark:bg-red-950/40 border-[#A82020] ring-2 ring-[#A82020]/20'
                            : 'bg-[#FAF8F4] dark:bg-[#141210] border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#A82020]'
                        }`}
                      >
                        <div>
                          <div className="font-nepali text-base font-semibold text-[#1F5C3D] dark:text-emerald-400">
                            {item.nepaliMeaning}
                          </div>
                          <div className="text-xs text-[#78716C] line-clamp-1">
                            {item.partOfSpeech} · Level {item.level}
                          </div>
                        </div>
                        {isMatched && (
                          <span className="text-xs font-semibold text-[#1F5C3D]">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DICTIONARY LIST & COMPACT VOCABULARY TABLE MODES (Paginated Across 10,400+ Words) */}
      {(viewMode === 'list' || viewMode === 'table') && filteredWords.length > 0 && (
        <div className="space-y-6">
          {/* Top Pagination Summary Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#57534E] dark:text-[#A8A29E]">
            <div>
              Showing{' '}
              <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                {((safePage - 1) * PAGE_SIZE + 1).toLocaleString()}–
                {Math.min(safePage * PAGE_SIZE, filteredWords.length).toLocaleString()}
              </strong>{' '}
              of{' '}
              <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                {filteredWords.length.toLocaleString()}
              </strong>{' '}
              matching vocabulary entries
              {selectedLectureNum !== null
                ? ` in Lecture ${String(selectedLectureNum).padStart(2, '0')}`
                : ''}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="min-h-[36px] px-3 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] font-semibold disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-ipa">
                Page {safePage} / {totalPages.toLocaleString()}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="min-h-[36px] px-3 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] font-semibold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#FAF7F2] dark:bg-[#141210] border-b border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                      <th className="py-3 px-4 font-semibold">Word (Silent Highlight)</th>
                      <th className="py-3 px-4 font-semibold">IPA & POS</th>
                      <th className="py-3 px-4 font-semibold">Nepali Meaning</th>
                      <th className="py-3 px-4 font-semibold">Mastery Stage</th>
                      <th className="py-3 px-4 font-semibold">Unit</th>
                      <th className="py-3 px-4 font-semibold">Audio, Save & Mastered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E0D6] dark:divide-[#2E2924]">
                    {paginatedWords.map((item) => {
                      const isSaved = savedWordIds.includes(item.id);
                      const mastery = getWordMasteryStatus(item.id);
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#FAF7F2]/60 dark:hover:bg-[#141210]/40"
                        >
                          <td className="py-3 px-4 font-semibold text-base text-[#1C1917] dark:text-[#F5F2EB]">
                            {item.segments?.map((seg, idx) =>
                              seg.silent ? (
                                <span
                                  key={idx}
                                  className="text-[#B91C1C] dark:text-[#F87171] underline decoration-dotted decoration-2 underline-offset-4"
                                >
                                  {seg.text}
                                </span>
                              ) : (
                                <span key={idx}>{seg.text}</span>
                              )
                            )}
                          </td>
                          <td className="py-3 px-4 font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                            {item.ipa} · {item.partOfSpeech}
                          </td>
                          <td className="py-3 px-4 font-nepali font-semibold text-[#15803D] dark:text-emerald-400">
                            {item.nepaliMeaning}
                          </td>
                          <td className="py-3 px-4 text-xs">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-ipa text-[11px] font-semibold ${mastery.badgeClass}`}
                            >
                              {mastery.isMastered && <CheckCircle2 className="w-3 h-3" />}
                              <span>{mastery.label}</span>
                            </span>
                          </td>
                          <td className="py-3 px-4 font-ipa text-xs">
                            <button
                              type="button"
                              onClick={() => onOpenLecture(item.lectureId)}
                              className="hover:underline font-semibold text-[#1C1917] dark:text-[#F5F2EB]"
                            >
                              L{String(item.lectureNumber).padStart(2, '0')} · {item.level}
                            </button>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  speechService.speak(item.word, { rate: preferredSpeechRate })
                                }
                                className="min-h-[34px] px-2.5 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1"
                              >
                                <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                                <span>1.0x</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => speechService.speak(item.word, { rate: 0.6 })}
                                className="min-h-[34px] px-2 py-1 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-medium inline-flex items-center gap-1"
                              >
                                <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onToggleSaveWord(item.id)}
                                title="Save Word"
                                className={`min-h-[34px] px-2 py-1 rounded-lg border ${
                                  isSaved
                                    ? 'border-[#B91C1C]/40 bg-[#B91C1C]/10 text-[#B91C1C]'
                                    : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E]'
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
                                  title={
                                    mastery.isMastered ? 'Mastered (Click to unmark)' : 'Mark Word as Mastered'
                                  }
                                  className={`min-h-[34px] px-2.5 py-1 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 ${
                                    mastery.isMastered
                                      ? 'border-[#15803D] bg-[#15803D] text-white'
                                      : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] hover:border-[#15803D]'
                                  }`}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span className="hidden xl:inline">
                                    {mastery.isMastered ? 'Mastered' : 'Master'}
                                  </span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedWords.map((item) => {
                const isSaved = savedWordIds.includes(item.id);
                const showMeaning = showMeaningsByDefault || Boolean(revealedIds[item.id]);
                const mastery = getWordMasteryStatus(item.id);

                return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E] dark:text-[#A8A29E] mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          onClick={() => onOpenLecture(item.lectureId)}
                          className="hover:underline text-[#B91C1C] dark:text-[#F87171] font-medium"
                        >
                          Lecture {String(item.lectureNumber).padStart(2, '0')}
                        </button>
                        <span aria-hidden="true">·</span>
                        <span>Level {item.level}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.partOfSpeech}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border font-ipa text-[10px] font-semibold ${mastery.badgeClass}`}
                        >
                          {mastery.isMastered && <CheckCircle2 className="w-2.5 h-2.5" />}
                          <span>{mastery.label}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {languageMode === 'english-only' && (
                          <button
                            onClick={() =>
                              setRevealedIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))
                            }
                            className="min-h-[36px] px-2.5 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] text-[11px] font-medium inline-flex items-center gap-1"
                          >
                            {showMeaning ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            )}
                            <span>{showMeaning ? 'Hide Nepali' : 'Meaning'}</span>
                          </button>
                        )}
                        {onToggleMasteredWord && (
                          <button
                            type="button"
                            onClick={() => onToggleMasteredWord(item.id)}
                            title={
                              mastery.isMastered ? 'Mastered (Click to unmark)' : 'Mark Word as Mastered'
                            }
                            className={`min-h-[36px] px-2.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1 transition-colors ${
                              mastery.isMastered
                                ? 'border-[#15803D] bg-[#15803D] text-white'
                                : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E] hover:border-[#15803D]'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{mastery.isMastered ? 'Mastered' : 'Mark Mastered'}</span>
                          </button>
                        )}
                        <button
                          onClick={() => onToggleSaveWord(item.id)}
                          aria-label="Toggle bookmark"
                          className={`min-h-[36px] min-w-[36px] px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 ${
                            isSaved
                              ? 'border-[#B91C1C]/40 bg-[#B91C1C]/10 text-[#B91C1C] dark:text-[#F87171]'
                              : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E]'
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

                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                      <div className="flex items-baseline gap-2.5">
                        <h3 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                          {item.segments?.map((seg, idx) =>
                            seg.silent ? (
                              <span
                                key={idx}
                                className="text-[#B91C1C] dark:text-[#F87171] bg-[#B91C1C]/10 underline decoration-dotted decoration-2 underline-offset-4 px-0.5 rounded"
                              >
                                {seg.text}
                              </span>
                            ) : (
                              <span key={idx}>{seg.text}</span>
                            )
                          )}
                        </h3>
                        <span className="font-ipa text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                          {item.ipa}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            speechService.speak(item.word, { rate: preferredSpeechRate })
                          }
                          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-medium inline-flex items-center gap-1.5"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                          <span>1.0x</span>
                        </button>
                        <button
                          onClick={() => speechService.speak(item.word, { rate: 0.6 })}
                          className="min-h-[38px] px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-medium inline-flex items-center gap-1"
                        >
                          <Turtle className="w-3.5 h-3.5 text-[#D97706]" />
                          <span>0.65x</span>
                        </button>
                      </div>
                    </div>

                    {showMeaning && (
                      <div className="font-nepali text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-2">
                        {item.nepaliMeaning}
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] mb-1">
                      “{item.englishExample}”
                    </p>
                    {isFullNepali && (
                      <p className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                        {item.nepaliExampleTranslation}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E7E0D6] dark:border-[#2E2924] flex items-center justify-between text-[11px] text-[#B91C1C] dark:text-[#F87171]">
                    <span>Phonics: {item.silentLettersSummary}</span>
                    <span className="text-[#57534E] dark:text-[#A8A29E]">{item.category}</span>
                  </div>
                </div>
              );
            })}
            </div>
          )}

          {/* Bottom Pagination Bar */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#E7E0D6] dark:border-[#2E2924]">
              <button
                onClick={() => {
                  setCurrentPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={safePage <= 1}
                className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Page</span>
              </button>

              <div className="flex items-center gap-1.5 text-xs font-ipa">
                <span>Page</span>
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
                  className="w-16 min-h-[38px] px-2 py-1 text-center rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18]"
                />
                <span>of {totalPages.toLocaleString()}</span>
              </div>

              <button
                onClick={() => {
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={safePage >= totalPages}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-40"
              >
                <span>Next Page</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
