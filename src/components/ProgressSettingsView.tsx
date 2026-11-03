import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Flame,
  CheckCircle2,
  BookmarkCheck,
  Download,
  RefreshCw,
  Volume2,
  Sun,
  Moon,
  Smartphone,
  Wifi,
  WifiOff,
  Globe,
  Award,
  Printer,
  Upload,
  FileDown,
  BarChart3,
  Target,
  MessageSquare,
  ArrowLeft,
  Mic,
  Play,
  Square,
  Sliders,
  Headphones,
  PlusCircle,
  Trophy,
  Lock,
  Sparkles,
  BookOpen,
  Zap,
  ShieldCheck,
  ArrowRight,
  Share2,
  Cloud,
  LogIn,
  LogOut,
  UserCheck,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { User } from 'firebase/auth';
import {
  UserProgressState,
  LectureUnit,
  CEFRLevel,
  LanguageMode,
  ModuleScoreRecord,
  MistakeItem,
} from '../types/curriculum';
import { usePWAInstall } from '../hooks/usePWA';
import { getMassiveLexicon } from '../data/massiveLexicon';
import { getUnifiedMasteredWordsCount } from '../services/storage';
import { ArenaToolTab } from './PracticeArenaView';
import {
  PrintableStudySheetModal,
  StudySheetFocusMode,
} from './PrintableStudySheetModal';
import {
  exportSavedWordsToCSV,
  exportMistakeNotebookToCSV,
} from '../services/studySheetExport';
import {
  speechService,
  DialogueCalibrationSettings,
  PronunciationResult,
} from '../services/speech';

interface ProgressSettingsViewProps {
  mode: 'progress' | 'settings';
  progress: UserProgressState;
  lectures: LectureUnit[];
  isOnline: boolean;
  initialProgressSubView?: 'overview' | 'achievements';
  onUpdateLevel: (level: CEFRLevel) => void;
  onUpdateSpeechRate: (rate: number) => void;
  onUpdateLanguageMode: (langMode: LanguageMode) => void;
  onToggleDarkMode: () => void;
  onManualSync: () => Promise<void>;
  onOpenLecture: (lectureId: string) => void;
  onOpenArenaTool?: (tool: ArenaToolTab) => void;
  onOpenDictionary?: () => void;
  onOpenDailyChallenge?: () => void;
  onUpdateDailyGoal?: (minutes: 5 | 10 | 15 | 30) => void;
  onImportProgress?: (imported: UserProgressState) => void;
  onRecordMistake?: (
    mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>
  ) => void;
  firebaseUser?: User | null;
  isCloudSyncing?: boolean;
  cloudSyncStatusMsg?: string | null;
  onGoogleSignIn?: () => Promise<void>;
  onGoogleSignOut?: () => Promise<void>;
  onPullFromCloud?: () => Promise<void>;
  onUpdateUserName?: (name: string) => void;
  onToggleDailyReminder?: () => void;
  onResetAllProgress?: (includeCloud: boolean) => Promise<void>;
}

interface CalibrationDialogueLine {
  speaker: 'Aarav (Speaker A)' | 'Elena (Speaker B)';
  speakerIndex: 0 | 1;
  english: string;
  nepali: string;
  targetPhonemes: { word: string; ipa: string; note: string }[];
}

const CALIBRATION_DIALOGUE_SCRIPT: CalibrationDialogueLine[] = [
  {
    speaker: 'Aarav (Speaker A)',
    speakerIndex: 0,
    english: 'Good morning, Elena! Did you receive the updated Wednesday schedule and the receipt?',
    nepali: 'शुभ प्रभात एलेना! के तपाईंले बुधबारको अद्यावधिक तालिका र रसिद प्राप्त गर्नुभयो?',
    targetPhonemes: [
      { word: 'Wednesday', ipa: '/ˈwenz.deɪ/', note: 'Middle "d" and "e" are silent' },
      { word: 'Receipt', ipa: '/rɪˈsiːt/', note: 'Silent "p" before "t"' },
    ],
  },
  {
    speaker: 'Elena (Speaker B)',
    speakerIndex: 1,
    english: 'Yes, without a doubt! I noticed a subtle change in the budget to clear our debt.',
    nepali: 'हो, निस्सन्देह! मैले हाम्रो ऋण तिर्न बजेटमा सूक्ष्म परिवर्तन देखेँ।',
    targetPhonemes: [
      { word: 'Doubt', ipa: '/daʊt/', note: 'Silent "b" before "t"' },
      { word: 'Subtle', ipa: '/ˈsʌt.əl/', note: 'Silent "b" in "-btle"' },
      { word: 'Debt', ipa: '/det/', note: 'Silent "b" in "-bt"' },
    ],
  },
  {
    speaker: 'Aarav (Speaker A)',
    speakerIndex: 0,
    english: 'Also, the plumber waited in the queue to fix the castle heating pipe.',
    nepali: 'साथै, प्लम्बरले किल्लाको तताउने पाइप मर्मत गर्न लाइनमा पर्खनुभयो।',
    targetPhonemes: [
      { word: 'Plumber', ipa: '/ˈplʌm.ər/', note: 'Silent "b" after "m"' },
      { word: 'Queue', ipa: '/kjuː/', note: 'Silent "-ueue" after "q"' },
      { word: 'Castle', ipa: '/ˈkɑː.səl/', note: 'Silent "t" in "-stle"' },
    ],
  },
  {
    speaker: 'Elena (Speaker B)',
    speakerIndex: 1,
    english: 'Wonderful! Let us fasten our seatbelts and review the honest report together.',
    nepali: 'उत्तम! हाम्रो सिटबेल्ट बाँधौँ र इमानदार प्रतिवेदन सँगै समीक्षा गरौँ।',
    targetPhonemes: [
      { word: 'Fasten', ipa: '/ˈfɑː.sən/', note: 'Silent "t" in "-sten"' },
      { word: 'Honest', ipa: '/ˈɒn.ɪst/', note: 'Silent initial "h"' },
    ],
  },
];

interface VoicePracticeDrill {
  id: string;
  category: 'words' | 'sentences';
  targetText: string;
  ipa: string;
  syllableGuide: string;
  silentRule: string;
  silentLetterTrapRegex?: RegExp;
  trapWarning: string;
  nepaliMeaning: string;
  coachingTipNepali: string;
}

const SOUND_PRACTICE_DRILLS: VoicePracticeDrill[] = [
  {
    id: 'drill-subtle',
    category: 'words',
    targetText: 'Subtle',
    ipa: '/ˈsʌt.əl/',
    syllableGuide: 'SUH-tuhl',
    silentRule: 'Silent "b" before "t"',
    silentLetterTrapRegex: /sub/i,
    trapWarning: 'Keep the "b" completely silent — say "SUH-tuhl", never "SUB-tuhl".',
    nepaliMeaning: 'सूक्ष्म / बारीक',
    coachingTipNepali: 'बीचको "b" उच्चारण नगर्नुहोस्; सीधा "स-टल्" भन्नुहोस्।',
  },
  {
    id: 'drill-receipt',
    category: 'words',
    targetText: 'Receipt',
    ipa: '/rɪˈsiːt/',
    syllableGuide: 'ri-SEET',
    silentRule: 'Silent "p" before "t"',
    silentLetterTrapRegex: /sip|seep/i,
    trapWarning: 'Drop the "p" sound completely — stress the second syllable: "ri-SEET".',
    nepaliMeaning: 'रसिद / बिल',
    coachingTipNepali: '"p" मौन रहन्छ; दोस्रो अक्षरमा जोड दिएर "रि-सीट्" भन्नुहोस्।',
  },
  {
    id: 'drill-wednesday',
    category: 'words',
    targetText: 'Wednesday',
    ipa: '/ˈwenz.deɪ/',
    syllableGuide: 'WENZ-day',
    silentRule: 'Silent "d" and first "e" (2 syllables only)',
    silentLetterTrapRegex: /wed/i,
    trapWarning: 'Blend into 2 syllables ("WENZ-day"), never 3 ("Wed-nes-day").',
    nepaliMeaning: 'बुधबार',
    coachingTipNepali: 'तीनवटा होइन, दुईवटा मात्र अक्षर ("वेन्ज्-डे") उच्चारण गर्नुहोस्।',
  },
  {
    id: 'drill-plumber',
    category: 'words',
    targetText: 'Plumber',
    ipa: '/ˈplʌm.ər/',
    syllableGuide: 'PLUM-er',
    silentRule: 'Silent "b" after "m"',
    silentLetterTrapRegex: /plumb/i,
    trapWarning: 'The "b" after "m" is silent, even when "-er" is added: "PLUM-er".',
    nepaliMeaning: 'धारा वा पाइप मर्मत गर्ने व्यक्ति',
    coachingTipNepali: '"m" पछिको "b" पूर्ण रूपमा मौन हुन्छ ("प्ल-मर्")।',
  },
  {
    id: 'drill-queue',
    category: 'words',
    targetText: 'Queue',
    ipa: '/kjuː/',
    syllableGuide: 'KYOO',
    silentRule: 'Silent "-ueue" — sounds just like the letter "Q"',
    trapWarning: 'Pronounce as a single syllable ("KYOO"). The last four letters are silent.',
    nepaliMeaning: 'लाइन / लाम',
    coachingTipNepali: 'अन्तिम चार अक्षर "-ueue" मौन हुन्छन्; केवल "क्यू" भन्नुहोस्।',
  },
  {
    id: 'drill-colonel',
    category: 'words',
    targetText: 'Colonel',
    ipa: '/ˈkɜː.nəl/',
    syllableGuide: 'KUR-nuhl',
    silentRule: 'Sounds identical to "Kernel" (/ˈkɜː.nəl/)',
    trapWarning: 'Do not pronounce the first "l" or "o" — it sounds like "KUR-nuhl".',
    nepaliMeaning: 'कर्णेल (सैनिक पद)',
    coachingTipNepali: 'स्पेलिङमा "l" भए पनि उच्चारण "कर्-नल्" (Kernel जस्तै) हुन्छ।',
  },
  {
    id: 'drill-sent-1',
    category: 'sentences',
    targetText: 'Could you please send the receipt and schedule by Wednesday?',
    ipa: '/kʊd juː pliːz send ðə rɪˈsiːt ænd ˈʃed.juːl baɪ ˈwenz.deɪ/',
    syllableGuide: 'Polite indirect request with 3 silent-letter targets',
    silentRule: 'Silent "l" in Could, silent "p" in Receipt, silent "d" in Wednesday',
    trapWarning: 'Link words smoothly and keep the "p" in receipt and "d" in Wednesday silent.',
    nepaliMeaning: 'के तपाईं कृपया बुधबारसम्म रसिद र तालिका पठाउन सक्नुहुन्छ?',
    coachingTipNepali: 'Could, Receipt र Wednesday मा रहेका मौन अक्षरहरू उच्चारण नगरी वाक्य प्रवाहमा पढ्नुहोस्।',
  },
  {
    id: 'drill-sent-2',
    category: 'sentences',
    targetText: 'Without a doubt, the honest plumber fixed the subtle leak.',
    ipa: '/wɪˈðaʊt ə daʊt ðə ˈɒn.ɪst ˈplʌm.ər fɪkst ðə ˈsʌt.əl liːk/',
    syllableGuide: '4 silent-letter targets in a natural statement',
    silentRule: 'Silent "b" in Doubt/Plumber/Subtle, silent "h" in Honest',
    trapWarning: 'Watch all three silent "b" words (doubt, plumber, subtle) and silent "h" in honest.',
    nepaliMeaning: 'निस्सन्देह, इमानदार प्लम्बरले सूक्ष्म चुहावट मर्मत गरे।',
    coachingTipNepali: 'Doubt, Plumber, र Subtle तीनवटै शब्दमा "b" उच्चारण नगर्नुहोस्।',
  },
];

interface MinimalPairContrast {
  id: string;
  label: string;
  phonemeA: string;
  wordA: string;
  ipaA: string;
  meaningA: string;
  phonemeB: string;
  wordB: string;
  ipaB: string;
  meaningB: string;
  mouthPositionTip: string;
}

const MINIMAL_PAIR_CONTRASTS: MinimalPairContrast[] = [
  {
    id: 'mp-v-b',
    label: '/v/ vs /b/ Labiodental Contrast',
    phonemeA: '/v/',
    wordA: 'Vet',
    ipaA: '/vet/',
    meaningA: 'पशु चिकित्सक',
    phonemeB: '/b/',
    wordB: 'Bet',
    ipaB: '/bet/',
    meaningB: 'बाजी',
    mouthPositionTip:
      'For /v/ ("Vet"), gently touch your upper teeth to your lower lip and vibrate air. For /b/ ("Bet"), press both lips together.',
  },
  {
    id: 'mp-f-p',
    label: '/f/ vs /p/ Airflow Contrast',
    phonemeA: '/f/',
    wordA: 'Fast',
    ipaA: '/fɑːst/',
    meaningA: 'छिटो',
    phonemeB: '/p/',
    wordB: 'Past',
    ipaB: '/pɑːst/',
    meaningB: 'विगत',
    mouthPositionTip:
      'For /f/ ("Fast"), blow continuous air between upper teeth and lower lip. Do not close both lips like Nepali "फ" (/pʰ/).',
  },
  {
    id: 'mp-sh-s',
    label: '/ʃ/ vs /s/ Sibilant Contrast',
    phonemeA: '/ʃ/',
    wordA: 'Sheet',
    ipaA: '/ʃiːt/',
    meaningA: 'पाना / तन्ना',
    phonemeB: '/s/',
    wordB: 'Seat',
    ipaB: '/siːt/',
    meaningB: 'सिट / आसन',
    mouthPositionTip:
      'For /ʃ/ ("Sheet"), round your lips slightly and pull the tongue slightly back for a soft "sh" sound.',
  },
  {
    id: 'mp-kn-v',
    label: 'Silent "kn-" Vowel Length Contrast',
    phonemeA: '/aɪ/',
    wordA: 'Knight',
    ipaA: '/naɪt/',
    meaningA: 'योद्धा (Silent K & GH)',
    phonemeB: '/ɪ/',
    wordB: 'Knit',
    ipaB: '/nɪt/',
    meaningB: 'बुन्नु (Silent K)',
    mouthPositionTip:
      'Both words have a silent initial "K", but "Knight" uses the long glide /aɪ/ while "Knit" uses the short crisp vowel /ɪ/.',
  },
];

export const ProgressSettingsView: React.FC<ProgressSettingsViewProps> = ({
  mode,
  progress,
  lectures,
  isOnline,
  initialProgressSubView = 'overview',
  onUpdateLevel,
  onUpdateSpeechRate,
  onUpdateLanguageMode,
  onToggleDarkMode,
  onManualSync,
  onOpenLecture,
  onOpenArenaTool,
  onOpenDictionary,
  onOpenDailyChallenge,
  onUpdateDailyGoal,
  onImportProgress,
  onRecordMistake,
  firebaseUser = null,
  isCloudSyncing = false,
  cloudSyncStatusMsg = null,
  onGoogleSignIn,
  onGoogleSignOut,
  onPullFromCloud,
  onUpdateUserName,
  onToggleDailyReminder,
  onResetAllProgress,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditingProfileName, setIsEditingProfileName] = useState(false);
  const [draftProfileName, setDraftProfileName] = useState<string>(
    progress.userName || firebaseUser?.displayName || 'Anisha Sharma'
  );
  const [showFullAudioLab, setShowFullAudioLab] = useState(false);
  const [selectedActivityDate, setSelectedActivityDate] = useState<string | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetIncludeCloud, setResetIncludeCloud] = useState(true);
  const [isResettingProgress, setIsResettingProgress] = useState(false);
  const audioLabSectionRef = useRef<HTMLElement | null>(null);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(
    () => speechService.getPreferredVoiceURI() || ''
  );
  const [isTestingVoice, setIsTestingVoice] = useState<'single' | 'dialogue' | null>(null);
  const [backupMessage, setBackupMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [certificateTrack, setCertificateTrack] = useState<CEFRLevel | null>(null);
  const [selectedBadgeForPrint, setSelectedBadgeForPrint] = useState<string | null>(null);
  const [studySheetPrintMode, setStudySheetPrintMode] = useState<StudySheetFocusMode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Dedicated Long-Form Dialogue Speed & Pitch Calibration State
  const [dialogueCalibration, setDialogueCalibration] = useState<DialogueCalibrationSettings>(() =>
    speechService.getDialogueCalibration()
  );
  const [isPlayingCalibrationDialogue, setIsPlayingCalibrationDialogue] = useState(false);
  const [activeCalibrationLineIdx, setActiveCalibrationLineIdx] = useState<number | null>(null);

  // Interactive Sound & Voice Practice Lab State
  const [practiceTab, setPracticeTab] = useState<'words' | 'sentences' | 'custom'>('words');
  const [selectedDrillId, setSelectedDrillId] = useState<string>(SOUND_PRACTICE_DRILLS[0].id);
  const [customPracticeText, setCustomPracticeText] = useState<string>(
    'We reviewed the subtle receipt and schedule on Wednesday.'
  );
  const [isListeningPracticeMic, setIsListeningPracticeMic] = useState(false);
  const [practiceResult, setPracticeResult] = useState<PronunciationResult | null>(null);
  const [practiceMicError, setPracticeMicError] = useState<string | null>(null);
  const [manualTranscriptTestInput, setManualTranscriptTestInput] = useState<string>('');
  const [savedToMistakesBanner, setSavedToMistakesBanner] = useState<boolean>(false);

  // Minimal-Pair Ear Training State
  const [activePairId, setActivePairId] = useState<string>(MINIMAL_PAIR_CONTRASTS[0].id);
  const [mysteryChoice, setMysteryChoice] = useState<'A' | 'B' | null>(null);
  const [userEarGuess, setUserEarGuess] = useState<'A' | 'B' | null>(null);

  // Progress Tab Sub-View ('overview' | 'achievements') & Filter State
  const [progressSubView, setProgressSubView] = useState<'overview' | 'achievements'>(
    initialProgressSubView
  );
  const [achievementStatusFilter, setAchievementStatusFilter] = useState<
    'all' | 'unlocked' | 'locked'
  >('all');
  const [achievementCategoryFilter, setAchievementCategoryFilter] = useState<
    'all' | 'curriculum' | 'streak' | 'vocabulary' | 'arena'
  >('all');

  useEffect(() => {
    setProgressSubView(initialProgressSubView);
  }, [initialProgressSubView]);

  const isFullNepali = progress.languageMode === 'full-nepali';

  const availableVoices = useMemo(() => {
    return speechService.getAvailableEnglishVoices();
  }, []);

  const currentDrill = useMemo(() => {
    return (
      SOUND_PRACTICE_DRILLS.find((d) => d.id === selectedDrillId) || SOUND_PRACTICE_DRILLS[0]
    );
  }, [selectedDrillId]);

  const currentMinimalPair = useMemo(() => {
    return (
      MINIMAL_PAIR_CONTRASTS.find((m) => m.id === activePairId) || MINIMAL_PAIR_CONTRASTS[0]
    );
  }, [activePairId]);

  const scoreEntries = Object.values(progress.moduleScores) as ModuleScoreRecord[];

  const skillMetrics = useMemo(() => {
    const spellingCorrect = scoreEntries.reduce((acc, s) => acc + s.spellingScore, 0);
    const spellingTotal = scoreEntries.reduce((acc, s) => acc + s.spellingTotal, 0);
    const spellingPercent =
      spellingTotal > 0 ? Math.round((spellingCorrect / spellingTotal) * 100) : null;

    const grammarCorrect = scoreEntries.reduce((acc, s) => acc + s.grammarScore, 0);
    const grammarTotal = scoreEntries.reduce((acc, s) => acc + s.grammarTotal, 0);
    const grammarPercent =
      grammarTotal > 0 ? Math.round((grammarCorrect / grammarTotal) * 100) : null;

    const dialogueCorrect = scoreEntries.reduce((acc, s) => acc + (s.dialogueScore || 0), 0);
    const dialogueTotal = scoreEntries.reduce((acc, s) => acc + (s.dialogueTotal || 0), 0);
    const dialoguePercent =
      dialogueTotal > 0 ? Math.round((dialogueCorrect / dialogueTotal) * 100) : null;

    const srsEntries = Object.values(progress.wordSRS || {});
    const masteredWords = srsEntries.filter(
      (w) => w.stage === 'mastered' || w.correctStreak >= 2
    ).length;
    const totalCoreWords = lectures.reduce((acc, l) => acc + l.moduleA_vocabulary.length, 0);
    const practicedWordsCount = Math.max(
      srsEntries.length,
      progress.savedWordIds.length,
      progress.completedUnitIds.length * 12
    );
    const vocabPercent =
      totalCoreWords > 0
        ? Math.min(100, Math.round((practicedWordsCount / totalCoreWords) * 100))
        : 0;

    const totalCorrect = spellingCorrect + grammarCorrect + dialogueCorrect;
    const totalQuestions = spellingTotal + grammarTotal + dialogueTotal;
    const overallAccuracy =
      totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null;

    // Identify lowest skill to recommend focus
    const candidates: { name: string; pct: number; hint: string }[] = [];
    if (spellingPercent !== null) {
      candidates.push({
        name: 'Spelling & Silent-Letter Dictation',
        pct: spellingPercent,
        hint: 'Practice Step 03 Audio Dictation Bee and review your Mistake Notes.',
      });
    }
    if (grammarPercent !== null) {
      candidates.push({
        name: 'Grammar & Sentence Structure',
        pct: grammarPercent,
        hint: 'Practice Step 04 SVO vs. SOV Syntax Comparisons and Sentence Builder tiles.',
      });
    }
    if (dialoguePercent !== null) {
      candidates.push({
        name: 'Real-Life Dialogue Comprehension',
        pct: dialoguePercent,
        hint: 'Listen to the Step 05 two-person dialogues and complete comprehension checks.',
      });
    }
    candidates.sort((a, b) => a.pct - b.pct);

    return {
      spellingCorrect,
      spellingTotal,
      spellingPercent,
      grammarCorrect,
      grammarTotal,
      grammarPercent,
      dialogueCorrect,
      dialogueTotal,
      dialoguePercent,
      masteredWords,
      practicedWordsCount,
      totalCoreWords,
      vocabPercent,
      totalCorrect,
      totalQuestions,
      overallAccuracy,
      focusArea:
        candidates[0] || {
          name: 'Core Silent-Letter Vocabulary & Dictation',
          pct: vocabPercent,
          hint: 'Complete your next sequential lecture from Step 01 through Step 05 to build balanced mastery.',
        },
    };
  }, [scoreEntries, progress.wordSRS, progress.savedWordIds, progress.completedUnitIds, lectures]);

  const allLexiconWords = useMemo(() => getMassiveLexicon(lectures), [lectures]);
  const totalLexiconCount = allLexiconWords.length;
  const savedWordsForExport = useMemo(() => {
    const matched = allLexiconWords.filter((w) => progress.savedWordIds.includes(w.id));
    return matched.length > 0 ? matched : allLexiconWords.filter((w) => w.isCoreLessonWord).slice(0, 20);
  }, [allLexiconWords, progress.savedWordIds]);
  const overallCoursePercent =
    lectures.length > 0
      ? Math.round((progress.completedUnitIds.length / lectures.length) * 100)
      : 0;

  const trackStats = useMemo(() => {
    return (['B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => {
      const units = lectures.filter((l) => l.level === lvl);
      const done = units.filter((l) => progress.completedUnitIds.includes(l.id)).length;
      const pct = units.length > 0 ? Math.round((done / units.length) * 100) : 0;
      const label =
        lvl === 'B1'
          ? 'Lower-Intermediate Foundation (Lectures 01–04)'
          : lvl === 'B2'
          ? 'Upper-Intermediate Workplace & Media (Lectures 05–08)'
          : 'Advanced Academic & Executive Mastery (Lectures 09–12)';
      return { level: lvl, total: units.length, done, pct, label };
    });
  }, [lectures, progress.completedUnitIds]);

  const unifiedMasteredWordsCount = useMemo(
    () => getUnifiedMasteredWordsCount(progress),
    [progress]
  );

  const nextUnfinishedLecture = useMemo(() => {
    return (
      lectures.find((l) => !progress.completedUnitIds.includes(l.id)) ||
      lectures[0]
    );
  }, [lectures, progress.completedUnitIds]);

  const fluencyHeatmapCells = useMemo(() => {
    const hasAnyActivity =
      progress.completedUnitIds.length > 0 ||
      unifiedMasteredWordsCount > 0 ||
      Object.keys(progress.completedStepsByLecture || {}).length > 0 ||
      skillMetrics.overallAccuracy !== null;

    const baseMastery = hasAnyActivity
      ? Math.min(
          95,
          Math.round(
            progress.completedUnitIds.length * 7 +
              unifiedMasteredWordsCount * 0.9 +
              (skillMetrics.overallAccuracy || 30) * 0.25
          )
        )
      : 0;
    const spellingBoost = hasAnyActivity ? (skillMetrics.spellingPercent ?? 20) : 0;
    const grammarBoost = hasAnyActivity ? (skillMetrics.grammarPercent ?? 20) : 0;

    const calcCellScore = (boost: number, offset: number, minWhenActive: number) => {
      if (!hasAnyActivity) return 0;
      return Math.min(100, Math.max(minWhenActive, Math.round((baseMastery + boost) / 2 + offset)));
    };

    const silentClusters = [
      { id: 'kn', label: 'Silent K (kn-)', example: 'Knight, Knowledge', score: calcCellScore(spellingBoost, 12, 15) },
      { id: 'mb', label: 'Silent B (-mb/-bt)', example: 'Subtle, Plumber, Debt', score: calcCellScore(spellingBoost, 8, 12) },
      { id: 'wr', label: 'Silent W (wr-/wh-)', example: 'Wreck, Wrist, Whole', score: calcCellScore(spellingBoost, 5, 12) },
      { id: 'lk', label: 'Silent L (-lk/-lm)', example: 'Calm, Salmon, Half', score: calcCellScore(spellingBoost, 0, 10) },
      { id: 'gh', label: 'Silent GH (-igh/-ough)', example: 'Though, Drought, Weigh', score: calcCellScore(spellingBoost, -4, 10) },
      { id: 'st', label: 'Silent T (-stle/-sten)', example: 'Castle, Fasten, Whistle', score: calcCellScore(spellingBoost, 4, 12) },
      { id: 'ps', label: 'Silent P (ps-/pn-/pt)', example: 'Psychology, Receipt', score: calcCellScore(spellingBoost, -2, 10) },
      { id: 'h', label: 'Silent H (hon-/rh-)', example: 'Honest, Heir, Rhythm', score: calcCellScore(spellingBoost, 6, 12) },
      { id: 'gn', label: 'Silent G (gn-/-ign)', example: 'Foreign, Sign, Campaign', score: calcCellScore(spellingBoost, -3, 10) },
      { id: 'mn', label: 'Silent N (-mn)', example: 'Autumn, Column, Solemn', score: calcCellScore(spellingBoost, 2, 10) },
      { id: 'sc', label: 'Silent C (sc-)', example: 'Conscience, Muscle', score: calcCellScore(spellingBoost, -6, 10) },
      { id: 'd', label: 'Silent D (-dj-/-dn-)', example: 'Wednesday, Ledger', score: calcCellScore(spellingBoost, 10, 14) },
    ];

    const syntaxPillars = [
      { id: 'svo', label: 'SOV → SVO Word Order', sub: 'Subject + Verb + Object', score: calcCellScore(grammarBoost, 8, 15) },
      { id: 'articles', label: 'Article Mastery (a/an/the/Ø)', sub: 'Definite vs. Zero Article', score: calcCellScore(grammarBoost, 0, 12) },
      { id: 'prepositions', label: 'Nepali Postposition Traps', sub: 'मा / ले / सँग → in/on/at/by/with', score: calcCellScore(grammarBoost, -4, 10) },
      { id: 'stative', label: 'Stative vs. Continuous (-ing)', sub: 'Have / Know / Believe', score: calcCellScore(grammarBoost, 5, 12) },
    ];

    return { silentClusters, syntaxPillars };
  }, [
    progress.completedUnitIds.length,
    progress.completedStepsByLecture,
    unifiedMasteredWordsCount,
    skillMetrics,
  ]);

  const achievementsList = useMemo(() => {
    const completedCount = progress.completedUnitIds.length;
    const streakDays = progress.currentStreakDays || 0;
    const wordsMasteredOrPracticed = unifiedMasteredWordsCount;
    const b1Done = trackStats.find((t) => t.level === 'B1')?.done || 0;
    const b1Total = trackStats.find((t) => t.level === 'B1')?.total || 4;
    const b2Done = trackStats.find((t) => t.level === 'B2')?.done || 0;
    const b2Total = trackStats.find((t) => t.level === 'B2')?.total || 4;
    const dailyChallenges = progress.dailyChallengeTotalCompleted || 0;
    const detectiveSolved = progress.detectiveSolvedIds?.length || 0;
    const sprintBest = progress.sprintHighScore || 0;
    const rolePlaysDone = progress.rolePlayCompletedIds?.length || 0;
    const customDeckCount = progress.customWords?.length || 0;
    const quizAcc = skillMetrics.overallAccuracy || 0;

    return [
      {
        id: 'first-lecture-finished',
        title: 'First Lecture Finished',
        nepaliTitle: 'पहिलो पाठ सम्पन्न',
        category: 'curriculum' as const,
        categoryLabel: 'Curriculum Milestone',
        tier: 'Bronze' as const,
        desc: 'Finish your very first sequential curriculum lecture from Step 01 to Step 05.',
        howToUnlock: 'Complete all 5 modules in Lecture 01 (or any lecture unit) to unlock.',
        actionLabel: 'Resume Next Lecture',
        onTriggerAction: () => nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(1, completedCount),
        target: 1,
        unit: 'lecture',
        unlocked: completedCount >= 1,
      },
      {
        id: 'ten-day-streak',
        title: '10-Day Streak',
        nepaliTitle: '१०-दिने निरन्तर अध्ययन',
        category: 'streak' as const,
        categoryLabel: 'Consistency & Habit',
        tier: 'Gold' as const,
        desc: 'Maintain an unbroken 10-day study streak across lectures, quizzes, or daily challenges.',
        howToUnlock: 'Complete at least one study step or Daily Challenge every day for 10 days.',
        actionLabel: 'Launch Daily Challenge',
        onTriggerAction: () =>
          onOpenDailyChallenge
            ? onOpenDailyChallenge()
            : nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(10, streakDays),
        target: 10,
        unit: 'days',
        unlocked: streakDays >= 10,
      },
      {
        id: 'fifty-words-mastered',
        title: '50 Words Mastered',
        nepaliTitle: '५० शब्दमा पूर्ण दक्षता',
        category: 'vocabulary' as const,
        categoryLabel: 'Vocabulary & SRS',
        tier: 'Gold' as const,
        desc: 'Master and practice 50 silent-letter and high-frequency vocabulary words.',
        howToUnlock: 'Mark words as Mastered in Lectures/Dictionary or review SRS flashcards.',
        actionLabel: 'Open SRS Dictionary',
        onTriggerAction: () =>
          onOpenDictionary
            ? onOpenDictionary()
            : nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(50, wordsMasteredOrPracticed),
        target: 50,
        unit: 'words',
        unlocked: wordsMasteredOrPracticed >= 50,
      },
      {
        id: 'three-day-streak',
        title: '3-Day Streak Builder',
        nepaliTitle: '३-दिने अध्ययन बानी',
        category: 'streak' as const,
        categoryLabel: 'Consistency & Habit',
        tier: 'Bronze' as const,
        desc: 'Build daily momentum by studying for 3 consecutive days.',
        howToUnlock: 'Log in and complete a lecture step or Daily Challenge 3 days in a row.',
        actionLabel: 'Start Daily Challenge',
        onTriggerAction: () =>
          onOpenDailyChallenge
            ? onOpenDailyChallenge()
            : nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(3, streakDays),
        target: 3,
        unit: 'days',
        unlocked: streakDays >= 3,
      },
      {
        id: 'twenty-five-words-collector',
        title: '25 Words Collector',
        nepaliTitle: '२५ शब्द संग्रहकर्ता',
        category: 'vocabulary' as const,
        categoryLabel: 'Vocabulary & SRS',
        tier: 'Silver' as const,
        desc: 'Master or bookmark 25 core English vocabulary words with silent-letter rules.',
        howToUnlock: 'Mark words as Mastered in Step 01 or practice flashcards in the 10k+ Dictionary.',
        actionLabel: 'Open Dictionary Deck',
        onTriggerAction: () =>
          onOpenDictionary
            ? onOpenDictionary()
            : nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(25, wordsMasteredOrPracticed),
        target: 25,
        unit: 'words',
        unlocked: wordsMasteredOrPracticed >= 25,
      },
      {
        id: 'b1-foundation-graduate',
        title: 'B1 Foundation Graduate',
        nepaliTitle: 'B1 आधारभूत तह पूरा',
        category: 'curriculum' as const,
        categoryLabel: 'Curriculum Milestone',
        tier: 'Silver' as const,
        desc: 'Complete all 4 lectures in Track 1 · B1 Lower-Intermediate (Lectures 01–04).',
        howToUnlock: 'Finish Lectures 01, 02, 03, and 04 covering silent clusters and SVO syntax.',
        actionLabel: 'Resume B1 Track',
        onTriggerAction: () => nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(b1Total, b1Done),
        target: b1Total,
        unit: 'B1 units',
        unlocked: b1Done >= b1Total && b1Total > 0,
      },
      {
        id: 'b2-workplace-graduate',
        title: 'B2 Workplace Graduate',
        nepaliTitle: 'B2 कार्यस्थल तह पूरा',
        category: 'curriculum' as const,
        categoryLabel: 'Curriculum Milestone',
        tier: 'Gold' as const,
        desc: 'Complete all 4 lectures in Track 2 · B2 Upper-Intermediate (Lectures 05–08).',
        howToUnlock: 'Finish Lectures 05–08 covering schwa reduction, passive voice, and reported speech.',
        actionLabel: 'Resume B2 Track',
        onTriggerAction: () => nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(b2Total, b2Done),
        target: b2Total,
        unit: 'B2 units',
        unlocked: b2Done >= b2Total && b2Total > 0,
      },
      {
        id: 'c1-master-linguist',
        title: 'C1 Master Linguist',
        nepaliTitle: 'C1 उच्च तह विशेषज्ञ',
        category: 'curriculum' as const,
        categoryLabel: 'Curriculum Milestone',
        tier: 'Platinum' as const,
        desc: 'Complete all 12 core curriculum lectures across B1, B2, and C1 tracks.',
        howToUnlock: 'Complete every unit from Lecture 01 through Lecture 12.',
        actionLabel: 'Resume Next Lecture',
        onTriggerAction: () => nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(12, completedCount),
        target: 12,
        unit: 'lectures',
        unlocked: completedCount >= 12,
      },
      {
        id: 'daily-challenge-champion',
        title: 'Daily Challenge Champion',
        nepaliTitle: 'दैनिक चुनौती विजेता',
        category: 'streak' as const,
        categoryLabel: 'Consistency & Habit',
        tier: 'Bronze' as const,
        desc: 'Complete the 24-Hour 3-Question Daily Challenge pop-up quiz.',
        howToUnlock: 'Launch and finish the 3-Question Daily Challenge on the Home Dashboard.',
        actionLabel: 'Start Daily Challenge',
        onTriggerAction: () =>
          onOpenDailyChallenge
            ? onOpenDailyChallenge()
            : nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(1, dailyChallenges),
        target: 1,
        unit: 'challenge',
        unlocked: dailyChallenges >= 1,
      },
      {
        id: 'silent-letter-detective',
        title: 'Silent-Letter Detective',
        nepaliTitle: 'मौन-अक्षर जासुस',
        category: 'arena' as const,
        categoryLabel: 'Fluency Arena',
        tier: 'Silver' as const,
        desc: 'Spot all hidden silent-letter words in a Practice Hub reading passage.',
        howToUnlock: 'Solve at least 1 passage in the Silent-Letter Detective game in Practice Hub.',
        actionLabel: 'Play Silent-Letter Detective',
        onTriggerAction: () =>
          onOpenArenaTool
            ? onOpenArenaTool('detective')
            : nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(1, detectiveSolved),
        target: 1,
        unit: 'case',
        unlocked: detectiveSolved >= 1,
      },
      {
        id: 'phonics-sprint-speedster',
        title: '60s Phonics Speedster',
        nepaliTitle: '६०-सेकेन्ड स्पेलिङ च्याम्पियन',
        category: 'arena' as const,
        categoryLabel: 'Fluency Arena',
        tier: 'Gold' as const,
        desc: 'Score 40+ points in the Timed 60-Second Spelling & Phonics Sprint.',
        howToUnlock: 'Play the 60s Spelling Sprint in Practice Hub and build a combo streak.',
        actionLabel: 'Start 60s Sprint',
        onTriggerAction: () =>
          onOpenArenaTool
            ? onOpenArenaTool('sprint')
            : nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(40, sprintBest),
        target: 40,
        unit: 'pts',
        unlocked: sprintBest >= 40,
      },
      {
        id: 'roleplay-deck-architect',
        title: 'Fluency & Deck Architect',
        nepaliTitle: 'संवाद र शब्दकोश निर्माता',
        category: 'arena' as const,
        categoryLabel: 'Fluency Arena',
        tier: 'Silver' as const,
        desc: 'Complete a Real-World Role-Play scenario or maintain 3+ Custom Flashcards.',
        howToUnlock: 'Finish a Role-Play simulation or add 3 custom words in Practice Hub.',
        actionLabel: 'Open Role-Play Simulator',
        onTriggerAction: () =>
          onOpenArenaTool
            ? onOpenArenaTool('roleplay')
            : nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id),
        current: Math.min(3, Math.max(rolePlaysDone * 3, customDeckCount, quizAcc >= 85 ? 3 : 0)),
        target: 3,
        unit: 'milestones',
        unlocked: rolePlaysDone >= 1 || customDeckCount >= 3 || quizAcc >= 85,
      },
    ];
  }, [
    progress.completedUnitIds.length,
    progress.currentStreakDays,
    progress.customWords,
    progress.dailyChallengeTotalCompleted,
    progress.detectiveSolvedIds,
    progress.sprintHighScore,
    progress.rolePlayCompletedIds,
    unifiedMasteredWordsCount,
    skillMetrics.overallAccuracy,
    trackStats,
    nextUnfinishedLecture,
    onOpenLecture,
    onOpenDictionary,
    onOpenDailyChallenge,
    onOpenArenaTool,
  ]);

  const unlockedBadgesCount = useMemo(
    () => achievementsList.filter((b) => b.unlocked).length,
    [achievementsList]
  );

  const filteredAchievements = useMemo(() => {
    return achievementsList.filter((badge) => {
      if (achievementStatusFilter === 'unlocked' && !badge.unlocked) return false;
      if (achievementStatusFilter === 'locked' && badge.unlocked) return false;
      if (achievementCategoryFilter !== 'all' && badge.category !== achievementCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [achievementsList, achievementStatusFilter, achievementCategoryFilter]);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    try {
      await onManualSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConfirmResetProgress = async () => {
    if (!onResetAllProgress) return;
    setIsResettingProgress(true);
    try {
      await onResetAllProgress(resetIncludeCloud);
      setIsResetModalOpen(false);
      setBackupMessage({
        type: 'success',
        text:
          firebaseUser && resetIncludeCloud
            ? 'All progress has been reset to 0 on both this device and your Google Cloud backup.'
            : 'All local progress on this device has been reset to 0.',
      });
    } catch {
      setBackupMessage({
        type: 'error',
        text: 'Could not complete reset. Please check your connection and try again.',
      });
    } finally {
      setIsResettingProgress(false);
    }
  };

  const handleVoiceChange = (uri: string) => {
    setSelectedVoiceURI(uri);
    speechService.setPreferredVoiceURI(uri || null);
  };

  const handleTestSingleVoice = () => {
    setIsPlayingCalibrationDialogue(false);
    setActiveCalibrationLineIdx(null);
    setIsTestingVoice('single');
    speechService.speak(
      'Without a doubt, consistent daily practice builds subtle fluency and clear pronunciation.',
      {
        rate: progress.preferredSpeechRate,
        speakerIndex: 0,
        onEnd: () => setIsTestingVoice(null),
      }
    );
  };

  const handleTestDialogueVoices = () => {
    setIsPlayingCalibrationDialogue(false);
    setActiveCalibrationLineIdx(null);
    setIsTestingVoice('dialogue');
    speechService.speak('Good morning! Have you reviewed the new project schedule and budget yet?', {
      rate: dialogueCalibration.dialogueRate,
      pitch: dialogueCalibration.speakerAPitch,
      speakerIndex: 0,
      onEnd: () => {
        window.setTimeout(() => {
          speechService.speak(
            'Yes, I checked the ledger and receipt this morning. Everything is ready for our meeting.',
            {
              rate: dialogueCalibration.dialogueRate,
              pitch: dialogueCalibration.speakerBPitch,
              speakerIndex: 1,
              onEnd: () => setIsTestingVoice(null),
            }
          );
        }, dialogueCalibration.turnPauseMs);
      },
    });
  };

  const handleUpdateCalibration = (patch: Partial<DialogueCalibrationSettings>) => {
    const updated = speechService.setDialogueCalibration(patch);
    setDialogueCalibration(updated);
  };

  const handlePlayCalibrationDialogue = (overrideRate?: 0.5 | 0.75 | 1.0) => {
    if (isPlayingCalibrationDialogue && !overrideRate) {
      speechService.stop();
      setIsPlayingCalibrationDialogue(false);
      setActiveCalibrationLineIdx(null);
      return;
    }

    const rateToUse = overrideRate || dialogueCalibration.dialogueRate;
    if (overrideRate) {
      handleUpdateCalibration({ dialogueRate: overrideRate });
    }

    speechService.stop();
    setIsTestingVoice(null);
    setIsPlayingCalibrationDialogue(true);
    let idx = 0;

    const playNextTurn = () => {
      if (idx >= CALIBRATION_DIALOGUE_SCRIPT.length) {
        setIsPlayingCalibrationDialogue(false);
        setActiveCalibrationLineIdx(null);
        return;
      }
      const line = CALIBRATION_DIALOGUE_SCRIPT[idx];
      setActiveCalibrationLineIdx(idx);

      speechService.speak(line.english, {
        rate: rateToUse,
        pitch:
          line.speakerIndex === 0
            ? dialogueCalibration.speakerAPitch
            : dialogueCalibration.speakerBPitch,
        speakerIndex: line.speakerIndex,
        onEnd: () => {
          window.setTimeout(() => {
            idx += 1;
            playNextTurn();
          }, dialogueCalibration.turnPauseMs);
        },
      });
    };

    playNextTurn();
  };

  const handlePlaySingleCalibrationLine = (idx: number) => {
    const line = CALIBRATION_DIALOGUE_SCRIPT[idx];
    if (!line) return;
    speechService.stop();
    setIsPlayingCalibrationDialogue(false);
    setActiveCalibrationLineIdx(idx);
    speechService.speak(line.english, {
      rate: dialogueCalibration.dialogueRate,
      pitch:
        line.speakerIndex === 0
          ? dialogueCalibration.speakerAPitch
          : dialogueCalibration.speakerBPitch,
      speakerIndex: line.speakerIndex,
      onEnd: () => setActiveCalibrationLineIdx(null),
    });
  };

  const activePracticeTargetText =
    practiceTab === 'custom'
      ? customPracticeText.trim() || 'Subtle'
      : currentDrill.targetText;

  const handleRecordVoicePractice = async () => {
    setPracticeMicError(null);
    setSavedToMistakesBanner(false);
    speechService.stop();

    if (!speechService.isRecognitionSupported()) {
      setPracticeMicError(
        'Browser microphone speech recognition is unavailable here. Use the interactive Phoneme & Transcript Evaluator below to test pronunciation scoring, or open in Chrome/Edge.'
      );
      return;
    }

    try {
      const result = await speechService.evaluatePronunciation(
        activePracticeTargetText,
        (listening) => setIsListeningPracticeMic(listening)
      );
      setPracticeResult(result);
    } catch (err: unknown) {
      setIsListeningPracticeMic(false);
      setPracticeMicError(
        err instanceof Error ? err.message : 'Microphone access could not be started.'
      );
    }
  };

  const handleEvaluateManualTranscript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTranscriptTestInput.trim()) return;
    setPracticeMicError(null);
    setSavedToMistakesBanner(false);
    const res = speechService.evaluateTextSimilarity(
      activePracticeTargetText,
      manualTranscriptTestInput.trim()
    );
    setPracticeResult(res);
  };

  const handleAddDrillToMistakeNotebook = () => {
    if (!onRecordMistake) return;
    onRecordMistake({
      lectureId: lectures[0]?.id || 'lecture-1-silent-consonants',
      lectureNumber: 1,
      category: 'dictation',
      sourceType: 'dictation',
      prompt: `Sound Practice Lab: Pronounce & Spell "${activePracticeTargetText}"`,
      nepaliHint:
        practiceTab === 'custom'
          ? 'Custom Sound Practice Target'
          : `${currentDrill.ipa} · ${currentDrill.nepaliMeaning}`,
      userWrongAnswer: practiceResult?.transcript || 'Needs pronunciation drill',
      correctAnswer: activePracticeTargetText,
      explanation:
        practiceTab === 'custom'
          ? 'Practice this phrase at 0.5x and 0.75x speed before speaking aloud.'
          : `${currentDrill.silentRule}. ${currentDrill.trapWarning}`,
    });
    setSavedToMistakesBanner(true);
  };

  const handlePlayMysteryMinimalPair = (rate: number) => {
    const pick: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
    setMysteryChoice(pick);
    setUserEarGuess(null);
    const wordToPlay = pick === 'A' ? currentMinimalPair.wordA : currentMinimalPair.wordB;
    speechService.speak(wordToPlay, { rate });
  };

  const handleExportProgressJSON = () => {
    try {
      const payload = JSON.stringify(progress, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `bhashasetu-study-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage({
        type: 'success',
        text: 'Study backup (.json) downloaded to your device.',
      });
    } catch {
      setBackupMessage({
        type: 'error',
        text: 'Could not export backup file.',
      });
    }
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as UserProgressState;
        if (!parsed || !Array.isArray(parsed.completedUnitIds)) {
          setBackupMessage({
            type: 'error',
            text: 'Invalid backup file format. Please select a valid BhashaSetu JSON backup.',
          });
          return;
        }
        if (onImportProgress) {
          onImportProgress(parsed);
          setBackupMessage({
            type: 'success',
            text: `Backup restored! (${parsed.completedUnitIds.length} completed lectures and ${
              parsed.savedWordIds?.length || 0
            } saved words loaded.)`,
          });
        }
      } catch {
        setBackupMessage({
          type: 'error',
          text: 'Could not parse JSON file. Please check the file and try again.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Printable Study Sheet (Saved Words & Mistake Notebook PDF / CSV) View
  if (studySheetPrintMode) {
    return (
      <PrintableStudySheetModal
        initialFocusMode={studySheetPrintMode}
        allLexiconWords={allLexiconWords}
        savedWordIds={progress.savedWordIds}
        masteredWordIds={progress.masteredWordIds || []}
        wordSRS={progress.wordSRS}
        mistakeNotebook={progress.mistakeNotebook}
        onClose={() => setStudySheetPrintMode(null)}
      />
    );
  }

  // Printable Shareable Achievement & Milestone Card View
  if (selectedBadgeForPrint) {
    const badgeInfo =
      achievementsList.find((b) => b.id === selectedBadgeForPrint) || achievementsList[0];
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
          <button
            onClick={() => setSelectedBadgeForPrint(null)}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Achievements View</span>
          </button>

          <button
            onClick={() => window.print()}
            className="min-h-[42px] px-5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Achievement Card as PDF</span>
          </button>
        </div>

        <div className="bg-white text-[#1C1917] border-4 border-double border-[#D97706] rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-[#15803D] text-white flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="font-ipa text-xs uppercase tracking-widest text-[#B91C1C] font-semibold">
            BhashaSetu · Official Milestone Achievement Card ({badgeInfo.tier} Tier)
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1C1917]">
            {badgeInfo.title}
          </h1>
          <div className="font-nepali text-lg text-[#57534E] font-medium">
            {badgeInfo.nepaliTitle}
          </div>
          <p className="text-sm sm:text-base text-[#57534E] max-w-xl mx-auto">
            {badgeInfo.desc}
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4 border-t border-b border-[#E7E0D6] py-4">
            <div>
              <div className="font-ipa text-xl font-bold text-[#15803D]">
                {badgeInfo.current} / {badgeInfo.target}
              </div>
              <div className="text-xs text-[#57534E]">Milestone Progress ({badgeInfo.unit})</div>
            </div>
            <div>
              <div className="font-ipa text-xl font-bold text-[#B91C1C]">
                {unifiedMasteredWordsCount} Words
              </div>
              <div className="text-xs text-[#57534E]">Words Mastered</div>
            </div>
            <div>
              <div className="font-ipa text-xl font-bold text-[#D97706]">
                {progress.currentStreakDays} Days
              </div>
              <div className="text-xs text-[#57534E]">Active Study Streak</div>
            </div>
          </div>

          <div className="text-xs font-ipa text-[#57534E] pt-2">
            Verified Milestone Card · Issued on {new Date().toLocaleDateString()} · BhashaSetu English Mastery
          </div>
        </div>
      </div>
    );
  }

  // Printable CEFR Certificate View
  if (certificateTrack) {
    const trackInfo = trackStats.find((t) => t.level === certificateTrack) || trackStats[0];
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 print:hidden">
          <button
            onClick={() => setCertificateTrack(null)}
            className="min-h-[42px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Progress Dashboard</span>
          </button>

          <button
            onClick={() => window.print()}
            className="min-h-[42px] px-5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Certificate as PDF</span>
          </button>
        </div>

        <div className="bg-white text-[#1C1917] border-4 border-double border-[#B91C1C] rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#B91C1C]/10 text-[#B91C1C] flex items-center justify-center mx-auto">
            <Award className="w-9 h-9" />
          </div>
          <div className="font-ipa text-xs uppercase tracking-widest text-[#B91C1C] font-semibold">
            BhashaSetu · English Phonics, Orthography & Syntax Curriculum
          </div>
          <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#1C1917]">
            Certificate of Curriculum Mastery
          </h1>
          <p className="text-sm sm:text-base text-[#57534E] max-w-xl mx-auto">
            This certifies dedicated study and proficiency across the{' '}
            <strong className="text-[#1C1917]">
              CEFR Level {trackInfo.level} — {trackInfo.label}
            </strong>{' '}
            syllabus, covering silent-letter phonics, orthographic spelling rules, SVO grammar syntax, and real-life conversational dialogues.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-4 border-t border-b border-[#E7E0D6] py-4">
            <div>
              <div className="font-ipa text-xl font-bold text-[#B91C1C]">
                {trackInfo.done} / {trackInfo.total}
              </div>
              <div className="text-xs text-[#57534E]">Track Units Completed</div>
            </div>
            <div>
              <div className="font-ipa text-xl font-bold text-[#15803D]">
                {skillMetrics.overallAccuracy !== null ? `${skillMetrics.overallAccuracy}%` : '100%'}
              </div>
              <div className="text-xs text-[#57534E]">Quiz Accuracy</div>
            </div>
            <div>
              <div className="font-ipa text-xl font-bold text-[#D97706]">
                {progress.currentStreakDays} Days
              </div>
              <div className="text-xs text-[#57534E]">Study Streak</div>
            </div>
          </div>

          <div className="text-xs font-ipa text-[#57534E] pt-2">
            Issued on {new Date().toLocaleDateString()} · BhashaSetu Offline-First Learning Platform
          </div>
        </div>
      </div>
    );
  }

  const renderGoogleAccountProfileCard = () => {
    const srsCount = Object.keys(progress.wordSRS || {}).length;
    const notesCount = Object.values(progress.lectureNotes || {}).filter((n) => n && n.trim().length > 0).length;
    const customWordsCount = (progress.customWords || []).length;
    const customLecturesCount = (progress.customLectures || []).length;
    const examsCount = (progress.examHistory || []).length;

    return (
      <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
          <div className="flex items-start sm:items-center gap-3.5">
            {firebaseUser?.photoURL ? (
              <img
                src={firebaseUser.photoURL}
                alt={firebaseUser.displayName || 'Google Account'}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-2xl border border-[#E7E0D6] dark:border-[#2E2924] object-cover shrink-0"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-serif-display text-lg font-bold ${
                  firebaseUser
                    ? 'bg-[#15803D] text-white'
                    : 'bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[#B91C1C]'
                }`}
              >
                {firebaseUser
                  ? (firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()
                  : <Cloud className="w-6 h-6" />}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#15803D] dark:text-emerald-400 inline-flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>
                    {firebaseUser
                      ? 'Google Account Connected · Firebase Cloud Backup Active'
                      : 'Google Account Cloud Login & Multi-Device Sync'}
                  </span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md font-ipa text-[10px] font-semibold ${
                    firebaseUser
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/50 text-[#D97706] dark:text-amber-300'
                  }`}
                >
                  {firebaseUser ? 'Auto-Saving to Cloud' : 'Not Signed In'}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                {firebaseUser
                  ? `${firebaseUser.displayName || 'BhashaSetu Learner'} (${firebaseUser.email || 'Google Account'})`
                  : 'Sign in with Google to Save All Your Study Data & Profile Info'}
              </h2>
              <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                {firebaseUser
                  ? `All your completed lectures, vocabularySRS, mistake notebook, scratchpad notes, exam scores, and audio settings are backed up under your Google account.${
                      progress.lastSyncedAt
                        ? ` Last synced at ${new Date(progress.lastSyncedAt).toLocaleTimeString()}.`
                        : ''
                    }`
                  : 'Connect your Google account so all your progress, custom vocabulary, mistake notebook, lecture notes, and CEFR certificates stay safely backed up in Firebase Firestore across phone and computer.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {firebaseUser ? (
              <>
                <button
                  type="button"
                  disabled={isCloudSyncing || isSyncing}
                  onClick={handleSyncClick}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#15803D] text-white text-xs font-semibold hover:bg-emerald-800 inline-flex items-center gap-2 transition-colors disabled:opacity-60"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isCloudSyncing || isSyncing ? 'animate-spin' : ''}`}
                  />
                  <span>
                    {isCloudSyncing || isSyncing ? 'Saving to Cloud...' : 'Save All Data Now'}
                  </span>
                </button>
                {onPullFromCloud && (
                  <button
                    type="button"
                    disabled={isCloudSyncing || isSyncing}
                    onClick={onPullFromCloud}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#15803D] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    <Download className="w-3.5 h-3.5 text-[#15803D]" />
                    <span>Restore / Merge from Cloud</span>
                  </button>
                )}
                {onGoogleSignOut && (
                  <button
                    type="button"
                    onClick={onGoogleSignOut}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C] text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}
              </>
            ) : (
              onGoogleSignIn && (
                <button
                  type="button"
                  disabled={isCloudSyncing}
                  onClick={onGoogleSignIn}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs sm:text-sm font-semibold hover:bg-[#B91C1C] dark:hover:bg-[#B91C1C] dark:hover:text-white inline-flex items-center gap-2.5 transition-colors shadow-xs disabled:opacity-60"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.4 0-.7-.1-1.4-.2-2H12z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 22c2.7 0 5-.9 6.7-2.4l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.9v2.6C4.6 19.8 8 22 12 22z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M6.2 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.6H2.9C2.3 8.9 2 10.4 2 12s.3 3.1.9 4.4l3.3-2.6z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8 2 4.6 4.2 2.9 7.6l3.3 2.6c.8-2.5 3.1-4.3 5.8-4.3z"
                    />
                  </svg>
                  <span>
                    {isCloudSyncing ? 'Connecting Google Account...' : 'Continue with Google Account'}
                  </span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Inventory of All User Data & Info Saved to Cloud */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
            <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">Lectures & Quizzes</div>
            <div className="font-ipa font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
              {progress.completedUnitIds.length} Units · {Object.keys(progress.moduleScores).length} Scores
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
            <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">Words & SRS Queue</div>
            <div className="font-ipa font-bold text-sm text-[#15803D] dark:text-emerald-400 mt-0.5">
              {unifiedMasteredWordsCount} Mastered · {srsCount} SRS
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
            <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">Mistakes & Notes</div>
            <div className="font-ipa font-bold text-sm text-[#B91C1C] dark:text-[#F87171] mt-0.5">
              {progress.mistakeNotebook.length} Mistakes · {notesCount} Notes
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
            <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">Custom & Exams</div>
            <div className="font-ipa font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
              {customWordsCount} Deck · {customLecturesCount} AI · {examsCount} Exams
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
            <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">Streaks & Badges</div>
            <div className="font-ipa font-bold text-sm text-[#D97706] mt-0.5">
              {progress.currentStreakDays}d Streak · {unlockedBadgesCount} Badges
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
            <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">Profile & Voice</div>
            <div className="font-ipa font-bold text-sm text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
              Level {progress.selectedLevel} · {progress.dailyGoalMinutes}m · {progress.preferredSpeechRate}x
            </div>
          </div>
        </div>

        {cloudSyncStatusMsg && (
          <div className="text-xs font-medium text-[#15803D] dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{cloudSyncStatusMsg}</span>
          </div>
        )}
      </section>
    );
  };

  // ===========================================================================
  // DEDICATED PROGRESS & ANALYTICS VIEW (mode === 'progress')
  // ===========================================================================
  if (mode === 'progress') {
    const achievementCompletionPct = Math.round(
      (unlockedBadgesCount / achievementsList.length) * 100
    );
    const scholarRankTitle =
      unlockedBadgesCount >= 10
        ? 'C1 Grandmaster Linguist'
        : unlockedBadgesCount >= 6
        ? 'B2 Syntax & Phonics Architect'
        : unlockedBadgesCount >= 3
        ? 'B1 Silent-Letter Scholar'
        : 'Phonics & Bridge Initiate';

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 space-y-8">
        {/* Page Header + Segmented View Switcher (Overview vs. Achievements) */}
        <div className="pb-5 border-b border-[#E7E0D6] dark:border-[#2E2924] flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] mb-1">
              Learning Analytics, Milestones & Syllabus Mastery
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              {progressSubView === 'achievements'
                ? 'Achievements & Unlockable Milestones'
                : 'Your Study Progress & Skill Breakdown'}
            </h1>
            <p className="text-sm sm:text-base text-[#57534E] dark:text-[#A8A29E] mt-1">
              {progressSubView === 'achievements'
                ? 'Track your unlockable badges across First Lecture Finished, 10-Day Streak, 50 Words Mastered, and CEFR track milestones.'
                : 'Track your daily streak, visual skill charts across Vocabulary, Spelling, Grammar, and Dialogue, and unit-by-unit mastery from B1 to C1.'}
            </p>
          </div>

          {/* Sub-View Switcher Tabs inside Progress */}
          <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setProgressSubView('overview')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all ${
                progressSubView === 'overview'
                  ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] shadow-xs'
                  : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview & Analytics</span>
            </button>
            <button
              type="button"
              onClick={() => setProgressSubView('achievements')}
              className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all ${
                progressSubView === 'achievements'
                  ? 'bg-[#B91C1C] text-white shadow-xs'
                  : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
              }`}
            >
              <Trophy className="w-4 h-4 text-[#D97706]" />
              <span>
                Achievements ({unlockedBadgesCount}/{achievementsList.length})
              </span>
            </button>
          </div>
        </div>

        {/* Google Account Login & Cloud Data Backup Card */}
        {renderGoogleAccountProfileCard()}

        {progressSubView === 'achievements' ? (
          /* ================================================================= */
          /* DEDICATED ACHIEVEMENTS & MILESTONE BADGES VIEW                    */
          /* ================================================================= */
          <div className="space-y-8">
            {/* Hero Achievement Banner & Rank Card */}
            <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 sm:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-8 space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs font-semibold text-[#D97706]">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Current Scholar Rank: {scholarRankTitle}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    {unlockedBadgesCount} of {achievementsList.length} Milestone Badges Unlocked ({achievementCompletionPct}%)
                  </h2>
                  <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                    Every lecture you finish, daily streak you maintain, and vocabulary word you master progresses your permanent BhashaSetu achievement badges.
                  </p>

                  <div className="pt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        Overall Trophy Case Completion
                      </span>
                      <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                        {unlockedBadgesCount}/{achievementsList.length} Badges ({achievementCompletionPct}%)
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#F2ECE1] dark:bg-[#141210] overflow-hidden">
                      <div
                        className="h-full bg-[#B91C1C] rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, achievementCompletionPct)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Featured Core 3 Milestones Spotlight */}
                <div className="lg:col-span-4 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
                  <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-between">
                    <span>Core Milestone Tracker</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#D97706]" />
                  </div>
                  <div className="space-y-2">
                    {achievementsList.slice(0, 3).map((core) => {
                      const pct = Math.min(100, Math.round((core.current / core.target) * 100));
                      return (
                        <div
                          key={core.id}
                          className="p-2.5 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              {core.title}
                            </span>
                            <span
                              className={`font-ipa text-[11px] font-semibold ${
                                core.unlocked
                                  ? 'text-[#15803D] dark:text-emerald-400'
                                  : 'text-[#B91C1C] dark:text-[#F87171]'
                              }`}
                            >
                              {core.unlocked ? '✓ Unlocked' : `${core.current}/${core.target}`}
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-[#F2ECE1] dark:bg-[#141210] overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                core.unlocked ? 'bg-[#15803D]' : 'bg-[#D97706]'
                              }`}
                              style={{ width: `${Math.max(6, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Bar for Achievements */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-wrap items-center justify-between gap-3">
              {/* Status Filter */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
                {(
                  [
                    { id: 'all', label: `All Badges (${achievementsList.length})` },
                    { id: 'unlocked', label: `Unlocked (${unlockedBadgesCount})` },
                    {
                      id: 'locked',
                      label: `In Progress (${achievementsList.length - unlockedBadgesCount})`,
                    },
                  ] as const
                ).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setAchievementStatusFilter(st.id)}
                    className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      achievementStatusFilter === st.id
                        ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                        : 'text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924]">
                {(
                  [
                    { id: 'all', label: 'All Categories' },
                    { id: 'curriculum', label: 'Lectures & CEFR' },
                    { id: 'streak', label: 'Streaks & Habits' },
                    { id: 'vocabulary', label: 'Words Mastered' },
                    { id: 'arena', label: 'Fluency Arena' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setAchievementCategoryFilter(cat.id)}
                    className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                      achievementCategoryFilter === cat.id
                        ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] font-semibold shadow-xs'
                        : 'text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Unlockable Badge Cards Grid */}
            {filteredAchievements.length === 0 ? (
              <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-8 text-center space-y-3">
                <div className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  No badges match the selected filter
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAchievementStatusFilter('all');
                    setAchievementCategoryFilter('all');
                  }}
                  className="min-h-[38px] px-4 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold"
                >
                  Show All Achievements
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAchievements.map((badge) => {
                  const pct = Math.min(100, Math.round((badge.current / badge.target) * 100));
                  const tierStyles =
                    badge.tier === 'Platinum'
                      ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                      : badge.tier === 'Gold'
                      ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                      : badge.tier === 'Silver'
                      ? 'bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700'
                      : 'bg-orange-100 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-800';

                  return (
                    <article
                      key={badge.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                        badge.unlocked
                          ? 'bg-white dark:bg-[#1F1C18] border-emerald-400 dark:border-emerald-700 shadow-xs'
                          : 'bg-white/80 dark:bg-[#1F1C18]/80 border-[#E7E0D6] dark:border-[#2E2924]'
                      }`}
                    >
                      <div className="space-y-3.5">
                        {/* Top Badge Icon + Tier & Unlock Status */}
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                              badge.unlocked
                                ? 'bg-[#15803D] text-white border-[#15803D]'
                                : 'bg-[#FAF7F2] dark:bg-[#141210] text-[#57534E] dark:text-[#A8A29E] border-[#E7E0D6] dark:border-[#2E2924]'
                            }`}
                          >
                            {badge.unlocked ? (
                              <Trophy className="w-6 h-6" />
                            ) : badge.category === 'streak' ? (
                              <Flame className="w-6 h-6 text-[#D97706]" />
                            ) : badge.category === 'vocabulary' ? (
                              <BookmarkCheck className="w-6 h-6 text-[#B91C1C]" />
                            ) : badge.category === 'curriculum' ? (
                              <BookOpen className="w-6 h-6 text-[#B91C1C]" />
                            ) : (
                              <Zap className="w-6 h-6 text-[#D97706]" />
                            )}
                          </div>

                          <div className="flex flex-wrap items-center justify-end gap-1.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-md border text-[10px] font-ipa font-semibold ${tierStyles}`}
                            >
                              {badge.tier}
                            </span>
                            {badge.unlocked ? (
                              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[#15803D] dark:text-emerald-400 text-[10px] font-ipa font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Unlocked</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E] text-[10px] font-ipa inline-flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                <span>Locked</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <div className="text-[11px] font-semibold text-[#B91C1C] dark:text-[#F87171]">
                            {badge.categoryLabel}
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                            {badge.title}
                          </h3>
                          {isFullNepali && (
                            <div className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                              {badge.nepaliTitle}
                            </div>
                          )}
                          <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1.5 leading-relaxed">
                            {badge.desc}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar, Direct 1-Click Action Button & Shareable Card */}
                      <div className="pt-4 mt-4 border-t border-[#E7E0D6] dark:border-[#2E2924] space-y-2.5">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#57534E] dark:text-[#A8A29E]">
                              Milestone Progress
                            </span>
                            <span className="font-ipa font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                              {badge.current} / {badge.target} {badge.unit} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-[#F2ECE1] dark:bg-[#141210] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                badge.unlocked ? 'bg-[#15803D]' : 'bg-[#B91C1C]'
                              }`}
                              style={{ width: `${Math.max(6, pct)}%` }}
                            />
                          </div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[11px] text-[#57534E] dark:text-[#A8A29E] space-y-2">
                          <div>{badge.howToUnlock}</div>
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#E7E0D6]/70 dark:border-[#2E2924]">
                            {badge.unlocked ? (
                              <button
                                type="button"
                                onClick={() => setSelectedBadgeForPrint(badge.id)}
                                className="min-h-[34px] px-3 py-1.5 rounded-lg bg-[#15803D] text-white text-xs font-semibold hover:bg-emerald-800 inline-flex items-center gap-1.5 w-full justify-center transition-colors"
                              >
                                <Share2 className="w-3.5 h-3.5" />
                                <span>Print / Share Achievement Card</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={badge.onTriggerAction}
                                className="min-h-[34px] px-3 py-1.5 rounded-lg bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold hover:bg-[#B91C1C] dark:hover:bg-[#B91C1C] dark:hover:text-white inline-flex items-center gap-1.5 w-full justify-center transition-colors"
                              >
                                <span>{badge.actionLabel}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* ================================================================= */
          /* OVERVIEW & ANALYTICS SUB-VIEW                                     */
          /* ================================================================= */
          <>
            {/* 4 KPI Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-[#57534E] dark:text-[#A8A29E] mb-2">
                  <span>Daily Streak & Grace Shield</span>
                  <Flame className="w-4 h-4 text-[#D97706]" />
                </div>
                <div className="font-ipa text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  {progress.currentStreakDays} {progress.currentStreakDays === 1 ? 'Day' : 'Days'}
                </div>
                <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1 flex items-center justify-between">
                  <span>Goal: {progress.dailyGoalMinutes || 15}m/day</span>
                  <span className="inline-flex items-center gap-1 font-ipa font-semibold text-[#15803D] dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{progress.streakFreezeShields ?? 1} Shield</span>
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-[#57534E] dark:text-[#A8A29E] mb-2">
                  <span>Lectures Completed</span>
                  <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                </div>
                <div className="font-ipa text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  {progress.completedUnitIds.length} / {lectures.length}
                </div>
                <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                  {overallCoursePercent}% of B1–C1 syllabus
                </div>
              </div>

              <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-[#57534E] dark:text-[#A8A29E] mb-2">
                  <span>Unified Words Mastered</span>
                  <Trophy className="w-4 h-4 text-[#D97706]" />
                </div>
                <div className="font-ipa text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  {unifiedMasteredWordsCount} Words
                </div>
                <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                  {Math.min(50, unifiedMasteredWordsCount)}/50 toward Gold Badge ({progress.masteredWordIds?.length || 0} manual)
                </div>
              </div>

              <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-5">
                <div className="flex items-center justify-between text-xs text-[#57534E] dark:text-[#A8A29E] mb-2">
                  <span>Saved / Total Lexicon</span>
                  <BookmarkCheck className="w-4 h-4 text-[#B91C1C]" />
                </div>
                <div className="font-ipa text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  {progress.savedWordIds.length} / {totalLexiconCount.toLocaleString()}+
                </div>
                <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1 flex items-center justify-between gap-2">
                  <span>{progress.mistakeNotebook.length} mistake notes</span>
                  <button
                    type="button"
                    onClick={() => setStudySheetPrintMode('combined')}
                    className="text-[11px] font-semibold text-[#B91C1C] dark:text-[#F87171] hover:underline inline-flex items-center gap-1"
                  >
                    <Printer className="w-3 h-3" />
                    <span>PDF/CSV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Visual Skill Breakdown Charts + Recommended Focus Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-5">
                <div>
                  <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    4-Skill Mastery Analytics
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                    Visual Skill Breakdown Charts
                  </h2>
                  <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
                    Performance across each module pillar based on your completed quizzes, dictation bees, and vocabulary practice:
                  </p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      label: '01 · Vocabulary & Silent-Letter Phonics',
                      pct: skillMetrics.vocabPercent,
                      detail: `${skillMetrics.practicedWordsCount} / ${skillMetrics.totalCoreWords} core words practiced`,
                      color: 'bg-[#B91C1C]',
                    },
                    {
                      label: '02 & 03 · Spelling Rules & Audio Dictation Bee',
                      pct: skillMetrics.spellingPercent ?? 0,
                      detail:
                        skillMetrics.spellingTotal > 0
                          ? `${skillMetrics.spellingCorrect}/${skillMetrics.spellingTotal} correct (${skillMetrics.spellingPercent}%)`
                          : 'Complete a Step 03 Spelling & Dictation quiz to record score',
                      color: 'bg-[#D97706]',
                    },
                    {
                      label: '04 · Grammar Syntax & Sentence Builder',
                      pct: skillMetrics.grammarPercent ?? 0,
                      detail:
                        skillMetrics.grammarTotal > 0
                          ? `${skillMetrics.grammarCorrect}/${skillMetrics.grammarTotal} correct (${skillMetrics.grammarPercent}%)`
                          : 'Complete a Step 04 Grammar Capstone quiz to record score',
                      color: 'bg-[#15803D]',
                    },
                    {
                      label: '05 · Real-Life Dialogue Comprehension',
                      pct: skillMetrics.dialoguePercent ?? 0,
                      detail:
                        skillMetrics.dialogueTotal > 0
                          ? `${skillMetrics.dialogueCorrect}/${skillMetrics.dialogueTotal} correct (${skillMetrics.dialoguePercent}%)`
                          : 'Complete a Step 05 Dialogue Comprehension quiz to record score',
                      color: 'bg-sky-700',
                    },
                  ].map((bar) => (
                    <div key={bar.label} className="space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                          {bar.label}
                        </span>
                        <span className="font-ipa text-[#57534E] dark:text-[#A8A29E]">
                          {bar.detail}
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-[#F2ECE1] dark:bg-[#141210] overflow-hidden">
                        <div
                          className={`h-full ${bar.color} rounded-full transition-all duration-300`}
                          style={{ width: `${Math.max(4, bar.pct)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Focus Area & Track Certificates */}
              <div className="lg:col-span-4 bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    <Target className="w-4 h-4" />
                    <span>Recommended Focus Area</span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    {skillMetrics.focusArea.name}
                  </h3>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                    {skillMetrics.focusArea.hint}
                  </p>

                  <div className="pt-2 space-y-2.5">
                    <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      CEFR Track Progress & Certificates:
                    </div>
                    {trackStats.map((t) => (
                      <div
                        key={t.level}
                        className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            Level {t.level} ({t.done}/{t.total})
                          </span>
                          <button
                            type="button"
                            onClick={() => setCertificateTrack(t.level)}
                            className="text-[11px] font-semibold text-[#B91C1C] dark:text-[#F87171] hover:underline inline-flex items-center gap-1"
                          >
                            <Award className="w-3 h-3" />
                            <span>View Certificate</span>
                          </button>
                        </div>
                        <div className="w-full h-2 rounded-full bg-[#E7E0D6] dark:bg-[#2E2924] overflow-hidden">
                          <div
                            className="h-full bg-[#B91C1C] rounded-full"
                            style={{ width: `${Math.max(5, t.pct)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* 14-DAY STUDY HEATMAP & ACHIEVEMENTS PREVIEW                     */}
            {/* =============================================================== */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Interactive 7-Day Bar Chart + 14-Day Study Activity Heatmap */}
              <div className="lg:col-span-5 bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 space-y-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#A82020] dark:text-[#F87171]">
                    Consistency & Daily Habit Tracker
                  </div>
                  <h2 className="text-lg sm:text-xl font-serif font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                    Interactive Weekly Bar Chart & 14-Day Heatmap
                  </h2>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-1">
                    Click any day bar below to inspect your study actions or launch a quick daily drill:
                  </p>
                </div>

                {/* Interactive 7-Day Vertical Capsule Bar Chart */}
                <div className="p-4 rounded-2xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924]">
                  <div className="flex items-center justify-between text-xs mb-3">
                    <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      Last 7 Days Study Volume
                    </span>
                    <span className="font-ipa text-[11px] text-[#78716C]">
                      Goal: {progress.dailyGoalMinutes || 15}m/day
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2 items-end h-32 pt-2 px-1">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date(Date.now() - (6 - i) * 86400000);
                      const dateStr = d.toISOString().split('T')[0];
                      const dayShort = d
                        .toLocaleDateString('en-US', { weekday: 'short' })
                        .slice(0, 1);
                      const dayFull = d.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      });
                      const count = progress.studyActivityByDate?.[dateStr] ?? 0;
                      const heightPct = count > 0 ? Math.min(100, Math.max(18, count * 20)) : 8;
                      const isToday = i === 6;
                      const isSelected = selectedActivityDate === dateStr;

                      return (
                        <button
                          key={`bar-${dateStr}`}
                          type="button"
                          onClick={() =>
                            setSelectedActivityDate((prev) =>
                              prev === dateStr ? null : dateStr
                            )
                          }
                          className="group flex flex-col items-center gap-1.5 h-full justify-end focus:outline-none"
                          title={`${dayFull}: ${count * 5} mins (${count} actions)`}
                        >
                          <span className="text-[10px] font-ipa text-[#78716C] group-hover:text-[#A82020]">
                            {count * 5}m
                          </span>
                          <div className="w-full max-w-[26px] h-20 rounded-full bg-[#ECE6DA] dark:bg-[#26221E] p-0.5 flex items-end overflow-hidden">
                            <div
                              className={`w-full rounded-full transition-all duration-300 ${
                                isSelected
                                  ? 'bg-[#1F5C3D]'
                                  : count >= 3
                                  ? 'bg-[#A82020]'
                                  : count >= 1
                                  ? 'bg-[#A82020]/65'
                                  : 'bg-[#D6CFC2] dark:bg-[#3A342E]'
                              }`}
                              style={{ height: `${heightPct}%` }}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-semibold ${
                              isToday
                                ? 'text-[#A82020] font-bold'
                                : 'text-[#57534E] dark:text-[#A8A29E]'
                            }`}
                          >
                            {dayShort}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {selectedActivityDate && (
                    <div className="mt-3 pt-2.5 border-t border-[#E6E0D4] dark:border-[#2E2924] flex items-center justify-between text-xs">
                      <span className="text-[#57534E] dark:text-[#A8A29E]">
                        <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                          {selectedActivityDate}
                        </strong>
                        :{' '}
                        {(progress.studyActivityByDate?.[selectedActivityDate] || 0) * 5} mins logged (
                        {progress.studyActivityByDate?.[selectedActivityDate] || 0} study units)
                      </span>
                      {onOpenDailyChallenge && (
                        <button
                          type="button"
                          onClick={onOpenDailyChallenge}
                          className="text-[#A82020] font-semibold hover:underline"
                        >
                          + Add Study Session
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* 14-Day Grid */}
                <div className="grid grid-cols-7 gap-1.5">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const d = new Date(Date.now() - (13 - i) * 86400000);
                    const dateStr = d.toISOString().split('T')[0];
                    const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = d.getDate();
                    const count = progress.studyActivityByDate?.[dateStr] || 0;

                    let cellStyle =
                      'bg-[#FAF8F4] dark:bg-[#141210] border-[#E6E0D4] dark:border-[#2E2924] text-[#57534E]';
                    if (count >= 4) {
                      cellStyle = 'bg-[#A82020] border-[#A82020] text-white font-bold';
                    } else if (count >= 2) {
                      cellStyle =
                        'bg-[#A82020]/20 dark:bg-[#A82020]/40 border-[#A82020] text-[#1C1917] dark:text-[#F5F2EB] font-semibold';
                    } else if (count >= 1) {
                      cellStyle =
                        'bg-amber-100 dark:bg-amber-950/50 border-[#D97706] text-[#1C1917] dark:text-[#F5F2EB]';
                    }

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => setSelectedActivityDate(dateStr)}
                        title={`${dateStr}: ${count} study actions`}
                        className={`p-1.5 rounded-xl border text-center space-y-0.5 transition-transform hover:scale-105 ${cellStyle}`}
                      >
                        <div className="text-[9px] opacity-80">{dayLabel}</div>
                        <div className="font-ipa text-xs">{dayNum}</div>
                        <div className="text-[9px] font-ipa">{count > 0 ? `${count}pt` : '—'}</div>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#E6E0D4] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                  <span>
                    Daily Challenges Completed:{' '}
                    <strong className="text-[#1C1917] dark:text-[#F5F2EB]">
                      {progress.dailyChallengeTotalCompleted || 0}
                    </strong>
                  </span>
                  <span>
                    60s Sprint High Score:{' '}
                    <strong className="text-[#A82020] dark:text-[#F87171]">
                      {progress.sprintHighScore || 0} pts
                    </strong>
                  </span>
                </div>
              </div>

              {/* Mastery Milestones Trophy Case Preview + Link to Full Achievements View */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                        Unlockable Badges ({unlockedBadgesCount}/{achievementsList.length} Unlocked)
                      </div>
                      <h2 className="text-lg sm:text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                        Achievements & Mastery Milestones
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProgressSubView('achievements')}
                      className="min-h-[36px] px-3.5 py-1.5 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>Open Achievements View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {achievementsList.slice(0, 6).map((badge) => {
                      const pct = Math.min(100, Math.round((badge.current / badge.target) * 100));
                      return (
                        <div
                          key={badge.id}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                            badge.unlocked
                              ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                              : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924]'
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              badge.unlocked
                                ? 'bg-[#15803D] text-white'
                                : 'bg-[#E7E0D6] dark:bg-[#2E2924] text-[#57534E]'
                            }`}
                          >
                            <Trophy className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-between gap-1.5">
                              <span className="truncate">{badge.title}</span>
                              <span
                                className={`text-[10px] font-ipa shrink-0 ${
                                  badge.unlocked
                                    ? 'text-[#15803D] dark:text-emerald-400'
                                    : 'text-[#57534E] dark:text-[#A8A29E]'
                                }`}
                              >
                                {badge.unlocked
                                  ? '✓ Unlocked'
                                  : `${badge.current}/${badge.target}`}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#57534E] dark:text-[#A8A29E] mt-0.5 line-clamp-1">
                              {badge.desc}
                            </p>
                            <div className="w-full h-1.5 rounded-full bg-[#E7E0D6] dark:bg-[#2E2924] overflow-hidden mt-2">
                              <div
                                className={`h-full rounded-full ${
                                  badge.unlocked ? 'bg-[#15803D]' : 'bg-[#B91C1C]'
                                }`}
                                style={{ width: `${Math.max(6, pct)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924] flex items-center justify-between text-xs text-[#57534E] dark:text-[#A8A29E]">
                  <span>Rank: {scholarRankTitle}</span>
                  <button
                    type="button"
                    onClick={() => setProgressSubView('achievements')}
                    className="font-semibold text-[#B91C1C] dark:text-[#F87171] hover:underline inline-flex items-center gap-1"
                  >
                    <span>View all {achievementsList.length} unlockable badges</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* =============================================================== */}
            {/* FLUENCY HEATMAP: SILENT CLUSTERS & NEPALI-TO-ENGLISH PILLARS    */}
            {/* =============================================================== */}
            <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E0D6] dark:border-[#2E2924] pb-4">
                <div>
                  <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    Orthographic & Syntactic Fluency Matrix
                  </div>
                  <h2 className="text-lg sm:text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                    Interactive Fluency Heatmap (12 Silent Clusters & 4 Nepali-to-English Grammar Pillars)
                  </h2>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                    Color-coded mastery across English silent-letter families and Nepali L1 interference patterns:
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-ipa shrink-0">
                  <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Developing (&lt;50%)
                  </span>
                  <span className="px-2 py-1 rounded-md bg-[#B91C1C]/15 text-[#B91C1C] dark:text-[#F87171] border border-[#B91C1C]/40">
                    Strong (50–74%)
                  </span>
                  <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 border border-emerald-400">
                    Fluent (75%+)
                  </span>
                </div>
              </div>

              {/* 12 Silent-Letter Cluster Heatmap Grid */}
              <div className="space-y-2.5">
                <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-between">
                  <span>12 Silent-Letter Cluster Fluency Cells</span>
                  {onOpenDictionary && (
                    <button
                      type="button"
                      onClick={onOpenDictionary}
                      className="text-[#B91C1C] dark:text-[#F87171] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Drill Silent Families in Dictionary</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                  {fluencyHeatmapCells.silentClusters.map((cell) => {
                    const heatClass =
                      cell.score >= 75
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700 text-[#15803D] dark:text-emerald-300'
                        : cell.score >= 50
                        ? 'bg-[#B91C1C]/10 dark:bg-[#B91C1C]/25 border-[#B91C1C]/50 text-[#1C1917] dark:text-[#F5F2EB]'
                        : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-[#1C1917] dark:text-[#F5F2EB]';

                    return (
                      <div
                        key={cell.id}
                        className={`p-3 rounded-xl border space-y-1 transition-all ${heatClass}`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>{cell.label}</span>
                          <span className="font-ipa text-[11px]">{cell.score}%</span>
                        </div>
                        <div className="text-[11px] opacity-80 truncate">{cell.example}</div>
                        <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cell.score >= 75
                                ? 'bg-[#15803D]'
                                : cell.score >= 50
                                ? 'bg-[#B91C1C]'
                                : 'bg-[#D97706]'
                            }`}
                            style={{ width: `${cell.score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4 Nepali-to-English L1 Interference & Syntax Pillars */}
              <div className="space-y-2.5 pt-2 border-t border-[#E7E0D6] dark:border-[#2E2924]">
                <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-between">
                  <span>4 Nepali-to-English Translation & L1 Interference Pillars</span>
                  {onOpenArenaTool && (
                    <button
                      type="button"
                      onClick={() => onOpenArenaTool('interference')}
                      className="text-[#B91C1C] dark:text-[#F87171] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Open Nepali-to-English Translation Lab</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {fluencyHeatmapCells.syntaxPillars.map((pillar) => (
                    <div
                      key={pillar.id}
                      className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                        <span>{pillar.label}</span>
                        <span className="font-ipa text-[#B91C1C] dark:text-[#F87171]">
                          {pillar.score}%
                        </span>
                      </div>
                      <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                        {pillar.sub}
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#E7E0D6] dark:bg-[#2E2924] overflow-hidden">
                        <div
                          className="h-full bg-[#15803D] rounded-full"
                          style={{ width: `${pillar.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent 10-Min IELTS / PTE / Career Exam Simulator Results */}
              {progress.examHistory && progress.examHistory.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-[#E7E0D6] dark:border-[#2E2924]">
                  <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-between">
                    <span>Recent 10-Minute IELTS / PTE / Career Readiness Mock Exam History</span>
                    {onOpenArenaTool && (
                      <button
                        type="button"
                        onClick={() => onOpenArenaTool('exam-simulator')}
                        className="text-[#B91C1C] dark:text-[#F87171] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Retake 10-Min Exam Simulator</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {progress.examHistory.slice(0, 3).map((rec) => (
                      <div
                        key={rec.id}
                        className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                            {rec.estimatedBand} ({rec.cefrEquivalent})
                          </div>
                          <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                            {new Date(rec.completedAt).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="font-ipa text-sm font-bold text-[#15803D] dark:text-emerald-400">
                          {rec.overallPercent}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

        {/* Responsive Syllabus Mastery Breakdown (Mobile Cards + Desktop Table) */}
        <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-4">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Complete Curriculum Mastery Breakdown (Lectures 01–{String(lectures.length).padStart(2, '0')})
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
              Sequential unit progress across B1 (01–04), B2 (05–08), and C1 (09–12):
            </p>
          </div>

          {/* Mobile Stacked Cards (< md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {lectures.map((lec) => {
              const score = progress.moduleScores[lec.id];
              const done = progress.completedUnitIds.includes(lec.id);
              const stepsCompleted = (progress.completedStepsByLecture?.[lec.id] || []).length;
              const stepPct = done ? 100 : Math.round((stepsCompleted / 5) * 100);

              return (
                <div
                  key={lec.id}
                  className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                      Lecture {String(lec.lectureNumber).padStart(2, '0')} · {lec.level}
                    </span>
                    <span className="font-ipa font-semibold text-[#15803D] dark:text-emerald-400">
                      {stepPct}% Complete
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-[#1C1917] dark:text-[#F5F2EB]">
                    {lec.title}
                  </div>
                  <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    <div>• Spelling: {lec.moduleC_spelling.ruleTitle}</div>
                    <div>• Grammar: {lec.moduleD_grammar.topicTitle}</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E7E0D6] dark:border-[#2E2924]">
                    <span className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                      {score
                        ? `Score: ${score.spellingScore + score.grammarScore + (score.dialogueScore || 0)}/${
                            score.spellingTotal + score.grammarTotal + (score.dialogueTotal || 0)
                          }`
                        : done
                        ? 'Completed'
                        : 'Not started'}
                    </span>
                    <button
                      onClick={() => onOpenLecture(lec.id)}
                      className="min-h-[36px] px-3.5 py-1.5 rounded-lg bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold"
                    >
                      {done ? 'Review' : 'Start'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (>= md) */}
          <div className="hidden md:block overflow-x-auto border border-[#E7E0D6] dark:border-[#2E2924] rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#FAF7F2] dark:bg-[#141210] border-b border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E]">
                  <th className="py-3 px-4 font-semibold">Lecture</th>
                  <th className="py-3 px-4 font-semibold">Level</th>
                  <th className="py-3 px-4 font-semibold">Spelling Rule Focus</th>
                  <th className="py-3 px-4 font-semibold">Grammar Topic</th>
                  <th className="py-3 px-4 font-semibold">Quiz Score</th>
                  <th className="py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E0D6] dark:divide-[#2E2924]">
                {lectures.map((lec) => {
                  const score = progress.moduleScores[lec.id];
                  const done = progress.completedUnitIds.includes(lec.id);
                  return (
                    <tr key={lec.id}>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                          {String(lec.lectureNumber).padStart(2, '0')}. {lec.title}
                        </div>
                        {isFullNepali && (
                          <div className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                            {lec.nepaliTitle}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-ipa text-xs font-semibold">{lec.level}</td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E] dark:text-[#A8A29E]">
                        {lec.moduleC_spelling.ruleTitle}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#57534E] dark:text-[#A8A29E]">
                        {lec.moduleD_grammar.topicTitle}
                      </td>
                      <td className="py-3.5 px-4 font-ipa text-xs font-semibold">
                        {score ? (
                          <span className="text-[#15803D] dark:text-emerald-400">
                            {score.spellingScore + score.grammarScore + (score.dialogueScore || 0)}/
                            {score.spellingTotal + score.grammarTotal + (score.dialogueTotal || 0)} Correct
                          </span>
                        ) : done ? (
                          <span className="text-[#15803D]">Completed</span>
                        ) : (
                          <span className="text-[#57534E]">Not started</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onOpenLecture(lec.id)}
                          className="min-h-[38px] px-3 py-1.5 rounded-lg bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] hover:border-[#B91C1C] whitespace-nowrap"
                        >
                          {done ? 'Review' : 'Start'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}
      </div>
    );
  }

  // ===========================================================================
  // DEDICATED SETTINGS VIEW (mode === 'settings') — Warm Editorial 2x2 Design
  // ===========================================================================
  const displayUserName =
    progress.userName || firebaseUser?.displayName || 'Anisha Sharma';
  const userInitials = displayUserName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AS';

  const currentVoicePitchPreset =
    dialogueCalibration.speakerAPitch < 1.0
      ? 'Warm'
      : dialogueCalibration.speakerAPitch > 1.02
      ? 'Clear'
      : 'Natural';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 pb-24 space-y-10">
      {/* Hidden JSON Restore Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFileChange}
        className="hidden"
      />

      {/* Editorial Header matching Screenshot 3 */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#A82020] dark:text-[#F87171] mb-2">
          MAKE BHASHASETU YOURS
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#1C1917] dark:text-[#F5F2EB] tracking-tight">
          Settings &amp; preferences
        </h1>
        <p className="text-sm sm:text-base text-[#6E685F] dark:text-[#A8A29E] mt-1.5">
          Your learning space should feel comfortable and personal.
        </p>
      </div>

      {/* Backup / Restore Toast Notification if present */}
      {backupMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between ${
            backupMessage.type === 'success'
              ? 'bg-[#E2EFE7] border-[#2E6F4E]/30 text-[#1F5C3D]'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          <span>{backupMessage.text}</span>
          <button
            type="button"
            onClick={() => setBackupMessage(null)}
            className="text-xs font-bold underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 2x2 Editorial Settings Grid (Exact match to Screenshot 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: Profile & Learning Preferences */}
        <section className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          {/* Avatar + Name + Edit button */}
          <div className="pb-6 border-b border-[#EFEAE0] dark:border-[#2E2924]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                {firebaseUser?.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={displayUserName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full object-cover border border-[#E6E0D4]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[#E5DEC9] dark:bg-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-center font-semibold text-sm shrink-0">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                    {displayUserName}
                  </div>
                  <div className="text-xs text-[#78716C] dark:text-[#A8A29E] truncate">
                    {firebaseUser?.email
                      ? `Synced with ${firebaseUser.email}`
                      : 'Learning at your own pace'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDraftProfileName(displayUserName);
                  setIsEditingProfileName((prev) => !prev);
                }}
                className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#A82020] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors shrink-0"
              >
                {isEditingProfileName ? 'Close' : 'Edit'}
              </button>
            </div>

            {isEditingProfileName && (
              <div className="mt-4 pt-4 border-t border-[#EFEAE0] dark:border-[#2E2924] space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#57534E] dark:text-[#A8A29E] mb-1">
                    Your Display Name (Used on Certificates &amp; Greeting)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={draftProfileName}
                      onChange={(e) => setDraftProfileName(e.target.value)}
                      placeholder="Enter your name"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] bg-[#FAF8F4] dark:bg-[#141210] text-sm text-[#1C1917] dark:text-[#F5F2EB]"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateUserName && draftProfileName.trim()) {
                          onUpdateUserName(draftProfileName.trim());
                        }
                        setIsEditingProfileName(false);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#A82020] text-white text-xs font-semibold"
                    >
                      Save
                    </button>
                  </div>
                </div>

                {/* Quick Google Account Cloud Login inside Profile Edit */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <span className="text-xs text-[#78716C]">
                    {firebaseUser
                      ? `Signed in as ${firebaseUser.email}`
                      : 'Sign in with Google to back up your progress across devices'}
                  </span>
                  {firebaseUser ? (
                    <button
                      type="button"
                      onClick={onGoogleSignOut}
                      className="px-3 py-1.5 rounded-lg border border-[#E6E0D4] text-xs font-semibold text-[#57534E] hover:text-[#1C1917]"
                    >
                      Sign out
                    </button>
                  ) : (
                    onGoogleSignIn && (
                      <button
                        type="button"
                        onClick={onGoogleSignIn}
                        className="px-3.5 py-1.5 rounded-lg bg-[#1C1917] text-white text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign in with Google</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Row 1: Learning level */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Learning level
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Choose the right challenge
              </div>
            </div>
            <select
              aria-label="Learning level"
              value={progress.currentLevel}
              onChange={(e) => onUpdateLevel(e.target.value as CEFRLevel)}
              className="bg-transparent text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none cursor-pointer pr-1 text-right"
            >
              <option value="B1">B1 · Foundation</option>
              <option value="B2">B2 · Workplace</option>
              <option value="C1">C1 · Advanced</option>
            </select>
          </div>

          {/* Row 2: Daily study goal */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Daily study goal
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                A small, achievable habit
              </div>
            </div>
            <select
              aria-label="Daily study goal"
              value={progress.dailyGoalMinutes || 15}
              onChange={(e) =>
                onUpdateDailyGoal &&
                onUpdateDailyGoal(Number(e.target.value) as 5 | 10 | 15 | 30)
              }
              className="bg-transparent text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none cursor-pointer pr-1 text-right"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
          </div>

          {/* Row 3: Display language */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Display language
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Explanations and navigation
              </div>
            </div>
            <select
              aria-label="Display language"
              value={progress.languageMode}
              onChange={(e) => onUpdateLanguageMode(e.target.value as LanguageMode)}
              className="bg-transparent text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none cursor-pointer pr-1 text-right"
            >
              <option value="full-nepali">English + नेपाली</option>
              <option value="english-only">English Only</option>
            </select>
          </div>
        </section>

        {/* CARD 2: Your study environment */}
        <section className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A82020] dark:text-[#F87171] mb-3">
            YOUR STUDY ENVIRONMENT
          </div>

          {/* Row 1: Daily reminder */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Daily reminder
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                A gentle nudge to practise
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={progress.dailyReminderEnabled !== false}
              onClick={() => onToggleDailyReminder && onToggleDailyReminder()}
              className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                progress.dailyReminderEnabled !== false
                  ? 'bg-[#2E6F4E] justify-end'
                  : 'bg-[#A8A29E]/50 justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Row 2: Dark appearance */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Dark appearance
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Easy on the eyes
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={progress.darkMode}
              onClick={onToggleDarkMode}
              className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center ${
                progress.darkMode
                  ? 'bg-[#2E6F4E] justify-end'
                  : 'bg-[#9CA3AF] justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Row 3: Offline mode */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Offline mode
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Lessons available without internet
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncClick}
              className="px-3.5 py-1.5 rounded-full bg-[#E2EFE7] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300 text-xs font-medium"
            >
              {isSyncing ? 'Checking...' : 'Ready'}
            </button>
          </div>
        </section>

        {/* CARD 3: Audio & pronunciation lab */}
        <section className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A82020] dark:text-[#F87171] mb-3">
            AUDIO &amp; PRONUNCIATION LAB
          </div>

          {/* Row 1: Dialogue playback speed */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Dialogue playback speed
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Listen at your comfortable pace
              </div>
            </div>
            <select
              aria-label="Dialogue playback speed"
              value={dialogueCalibration.dialogueRate}
              onChange={(e) => {
                const r = Number(e.target.value) as 0.5 | 0.75 | 1.0;
                handleUpdateCalibration({ dialogueRate: r });
                onUpdateSpeechRate(r);
              }}
              className="bg-transparent text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none cursor-pointer pr-1 text-right"
            >
              <option value={0.5}>0.5×</option>
              <option value={0.75}>0.75×</option>
              <option value={1.0}>1.0×</option>
            </select>
          </div>

          {/* Row 2: Voice pitch */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Voice pitch
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Find a sound that feels clear
              </div>
            </div>
            <select
              aria-label="Voice pitch"
              value={currentVoicePitchPreset}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'Warm') {
                  handleUpdateCalibration({ speakerAPitch: 0.92, speakerBPitch: 1.0 });
                } else if (val === 'Clear') {
                  handleUpdateCalibration({ speakerAPitch: 1.08, speakerBPitch: 1.14 });
                } else {
                  handleUpdateCalibration({ speakerAPitch: 1.0, speakerBPitch: 1.06 });
                }
              }}
              className="bg-transparent text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none cursor-pointer pr-1 text-right"
            >
              <option value="Natural">Natural</option>
              <option value="Warm">Warm</option>
              <option value="Clear">Clear</option>
            </select>
          </div>

          {/* Row 3: Test your pronunciation */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Test your pronunciation
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Try the live voice practice
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowFullAudioLab((prev) => !prev);
                setTimeout(() => {
                  audioLabSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#A82020] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors"
            >
              {showFullAudioLab ? 'Hide lab' : 'Open lab'}
            </button>
          </div>
        </section>

        {/* CARD 4: Your data, in your hands */}
        <section className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#A82020] dark:text-[#F87171] mb-3">
            YOUR DATA, IN YOUR HANDS
          </div>

          {/* Row 1: Export a backup */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Export a backup
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Save your progress as a file
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStudySheetPrintMode('combined')}
                className="px-3 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917]"
                title="Print or export Saved Words & Mistake Notebook as PDF/CSV"
              >
                PDF / CSV
              </button>
              <button
                type="button"
                onClick={handleExportProgressJSON}
                className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#A82020] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors"
              >
                Export
              </button>
            </div>
          </div>

          {/* Row 2: Restore a backup */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Restore a backup
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Bring your learning history back
              </div>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#A82020] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors"
            >
              Choose file
            </button>
          </div>

          {/* Row 3: Sync status */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Sync status
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                {cloudSyncStatusMsg || 'Last checked just now'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => (firebaseUser && onPullFromCloud ? onPullFromCloud() : handleSyncClick())}
              className="px-3.5 py-1.5 rounded-full bg-[#E2EFE7] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300 text-xs font-medium"
            >
              {isCloudSyncing || isSyncing ? 'Syncing...' : 'Up to date'}
            </button>
          </div>

          {/* Row 4: Reset all progress (Local & Cloud) */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-[#A82020] dark:text-[#F87171]">
                Reset progress
              </div>
              <div className="text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Start fresh from 0 locally{firebaseUser ? ' and in Google Cloud' : ''}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setResetIncludeCloud(true);
                setIsResetModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl border border-[#A82020]/40 dark:border-red-800/60 bg-[#FAF2F0] dark:bg-red-950/30 text-xs font-semibold text-[#A82020] dark:text-red-300 hover:bg-[#A82020] hover:text-white transition-colors inline-flex items-center gap-1.5 shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset progress</span>
            </button>
          </div>
        </section>
      </div>

      {/* Confirmation Popup Modal for Resetting Local & Cloud Progress */}
      {isResetModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reset-progress-modal-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FAF2F0] dark:bg-red-950/50 border border-[#A82020]/30 text-[#A82020] dark:text-red-300 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    id="reset-progress-modal-title"
                    className="font-serif text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]"
                  >
                    Reset all study progress?
                  </h2>
                  <p className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                    This action resets your learning journey back to 0.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                aria-label="Close confirmation popup"
                className="p-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] text-xs text-[#57534E] dark:text-[#A8A29E] space-y-2">
              <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                The following items will be cleared back to 0:
              </div>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Completed lessons ({progress.completedUnitIds.length} of {lectures.length}) &amp; step checkpoints
                </li>
                <li>
                  Mastered words ({unifiedMasteredWordsCount}), saved words ({progress.savedWordIds.length}) &amp; SRS review history
                </li>
                <li>
                  Study streak ({progress.currentStreakDays} days), weekly minutes &amp; unlocked badges
                </li>
                <li>
                  Mistake notebook ({progress.mistakeNotebook.length}), lecture notes &amp; arena high scores
                </li>
              </ul>
            </div>

            {/* Option to also clear Cloud Backup (Firestore) */}
            <div className="p-3.5 rounded-xl bg-[#F5F2EB] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924]">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetIncludeCloud}
                  onChange={(e) => setResetIncludeCloud(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#A82020] rounded"
                />
                <div className="text-xs">
                  <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    Reset both Local Device Storage &amp; Google Cloud Backup
                  </div>
                  <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                    {firebaseUser
                      ? `Signed in as ${firebaseUser.email}. When checked, your Firestore cloud backup will also be reset to 0 so old completed lessons do not come back on reload.`
                      : 'Clears local browser & offline IndexedDB storage (and cloud backup if signed in).'}
                  </div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                disabled={isResettingProgress}
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] bg-white dark:bg-[#1A1714] text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isResettingProgress}
                onClick={handleConfirmResetProgress}
                className="px-5 py-2.5 rounded-xl bg-[#A82020] hover:bg-[#8E1B1B] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs disabled:opacity-60"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  {isResettingProgress
                    ? 'Resetting...'
                    : resetIncludeCloud && firebaseUser
                    ? 'Confirm Delete (Local & Cloud)'
                    : 'Confirm Delete & Reset to 0'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Full Audio Speed Calibration, Cloud Account & Live Pronunciation Studio */}
      {showFullAudioLab && (
        <div ref={audioLabSectionRef as React.RefObject<HTMLDivElement>} className="space-y-8 pt-4 border-t border-[#E6E0D4] dark:border-[#2E2924]">
          {renderGoogleAccountProfileCard()}

          {/* ===================================================================== */}
          {/* 1. DEDICATED AUDIO SPEED TEST & LONG-FORM DIALOGUE CALIBRATION CARD   */}
          {/* ===================================================================== */}
          <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E7E0D6] dark:border-[#2E2924]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] mb-1">
              <Sliders className="w-4 h-4" />
              <span>Long-Form Dialogue Audio Speed & Pitch Calibration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Audio Speed Test (0.5x · 0.75x · 1.0x) & Pitch Shift Calibrator
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
              Fine-tune playback speed and speaker pitch shifts for long-form lecture dialogues so you can hear silent letters and vowel phonemes clearly before starting a lecture.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handlePlayCalibrationDialogue()}
              className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                isPlayingCalibrationDialogue
                  ? 'bg-[#D97706] text-white'
                  : 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
              }`}
            >
              {isPlayingCalibrationDialogue ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Calibration Dialogue ({dialogueCalibration.dialogueRate}x)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Test Full Dialogue ({dialogueCalibration.dialogueRate}x)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Calibration Controls Grid: Speed (0.5x / 0.75x / 1.0x) + Speaker A/B Pitch + Turn Pause */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Calibration Dials */}
          <div className="lg:col-span-5 space-y-5">
            {/* Long-Form Dialogue Playback Speed (0.5x, 0.75x, 1.0x) */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  1. Long-Form Dialogue Speed:
                </label>
                <span className="font-ipa text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                  Active: {dialogueCalibration.dialogueRate}x
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    {
                      rate: 0.5 as const,
                      label: '0.5x Speed',
                      sub: 'Phoneme Slow',
                    },
                    {
                      rate: 0.75 as const,
                      label: '0.75x Speed',
                      sub: 'Careful Study',
                    },
                    {
                      rate: 1.0 as const,
                      label: '1.0x Speed',
                      sub: 'Natural Pace',
                    },
                  ]
                ).map((opt) => {
                  const active = dialogueCalibration.dialogueRate === opt.rate;
                  return (
                    <button
                      key={opt.rate}
                      type="button"
                      onClick={() => handlePlayCalibrationDialogue(opt.rate)}
                      className={`min-h-[52px] p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        active
                          ? 'bg-[#1C1917] text-white dark:bg-[#F5F2EB] dark:text-[#1C1917] border-transparent'
                          : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C]'
                      }`}
                    >
                      <div className="font-ipa text-xs font-semibold flex items-center justify-between">
                        <span>{opt.label}</span>
                        <Volume2 className="w-3.5 h-3.5 opacity-80" />
                      </div>
                      <div
                        className={`text-[10px] ${
                          active
                            ? 'text-stone-300 dark:text-stone-600'
                            : 'text-[#57534E] dark:text-[#A8A29E]'
                        }`}
                      >
                        {opt.sub}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speaker A & Speaker B Pitch Shift Calibration */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    2. Speaker A Pitch Shift (Lower / Warm Voice):
                  </span>
                  <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    {dialogueCalibration.speakerAPitch.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { pitch: 0.85, label: '0.85 Deep' },
                    { pitch: 0.93, label: '0.93 Balanced' },
                    { pitch: 1.0, label: '1.00 Neutral' },
                  ].map((p) => (
                    <button
                      key={p.pitch}
                      type="button"
                      onClick={() => {
                        handleUpdateCalibration({ speakerAPitch: p.pitch });
                        speechService.speak('Did you receive the updated Wednesday schedule?', {
                          rate: dialogueCalibration.dialogueRate,
                          pitch: p.pitch,
                          speakerIndex: 0,
                        });
                      }}
                      className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border font-ipa text-xs font-semibold transition-all ${
                        Math.abs(dialogueCalibration.speakerAPitch - p.pitch) < 0.02
                          ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                          : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    3. Speaker B Pitch Shift (Higher / Crisp Voice):
                  </span>
                  <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    {dialogueCalibration.speakerBPitch.toFixed(2)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { pitch: 1.0, label: '1.00 Neutral' },
                    { pitch: 1.09, label: '1.09 Balanced' },
                    { pitch: 1.18, label: '1.18 Bright' },
                  ].map((p) => (
                    <button
                      key={p.pitch}
                      type="button"
                      onClick={() => {
                        handleUpdateCalibration({ speakerBPitch: p.pitch });
                        speechService.speak(
                          'Yes, without a doubt! I noticed a subtle change in the receipt.',
                          {
                            rate: dialogueCalibration.dialogueRate,
                            pitch: p.pitch,
                            speakerIndex: 1,
                          }
                        );
                      }}
                      className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border font-ipa text-xs font-semibold transition-all ${
                        Math.abs(dialogueCalibration.speakerBPitch - p.pitch) < 0.02
                          ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                          : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    4. Turn Pause Between Dialogue Lines:
                  </span>
                  <span className="font-ipa font-semibold text-[#57534E] dark:text-[#A8A29E]">
                    {dialogueCalibration.turnPauseMs} ms
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { ms: 250, label: '250ms Brisk' },
                    { ms: 380, label: '380ms Natural' },
                    { ms: 650, label: '650ms Relaxed' },
                  ].map((pause) => (
                    <button
                      key={pause.ms}
                      type="button"
                      onClick={() => handleUpdateCalibration({ turnPauseMs: pause.ms })}
                      className={`min-h-[38px] px-2.5 py-1.5 rounded-lg border font-ipa text-xs font-semibold transition-all ${
                        dialogueCalibration.turnPauseMs === pause.ms
                          ? 'bg-[#1C1917] text-white dark:bg-[#F5F2EB] dark:text-[#1C1917] border-transparent'
                          : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                      }`}
                    >
                      {pause.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Multi-Turn Phoneme Calibration Script */}
          <div className="lg:col-span-7 p-4 sm:p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-col justify-between space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Interactive Phoneme & Silent-Letter Dialogue Test Script
                </div>
                <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                  Tap any line to test how clearly you hear each silent-letter word at{' '}
                  <strong className="font-ipa">{dialogueCalibration.dialogueRate}x</strong> speed:
                </p>
              </div>
              <span className="font-ipa text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                Saved automatically for Step 05 Lectures
              </span>
            </div>

            <div className="space-y-3">
              {CALIBRATION_DIALOGUE_SCRIPT.map((line, idx) => {
                const isLineActive = activeCalibrationLineIdx === idx;
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isLineActive
                        ? 'bg-white dark:bg-[#1F1C18] border-[#B91C1C] ring-1 ring-[#B91C1C]'
                        : 'bg-white/90 dark:bg-[#1F1C18]/90 border-[#E7E0D6] dark:border-[#2E2924]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                        {line.speaker} ·{' '}
                        <span className="font-ipa text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                          Pitch{' '}
                          {line.speakerIndex === 0
                            ? dialogueCalibration.speakerAPitch.toFixed(2)
                            : dialogueCalibration.speakerBPitch.toFixed(2)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handlePlaySingleCalibrationLine(idx)}
                        className="min-h-[32px] px-2.5 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#B91C1C] text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                        <span>Listen ({dialogueCalibration.dialogueRate}x)</span>
                      </button>
                    </div>

                    <p className="text-sm font-medium text-[#1C1917] dark:text-[#F5F2EB]">
                      “{line.english}”
                    </p>
                    {progress.languageMode !== 'english-only' && (
                      <p className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                        {line.nepali}
                      </p>
                    )}

                    {/* Target Phoneme Clarity Checkpoints */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[#E7E0D6]/70 dark:border-[#2E2924]/70 text-[11px]">
                      <span className="font-semibold text-[#57534E] dark:text-[#A8A29E]">
                        Phoneme Check:
                      </span>
                      {line.targetPhonemes.map((tp) => (
                        <button
                          key={tp.word}
                          type="button"
                          onClick={() =>
                            speechService.speak(tp.word, {
                              rate: dialogueCalibration.dialogueRate,
                              speakerIndex: line.speakerIndex,
                            })
                          }
                          className="px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C] text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1"
                          title={tp.note}
                        >
                          <span className="font-semibold">{tp.word}</span>
                          <span className="font-ipa text-[#B91C1C] dark:text-[#F87171]">
                            {tp.ipa}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. INTERACTIVE SOUND & VOICE PRACTICE LAB (SPEECH FEEDBACK STUDIO)    */}
      {/* ===================================================================== */}
      <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E7E0D6] dark:border-[#2E2924]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] mb-1">
              <Mic className="w-4 h-4" />
              <span>Interactive Sound Practice & Voice Diagnostic Studio</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Sound Practice Lab — Test Your Voice & Get Phoneme Feedback
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
              Practice pronouncing tricky silent-letter words, full conversational sentences, or any custom English phrase and receive instant articulation scoring and coaching tips.
            </p>
          </div>

          {/* 3 Practice Mode Selector Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#FAF7F2] dark:bg-[#141210] rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] self-start">
            {(
              [
                { id: 'words' as const, label: 'Silent-Letter Words' },
                { id: 'sentences' as const, label: 'Full Sentences' },
                { id: 'custom' as const, label: 'Custom Phrase' },
              ]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setPracticeTab(tab.id);
                  setPracticeResult(null);
                  setPracticeMicError(null);
                  setSavedToMistakesBanner(false);
                  if (tab.id === 'words') {
                    setSelectedDrillId(
                      SOUND_PRACTICE_DRILLS.find((d) => d.category === 'words')?.id ||
                        SOUND_PRACTICE_DRILLS[0].id
                    );
                  } else if (tab.id === 'sentences') {
                    setSelectedDrillId(
                      SOUND_PRACTICE_DRILLS.find((d) => d.category === 'sentences')?.id ||
                        SOUND_PRACTICE_DRILLS[6].id
                    );
                  }
                }}
                className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  practiceTab === tab.id
                    ? 'bg-white dark:bg-[#1F1C18] text-[#1C1917] dark:text-[#F5F2EB] shadow-xs'
                    : 'text-[#57534E] dark:text-[#A8A29E]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Drill Selector or Custom Input */}
          <div className="lg:col-span-5 space-y-4">
            {practiceTab !== 'custom' ? (
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#57534E] dark:text-[#A8A29E]">
                  Select a {practiceTab === 'words' ? 'Silent-Letter Word' : 'Dialogue Sentence'} to Test Your Voice:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                  {SOUND_PRACTICE_DRILLS.filter((d) => d.category === practiceTab).map((drill) => {
                    const active = drill.id === selectedDrillId;
                    return (
                      <button
                        key={drill.id}
                        type="button"
                        onClick={() => {
                          setSelectedDrillId(drill.id);
                          setPracticeResult(null);
                          setPracticeMicError(null);
                          setSavedToMistakesBanner(false);
                        }}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 ${
                          active
                            ? 'border-[#B91C1C] bg-[#B91C1C]/8 dark:bg-[#B91C1C]/20'
                            : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#B91C1C]/50'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                            {drill.targetText}
                          </div>
                          <div className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E] truncate">
                            {drill.ipa} · {drill.silentRule}
                          </div>
                        </div>
                        <Volume2 className="w-4 h-4 text-[#B91C1C] shrink-0" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
                <label className="block text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Enter Any English Word or Sentence to Practice:
                </label>
                <textarea
                  rows={3}
                  value={customPracticeText}
                  onChange={(e) => {
                    setCustomPracticeText(e.target.value);
                    setPracticeResult(null);
                  }}
                  placeholder="Type any word or sentence you want to practice speaking..."
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#B91C1C]"
                />
                <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                  First listen to the model pronunciation at 0.5x, 0.75x, or 1.0x on the right, then tap the microphone to test your voice.
                </p>
              </div>
            )}
          </div>

          {/* Right Column: Active Target Card + Live Voice Recorder + Instant Feedback */}
          <div className="lg:col-span-7 p-5 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-5">
            {/* Target Phrase Header & Model Audio Buttons */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#57534E] dark:text-[#A8A29E]">
                <span>Target Pronunciation Prompt</span>
                {practiceTab !== 'custom' && (
                  <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    Syllable Guide: {currentDrill.syllableGuide}
                  </span>
                )}
              </div>

              <div className="text-2xl sm:text-3xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                “{activePracticeTargetText}”
              </div>

              {practiceTab !== 'custom' && (
                <div className="space-y-1 text-xs">
                  <div className="font-ipa text-sm text-[#57534E] dark:text-[#A8A29E]">
                    IPA: <strong className="text-[#1C1917] dark:text-[#F5F2EB]">{currentDrill.ipa}</strong>
                    {progress.languageMode !== 'english-only' && (
                      <span className="font-nepali ml-2">({currentDrill.nepaliMeaning})</span>
                    )}
                  </div>
                  <div className="text-[#B91C1C] dark:text-[#F87171] font-medium">
                    Phonics Focus: {currentDrill.trapWarning}
                  </div>
                  {isFullNepali && (
                    <div className="font-nepali text-[#57534E] dark:text-[#A8A29E]">
                      टिप्स: {currentDrill.coachingTipNepali}
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Listen at 3 Calibrated Speeds + Step 2: Speak Into Mic */}
              <div className="flex flex-wrap items-center gap-2.5 pt-2">
                {[
                  { rate: 0.5, label: 'Listen 0.5x' },
                  { rate: 0.75, label: 'Listen 0.75x' },
                  { rate: 1.0, label: 'Listen 1.0x' },
                ].map((b) => (
                  <button
                    key={b.rate}
                    type="button"
                    onClick={() => speechService.speak(activePracticeTargetText, { rate: b.rate })}
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                    <span>{b.label}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleRecordVoicePractice}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all ${
                    isListeningPracticeMic
                      ? 'bg-[#D97706] text-white animate-pulse'
                      : 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>
                    {isListeningPracticeMic
                      ? 'Listening... Speak Clearly Now'
                      : 'Tap to Test Your Voice'}
                  </span>
                </button>
              </div>
            </div>

            {practiceMicError && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                {practiceMicError}
              </div>
            )}

            {/* Interactive Self-Check / Transcript Evaluator (Works even without mic hardware) */}
            <form
              onSubmit={handleEvaluateManualTranscript}
              className="pt-3 border-t border-[#E7E0D6] dark:border-[#2E2924] flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <input
                type="text"
                value={manualTranscriptTestInput}
                onChange={(e) => setManualTranscriptTestInput(e.target.value)}
                placeholder="Or type how you pronounced/heard it to test diagnostic feedback..."
                className="flex-1 min-h-[38px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs text-[#1C1917] dark:text-[#F5F2EB]"
              />
              <button
                type="submit"
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold whitespace-nowrap shrink-0"
              >
                Evaluate Pronunciation
              </button>
            </form>

            {/* Instant Voice Diagnostic Feedback Card */}
            {practiceResult && (
              <div
                className={`p-4 rounded-xl border space-y-3 ${
                  practiceResult.passed
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    {practiceResult.passed
                      ? '✓ Clear Pronunciation Match!'
                      : 'Keep Practicing — Phoneme Calibration Feedback'}
                  </div>
                  <span className="font-ipa text-sm font-bold text-[#B91C1C] dark:text-[#F87171]">
                    Accuracy Score: {practiceResult.score}%
                  </span>
                </div>

                {/* Score Bar */}
                <div className="w-full h-2.5 rounded-full bg-white dark:bg-[#141210] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      practiceResult.passed ? 'bg-[#15803D]' : 'bg-[#D97706]'
                    }`}
                    style={{ width: `${Math.max(6, practiceResult.score)}%` }}
                  />
                </div>

                <div className="text-xs text-[#1C1917] dark:text-[#F5F2EB]">
                  <strong>Captured Speech:</strong> “{practiceResult.transcript || 'No speech detected'}”
                </div>

                {/* Word-by-Word Match Breakdown */}
                {practiceResult.wordDiagnostics && practiceResult.wordDiagnostics.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[#57534E] dark:text-[#A8A29E]">
                      Word-by-Word Articulation Check:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {practiceResult.wordDiagnostics.map((wd, idx) => (
                        <span
                          key={`${wd.word}-${idx}`}
                          className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                            wd.matched
                              ? 'bg-emerald-100/80 dark:bg-emerald-900/40 border-emerald-400 text-emerald-950 dark:text-emerald-200'
                              : 'bg-amber-100/80 dark:bg-amber-900/40 border-amber-400 text-amber-950 dark:text-amber-200'
                          }`}
                        >
                          {wd.matched ? '✓ ' : '• '}
                          {wd.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                  {isFullNepali ? practiceResult.feedbackNepali : practiceResult.feedbackEnglish}
                </p>

                {practiceTab !== 'custom' && !practiceResult.passed && (
                  <div className="text-xs font-medium text-[#B91C1C] dark:text-[#F87171]">
                    Coaching Tip: {currentDrill.trapWarning}
                  </div>
                )}

                {onRecordMistake && (
                  <div className="pt-1 flex items-center justify-between gap-2">
                    {savedToMistakesBanner ? (
                      <span className="text-xs font-semibold text-[#15803D] dark:text-emerald-400">
                        ✓ Added to your Mistake Notebook for extra practice!
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddDrillToMistakeNotebook}
                        className="min-h-[34px] px-3 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] inline-flex items-center gap-1.5"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Save to Mistake Notebook</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 3. PHONEME EAR-TRAINING & MINIMAL-PAIR CONTRAST LAB                   */}
      {/* ===================================================================== */}
      <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] mb-1">
              <Headphones className="w-4 h-4" />
              <span>Phoneme Discrimination & Ear Calibration</span>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Minimal-Pair Ear Training (Distinguish Similar English Sounds)
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
              Compare commonly confused English phoneme pairs at 0.5x and 1.0x speed, then test your ear with a Mystery Sound Challenge:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {MINIMAL_PAIR_CONTRASTS.map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => {
                  setActivePairId(pair.id);
                  setMysteryChoice(null);
                  setUserEarGuess(null);
                }}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  activePairId === pair.id
                    ? 'bg-[#1C1917] text-white dark:bg-[#F5F2EB] dark:text-[#1C1917] border-transparent'
                    : 'bg-[#FAF7F2] dark:bg-[#141210] border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                }`}
              >
                {pair.phonemeA} vs {pair.phonemeB}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Word A vs Word B Comparison Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                side: 'A' as const,
                phoneme: currentMinimalPair.phonemeA,
                word: currentMinimalPair.wordA,
                ipa: currentMinimalPair.ipaA,
                meaning: currentMinimalPair.meaningA,
              },
              {
                side: 'B' as const,
                phoneme: currentMinimalPair.phonemeB,
                word: currentMinimalPair.wordB,
                ipa: currentMinimalPair.ipaB,
                meaning: currentMinimalPair.meaningB,
              },
            ].map((item) => (
              <div
                key={item.side}
                className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-ipa font-semibold text-[#B91C1C] dark:text-[#F87171]">
                    Sound {item.side}: {item.phoneme}
                  </span>
                  <span className="font-ipa text-[#57534E] dark:text-[#A8A29E]">{item.ipa}</span>
                </div>
                <div className="text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  {item.word}
                </div>
                {progress.languageMode !== 'english-only' && (
                  <div className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                    अर्थ: {item.meaning}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => speechService.speak(item.word, { rate: 1.0 })}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#B91C1C] text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                    <span>1.0x</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => speechService.speak(item.word, { rate: 0.5 })}
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#D97706] text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>0.5x Slow</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Mystery Ear Test Box */}
          <div className="lg:col-span-5 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
            <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Mystery Ear Calibration Test: Which Word Did You Hear?
            </div>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
              {currentMinimalPair.mouthPositionTip}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePlayMysteryMinimalPair(0.75)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] inline-flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Mystery Sound</span>
              </button>

              {mysteryChoice && (
                <>
                  <button
                    type="button"
                    onClick={() => setUserEarGuess('A')}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold"
                  >
                    Heard “{currentMinimalPair.wordA}”
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserEarGuess('B')}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold"
                  >
                    Heard “{currentMinimalPair.wordB}”
                  </button>
                </>
              )}
            </div>

            {mysteryChoice && userEarGuess && (
              <div
                className={`p-2.5 rounded-lg text-xs font-semibold ${
                  userEarGuess === mysteryChoice
                    ? 'bg-emerald-100/80 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-100/80 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200'
                }`}
              >
                {userEarGuess === mysteryChoice
                  ? `✓ Spot-on ear! The mystery word was "${
                      mysteryChoice === 'A' ? currentMinimalPair.wordA : currentMinimalPair.wordB
                    }".`
                  : `Not quite — the mystery word was "${
                      mysteryChoice === 'A' ? currentMinimalPair.wordA : currentMinimalPair.wordB
                    }". Tap 0.5x Slow to compare both sounds!`}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Language & Nepali Assistance Mode Selector */}
      <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171] mb-1">
          <Globe className="w-4 h-4" />
          <span>Language & Nepali Display Preference</span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mb-1">
          Choose How Much Nepali Appears in the App
        </h2>
        <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mb-4">
          Switch between an all-English experience, English with concise word meanings only, or full Nepali explanations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(
            [
              {
                id: 'english-only' as LanguageMode,
                title: 'English Only',
                badge: '100% English UI & Rules',
                desc: 'All interface text, spelling rules, pronunciation guides, and grammar explanations are in English. Nepali is hidden unless you tap to reveal a word meaning.',
              },
              {
                id: 'english-meanings' as LanguageMode,
                title: 'English + Word Meanings',
                badge: 'Balanced (Recommended)',
                desc: 'Keeps the interface, rules, and instructions cleanly in English, showing Nepali only for vocabulary word meanings and optional sentence comparisons.',
              },
              {
                id: 'full-nepali' as LanguageMode,
                title: 'Full Nepali Support',
                badge: 'विस्तृत नेपाली व्याख्या',
                desc: 'Displays bilingual Nepali titles, phonetic sound cues, and full Devanagari explanations across every lecture module.',
              },
            ]
          ).map((option) => {
            const active = progress.languageMode === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onUpdateLanguageMode(option.id)}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  active
                    ? 'border-[#B91C1C] bg-[#B91C1C]/8 dark:bg-[#B91C1C]/20 ring-1 ring-[#B91C1C]'
                    : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#B91C1C]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {option.title}
                    </span>
                    {active && (
                      <CheckCircle2 className="w-4 h-4 text-[#B91C1C] dark:text-[#F87171] shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-[#B91C1C] dark:text-[#F87171] mb-2">
                    {option.badge}
                  </div>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                    {option.desc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Voice Accent & Speed Studio + Study Goal & Theme */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice & Audio Speed Studio */}
        <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-5">
          <div>
            <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
              Word Vocabulary Voice Profile
            </div>
            <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
              Default Vocabulary Speed & System Voice Selection
            </h3>
          </div>

          {/* Speech Speed Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] mb-2">
              Default Single-Word Pronunciation Speed:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { rate: 0.75, label: '0.75x Careful' },
                { rate: 0.95, label: '1.0x Natural' },
                { rate: 1.1, label: '1.1x Brisk' },
              ].map((opt) => (
                <button
                  key={opt.rate}
                  onClick={() => onUpdateSpeechRate(opt.rate)}
                  className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold inline-flex items-center justify-center gap-1.5 ${
                    Math.abs(progress.preferredSpeechRate - opt.rate) < 0.05
                      ? 'bg-[#1C1917] text-white dark:bg-[#F5F2EB] dark:text-[#1C1917] border-transparent'
                      : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred English Voice Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] mb-2">
              Preferred English Voice Profile:
            </label>
            <select
              value={selectedVoiceURI}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB]"
            >
              <option value="">Automatic Best English Voice (Recommended)</option>
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Live Voice & Two-Speaker Conversation Test Buttons */}
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3">
            <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Quick Voice Check
            </div>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
              Test how single vocabulary words and two-person dialogues sound with your selected voice:
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleTestSingleVoice}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  isTestingVoice === 'single'
                    ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                    : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Test Single Voice</span>
              </button>

              <button
                type="button"
                onClick={handleTestDialogueVoices}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  isTestingVoice === 'dialogue'
                    ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                    : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Test Two-Person Voices (A & B)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Target Level, Daily Goal & Theme Posture */}
        <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Study Personalization
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                Target CEFR Level, Daily Goal & Theme
              </h3>
            </div>

            {/* Level Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] mb-2">
                Current Target CEFR Track:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['B1', 'B2', 'C1'] as CEFRLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onUpdateLevel(lvl)}
                    className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${
                      progress.selectedLevel === lvl
                        ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                        : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB]'
                    }`}
                  >
                    Level {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Study Goal Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] mb-2">
                Daily Study Goal Target:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {([5, 10, 15, 30] as (5 | 10 | 15 | 30)[]).map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => onUpdateDailyGoal && onUpdateDailyGoal(mins)}
                    className={`min-h-[42px] px-2.5 py-2 rounded-xl border font-ipa text-xs font-semibold transition-all ${
                      progress.dailyGoalMinutes === mins
                        ? 'bg-[#1C1917] text-white dark:bg-[#F5F2EB] dark:text-[#1C1917] border-transparent'
                        : 'border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between pt-4 border-t border-[#E7E0D6] dark:border-[#2E2924]">
            <div>
              <div className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Reading Theme Posture
              </div>
              <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                Switch between Warm Cream paper and Dark Ink mode
              </div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="min-h-[44px] px-4 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-2"
            >
              {progress.darkMode ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Warm Cream</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-[#57534E]" />
                  <span>Dark Ink</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Data Backup Export/Restore + Offline PWA Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Backup Export & Restore */}
        <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
              Local Data Portability
            </div>
            <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Export & Restore Study Progress Backup (.json)
            </h3>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
              Download a complete copy of your completed lectures, quiz scores, saved dictionary bookmarks, SRS boxes, and Mistake Notes, or restore from a saved JSON file on any device.
            </p>
          </div>

          {backupMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs font-medium ${
                backupMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
              }`}
            >
              {backupMessage.text}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleExportProgressJSON}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold inline-flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Export Study Backup (.json)</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C] inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#B91C1C]" />
              <span>Restore from Backup File</span>
            </button>
          </div>

          {/* Physical Study Sheets Export (Saved Words & Mistake Notebook — PDF & CSV) */}
          <div className="pt-4 mt-2 border-t border-[#E7E0D6] dark:border-[#2E2924] space-y-2.5">
            <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Physical On-The-Go Study Sheets (Formatted PDF & CSV Export):
            </div>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E]">
              Export your Saved Words ({progress.savedWordIds.length}) and Mistake Notebook ({progress.mistakeNotebook.length}) as printable PDF worksheets or UTF-8 CSV spreadsheets.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setStudySheetPrintMode('combined')}
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] inline-flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF Study Sheet</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  exportSavedWordsToCSV(
                    savedWordsForExport,
                    progress.masteredWordIds || [],
                    progress.wordSRS
                  )
                }
                className="min-h-[40px] px-3 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C] inline-flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Saved Words (.CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => exportMistakeNotebookToCSV(progress.mistakeNotebook)}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#B91C1C] inline-flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-[#B91C1C]" />
                <span>Mistake Notebook (.CSV)</span>
              </button>
            </div>
          </div>
        </div>

        {/* PWA Installation & Offline Sync Card */}
        <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Offline PWA & Home Screen Installation
              </h3>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#57534E] dark:text-[#A8A29E]">
                {isOnline ? (
                  <>
                    <Wifi className="w-4 h-4 text-[#15803D]" />
                    <span>Online</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-4 h-4 text-[#D97706]" />
                    <span>Offline Mode</span>
                  </>
                )}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E]">
              All 12 core syllabus lectures, 10,400+ dictionary words, and audio pronunciation work offline once installed.
            </p>

            {/* Offline Sync Status Box */}
            <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Local Storage & Sync Queue
                </div>
                <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                  {progress.pendingSyncQueue.length > 0
                    ? `${progress.pendingSyncQueue.length} offline updates waiting to sync`
                    : 'All study progress saved locally'}
                </div>
              </div>
              <button
                onClick={handleSyncClick}
                disabled={!isOnline || isSyncing}
                className="min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-50 whitespace-nowrap shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>

          {/* Add to Home Screen Action */}
          <div className="pt-4 border-t border-[#E7E0D6] dark:border-[#2E2924]">
            {isInstalled ? (
              <div className="text-xs font-semibold text-[#15803D] dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>BhashaSetu is installed on your home screen (Standalone Mode).</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-[#B91C1C] text-white text-xs font-semibold hover:bg-[#991B1B] transition-colors inline-flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Add BhashaSetu to Home Screen (Install PWA)</span>
              </button>
            ) : (
              <button
                onClick={() => setShowIOSGuide((prev) => !prev)}
                className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs font-semibold inline-flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>
                  {isIOS
                    ? 'How to Install on iPhone / iPad (Add to Home Screen)'
                    : 'How to Add App to Your Home Screen'}
                </span>
              </button>
            )}

            {showIOSGuide && (
              <div className="mt-3 p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-xs space-y-1.5">
                <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Install for Full Offline Access:
                </div>
                <p className="text-[#57534E] dark:text-[#A8A29E]">
                  1. On <strong>iOS Safari</strong>: Tap the <strong>Share</strong> icon at the
                  bottom of the browser, then tap <strong>Add to Home Screen</strong>.
                </p>
                <p className="text-[#57534E] dark:text-[#A8A29E]">
                  2. On <strong>Chrome / Android / Desktop</strong>: Open the browser menu (⋮) or
                  address bar install icon and select <strong>Install BhashaSetu</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};
