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
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check,
  RotateCcw,
  PenTool,
  GraduationCap,
  Brain,
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
import { ResponsiveSelectSheet } from './ui/ResponsivePrimitives';
import { useModalBehavior, backdropDismiss, MODAL_BACKDROP_CLASS, scrollBehavior } from '../hooks/useModalBehavior';


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
  onToggleHapticFeedback?: () => void;
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

interface EditorialDropdownOption<T extends string | number> {
  value: T;
  label: string;
  sub?: string;
  badge?: string;
}

interface EditorialSelectDropdownProps<T extends string | number> {
  ariaLabel: string;
  value: T;
  options: EditorialDropdownOption<T>[];
  onChange: (value: T) => void;
  align?: 'left' | 'right';
  compact?: boolean;
}

function EditorialSelectDropdown<T extends string | number>({
  ariaLabel,
  value,
  options,
  onChange,
  align = 'right',
  compact = false,
}: EditorialSelectDropdownProps<T>) {
  return (
    <ResponsiveSelectSheet<T>
      ariaLabel={ariaLabel}
      sheetTitle={ariaLabel}
      sheetDescription="Tap an option below to update your preference."
      value={value}
      options={options.map((opt) => ({
        value: opt.value,
        label: opt.label,
        sub: opt.sub,
        badge: opt.badge,
      }))}
      onChange={onChange}
      align={align}
      compact={compact}
    />
  );
}

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
  onToggleHapticFeedback,
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
  useModalBehavior(isResetModalOpen, () => setIsResetModalOpen(false));
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
  const [progressPeriod, setProgressPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [badgeCategoryFilter, setBadgeCategoryFilter] = useState<
    'all' | 'earned' | 'streak' | 'learning' | 'practice' | 'mastery'
  >('all');
  const [showAll16Badges, setShowAll16Badges] = useState<boolean>(false);
  // Badge detail pop-up (any badge, earned or still to come)
  const [openBadgeId, setOpenBadgeId] = useState<string | null>(null);
  useModalBehavior(Boolean(openBadgeId), () => setOpenBadgeId(null));
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

  const handlePlayCalibrationDialogue = (overrideRate?: number) => {
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
            className="min-h-[42px] px-5 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Achievement Card as PDF</span>
          </button>
        </div>

        <div className="bg-white text-[#1C1917] border-4 border-double border-[#D97706] rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-[#2D6A4F] text-white flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-10 h-10" />
          </div>
          <div className="font-ipa text-xs uppercase tracking-widest text-[#9E2A2B] font-semibold">
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
              <div className="font-ipa text-xl font-bold text-[#2D6A4F]">
                {badgeInfo.current} / {badgeInfo.target}
              </div>
              <div className="text-xs text-[#57534E]">Milestone Progress ({badgeInfo.unit})</div>
            </div>
            <div>
              <div className="font-ipa text-xl font-bold text-[#9E2A2B]">
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
            className="min-h-[42px] px-5 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] inline-flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save Certificate as PDF</span>
          </button>
        </div>

        <div className="bg-white text-[#1C1917] border-4 border-double border-[#9E2A2B] rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#9E2A2B]/10 text-[#9E2A2B] flex items-center justify-center mx-auto">
            <Award className="w-9 h-9" />
          </div>
          <div className="font-ipa text-xs uppercase tracking-widest text-[#9E2A2B] font-semibold">
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
              <div className="font-ipa text-xl font-bold text-[#9E2A2B]">
                {trackInfo.done} / {trackInfo.total}
              </div>
              <div className="text-xs text-[#57534E]">Track Units Completed</div>
            </div>
            <div>
              <div className="font-ipa text-xl font-bold text-[#2D6A4F]">
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
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[#9E2A2B]'
                }`}
              >
                {firebaseUser
                  ? (firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()
                  : <Cloud className="w-6 h-6" />}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[#2D6A4F] dark:text-emerald-400 inline-flex items-center gap-1">
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
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-[#2D6A4F] dark:text-emerald-300'
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
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-[#2D6A4F] text-white text-xs font-semibold hover:bg-emerald-800 inline-flex items-center gap-2 transition-colors disabled:opacity-60"
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
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#2D6A4F] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
                  >
                    <Download className="w-3.5 h-3.5 text-[#2D6A4F]" />
                    <span>Restore / Merge from Cloud</span>
                  </button>
                )}
                {onGoogleSignOut && (
                  <button
                    type="button"
                    onClick={onGoogleSignOut}
                    className="min-h-[42px] px-3.5 py-2 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#9E2A2B] text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] inline-flex items-center gap-1.5 transition-colors"
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
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] text-xs sm:text-sm font-semibold hover:bg-[#9E2A2B] dark:hover:bg-[#9E2A2B] dark:hover:text-white inline-flex items-center gap-2.5 transition-colors shadow-xs disabled:opacity-60"
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
            <div className="font-ipa font-bold text-sm text-[#2D6A4F] dark:text-emerald-400 mt-0.5">
              {unifiedMasteredWordsCount} Mastered · {srsCount} SRS
            </div>
          </div>
          <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
            <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">Mistakes & Notes</div>
            <div className="font-ipa font-bold text-sm text-[#9E2A2B] dark:text-[#F87171] mt-0.5">
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
          <div className="text-xs font-medium text-[#2D6A4F] dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{cloudSyncStatusMsg}</span>
          </div>
        )}
      </section>
    );
  };

  // ===========================================================================
  // DEDICATED PROGRESS & ACHIEVEMENTS VIEW (mode === 'progress')
  // ===========================================================================
  if (mode === 'progress') {
    const streakDays = progress.currentStreakDays || 0;
    const bestStreak = Math.max(progress.longestStreakDays || 0, streakDays);
    const completedLessonsCount = progress.completedUnitIds.length;
    const totalLessonsCount = lectures.length || 12;

    // Build 7-day current week study bars (Mon -> Sun)
    const weekDayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const weekDayShortLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weekDayFullNames = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    const now = new Date();
    const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon, ...
    const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

    const weekEntries = weekDayLabels.map((letter, idx) => {
      const d = new Date(now);
      d.setDate(now.getDate() + mondayOffset + idx);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${day}`;
      const rawUnits = progress.studyActivityByDate?.[dateStr] || 0;
      const minutes = rawUnits * 5;
      const isToday = d.toDateString() === now.toDateString();
      return {
        idx,
        letter,
        shortLabel: weekDayShortLabels[idx],
        dayNumber: d.getDate(),
        dayName: weekDayFullNames[idx],
        dateStr,
        minutes,
        isToday,
      };
    });

    const weeklyMinutesTotal = weekEntries.reduce((sum, e) => sum + e.minutes, 0);
    const activeDaysThisWeek = weekEntries.filter((e) => e.minutes > 0).length;
    const maxDayMinutes = Math.max(20, ...weekEntries.map((e) => e.minutes));
    const bestDayEntry = weekEntries.reduce(
      (best, curr) => (curr.minutes > best.minutes ? curr : best),
      weekEntries[0]
    );

    // Total study minutes across all recorded dates
    const allRecordedUnits = Object.values(progress.studyActivityByDate || {}).reduce(
      (sum, v) => sum + (typeof v === 'number' ? v : 0),
      0
    );
    const totalStudyMinutes = Math.max(
      weeklyMinutesTotal,
      allRecordedUnits * 5 + completedLessonsCount * 15
    );
    const studyHours = Math.floor(totalStudyMinutes / 60);
    const studyRemMinutes = totalStudyMinutes % 60;
    const studyTimeFormatted =
      studyHours > 0 ? `${studyHours}h ${studyRemMinutes}m` : `${totalStudyMinutes}m`;

    const weeklyGoalTarget = (progress.dailyGoalMinutes || 15) * 7;
    const weeklyGoalPct = Math.min(100, Math.round((weeklyMinutesTotal / weeklyGoalTarget) * 100));

    const totalGoalMetDays = Object.values(progress.studyActivityByDate || {}).filter(
      (u) => (u || 0) * 5 >= (progress.dailyGoalMinutes || 15)
    ).length;

    // 4-Skill percentages
    const vocabSkillPct = skillMetrics.vocabPercent || 0;
    const pronunciationPracticedTotal = scoreEntries.reduce(
      (sum, s) => sum + (s.pronunciationPracticed || 0),
      0
    );
    const pronunciationSkillPct = Math.min(
      100,
      Math.round(
        pronunciationPracticedTotal * 12 +
          completedLessonsCount * 8 +
          (progress.rolePlayCompletedIds?.length || 0) * 15
      )
    );
    const spellingSkillPct = skillMetrics.spellingPercent ?? 0;
    const grammarSkillPct = skillMetrics.grammarPercent ?? 0;

    // GitHub-Style 20-Week (140 Days) Contribution Heatmap
    const TOTAL_WEEKS = 20;
    const endSunday = new Date(now);
    const daysToSunday = (7 - endSunday.getDay()) % 7;
    endSunday.setDate(endSunday.getDate() + daysToSunday);

    const heatmapWeeks: {
      weekIndex: number;
      monthLabel: string | null;
      days: {
        dateStr: string;
        formattedDate: string;
        minutes: number;
        actions: number;
        level: 0 | 1 | 2 | 3 | 4;
        isToday: boolean;
        isFuture: boolean;
      }[];
    }[] = [];

    let lastMonth = -1;
    let totalActiveDaysInHeatmap = 0;
    let totalHeatmapMinutes = 0;

    for (let w = 0; w < TOTAL_WEEKS; w++) {
      const weekDays = [];
      let monthLabel: string | null = null;

      for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
        // dayIdx 0 = Mon ... 6 = Sun
        const offsetDays = (TOTAL_WEEKS - 1 - w) * 7 + (6 - dayIdx);
        const cellDate = new Date(endSunday);
        cellDate.setDate(endSunday.getDate() - offsetDays);

        const dateStr = cellDate.toISOString().split('T')[0];
        const isFuture = cellDate > now && cellDate.toDateString() !== now.toDateString();
        const isToday = cellDate.toDateString() === now.toDateString();
        const actions = isFuture ? 0 : progress.studyActivityByDate?.[dateStr] || 0;
        const minutes = actions * 5;

        if (actions > 0) {
          totalActiveDaysInHeatmap += 1;
          totalHeatmapMinutes += minutes;
        }

        if (dayIdx === 0) {
          const m = cellDate.getMonth();
          if (m !== lastMonth) {
            monthLabel = cellDate.toLocaleDateString('en-US', { month: 'short' });
            lastMonth = m;
          }
        }

        let level: 0 | 1 | 2 | 3 | 4 = 0;
        if (minutes >= 25) level = 4;
        else if (minutes >= 15) level = 3;
        else if (minutes >= 10) level = 2;
        else if (minutes > 0) level = 1;

        weekDays.push({
          dateStr,
          formattedDate: cellDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          minutes,
          actions,
          level,
          isToday,
          isFuture,
        });
      }

      heatmapWeeks.push({
        weekIndex: w,
        monthLabel,
        days: weekDays,
      });
    }

    // 16 Editorial Badges matching the HTML design
    const notesCount = Object.values(progress.lectureNotes || {}).filter(
      (n) => n && n.trim().length > 0
    ).length;
    const srsReviewedCount = Object.keys(progress.wordSRS || {}).length;
    const dailyChallengesDone = progress.dailyChallengeTotalCompleted || 0;
    const practicedWordsTotal = Math.max(
      unifiedMasteredWordsCount,
      progress.savedWordIds.length + srsReviewedCount
    );
    const listeningAndSpeakingCount =
      pronunciationPracticedTotal +
      (progress.rolePlayCompletedIds?.length || 0) +
      completedLessonsCount * 2;
    const sprintsCompletedCount =
      (progress.sprintHighScore || 0) > 0
        ? Math.max(1, Math.floor((progress.sprintHighScore || 0) / 10))
        : 0;

    const editorialBadges = [
      {
        id: 'first-spark',
        title: 'First spark',
        desc: 'Study 7 days in a row',
        category: 'streak' as const,
        artClass: 'from-[#F6C78E] to-[#C7684E] text-[#FFF5E6]',
        cornerLabel: '7',
        icon: 'flame' as const,
        tier: 'bronze' as const,
        earned: streakDays >= 7,
        current: Math.min(7, streakDays),
        target: 7,
        statusText:
          streakDays >= 7 ? 'BRONZE · EARNED' : `BRONZE · ${Math.max(1, 7 - streakDays)} DAYS LEFT`,
      },
      {
        id: 'page-turner',
        title: 'Page turner',
        desc: 'Complete your first 3 lessons',
        category: 'learning' as const,
        artClass: 'from-[#D4E3D2] to-[#719274] text-[#F8FFF8]',
        cornerLabel: '3',
        icon: 'book' as const,
        tier: 'silver' as const,
        earned: completedLessonsCount >= 3,
        current: Math.min(3, completedLessonsCount),
        target: 3,
        statusText:
          completedLessonsCount >= 3
            ? 'SILVER · EARNED'
            : `SILVER · ${Math.max(1, 3 - completedLessonsCount)} LESSONS LEFT`,
      },
      {
        id: 'word-collector',
        title: 'Word collector',
        desc: 'Master 50 new words',
        category: 'mastery' as const,
        artClass: 'from-[#D5D8F2] to-[#777DAA] text-white',
        cornerLabel: '50',
        icon: 'languages' as const,
        tier: 'silver' as const,
        earned: unifiedMasteredWordsCount >= 50,
        current: Math.min(50, unifiedMasteredWordsCount),
        target: 50,
        statusText:
          unifiedMasteredWordsCount >= 50
            ? 'SILVER · EARNED'
            : `SILVER · ${Math.max(1, 50 - unifiedMasteredWordsCount)} WORDS LEFT`,
      },
      {
        id: 'careful-listener',
        title: 'Careful listener',
        desc: 'Finish 10 listening practices',
        category: 'practice' as const,
        artClass: 'from-[#E7D5F0] to-[#A57DB1] text-white',
        cornerLabel: '♪',
        icon: 'ear' as const,
        tier: 'bronze' as const,
        earned: listeningAndSpeakingCount >= 10,
        current: Math.min(10, listeningAndSpeakingCount),
        target: 10,
        statusText:
          listeningAndSpeakingCount >= 10
            ? 'BRONZE · EARNED'
            : `BRONZE · ${Math.max(1, 10 - listeningAndSpeakingCount)} LEFT`,
      },
      {
        id: 'daily-bright-spot',
        title: 'Daily bright spot',
        desc: 'Finish 3 daily challenges',
        category: 'practice' as const,
        artClass: 'from-[#F6DD99] to-[#D49B43] text-[#FFFAF0]',
        cornerLabel: '3',
        icon: 'calendar' as const,
        tier: 'bronze' as const,
        earned: dailyChallengesDone >= 3,
        current: Math.min(3, dailyChallengesDone),
        target: 3,
        statusText:
          dailyChallengesDone >= 3
            ? 'BRONZE · EARNED'
            : `BRONZE · ${Math.max(1, 3 - dailyChallengesDone)} LEFT`,
      },
      {
        id: 'early-bird',
        title: 'Early bird',
        desc: 'Build a 3-day study habit',
        category: 'streak' as const,
        artClass: 'from-[#F2D1AE] to-[#CF865E] text-white',
        cornerLabel: '3',
        icon: 'sunrise' as const,
        tier: 'bronze' as const,
        earned: streakDays >= 3,
        current: Math.min(3, streakDays),
        target: 3,
        statusText:
          streakDays >= 3 ? 'BRONZE · EARNED' : `BRONZE · ${Math.max(1, 3 - streakDays)} DAYS LEFT`,
      },
      {
        id: 'thoughtful-learner',
        title: 'Thoughtful learner',
        desc: 'Save 5 lesson notes or bookmarks',
        category: 'learning' as const,
        artClass: 'from-[#CAE5E0] to-[#619A8C] text-white',
        cornerLabel: '5',
        icon: 'notes' as const,
        tier: 'bronze' as const,
        earned: notesCount + progress.savedWordIds.length >= 5,
        current: Math.min(5, notesCount + progress.savedWordIds.length),
        target: 5,
        statusText:
          notesCount + progress.savedWordIds.length >= 5
            ? 'BRONZE · EARNED'
            : `BRONZE · ${Math.max(1, 5 - (notesCount + progress.savedWordIds.length))} LEFT`,
      },
      {
        id: 'memory-maker',
        title: 'Memory maker',
        desc: 'Review 25 words with SRS',
        category: 'mastery' as const,
        artClass: 'from-[#C9D9E9] to-[#6487A5] text-white',
        cornerLabel: '25',
        icon: 'srs' as const,
        tier: 'silver' as const,
        earned: srsReviewedCount >= 25 || unifiedMasteredWordsCount >= 25,
        current: Math.min(25, Math.max(srsReviewedCount, unifiedMasteredWordsCount)),
        target: 25,
        statusText:
          srsReviewedCount >= 25 || unifiedMasteredWordsCount >= 25
            ? 'SILVER · EARNED'
            : `SILVER · ${Math.max(1, 25 - Math.max(srsReviewedCount, unifiedMasteredWordsCount))} WORDS LEFT`,
      },
      {
        id: 'streak-keeper',
        title: 'Streak keeper',
        desc: 'Study 14 days in a row',
        category: 'streak' as const,
        artClass: 'from-[#F4DAA5] to-[#C18B47] text-[#6A4623]',
        cornerLabel: '14',
        icon: 'flame' as const,
        tier: 'gold' as const,
        earned: streakDays >= 14,
        current: Math.min(14, streakDays),
        target: 14,
        statusText:
          streakDays >= 14
            ? 'GOLD · EARNED'
            : `GOLD · ${Math.max(1, 14 - streakDays)} DAYS LEFT`,
      },
      {
        id: 'lesson-voyager',
        title: 'Lesson voyager',
        desc: 'Complete 5 full lessons',
        category: 'learning' as const,
        artClass: 'from-[#D4E3D2] to-[#719274] text-white',
        cornerLabel: '5',
        icon: 'grad' as const,
        tier: 'gold' as const,
        earned: completedLessonsCount >= 5,
        current: Math.min(5, completedLessonsCount),
        target: 5,
        statusText:
          completedLessonsCount >= 5
            ? 'GOLD · EARNED'
            : `GOLD · ${Math.max(1, 5 - completedLessonsCount)} LESSONS LEFT`,
      },
      {
        id: 'word-champion',
        title: 'Word champion',
        desc: 'Master 100 vocabulary words',
        category: 'mastery' as const,
        artClass: 'from-[#F6DD99] to-[#D49B43] text-[#6A4623]',
        cornerLabel: '100',
        icon: 'trophy' as const,
        tier: 'gold' as const,
        earned: unifiedMasteredWordsCount >= 100,
        current: Math.min(100, unifiedMasteredWordsCount),
        target: 100,
        statusText:
          unifiedMasteredWordsCount >= 100
            ? 'GOLD · EARNED'
            : `GOLD · ${Math.max(1, 100 - unifiedMasteredWordsCount)} WORDS LEFT`,
      },
      {
        id: 'brave-voice',
        title: 'Brave voice',
        desc: 'Complete 20 speaking practices',
        category: 'practice' as const,
        artClass: 'from-[#E7D5F0] to-[#A57DB1] text-white',
        cornerLabel: '20',
        icon: 'mic' as const,
        tier: 'gold' as const,
        earned: listeningAndSpeakingCount >= 20,
        current: Math.min(20, listeningAndSpeakingCount),
        target: 20,
        statusText:
          listeningAndSpeakingCount >= 20 ? 'GOLD · EARNED' : 'GOLD · KEEP PRACTISING',
      },
      {
        id: 'one-month-strong',
        title: 'One month strong',
        desc: 'Build a 30-day learning streak',
        category: 'streak' as const,
        artClass: 'from-[#F6C78E] to-[#C7684E] text-white',
        cornerLabel: '30',
        icon: 'calendar' as const,
        tier: 'platinum' as const,
        earned: streakDays >= 30,
        current: Math.min(30, streakDays),
        target: 30,
        statusText: streakDays >= 30 ? 'PLATINUM · EARNED' : 'PLATINUM',
      },
      {
        id: 'curriculum-complete',
        title: 'Curriculum complete',
        desc: 'Finish all 12 core lessons',
        category: 'learning' as const,
        artClass: 'from-[#D4E3D2] to-[#719274] text-white',
        cornerLabel: '12',
        icon: 'book' as const,
        tier: 'platinum' as const,
        earned: completedLessonsCount >= 12,
        current: Math.min(12, completedLessonsCount),
        target: 12,
        statusText: completedLessonsCount >= 12 ? 'PLATINUM · EARNED' : 'PLATINUM',
      },
      {
        id: 'quick-thinker',
        title: 'Quick thinker',
        desc: 'Complete 10 spelling sprints',
        category: 'practice' as const,
        artClass: 'from-[#F6DD99] to-[#D49B43] text-white',
        cornerLabel: '10',
        icon: 'zap' as const,
        tier: 'silver' as const,
        earned: sprintsCompletedCount >= 10,
        current: Math.min(10, sprintsCompletedCount),
        target: 10,
        statusText: sprintsCompletedCount >= 10 ? 'SILVER · EARNED' : 'SILVER',
      },
      {
        id: 'language-architect',
        title: 'Language architect',
        desc: 'Practise 500 unique words',
        category: 'mastery' as const,
        artClass: 'from-[#C9D9E9] to-[#6487A5] text-white',
        cornerLabel: '500',
        icon: 'brain' as const,
        tier: 'platinum' as const,
        earned: practicedWordsTotal >= 500,
        current: Math.min(500, practicedWordsTotal),
        target: 500,
        statusText: practicedWordsTotal >= 500 ? 'PLATINUM · EARNED' : 'PLATINUM',
      },
    ];

    const earnedEditorialCount = editorialBadges.filter((b) => b.earned).length;
    const nextLockedBadge =
      editorialBadges.find((b) => !b.earned) || editorialBadges[editorialBadges.length - 1];
    const nextLockedPct = Math.min(
      100,
      Math.round((nextLockedBadge.current / nextLockedBadge.target) * 100)
    );

    const visibleEditorialBadges = editorialBadges
      .slice(0, showAll16Badges ? 16 : 12)
      .filter((b) => {
        if (badgeCategoryFilter === 'all') return true;
        if (badgeCategoryFilter === 'earned') return b.earned;
        return b.category === badgeCategoryFilter;
      });

    const renderBadgeIcon = (iconType: (typeof editorialBadges)[number]['icon']) => {
      switch (iconType) {
        case 'flame':
          return <Flame className="w-5 h-5" />;
        case 'book':
          return <BookOpen className="w-5 h-5" />;
        case 'languages':
          return <Globe className="w-5 h-5" />;
        case 'ear':
          return <Headphones className="w-5 h-5" />;
        case 'calendar':
          return <Calendar className="w-5 h-5" />;
        case 'sunrise':
          return <Sun className="w-5 h-5" />;
        case 'notes':
          return <PenTool className="w-5 h-5" />;
        case 'srs':
          return <RotateCcw className="w-5 h-5" />;
        case 'grad':
          return <GraduationCap className="w-5 h-5" />;
        case 'trophy':
          return <Trophy className="w-5 h-5" />;
        case 'mic':
          return <Mic className="w-5 h-5" />;
        case 'zap':
          return <Zap className="w-5 h-5" />;
        case 'brain':
          return <Brain className="w-5 h-5" />;
      }
    };

    const b1Track = trackStats.find((t) => t.level === 'B1') || { done: 0, total: 4, pct: 0 };
    const b2Track = trackStats.find((t) => t.level === 'B2') || { done: 0, total: 4, pct: 0 };
    const c1Track = trackStats.find((t) => t.level === 'C1') || { done: 0, total: 4, pct: 0 };

    return (
      <div className="w-full max-w-[82rem] mx-auto px-[0.625rem] sm:px-[1rem] lg:px-[1.5rem] py-[0.875rem] sm:py-[1.25rem] pb-24 space-y-5">
        {/* Top Eyebrow + Title + Progress / Achievements Toggle + Period Filter */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#B7332C] dark:text-[#F87171]">
              YOUR LEARNING STORY
            </div>
            <h1 className="font-serif text-3xl sm:text-[34px] font-bold text-[#282522] dark:text-[#F1ECE4] tracking-tight mt-1">
              Progress &amp; achievements
            </h1>
            <p className="text-xs sm:text-sm text-[#79736D] dark:text-[#A69F96] mt-1">
              Every small step is building lasting confidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-end shrink-0">
            {/* Segmented Toggle Button: Progress vs Achievements */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#F0ECE5] dark:bg-[#262422] border border-[#E8E2D9] dark:border-[#3B3834]">
              <button
                type="button"
                onClick={() => setProgressSubView('overview')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  progressSubView === 'overview'
                    ? 'bg-[#FFFDF9] dark:bg-[#1E1D1B] text-[#B7332C] dark:text-[#F0A59B] shadow-xs'
                    : 'text-[#615C55] dark:text-[#C7C0B6] hover:text-[#282522]'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Progress</span>
              </button>
              <button
                type="button"
                onClick={() => setProgressSubView('achievements')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                  progressSubView === 'achievements'
                    ? 'bg-[#B7332C] text-white shadow-xs'
                    : 'text-[#615C55] dark:text-[#C7C0B6] hover:text-[#282522]'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>
                  Achievements ({earnedEditorialCount}/{editorialBadges.length})
                </span>
              </button>
            </div>

            <EditorialSelectDropdown
              ariaLabel="Select progress period"
              value={progressPeriod}
              compact
              options={[
                { value: 'week', label: 'This week', sub: 'Current 7-day learning rhythm' },
                { value: 'month', label: 'This month', sub: 'Last 30 days of study activity' },
                { value: 'all', label: 'All time', sub: 'Complete BhashaSetu history' },
              ]}
              onChange={(val) => setProgressPeriod(val)}
            />
          </div>
        </div>

        {/* Hero Welcome Banner (Matching HTML .progress-welcome) */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#29231F] via-[#45352E] to-[#6F483B] text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          {/* Decorative Concentric Background Rings */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute right-[10%] -top-32 w-68 h-68 rounded-full border border-white/10 shadow-[0_0_0_24px_rgba(255,255,255,0.03),0_0_0_50px_rgba(255,255,255,0.02)]"
          />

          <div className="relative z-10 max-w-xl space-y-2.5">
            <div className="flex items-center gap-2 text-[#E7B979] text-[10px] font-bold tracking-[0.14em] uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LOOK AT YOU GO</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-[30px] leading-[1.2] font-bold tracking-tight">
              {streakDays} {streakDays === 1 ? 'day' : 'days'} of showing up.
              <br />
              <em className="font-normal text-[#E8BD86] italic">
                That’s something to be proud of.
              </em>
            </h2>
            <p className="text-xs sm:text-sm text-[#E0D1C7] max-w-md leading-relaxed">
              You’ve spent {studyTimeFormatted} learning{' '}
              {progressPeriod === 'week'
                ? 'this week'
                : progressPeriod === 'month'
                ? 'this month'
                : 'so far'}
              . Your steady practice is turning new words into natural confidence.
            </p>
            <div className="flex flex-wrap gap-2 pt-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 text-[#F4E4D5] text-[11px]">
                <Flame className="w-3.5 h-3.5 text-[#EFBF7A]" />
                <span>Best streak · {bestStreak} days</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/12 text-[#F4E4D5] text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-[#EFBF7A]" />
                <span>{activeDaysThisWeek} of 7 days this week</span>
              </span>
            </div>
          </div>

          {/* Right Orbital Streak Emblem */}
          <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center self-center sm:mr-4">
            <div className="absolute w-34 h-26 rounded-full border border-[#F0CF9D]/35 -rotate-25" />
            <div className="absolute w-26 h-34 rounded-full border border-[#F0CF9D]/20 rotate-35" />
            <div className="relative w-22 h-22 rounded-full bg-radial from-[#F6D79F] to-[#C18447] shadow-[0_0_0_6px_rgba(215,166,107,0.16),0_9px_25px_rgba(16,10,8,0.45)] text-[#512F20] flex flex-col items-center justify-center">
              <Flame className="w-5 h-5" />
              <b className="font-serif text-2xl leading-none mt-0.5">{streakDays}</b>
              <small className="text-[7px] font-bold tracking-[0.12em] mt-1">
                DAY STREAK
              </small>
            </div>
            <span className="absolute top-3 right-4 text-[#F1CB91] text-base select-none">
              ✦
            </span>
            <span className="absolute bottom-2.5 left-3 text-[#F1CB91] text-lg select-none">
              ✧
            </span>
          </div>
        </section>

        {/* Image 2 Inspired: 7-Day Calendar Checkmark Strip + Circular Track Progress Ring + Cards Collected */}
        {(() => {
          const activeLevel = progress.selectedLevel || 'B1';
          const currentTrackObj =
            activeLevel === 'B1' ? b1Track : activeLevel === 'B2' ? b2Track : c1Track;
          const activeTrackName =
            activeLevel === 'B1'
              ? 'B1 FOUNDATION'
              : activeLevel === 'B2'
              ? 'B2 WORKPLACE'
              : 'C1 ADVANCED';

          // Compute overall or active track completion % (including step progress)
          const trackLectures = lectures.filter((l) => l.level === activeLevel);
          const totalTrackSteps = Math.max(1, trackLectures.length * 5);
          const doneTrackSteps = trackLectures.reduce((acc, l) => {
            if (progress.completedUnitIds.includes(l.id)) return acc + 5;
            return acc + (progress.completedStepsByLecture?.[l.id]?.length || 0);
          }, 0);
          const ringPct = Math.min(
            100,
            Math.max(currentTrackObj.pct, Math.round((doneTrackSteps / totalTrackSteps) * 100))
          );

          // Expected completion date based on remaining lessons in track (~2 days per lesson)
          const remainingLessons = Math.max(
            0,
            currentTrackObj.total - currentTrackObj.done
          );
          const expectedDate = new Date(now);
          expectedDate.setDate(now.getDate() + Math.max(1, remainingLessons * 3));
          const expectedDateFormatted = expectedDate
            .toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
            .toUpperCase();

          // SVG Ring math
          const radius = 68;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset =
            circumference - (Math.max(4, ringPct) / 100) * circumference;

          // Cards Collected counts (Vocabulary, Grammar, Pronunciation)
          const vocabCollected = Math.max(
            unifiedMasteredWordsCount,
            progress.savedWordIds.length + Object.keys(progress.wordSRS || {}).length
          );
          const grammarCollected =
            scoreEntries.reduce((sum, s) => sum + (s.grammarScore || 0), 0) +
            completedLessonsCount * 3 +
            12;
          const pronunciationCollected =
            listeningAndSpeakingCount + completedLessonsCount * 4 + 18;

          return (
            <section className="rounded-2xl bg-[#FFFDF9] dark:bg-[#1E1C19] border border-[#E8E2D9] dark:border-[#34302B] p-5 sm:p-6 space-y-6">
              {/* Top 7-Day Calendar Checkmark & Date Strip (Mon Tue Wed Thu Fri Sat Sun) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#EFEAE0] dark:border-[#2E2924]">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171]">
                    WEEKLY ATTENDANCE &amp; TRACK MILESTONE
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
                    Daily check-in &amp; cards collected
                  </h3>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 max-w-md w-full sm:w-auto">
                  {weekEntries.map((day) => {
                    const hasStudied = day.minutes > 0 || (day.isToday && streakDays > 0);
                    return (
                      <div
                        key={day.idx}
                        title={`${day.dayName}: ${day.minutes} min studied`}
                        className={`px-2 py-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-all ${
                          day.isToday
                            ? 'border-2 border-[#9E2A2B] dark:border-[#F87171] bg-[#FAF8F4] dark:bg-[#282420] shadow-xs'
                            : 'border border-transparent bg-[#F5F2EB]/60 dark:bg-[#161412]'
                        }`}
                      >
                        <span
                          className={`text-[11px] font-medium ${
                            day.isToday
                              ? 'text-[#9E2A2B] dark:text-[#F87171] font-bold'
                              : 'text-[#78716C] dark:text-[#A8A29E]'
                          }`}
                        >
                          {day.shortLabel}
                        </span>
                        {hasStudied ? (
                          <span className="w-6 h-6 rounded-full bg-[#E3EFE8] dark:bg-emerald-950/70 text-[#2D6A4F] dark:text-emerald-400 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 stroke-[2.75]" />
                          </span>
                        ) : (
                          <span className="w-6 h-6 flex items-center justify-center font-serif font-bold text-sm text-[#57534E] dark:text-[#A8A29E] tabular-nums">
                            {day.dayNumber}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Lower Split: Left Circular Track Gauge + Right "Cards Collected" 3-Column Tiles */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left (5 cols): Circular Progress Gauge + Expected Completion Date */}
                <div className="lg:col-span-5 flex flex-col items-center text-center space-y-3 py-2">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg className="w-44 h-44 -rotate-90" viewBox="0 0 160 160">
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        className="text-[#EAE5DC] dark:text-[#2C2824]"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        className="text-[#9E2A2B] dark:text-[#F87171] transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center px-4">
                      <span className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                        You&apos;ve completed
                      </span>
                      <span className="font-serif font-bold text-4xl text-[#1C1917] dark:text-[#F5F2EB] tabular-nums leading-none my-1">
                        {ringPct}
                        <span className="text-xl font-sans">%</span>
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9E2A2B] dark:text-[#F87171]">
                        of {activeTrackName}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-xs font-bold tracking-[0.08em] text-[#1C1917] dark:text-[#F5F2EB]">
                      { remainingLessons === 0 ? 'TRACK COMPLETED ✓' : expectedDateFormatted }
                    </div>
                    <div className="text-[11px] text-[#78716C] dark:text-[#A8A29E]">
                      Expected Completion Date · Based on your daily goal pace
                    </div>
                  </div>
                </div>

                {/* Right (7 cols): Cards Collected (Vocabulary · Grammar · Pronunciation) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-lg text-[#1C1917] dark:text-[#F5F2EB]">
                      Cards Collected
                    </h4>
                    <span className="text-xs text-[#78716C] dark:text-[#A8A29E]">
                      Tap a deck to practice
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenDictionary?.()}
                      className="group rounded-2xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all"
                    >
                      <span className="font-serif font-bold text-2xl sm:text-3xl text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#9E2A2B] dark:group-hover:text-[#F87171] tabular-nums transition-colors">
                        {vocabCollected}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] text-[#78716C] dark:text-[#A8A29E] mt-2">
                        VOCABULARY
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenArenaTool?.('interference')}
                      className="group rounded-2xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#2D6A4F] p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all"
                    >
                      <span className="font-serif font-bold text-2xl sm:text-3xl text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#2D6A4F] dark:group-hover:text-emerald-400 tabular-nums transition-colors">
                        {grammarCollected}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] text-[#78716C] dark:text-[#A8A29E] mt-2">
                        GRAMMAR
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenArenaTool?.('shadowing')}
                      className="group rounded-2xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#C88A32] p-4 sm:p-5 flex flex-col items-center justify-center text-center transition-all"
                    >
                      <span className="font-serif font-bold text-2xl sm:text-3xl text-[#1C1917] dark:text-[#F5F2EB] group-hover:text-[#C88A32] dark:group-hover:text-amber-400 tabular-nums transition-colors">
                        {pronunciationCollected}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.1em] text-[#78716C] dark:text-[#A8A29E] mt-2">
                        PRONUNCIATION
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* 4 KPI Summary Cards Row (Matching HTML .progress-kpis) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* KPI 1: Study time */}
          <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#F7E9E5] dark:bg-red-950/50 text-[#A94D43] dark:text-red-300 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </span>
              <span className="text-xs text-[#79736D] dark:text-[#A69F96]">Study time</span>
            </div>
            <div className="font-serif text-2xl text-[#282522] dark:text-[#F1ECE4] mt-3">
              {studyTimeFormatted}
            </div>
            <div className="text-[11px] text-[#63846C] dark:text-emerald-400 mt-1">
              {weeklyMinutesTotal} min studied this week
            </div>
          </div>

          {/* KPI 2: Lessons finished */}
          <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#E8F1EB] dark:bg-emerald-950/50 text-[#4D7A5B] dark:text-emerald-300 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </span>
              <span className="text-xs text-[#79736D] dark:text-[#A69F96]">
                Lessons finished
              </span>
            </div>
            <div className="font-serif text-2xl text-[#282522] dark:text-[#F1ECE4] mt-3">
              {completedLessonsCount}{' '}
              <span className="text-xs font-sans text-[#79736D]">
                / {totalLessonsCount}
              </span>
            </div>
            <div className="text-[11px] text-[#63846C] dark:text-emerald-400 mt-1">
              Next up: Lesson{' '}
              {String(nextUnfinishedLecture?.lectureNumber || 1).padStart(2, '0')}
            </div>
          </div>

          {/* KPI 3: Words practised */}
          <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#F6EEDF] dark:bg-amber-950/50 text-[#A57735] dark:text-amber-300 flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </span>
              <span className="text-xs text-[#79736D] dark:text-[#A69F96]">
                Words practised
              </span>
            </div>
            <div className="font-serif text-2xl text-[#282522] dark:text-[#F1ECE4] mt-3">
              {practicedWordsTotal}
            </div>
            <div className="text-[11px] text-[#63846C] dark:text-emerald-400 mt-1">
              {unifiedMasteredWordsCount} words mastered
            </div>
          </div>

          {/* KPI 4: Daily goal met */}
          <div className="rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-lg bg-[#EAF0F4] dark:bg-sky-950/50 text-[#587992] dark:text-sky-300 flex items-center justify-center shrink-0">
                <Target className="w-4 h-4" />
              </span>
              <span className="text-xs text-[#79736D] dark:text-[#A69F96]">
                Daily goal met
              </span>
            </div>
            <div className="font-serif text-2xl text-[#282522] dark:text-[#F1ECE4] mt-3">
              {totalGoalMetDays}{' '}
              <span className="text-xs font-sans text-[#79736D]">/ 12 days</span>
            </div>
            <div className="text-[11px] text-[#63846C] dark:text-emerald-400 mt-1">
              {Math.max(1, 12 - totalGoalMetDays)} more to your next badge
            </div>
          </div>
        </section>

        {progressSubView === 'overview' ? (
          /* ================================================================= */
          /* PROGRESS SUB-VIEW: 2x2 ANALYTICS + GITHUB HEATMAP + TIMELINE      */
          /* ================================================================= */
          <div className="space-y-6">
            {/* 2x2 Analytics Grid matching HTML .analytics-grid */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Panel 1 (7 cols): Your learning rhythm (Study minutes each day) */}
              <div className="lg:col-span-7 rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-5 sm:p-6 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B7332C] dark:text-[#F87171]">
                      CONSISTENCY BUILDS FLUENCY
                    </div>
                    <h2 className="font-serif text-xl text-[#282522] dark:text-[#F1ECE4] mt-1">
                      Your learning rhythm
                    </h2>
                    <p className="text-xs text-[#79736D] dark:text-[#A69F96] mt-0.5">
                      Study minutes each day · this week
                    </p>
                  </div>
                  <div className="text-right">
                    <b className="font-serif text-2xl sm:text-[26px] font-normal text-[#282522] dark:text-[#F1ECE4] block leading-none">
                      {weeklyMinutesTotal}
                    </b>
                    <span className="text-[10px] text-[#79736D] dark:text-[#A69F96]">
                      minutes
                    </span>
                  </div>
                </div>

                {/* Bar Chart with Y-Axis & Gridlines */}
                <div className="h-40 flex gap-3 mt-4">
                  <div className="flex flex-col justify-between text-[10px] text-[#A29B92] pb-6">
                    <span>{maxDayMinutes}</span>
                    <span>{Math.round(maxDayMinutes * 0.75)}</span>
                    <span>{Math.round(maxDayMinutes * 0.5)}</span>
                    <span>{Math.round(maxDayMinutes * 0.25)}</span>
                    <span>0</span>
                  </div>

                  <div className="relative flex-1 flex items-end justify-around gap-2 pt-4 px-1">
                    {/* Horizontal Gridlines */}
                    <div className="absolute inset-x-0 top-[10%] h-px bg-[#EEE9E2] dark:bg-[#3E3B37]" />
                    <div className="absolute inset-x-0 top-[32%] h-px bg-[#EEE9E2] dark:bg-[#3E3B37]" />
                    <div className="absolute inset-x-0 top-[54%] h-px bg-[#EEE9E2] dark:bg-[#3E3B37]" />
                    <div className="absolute inset-x-0 top-[76%] h-px bg-[#EEE9E2] dark:bg-[#3E3B37]" />

                    {weekEntries.map((entry) => {
                      const heightPct =
                        entry.minutes > 0
                          ? Math.min(100, Math.max(12, Math.round((entry.minutes / maxDayMinutes) * 100)))
                          : 4;
                      const isBest =
                        entry.minutes > 0 && entry.minutes === bestDayEntry.minutes;

                      let barGradient = 'bg-[#ECE7DF] dark:bg-[#3A3632]';
                      if (entry.isToday && entry.minutes > 0) {
                        barGradient = 'bg-gradient-to-b from-[#D78370] to-[#B74B40]';
                      } else if (isBest) {
                        barGradient = 'bg-gradient-to-b from-[#D4A45E] to-[#B5793E]';
                      } else if (entry.minutes > 0) {
                        barGradient = 'bg-gradient-to-b from-[#9EAF91] to-[#6F8D70]';
                      } else if (entry.isToday) {
                        barGradient = 'bg-[#D78370]/50';
                      }

                      return (
                        <div
                          key={entry.idx}
                          className="relative z-10 flex-1 h-full flex flex-col items-center justify-end gap-1.5"
                        >
                          <div className="w-full flex-1 flex items-end justify-center">
                            <div
                              className={`w-full max-w-[26px] rounded-t-md rounded-b-xs relative transition-all duration-300 ${barGradient}`}
                              style={{ height: `${heightPct}%` }}
                            >
                              {entry.minutes > 0 && (
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-[#777067] dark:text-[#A69F96] font-medium">
                                  {entry.minutes}
                                </span>
                              )}
                            </div>
                          </div>
                          <small className="text-[10px] text-[#79736D] dark:text-[#A69F96]">
                            {entry.letter}
                          </small>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 mt-2 border-t border-[#E8E2D9] dark:border-[#3B3834] flex items-center justify-between text-[11px] text-[#79736D] dark:text-[#A69F96]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#79937B]" />
                    <span>Your study time</span>
                  </span>
                  <span>
                    {bestDayEntry.minutes > 0
                      ? `Best day: ${bestDayEntry.dayName} · ${bestDayEntry.minutes} min`
                      : 'Complete a lesson or drill today to start your week'}
                  </span>
                </div>
              </div>

              {/* Panel 2 (5 cols): Weekly goal conic ring + 7 day circles */}
              <div className="lg:col-span-5 rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-5 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B7332C] dark:text-[#F87171]">
                    A HABIT THAT STICKS
                  </div>
                  <h2 className="font-serif text-xl text-[#282522] dark:text-[#F1ECE4] mt-1">
                    Weekly goal
                  </h2>
                  <p className="text-xs text-[#79736D] dark:text-[#A69F96] mt-0.5">
                    {weeklyMinutesTotal >= weeklyGoalTarget
                      ? `You’ve reached your ${weeklyGoalTarget}-minute weekly goal!`
                      : `You’re building toward your ${weeklyGoalTarget}-minute goal.`}
                  </p>
                </div>

                {/* Conic Progress Ring + Copy */}
                <div className="flex items-center gap-5 my-4">
                  <div
                    className="w-24 h-24 rounded-full grid place-items-center relative shrink-0"
                    style={{
                      background: `conic-gradient(#688E70 0 ${weeklyGoalPct}%, #EEE9E2 ${weeklyGoalPct}% 100%)`,
                    }}
                  >
                    <div className="w-19 h-19 rounded-full bg-[#FFFDF9] dark:bg-[#292725] flex flex-col items-center justify-center">
                      <b className="font-serif text-xl text-[#282522] dark:text-[#F1ECE4] leading-none">
                        {weeklyGoalPct}%
                      </b>
                      <small className="text-[8px] tracking-wider text-[#79736D] uppercase mt-1">
                        THIS WEEK
                      </small>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <strong className="font-serif text-lg font-normal text-[#282522] dark:text-[#F1ECE4] block">
                      {weeklyMinutesTotal}{' '}
                      <small className="text-xs font-sans text-[#79736D]">
                        / {weeklyGoalTarget} min
                      </small>
                    </strong>
                    <p className="text-[11px] text-[#79736D] dark:text-[#A69F96] leading-relaxed">
                      {weeklyMinutesTotal >= weeklyGoalTarget
                        ? 'Wonderful consistency this week!'
                        : `Just ${Math.max(0, weeklyGoalTarget - weeklyMinutesTotal)} more minutes to reach your goal.`}
                    </p>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#E8F1EB] dark:bg-emerald-950/60 text-[#3C705D] dark:text-emerald-300 text-[10px] font-medium">
                      {weeklyGoalPct >= 50 ? 'On track' : 'Building rhythm'}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-1.5">
                    {weekEntries.map((d) => (
                      <span
                        key={d.idx}
                        className={`w-7 h-7 rounded-full grid place-items-center text-[10px] font-medium ${
                          d.isToday
                            ? 'bg-[#B7332C] text-white'
                            : d.minutes > 0
                            ? 'bg-[#E5EEE6] dark:bg-emerald-950/60 text-[#487052] dark:text-emerald-300'
                            : 'bg-[#F0ECE5] dark:bg-[#393631] text-[#79736D]'
                        }`}
                      >
                        {d.letter}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#79736D] dark:text-[#A69F96] mt-2">
                    <span>{activeDaysThisWeek} study days</span>
                    <span>{Math.max(0, 7 - activeDaysThisWeek)} days left</span>
                  </div>
                </div>
              </div>

              {/* Panel 3 (6 cols): Learning balance (4 Skills) */}
              <div className="lg:col-span-6 rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-5 sm:p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B7332C] dark:text-[#F87171]">
                      YOUR SKILLS, GROWING
                    </div>
                    <h2 className="font-serif text-xl text-[#282522] dark:text-[#F1ECE4] mt-1">
                      Learning balance
                    </h2>
                  </div>
                  <span className="text-xs text-[#79736D] dark:text-[#A69F96]">
                    Last 30 days
                  </span>
                </div>

                <div className="space-y-3.5 mt-4">
                  {[
                    {
                      name: 'Vocabulary',
                      status: vocabSkillPct >= 60 ? 'Strong progress' : 'Growing steadily',
                      pct: vocabSkillPct,
                      iconBg: 'bg-[#F7E9E5] text-[#A94D43]',
                      barColor: 'bg-[#79947B]',
                      icon: <BookOpen className="w-3.5 h-3.5" />,
                    },
                    {
                      name: 'Pronunciation',
                      status: pronunciationSkillPct >= 50 ? 'Growing steadily' : 'On your way',
                      pct: pronunciationSkillPct,
                      iconBg: 'bg-[#EAF0F4] text-[#55738A]',
                      barColor: 'bg-[#68859B]',
                      icon: <Volume2 className="w-3.5 h-3.5" />,
                    },
                    {
                      name: 'Spelling',
                      status: spellingSkillPct >= 50 ? 'Good momentum' : 'Keep practising',
                      pct: spellingSkillPct,
                      iconBg: 'bg-[#F6EEDF] text-[#A57735]',
                      barColor: 'bg-[#C49550]',
                      icon: <PenTool className="w-3.5 h-3.5" />,
                    },
                    {
                      name: 'Grammar',
                      status: grammarSkillPct >= 50 ? 'New confidence' : 'Building foundations',
                      pct: grammarSkillPct,
                      iconBg: 'bg-[#E8F1EB] text-[#4D7A5B]',
                      barColor: 'bg-[#B87769]',
                      icon: <MessageSquare className="w-3.5 h-3.5" />,
                    },
                  ].map((sk) => (
                    <div key={sk.name} className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${sk.iconBg}`}
                      >
                        {sk.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between text-xs">
                          <b className="font-semibold text-[#282522] dark:text-[#F1ECE4]">
                            {sk.name}
                          </b>
                          <span className="text-[11px] text-[#79736D] dark:text-[#A69F96]">
                            {sk.status}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#EEE9E2] dark:bg-[#403C37] mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${sk.barColor} transition-all duration-300`}
                            style={{ width: `${Math.max(4, sk.pct)}%` }}
                          />
                        </div>
                      </div>
                      <strong className="text-xs font-semibold text-[#282522] dark:text-[#F1ECE4] w-9 text-right">
                        {sk.pct}%
                      </strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel 4 (6 cols): Your CEFR journey */}
              <div className="lg:col-span-6 rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-5 sm:p-6 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B7332C] dark:text-[#F87171]">
                      A PATH WORTH CELEBRATING
                    </div>
                    <h2 className="font-serif text-xl text-[#282522] dark:text-[#F1ECE4] mt-1">
                      Your CEFR journey
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#EAF0F4] dark:bg-sky-950/60 text-[#55738A] dark:text-sky-300 text-[10px] font-semibold">
                    {progress.selectedLevel || 'B1'}{' '}
                    {progress.selectedLevel === 'C1'
                      ? 'Advanced'
                      : progress.selectedLevel === 'B2'
                      ? 'Workplace'
                      : 'Foundation'}
                  </span>
                </div>

                {/* 3-Node Connected Stepper */}
                <div className="flex items-center my-6 px-2">
                  {/* Node B1 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (b1Track.done >= b1Track.total) {
                        speechService.playCelebrationChime('milestone');
                      } else if (nextUnfinishedLecture) {
                        onOpenLecture(nextUnfinishedLecture.id);
                      }
                    }}
                    title={
                      b1Track.done >= b1Track.total
                        ? 'B1 Foundation Track Completed — Tap to celebrate!'
                        : 'Continue B1 Foundation Track'
                    }
                    className="w-16 flex flex-col items-center gap-1 shrink-0 focus:outline-none group"
                  >
                    <span
                      className={`w-9 h-9 rounded-full grid place-items-center text-xs font-bold transition-transform group-hover:scale-105 ${
                        b1Track.done >= b1Track.total
                          ? 'bg-[#E6EFE7] text-[#52765B]'
                          : 'bg-[#B7332C] text-white shadow-[0_0_0_5px_#F8E9E5] dark:shadow-none'
                      }`}
                    >
                      {b1Track.done >= b1Track.total ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        String(nextUnfinishedLecture?.lectureNumber || 1).padStart(2, '0')
                      )}
                    </span>
                    <b className="text-xs text-[#282522] dark:text-[#F1ECE4]">B1</b>
                    <small className="text-[10px] text-[#79736D]">Foundation</small>
                  </button>

                  {/* Segment B1 -> B2 */}
                  <div className="h-1 flex-1 bg-[#ECE7DF] dark:bg-[#403C37] -mx-1 mb-7 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#77947A] rounded-full transition-all duration-300"
                      style={{ width: `${b1Track.pct}%` }}
                    />
                  </div>

                  {/* Node B2 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (b2Track.done >= b2Track.total) {
                        speechService.playCelebrationChime('milestone');
                      } else if (b1Track.done >= b1Track.total && nextUnfinishedLecture) {
                        onOpenLecture(nextUnfinishedLecture.id);
                      }
                    }}
                    title={
                      b2Track.done >= b2Track.total
                        ? 'B2 Workplace Track Completed — Tap to celebrate!'
                        : 'B2 Workplace Track'
                    }
                    className="w-16 flex flex-col items-center gap-1 shrink-0 focus:outline-none group"
                  >
                    <span
                      className={`w-9 h-9 rounded-full grid place-items-center text-xs font-bold transition-transform group-hover:scale-105 ${
                        b2Track.done >= b2Track.total
                          ? 'bg-[#E6EFE7] text-[#52765B]'
                          : b1Track.done >= b1Track.total
                          ? 'bg-[#B7332C] text-white shadow-[0_0_0_5px_#F8E9E5] dark:shadow-none'
                          : 'bg-[#F0ECE5] dark:bg-[#383530] text-[#A49C92]'
                      }`}
                    >
                      {b2Track.done >= b2Track.total ? (
                        <Check className="w-4 h-4" />
                      ) : b1Track.done >= b1Track.total ? (
                        String(nextUnfinishedLecture?.lectureNumber || 5).padStart(2, '0')
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <b className="text-xs text-[#282522] dark:text-[#F1ECE4]">B2</b>
                    <small className="text-[10px] text-[#79736D]">Workplace</small>
                  </button>

                  {/* Segment B2 -> C1 */}
                  <div className="h-1 flex-1 bg-[#ECE7DF] dark:bg-[#403C37] -mx-1 mb-7 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#77947A] rounded-full transition-all duration-300"
                      style={{ width: `${b2Track.pct}%` }}
                    />
                  </div>

                  {/* Node C1 */}
                  <button
                    type="button"
                    onClick={() => {
                      if (c1Track.done >= c1Track.total) {
                        speechService.playCelebrationChime('milestone');
                      } else if (b2Track.done >= b2Track.total && nextUnfinishedLecture) {
                        onOpenLecture(nextUnfinishedLecture.id);
                      }
                    }}
                    title={
                      c1Track.done >= c1Track.total
                        ? 'C1 Advanced Track Completed — Tap to celebrate!'
                        : 'C1 Advanced Track'
                    }
                    className="w-16 flex flex-col items-center gap-1 shrink-0 focus:outline-none group"
                  >
                    <span
                      className={`w-9 h-9 rounded-full grid place-items-center text-xs font-bold transition-transform group-hover:scale-105 ${
                        c1Track.done >= c1Track.total
                          ? 'bg-[#E6EFE7] text-[#52765B]'
                          : b2Track.done >= b2Track.total
                          ? 'bg-[#B7332C] text-white shadow-[0_0_0_5px_#F8E9E5] dark:shadow-none'
                          : 'bg-[#F0ECE5] dark:bg-[#383530] text-[#A49C92]'
                      }`}
                    >
                      {c1Track.done >= c1Track.total ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Lock className="w-3.5 h-3.5" />
                      )}
                    </span>
                    <b className="text-xs text-[#282522] dark:text-[#F1ECE4]">C1</b>
                    <small className="text-[10px] text-[#79736D]">Advanced</small>
                  </button>
                </div>

                {/* Bottom Callout */}
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F2E9] dark:bg-[#34302A] text-xs text-[#79736D] dark:text-[#A69F96]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#B6813D] shrink-0" />
                    <span>
                      <b className="text-[#514539] dark:text-[#E3D4C4]">
                        One lesson at a time.
                      </b>{' '}
                      Complete Lesson{' '}
                      {String(nextUnfinishedLecture?.lectureNumber || 1).padStart(2, '0')} to open
                      your next milestone.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCertificateTrack(progress.selectedLevel || 'B1')}
                    className="text-[11px] font-semibold text-[#B7332C] dark:text-[#F87171] hover:underline shrink-0"
                  >
                    Certificate →
                  </button>
                </div>
              </div>
            </section>

            {/* GitHub-Style Contribution Heatmap Card */}
            <section className="rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-5 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B7332C] dark:text-[#F87171]">
                    DAILY CONSISTENCY GRAPH
                  </div>
                  <h2 className="font-serif text-xl text-[#282522] dark:text-[#F1ECE4] mt-0.5">
                    Study activity heatmap
                  </h2>
                  <p className="text-xs text-[#79736D] dark:text-[#A69F96]">
                    {totalActiveDaysInHeatmap} active study{' '}
                    {totalActiveDaysInHeatmap === 1 ? 'day' : 'days'} ({totalHeatmapMinutes} mins)
                    in the last 20 weeks · Click any square to inspect
                  </p>
                </div>

                {selectedActivityDate && (
                  <div className="px-3 py-1.5 rounded-xl bg-[#F7F2E9] dark:bg-[#34302A] border border-[#E8E2D9] dark:border-[#3B3834] text-xs text-[#282522] dark:text-[#F1ECE4]">
                    <strong>{selectedActivityDate}</strong>:{' '}
                    {(progress.studyActivityByDate?.[selectedActivityDate] || 0) * 5} mins studied
                  </div>
                )}
              </div>

              {/* GitHub-Style Grid: Day-of-Week Labels + 20 Week Columns */}
              <div className="overflow-x-auto pb-1">
                <div className="min-w-[600px]">
                  {/* Month Labels Row */}
                  <div className="flex items-center pl-9 mb-1.5">
                    {heatmapWeeks.map((week) => (
                      <div
                        key={`month-${week.weekIndex}`}
                        className="flex-1 text-[10px] text-[#79736D] dark:text-[#A69F96] font-medium"
                      >
                        {week.monthLabel || ''}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-start gap-2">
                    {/* Left Day-of-Week Labels (Mon, Wed, Fri, Sun) */}
                    <div className="grid grid-rows-7 gap-1.5 text-[10px] text-[#79736D] dark:text-[#A69F96] pr-1 leading-none">
                      <span className="h-3.5 flex items-center">Mon</span>
                      <span className="h-3.5 flex items-center opacity-0">Tue</span>
                      <span className="h-3.5 flex items-center">Wed</span>
                      <span className="h-3.5 flex items-center opacity-0">Thu</span>
                      <span className="h-3.5 flex items-center">Fri</span>
                      <span className="h-3.5 flex items-center opacity-0">Sat</span>
                      <span className="h-3.5 flex items-center">Sun</span>
                    </div>

                    {/* 20 Columns x 7 Rows of Contribution Squares */}
                    <div className="flex-1 grid grid-cols-20 gap-1.5">
                      {heatmapWeeks.map((week) => (
                        <div
                          key={`week-${week.weekIndex}`}
                          className="grid grid-rows-7 gap-1.5"
                        >
                          {week.days.map((day) => {
                            const isSelected = selectedActivityDate === day.dateStr;
                            let cellColor =
                              'bg-[#EEEAE3] dark:bg-[#35322E] hover:ring-1 hover:ring-[#B7332C]';
                            if (day.isFuture) {
                              cellColor = 'bg-[#F5F2EC] dark:bg-[#23211F] opacity-40';
                            } else if (day.level === 4) {
                              cellColor = 'bg-[#3C705D] dark:bg-[#5FA372]';
                            } else if (day.level === 3) {
                              cellColor = 'bg-[#6F9B7A] dark:bg-[#497D57]';
                            } else if (day.level === 2) {
                              cellColor = 'bg-[#A8C5AE] dark:bg-[#35593E]';
                            } else if (day.level === 1) {
                              cellColor = 'bg-[#D7E4D8] dark:bg-[#273B2C]';
                            }

                            return (
                              <button
                                key={day.dateStr}
                                type="button"
                                disabled={day.isFuture}
                                onClick={() =>
                                  setSelectedActivityDate((prev) =>
                                    prev === day.dateStr ? null : day.dateStr
                                  )
                                }
                                title={`${day.formattedDate}: ${day.minutes} mins (${day.actions} study actions)`}
                                className={`w-full h-3.5 rounded-[3px] transition-transform hover:scale-110 focus:outline-none ${cellColor} ${
                                  day.isToday
                                    ? 'ring-1.5 ring-[#B7332C]'
                                    : isSelected
                                    ? 'ring-1.5 ring-[#282522] dark:ring-white'
                                    : ''
                                }`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legend Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E8E2D9] dark:border-[#3B3834] text-[11px] text-[#79736D] dark:text-[#A69F96]">
                <span>Last 20 weeks · Daily study consistency</span>
                <div className="flex items-center gap-1.5">
                  <span>Less</span>
                  <span className="w-3 h-3 rounded-[3px] bg-[#EEEAE3] dark:bg-[#35322E] inline-block" />
                  <span className="w-3 h-3 rounded-[3px] bg-[#D7E4D8] dark:bg-[#273B2C] inline-block" />
                  <span className="w-3 h-3 rounded-[3px] bg-[#A8C5AE] dark:bg-[#35593E] inline-block" />
                  <span className="w-3 h-3 rounded-[3px] bg-[#6F9B7A] dark:bg-[#497D57] inline-block" />
                  <span className="w-3 h-3 rounded-[3px] bg-[#3C705D] dark:bg-[#5FA372] inline-block" />
                  <span>More</span>
                </div>
              </div>
            </section>

            {/* Recent Activity Timeline (Matching HTML .recent-activity) */}
            <section className="rounded-2xl bg-[#FFFDF9] dark:bg-[#292725] border border-[#E8E2D9] dark:border-[#3B3834] p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B7332C] dark:text-[#F87171]">
                    YOUR EFFORT ADDS UP
                  </div>
                  <h2 className="font-serif text-xl text-[#282522] dark:text-[#F1ECE4] mt-0.5">
                    Recent activity
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    nextUnfinishedLecture && onOpenLecture(nextUnfinishedLecture.id)
                  }
                  className="px-3.5 py-2 rounded-xl border border-[#E8E2D9] dark:border-[#3B3834] text-xs font-semibold text-[#B7332C] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#34302A] transition-colors"
                >
                  View learning path
                </button>
              </div>

              <div className="mt-4 divide-y divide-[#EEE9E2] dark:divide-[#3E3B37]">
                <div className="flex items-center gap-3.5 py-3">
                  <span className="w-8 h-8 rounded-lg bg-[#E8F1EB] dark:bg-emerald-950/50 text-[#4D7A5B] dark:text-emerald-300 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="text-xs font-semibold text-[#282522] dark:text-[#F1ECE4] block">
                      {completedLessonsCount > 0
                        ? `Completed ${completedLessonsCount} curriculum ${
                            completedLessonsCount === 1 ? 'lesson' : 'lessons'
                          }`
                        : `Next up: Lesson ${String(
                            nextUnfinishedLecture?.lectureNumber || 1
                          ).padStart(2, '0')} · ${nextUnfinishedLecture?.title || 'Silent Consonants'}`}
                    </b>
                    <p className="text-[11px] text-[#79736D] dark:text-[#A69F96] mt-0.5">
                      {nextUnfinishedLecture?.category || 'Spelling & phonics patterns'} ·{' '}
                      {nextUnfinishedLecture?.estimatedMinutes || 15} minutes
                    </p>
                  </div>
                  <time className="text-[11px] text-[#79736D] dark:text-[#A69F96] whitespace-nowrap">
                    Active path
                  </time>
                </div>

                <div className="flex items-center gap-3.5 py-3">
                  <span className="w-8 h-8 rounded-lg bg-[#F6EEDF] dark:bg-amber-950/50 text-[#A57735] dark:text-amber-300 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="text-xs font-semibold text-[#282522] dark:text-[#F1ECE4] block">
                      {earnedEditorialCount > 0
                        ? `Unlocked ${earnedEditorialCount} achievement ${
                            earnedEditorialCount === 1 ? 'badge' : 'badges'
                          }`
                        : `Working toward “${nextLockedBadge.title}” badge`}
                    </b>
                    <p className="text-[11px] text-[#79736D] dark:text-[#A69F96] mt-0.5">
                      {nextLockedBadge.desc}
                    </p>
                  </div>
                  <time className="text-[11px] text-[#79736D] dark:text-[#A69F96] whitespace-nowrap">
                    Milestone
                  </time>
                </div>

                <div className="flex items-center gap-3.5 py-3">
                  <span className="w-8 h-8 rounded-lg bg-[#EAF0F4] dark:bg-sky-950/50 text-[#55738A] dark:text-sky-300 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="text-xs font-semibold text-[#282522] dark:text-[#F1ECE4] block">
                      {practicedWordsTotal > 0
                        ? `Practised ${practicedWordsTotal} vocabulary words (${unifiedMasteredWordsCount} mastered)`
                        : '10,400+ silent-letter & high-utility words ready to explore'}
                    </b>
                    <p className="text-[11px] text-[#79736D] dark:text-[#A69F96] mt-0.5">
                      {progress.savedWordIds.length} saved in personal study deck ·{' '}
                      {progress.mistakeNotebook.length} mistake notes
                    </p>
                  </div>
                  <time className="text-[11px] text-[#79736D] dark:text-[#A69F96] whitespace-nowrap">
                    Word bank
                  </time>
                </div>

                <div className="flex items-center gap-3.5 py-3">
                  <span className="w-8 h-8 rounded-lg bg-[#F8E9E5] dark:bg-red-950/50 text-[#A94D43] dark:text-red-300 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <b className="text-xs font-semibold text-[#282522] dark:text-[#F1ECE4] block">
                      {streakDays > 0
                        ? `Reached a ${streakDays}-day learning streak`
                        : 'Start your daily study streak today'}
                    </b>
                    <p className="text-[11px] text-[#79736D] dark:text-[#A69F96] mt-0.5">
                      Your longest streak is {bestStreak} days · Daily goal:{' '}
                      {progress.dailyGoalMinutes || 15} min
                    </p>
                  </div>
                  <time className="text-[11px] text-[#79736D] dark:text-[#A69F96] whitespace-nowrap">
                    Habit
                  </time>
                </div>
              </div>
            </section>
          </div>
        ) : (
          /* ================================================================= */
          /* ACHIEVEMENTS SUB-VIEW: MATCHING HTML .achievement-section         */
          /* ================================================================= */
          <section className="space-y-5 pt-2">
            {/* Achievement Heading Row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#B7332C] dark:text-[#F87171]">
                  LITTLE WINS. LASTING CONFIDENCE.
                </div>
                <h2 className="font-serif text-2xl sm:text-[26px] text-[#282522] dark:text-[#F1ECE4] mt-1">
                  Your achievements
                </h2>
                <p className="text-xs text-[#79736D] dark:text-[#A69F96] mt-0.5">
                  Every badge marks something you worked for.
                </p>
              </div>
              <span className="text-xs text-[#79736D] dark:text-[#A69F96]">
                <b className="font-serif text-lg text-[#282522] dark:text-[#F1ECE4]">
                  {earnedEditorialCount}
                </b>{' '}
                earned · {editorialBadges.length - earnedEditorialCount} to discover
              </span>
            </div>

            {/* Featured Next Milestone Banner (Matching HTML .featured-badge) */}
            <div className="rounded-2xl border border-[#EBDEC5] dark:border-[#4B4030] bg-gradient-to-r from-[#FCF7EB] to-[#FFFDF9] dark:from-[#342D23] dark:to-[#292725] p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 items-center gap-5">
              {/* Left Medal */}
              <div className="md:col-span-2 flex justify-start md:justify-center">
                <div className="w-18 h-18 relative grid place-items-center">
                  <div className="w-15 h-15 rounded-full bg-radial from-[#F4DAA5] to-[#C18B47] shadow-[0_0_0_4px_rgba(230,201,141,0.35),0_4px_10px_rgba(102,68,29,0.15)] text-[#6A4623] flex flex-col items-center justify-center relative z-10">
                    {renderBadgeIcon(nextLockedBadge.icon)}
                    <span className="font-serif text-sm font-semibold leading-none mt-0.5">
                      {nextLockedBadge.cornerLabel}
                    </span>
                  </div>
                  <span className="absolute right-0 top-0 text-[#C58B43] text-sm">✦</span>
                </div>
              </div>

              {/* Middle Copy */}
              <div className="md:col-span-7 space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#F6EEDF] text-[#946B31] text-[10px] font-semibold uppercase tracking-wider">
                  NEXT MILESTONE
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-[#282522] dark:text-[#F1ECE4]">
                  {nextLockedBadge.title}
                </h3>
                <p className="text-xs text-[#79736D] dark:text-[#A69F96]">
                  {nextLockedBadge.desc}. Keep going — you’re closer than you think.
                </p>
                <div className="max-w-sm pt-2">
                  <div className="flex items-center justify-between text-[11px] text-[#79736D] dark:text-[#A69F96]">
                    <span>
                      {nextLockedBadge.current} of {nextLockedBadge.target}
                    </span>
                    <b className="text-[#996B30] dark:text-amber-300">
                      {Math.max(0, nextLockedBadge.target - nextLockedBadge.current)} left
                    </b>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#EEE9E2] dark:bg-[#403C37] mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#D4AD69] to-[#B8823F]"
                      style={{ width: `${Math.max(8, nextLockedPct)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Right Reward Box */}
              <div className="md:col-span-3 md:border-l border-[#E9DFCE] dark:border-[#4A4237] md:pl-5 flex flex-col gap-1">
                <span className="text-[10px] text-[#79736D] dark:text-[#A69F96]">
                  Next reward
                </span>
                <b className="text-xs font-semibold text-[#282522] dark:text-[#F1ECE4]">
                  {nextLockedBadge.title}
                </b>
                <small className="text-[10px] font-semibold text-[#9B733C] uppercase">
                  {nextLockedBadge.tier} · TARGET {nextLockedBadge.target}
                </small>
              </div>
            </div>

            {/* Badge Category Filter Chips + Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {(
                  [
                    { id: 'all', label: 'All badges', count: editorialBadges.length },
                    { id: 'earned', label: 'Earned', count: earnedEditorialCount },
                    { id: 'streak', label: 'Streaks' },
                    { id: 'learning', label: 'Learning' },
                    { id: 'practice', label: 'Practice' },
                    { id: 'mastery', label: 'Mastery' },
                  ] as const
                ).map((tab) => {
                  const active = badgeCategoryFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setBadgeCategoryFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        active
                          ? 'bg-[#F8E9E5] dark:bg-[#492D29] text-[#B7332C] dark:text-[#F0A59B] font-semibold'
                          : 'bg-[#F0ECE5] dark:bg-[#34312D] text-[#6C665E] dark:text-[#BDB6AB] hover:text-[#282522]'
                      }`}
                    >
                      {tab.label}
                      {'count' in tab && tab.count !== undefined && (
                        <span className="opacity-65 ml-1">{tab.count}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-[11px] text-[#79736D] dark:text-[#A69F96]">
                <span className="inline-flex items-center gap-1.5">
                  <i className="w-2 h-2 rounded-full bg-[#C6944D] inline-block" />
                  <span>Earned</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <i className="w-2 h-2 rounded-full bg-[#C9C3B9] inline-block" />
                  <span>Still to come</span>
                </span>
              </div>
            </div>

            {/* 4-Column Badge Cards Grid (Matching HTML #achievement-grid) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleEditorialBadges.map((badge) => {
                const tierColor =
                  badge.tier === 'bronze'
                    ? 'text-[#9C704D]'
                    : badge.tier === 'silver'
                    ? 'text-[#778090]'
                    : badge.tier === 'gold'
                    ? 'text-[#A77B36]'
                    : 'text-[#758593]';

                return (
                  <article
                    key={badge.id}
                    role="button"
                    tabIndex={0}
                    aria-haspopup="dialog"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setOpenBadgeId(badge.id);
                      }
                    }}
                    onClick={() => {
                      setOpenBadgeId(badge.id);
                      if (badge.earned) {
                        speechService.playCelebrationChime(
                          badge.tier === 'gold' ||
                            badge.tier === 'platinum' ||
                            badge.category === 'mastery'
                            ? 'milestone'
                            : 'achievement'
                        );
                      }
                    }}
                    title={
                      badge.earned
                        ? `${badge.title} — Tap to celebrate with confetti!`
                        : `${badge.title} — Tap for details`
                    }
                    className={`relative cursor-pointer flex items-center gap-3.5 p-4 rounded-xl border transition-all hover:-translate-y-0.5 ${
                      badge.earned
                        ? 'cursor-pointer bg-gradient-to-br from-[#FFFEFA] to-[#FBF6EC] dark:from-[#2E2B26] dark:to-[#292725] border-[#EADCC4] dark:border-[#4B4233]'
                        : 'bg-[#F8F6F1] dark:bg-[#272624] border-[#EBE7DF] dark:border-[#383531]'
                    }`}
                  >
                    {/* Circular Radial Badge Art */}
                    <div
                      className={`w-13 h-13 rounded-full shrink-0 flex flex-col items-center justify-center relative shadow-[inset_0_0_0_3px_rgba(255,255,255,0.4),0_2px_5px_rgba(70,54,32,0.12)] ${
                        badge.earned
                          ? `bg-radial ${badge.artClass}`
                          : 'bg-gradient-to-br from-[#E8E4DC] to-[#CFC9BE] text-[#8F897F] saturate-35'
                      }`}
                    >
                      {renderBadgeIcon(badge.icon)}
                      <span className="absolute -right-0.5 bottom-0 min-w-[18px] h-[18px] px-1 rounded-full grid place-items-center bg-[#FFFDF7] text-[#75552E] font-serif text-[9px] font-semibold shadow-xs">
                        {badge.cornerLabel}
                      </span>
                    </div>

                    {/* Badge Copy */}
                    <div className="min-w-0 pr-4">
                      <h3
                        className={`text-xs font-semibold leading-snug ${
                          badge.earned
                            ? 'text-[#282522] dark:text-[#F1ECE4]'
                            : 'text-[#69645D] dark:text-[#C5BEB4]'
                        }`}
                      >
                        {badge.title}
                      </h3>
                      <p className="text-[11px] text-[#79736D] dark:text-[#A69F96] mt-1 leading-snug">
                        {badge.desc}
                      </p>
                      <span
                        className={`inline-block mt-2 text-[9px] font-bold tracking-wider uppercase ${tierColor}`}
                      >
                        {badge.statusText}
                      </span>
                    </div>

                    {/* Top-Right Status Icon */}
                    {badge.earned ? (
                      <CheckCircle2 className="w-4 h-4 text-[#679074] absolute top-2.5 right-2.5" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#AAA398] absolute top-2.5 right-2.5" />
                    )}
                  </article>
                );
              })}
            </div>

            {/* Expand / Collapse All 16 Achievements Button */}
            <button
              type="button"
              onClick={() => setShowAll16Badges((prev) => !prev)}
              className="w-full py-3 rounded-xl border border-dashed border-[#D9D1C6] dark:border-[#4B4640] text-xs font-medium text-[#736B62] dark:text-[#C2B9AE] hover:border-[#B7332C] hover:text-[#B7332C] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>
                {showAll16Badges
                  ? 'Show fewer achievements'
                  : `See all ${editorialBadges.length} achievements`}
              </span>
              {showAll16Badges ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Badge Detail Pop-up: blurred backdrop, click outside / Escape to close */}
            {(() => {
              const badge = editorialBadges.find((b) => b.id === openBadgeId);
              if (!badge) return null;
              const pct = Math.min(100, Math.round((badge.current / Math.max(1, badge.target)) * 100));
              return (
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="badge-detail-title"
                  onMouseDown={backdropDismiss(() => setOpenBadgeId(null))}
                  className={`fixed inset-0 z-50 ${MODAL_BACKDROP_CLASS} flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-up`}
                >
                  <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] shadow-2xl px-6 pt-4 pb-7 sm:pt-7 flex flex-col items-center text-center gap-3">
                    <span aria-hidden="true" className="sm:hidden w-10 h-1.5 rounded-full bg-[#DFD7C8] dark:bg-[#3A332D] mb-1" />
                    <button
                      type="button"
                      onClick={() => setOpenBadgeId(null)}
                      aria-label="Close badge details"
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-[#F2EEE6] dark:bg-[#141210] text-[#3D342B] dark:text-[#D6CFC4] flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div
                      className={`relative w-[110px] h-[110px] rounded-full flex items-center justify-center shadow-[inset_0_0_0_5px_rgba(255,255,255,0.4),0_12px_24px_-10px_rgba(70,54,32,0.5)] [&>svg]:w-10 [&>svg]:h-10 ${
                        badge.earned
                          ? `bg-radial ${badge.artClass}`
                          : 'bg-gradient-to-br from-[#E8E4DC] to-[#CFC9BE] text-[#8F897F] saturate-35'
                      }`}
                    >
                      {renderBadgeIcon(badge.icon)}
                      {!badge.earned && (
                        <span className="absolute -right-1 bottom-1 w-8 h-8 rounded-full bg-white dark:bg-[#1F1C18] text-[#6E685F] flex items-center justify-center shadow-xs">
                          <Lock className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-[#9C704D]">
                      {badge.tier} · {badge.category}
                    </span>
                    <h2 id="badge-detail-title" className="font-serif text-2xl font-bold text-[#1C1917] dark:text-[#F5F2EB]">
                      {badge.title}
                    </h2>
                    <p className="text-sm text-[#57534E] dark:text-[#A8A29E]">{badge.desc}</p>
                    <div className="w-full mt-1">
                      <div className="flex justify-between text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] mb-1.5">
                        <span>
                          {badge.current} of {badge.target}
                        </span>
                        <span className={badge.earned ? 'text-[#2D6A4F]' : 'text-[#9E2A2B] dark:text-[#F87171]'}>
                          {badge.earned ? 'Earned' : `${pct}%`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[#EFE9DD] dark:bg-[#2E2924] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${badge.earned ? 'bg-[#2D6A4F]' : 'bg-gradient-to-r from-[#C18447] to-[#F6D79F]'}`}
                          style={{ width: `${Math.max(4, pct)}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-[#6E685F] dark:text-[#A8A29E]">
                      {badge.statusText}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenBadgeId(null)}
                      className="mt-2 w-full min-h-[44px] rounded-xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-sm font-bold"
                    >
                      {badge.earned ? 'Nice!' : 'Keep going'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </section>
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

  const formattedDialogueRate = `${Number(dialogueCalibration.dialogueRate.toFixed(2))}×`;
  const normalizedWordRate =
    [0.5, 0.75, 0.85, 1.0, 1.15].find(
      (r) => Math.abs((progress.preferredSpeechRate || 1.0) - r) < 0.06
    ) ?? 1.0;

  return (
    <div className="w-full max-w-[82rem] mx-auto px-[0.625rem] sm:px-[1rem] lg:px-[1.5rem] py-[0.875rem] sm:py-[1.25rem] pb-24 space-y-5">
      {/* Hidden JSON Restore Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFileChange}
        className="hidden"
      />

      {/* Minimal Clean Title Only: Settings & preferences */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#1C1917] dark:text-[#F5F2EB] tracking-tight">
          Settings &amp; preferences
        </h1>
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

      {/* 2x2 Editorial Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CARD 1: User Info Card (Username, Email, Signout/Signin, Sync) + Learning Preferences */}
        <section className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-5 sm:p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          {/* Users Info Card Block */}
          <div className="pb-5 border-b border-[#EFEAE0] dark:border-[#2E2924] space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3.5 min-w-0">
                {firebaseUser?.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={displayUserName}
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full object-cover border border-[#E6E0D4] shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E5DEC9] dark:bg-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] flex items-center justify-center font-semibold text-xs sm:text-sm shrink-0">
                    {userInitials}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                    {displayUserName}
                  </div>
                  <div className="text-xs text-[#78716C] dark:text-[#A8A29E] truncate mt-0.5">
                    {firebaseUser?.email
                      ? firebaseUser.email
                      : 'Local profile · Not signed in'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDraftProfileName(displayUserName);
                  setIsEditingProfileName((prev) => !prev);
                }}
                className="px-3 py-1.5 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#9E2A2B] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors shrink-0"
              >
                {isEditingProfileName ? 'Close' : 'Edit name'}
              </button>
            </div>

            {isEditingProfileName && (
              <div className="p-3.5 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] space-y-2">
                <label className="block text-[11px] font-medium text-[#57534E] dark:text-[#A8A29E]">
                  Display Name (used on greetings &amp; certificates)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={draftProfileName}
                    onChange={(e) => setDraftProfileName(e.target.value)}
                    placeholder="Enter your name"
                    className="flex-1 h-9 px-3 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] bg-white dark:bg-[#1A1714] text-xs sm:text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#9E2A2B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateUserName && draftProfileName.trim()) {
                        onUpdateUserName(draftProfileName.trim());
                      }
                      setIsEditingProfileName(false);
                    }}
                    className="h-9 px-3.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Direct Sync Option + Sign Out / Sign In Option */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button
                type="button"
                disabled={isCloudSyncing || isSyncing}
                onClick={() =>
                  firebaseUser && onPullFromCloud ? onPullFromCloud() : handleSyncClick()
                }
                className="px-3.5 py-2 rounded-xl bg-[#FAF8F4] dark:bg-[#141210] border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#2E6F4E] text-xs font-medium text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 text-[#2E6F4E] ${
                    isCloudSyncing || isSyncing ? 'animate-spin' : ''
                  }`}
                />
                <span>
                  {isCloudSyncing || isSyncing
                    ? 'Syncing...'
                    : firebaseUser
                    ? 'Sync cloud data'
                    : 'Sync local data'}
                </span>
              </button>

              {firebaseUser ? (
                <button
                  type="button"
                  onClick={onGoogleSignOut}
                  className="px-3.5 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] hover:border-[#9E2A2B] text-xs font-medium text-[#57534E] dark:text-[#A8A29E] hover:text-[#9E2A2B] dark:hover:text-[#F87171] inline-flex items-center gap-1.5 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              ) : (
                onGoogleSignIn && (
                  <button
                    type="button"
                    onClick={onGoogleSignIn}
                    className="px-3.5 py-2 rounded-xl bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] hover:bg-[#9E2A2B] dark:hover:bg-[#9E2A2B] dark:hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign in with Google</span>
                  </button>
                )
              )}
            </div>
          </div>

          {/* Row 1: Learning level */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Learning level
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Choose the right challenge
              </div>
            </div>
            <EditorialSelectDropdown<CEFRLevel>
              ariaLabel="Learning level"
              value={(progress.currentLevel || progress.selectedLevel || 'B1') as CEFRLevel}
              onChange={(lvl) => onUpdateLevel(lvl)}
              options={[
                {
                  value: 'B1',
                  label: 'B1 · Foundation',
                  sub: 'Everyday confidence & core silent letters',
                  badge: 'Lessons 01–04',
                },
                {
                  value: 'B2',
                  label: 'B2 · Workplace',
                  sub: 'Clear workplace & media communication',
                  badge: 'Lessons 05–08',
                },
                {
                  value: 'C1',
                  label: 'C1 · Advanced',
                  sub: 'Academic & executive fluency',
                  badge: 'Lessons 09–12',
                },
              ]}
            />
          </div>

          {/* Row 2: Daily study goal */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Daily study goal
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                A small, achievable habit
              </div>
            </div>
            <EditorialSelectDropdown<5 | 10 | 15 | 30>
              ariaLabel="Daily study goal"
              value={(progress.dailyGoalMinutes || 15) as 5 | 10 | 15 | 30}
              onChange={(mins) => onUpdateDailyGoal && onUpdateDailyGoal(mins)}
              options={[
                { value: 5, label: '5 minutes', sub: 'Quick daily warm-up' },
                { value: 10, label: '10 minutes', sub: 'Steady daily practice' },
                {
                  value: 15,
                  label: '15 minutes',
                  sub: 'Balanced daily study pace',
                  badge: 'Default',
                },
                { value: 30, label: '30 minutes', sub: 'Deep intensive session' },
              ]}
            />
          </div>

          {/* Row 3: Display language */}
          <div className="pt-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Display language
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Explanations and navigation
              </div>
            </div>
            <EditorialSelectDropdown<LanguageMode>
              ariaLabel="Display language"
              value={progress.languageMode}
              onChange={(lang) => onUpdateLanguageMode(lang)}
              options={[
                {
                  value: 'full-nepali',
                  label: 'English + नेपाली',
                  sub: 'Full bilingual explanations & Devanagari cues',
                  badge: 'Default',
                },
                {
                  value: 'english-meanings',
                  label: 'English + Meanings',
                  sub: 'English UI with Nepali word meanings',
                },
                {
                  value: 'english-only',
                  label: 'English Only',
                  sub: '100% English interface & explanations',
                },
              ]}
            />
          </div>
        </section>

        {/* CARD 2: Your study environment */}
        <section className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-5 sm:p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171] mb-3">
            YOUR STUDY ENVIRONMENT
          </div>

          {/* Row 1: Daily reminder */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Daily reminder
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                A gentle nudge to practise
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={progress.dailyReminderEnabled !== false}
              onClick={() => onToggleDailyReminder && onToggleDailyReminder()}
              className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center shrink-0 ${
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
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Dark appearance
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Easy on the eyes
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={progress.darkMode}
              onClick={() => {
                speechService.triggerHaptic('light');
                onToggleDarkMode();
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center shrink-0 ${
                progress.darkMode
                  ? 'bg-[#2E6F4E] justify-end'
                  : 'bg-[#9CA3AF] justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Row 3: Haptic feedback */}
          <div className="py-4 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Haptic feedback
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    progress.hapticFeedbackEnabled !== false
                      ? 'bg-[#DCECE2] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300'
                      : 'bg-[#F2EFE9] dark:bg-[#26221E] text-[#78716C] dark:text-[#A8A29E]'
                  }`}
                >
                  {progress.hapticFeedbackEnabled !== false ? 'On' : 'Off'}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Gentle vibration on answers, quiz feedback &amp; achievement celebrations
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-label="Toggle haptic feedback"
              aria-checked={progress.hapticFeedbackEnabled !== false}
              onClick={() => {
                if (onToggleHapticFeedback) {
                  onToggleHapticFeedback();
                } else {
                  const next = progress.hapticFeedbackEnabled === false;
                  speechService.setHapticFeedbackEnabled(next);
                }
              }}
              className={`w-12 h-7 rounded-full p-1 transition-colors flex items-center shrink-0 ${
                progress.hapticFeedbackEnabled !== false
                  ? 'bg-[#2E6F4E] justify-end'
                  : 'bg-[#9CA3AF] justify-start'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-white shadow-xs" />
            </button>
          </div>

          {/* Row 4: Offline mode */}
          <div className="pt-4 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Offline mode
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Lessons available without internet
              </div>
            </div>
            <button
              type="button"
              onClick={handleSyncClick}
              className="px-3.5 py-1.5 rounded-full bg-[#E2EFE7] dark:bg-emerald-950/60 text-[#1F5C3D] dark:text-emerald-300 text-xs font-medium shrink-0"
            >
              {isSyncing ? 'Checking...' : 'Ready'}
            </button>
          </div>
        </section>

        {/* CARD 3: Audio & pronunciation lab */}
        <section className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-5 sm:p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171] mb-3">
            AUDIO &amp; PRONUNCIATION LAB
          </div>

          {/* Row 1: Dialogue playback speed (Interactive Slider) */}
          <div className="py-3.5 border-b border-[#EFEAE0] dark:border-[#2E2924] space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Dialogue playback speed
                </div>
                <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                  Slide to adjust conversation pace
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  speechService.speak(
                    'Good morning! Did you receive the updated Wednesday schedule?',
                    {
                      rate: dialogueCalibration.dialogueRate,
                      pitch: dialogueCalibration.speakerAPitch,
                    }
                  )
                }
                title="Click to preview dialogue speed"
                className="px-2.5 py-1 rounded-lg bg-[#F8E9E5] dark:bg-red-950/50 text-[#9E2A2B] dark:text-red-300 font-ipa text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-[#F2DCD6] transition-colors shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{formattedDialogueRate}</span>
              </button>
            </div>

            <div className="space-y-1.5">
              <input
                type="range"
                aria-label="Dialogue playback speed slider"
                min={0.5}
                max={1.25}
                step={0.05}
                value={dialogueCalibration.dialogueRate}
                onChange={(e) => {
                  const r = Number(parseFloat(e.target.value).toFixed(2));
                  handleUpdateCalibration({ dialogueRate: r });
                }}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-[#EAE4D8] dark:bg-[#2E2924] accent-[#9E2A2B]"
              />
              <div className="flex items-center justify-between text-[10px] text-[#78716C] dark:text-[#A8A29E]">
                {[
                  { rate: 0.5, label: '0.5× Slow' },
                  { rate: 0.75, label: '0.75× Careful' },
                  { rate: 1.0, label: '1.0× Default' },
                  { rate: 1.25, label: '1.25× Fast' },
                ].map((tick) => {
                  const isTickActive =
                    Math.abs(dialogueCalibration.dialogueRate - tick.rate) < 0.03;
                  return (
                    <button
                      key={tick.rate}
                      type="button"
                      onClick={() => handleUpdateCalibration({ dialogueRate: tick.rate })}
                      className={`transition-colors ${
                        isTickActive
                          ? 'font-bold text-[#9E2A2B] dark:text-[#F87171]'
                          : 'hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
                      }`}
                    >
                      {tick.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Row 2: Word playback speed (Default 1.0x first, then options) */}
          <div className="py-3.5 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Word playback speed
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Single vocabulary &amp; dictionary words
              </div>
            </div>
            <EditorialSelectDropdown<number>
              ariaLabel="Word playback speed"
              value={normalizedWordRate}
              onChange={(rate) => {
                onUpdateSpeechRate(rate);
                speechService.speak('Knowledge, subtle, receipt.', { rate });
              }}
              options={[
                {
                  value: 1.0,
                  label: '1.0× (Default)',
                  sub: 'Natural everyday word pronunciation',
                  badge: 'Default',
                },
                {
                  value: 0.85,
                  label: '0.85× Clear',
                  sub: 'Slightly slower for crisp silent letters',
                },
                {
                  value: 0.75,
                  label: '0.75× Careful',
                  sub: 'Slow pace for new phonics patterns',
                },
                {
                  value: 0.5,
                  label: '0.5× Extra Slow',
                  sub: 'Syllable-by-syllable listening',
                },
                {
                  value: 1.15,
                  label: '1.15× Brisk',
                  sub: 'Quick review speed for mastered words',
                },
              ]}
            />
          </div>

          {/* Row 3: Voice pitch */}
          <div className="py-3.5 border-b border-[#EFEAE0] dark:border-[#2E2924] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Voice pitch
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Find a sound that feels clear
              </div>
            </div>
            <EditorialSelectDropdown<'Natural' | 'Warm' | 'Clear'>
              ariaLabel="Voice pitch"
              value={currentVoicePitchPreset as 'Natural' | 'Warm' | 'Clear'}
              onChange={(val) => {
                if (val === 'Warm') {
                  handleUpdateCalibration({ speakerAPitch: 0.92, speakerBPitch: 1.0 });
                } else if (val === 'Clear') {
                  handleUpdateCalibration({ speakerAPitch: 1.08, speakerBPitch: 1.14 });
                } else {
                  handleUpdateCalibration({ speakerAPitch: 1.0, speakerBPitch: 1.06 });
                }
              }}
              options={[
                {
                  value: 'Natural',
                  label: 'Natural',
                  sub: 'Balanced conversational pitch',
                  badge: 'Default',
                },
                {
                  value: 'Warm',
                  label: 'Warm',
                  sub: 'Deeper, softer voice tone',
                },
                {
                  value: 'Clear',
                  label: 'Clear',
                  sub: 'Brighter consonant articulation',
                },
              ]}
            />
          </div>

          {/* Row 4: Test your pronunciation */}
          <div className="pt-3.5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Test your pronunciation
              </div>
              <div className="text-[11px] sm:text-xs text-[#78716C] dark:text-[#A8A29E] mt-0.5">
                Try the live voice practice
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowFullAudioLab((prev) => !prev);
                setTimeout(() => {
                  audioLabSectionRef.current?.scrollIntoView({ behavior: scrollBehavior() });
                }, 100);
              }}
              className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#9E2A2B] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors shrink-0"
            >
              {showFullAudioLab ? 'Hide lab' : 'Open lab'}
            </button>
          </div>
        </section>

        {/* CARD 4: Your data, in your hands */}
        <section className="bg-white dark:bg-[#1A1714] border border-[#E6E0D4] dark:border-[#2E2924] rounded-2xl p-6 sm:p-7 shadow-[0_1px_2px_rgba(28,25,23,0.03)] flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9E2A2B] dark:text-[#F87171] mb-3">
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
                className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#9E2A2B] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors"
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
              className="px-4 py-2 rounded-xl border border-[#E6E0D4] dark:border-[#2E2924] text-xs font-medium text-[#9E2A2B] dark:text-[#F87171] hover:bg-[#FAF8F4] dark:hover:bg-[#141210] transition-colors"
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
              <div className="text-sm font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
              className="px-3.5 py-2 rounded-xl border border-[#9E2A2B]/40 dark:border-red-800/60 bg-[#FAF2F0] dark:bg-red-950/30 text-xs font-semibold text-[#9E2A2B] dark:text-red-300 hover:bg-[#9E2A2B] hover:text-white transition-colors inline-flex items-center gap-1.5 shrink-0"
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
          onMouseDown={backdropDismiss(() => setIsResetModalOpen(false))}
          className={`fixed inset-0 z-50 ${MODAL_BACKDROP_CLASS} flex items-center justify-center p-4 animate-fade-up`}
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1F1C18] border border-[#E6E0D4] dark:border-[#2E2924] shadow-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#FAF2F0] dark:bg-red-950/50 border border-[#9E2A2B]/30 text-[#9E2A2B] dark:text-red-300 flex items-center justify-center shrink-0">
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
                  className="mt-0.5 w-4 h-4 accent-[#9E2A2B] rounded"
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
                className="px-5 py-2.5 rounded-xl bg-[#9E2A2B] hover:bg-[#872223] text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors shadow-xs disabled:opacity-60"
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
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] mb-1">
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
                  : 'bg-[#9E2A2B] text-white hover:bg-[#872223]'
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
                <span className="font-ipa text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
                          : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]'
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
                  <span className="font-ipa font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
                          ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
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
                  <span className="font-ipa font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
                          ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
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
                        ? 'bg-white dark:bg-[#1F1C18] border-[#9E2A2B] ring-1 ring-[#9E2A2B]'
                        : 'bg-white/90 dark:bg-[#1F1C18]/90 border-[#E7E0D6] dark:border-[#2E2924]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
                        className="min-h-[32px] px-2.5 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#9E2A2B] text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
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
                          className="px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#9E2A2B] text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1"
                          title={tp.note}
                        >
                          <span className="font-semibold">{tp.word}</span>
                          <span className="font-ipa text-[#9E2A2B] dark:text-[#F87171]">
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
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] mb-1">
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
                            ? 'border-[#9E2A2B] bg-[#9E2A2B]/8 dark:bg-[#9E2A2B]/20'
                            : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#9E2A2B]/50'
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
                        <Volume2 className="w-4 h-4 text-[#9E2A2B] shrink-0" />
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
                  className="w-full p-3 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-sm text-[#1C1917] dark:text-[#F5F2EB] focus:outline-none focus:border-[#9E2A2B]"
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
                  <span className="font-ipa font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
                  <div className="text-[#9E2A2B] dark:text-[#F87171] font-medium">
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
                    className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#9E2A2B] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                    <span>{b.label}</span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleRecordVoicePractice}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all ${
                    isListeningPracticeMic
                      ? 'bg-[#D97706] text-white animate-pulse'
                      : 'bg-[#9E2A2B] text-white hover:bg-[#872223]'
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
                  <span className="font-ipa text-sm font-bold text-[#9E2A2B] dark:text-[#F87171]">
                    Accuracy Score: {practiceResult.score}%
                  </span>
                </div>

                {/* Score Bar */}
                <div className="w-full h-2.5 rounded-full bg-white dark:bg-[#141210] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      practiceResult.passed ? 'bg-[#2D6A4F]' : 'bg-[#D97706]'
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
                  <div className="text-xs font-medium text-[#9E2A2B] dark:text-[#F87171]">
                    Coaching Tip: {currentDrill.trapWarning}
                  </div>
                )}

                {onRecordMistake && (
                  <div className="pt-1 flex items-center justify-between gap-2">
                    {savedToMistakesBanner ? (
                      <span className="text-xs font-semibold text-[#2D6A4F] dark:text-emerald-400">
                        ✓ Added to your Mistake Notebook for extra practice!
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleAddDrillToMistakeNotebook}
                        className="min-h-[34px] px-3 py-1 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] bg-white dark:bg-[#1F1C18] text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] inline-flex items-center gap-1.5"
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
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] mb-1">
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
                  <span className="font-ipa font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
                    className="min-h-[36px] px-3 py-1 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#9E2A2B] text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
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
                className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] inline-flex items-center gap-1.5"
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
        <div className="flex items-center gap-2 text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171] mb-1">
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
                    ? 'border-[#9E2A2B] bg-[#9E2A2B]/8 dark:bg-[#9E2A2B]/20 ring-1 ring-[#9E2A2B]'
                    : 'border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] hover:border-[#9E2A2B]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-sm font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {option.title}
                    </span>
                    {active && (
                      <CheckCircle2 className="w-4 h-4 text-[#9E2A2B] dark:text-[#F87171] shrink-0" />
                    )}
                  </div>
                  <div className="text-[11px] font-medium text-[#9E2A2B] dark:text-[#F87171] mb-2">
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
            <div className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="block text-xs font-semibold text-[#57534E] dark:text-[#A8A29E]">
              Preferred English Voice Profile:
            </label>
            <EditorialSelectDropdown<string>
              ariaLabel="Preferred English Voice Profile"
              value={selectedVoiceURI}
              onChange={(uri) => handleVoiceChange(uri)}
              options={[
                {
                  value: '',
                  label: 'Automatic Best Voice',
                  sub: 'Recommended system English voice',
                  badge: 'Default',
                },
                ...availableVoices.map((v) => ({
                  value: v.voiceURI,
                  label: v.name,
                  sub: v.lang,
                })),
              ]}
            />
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
                    ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                    : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Test Single Voice</span>
              </button>

              <button
                type="button"
                onClick={handleTestDialogueVoices}
                className={`min-h-[40px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  isTestingVoice === 'dialogue'
                    ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
                    : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924] text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Test Two-Person Voices (A & B)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Target Level, Daily Goal & Theme Posture */}
        <div className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <div className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
                        ? 'bg-[#9E2A2B] text-white border-[#9E2A2B]'
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
            <div className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
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
              className="min-h-[44px] px-4 py-2.5 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B] inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-[#9E2A2B]" />
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
                className="min-h-[40px] px-3.5 py-2 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] inline-flex items-center gap-1.5"
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
                className="min-h-[40px] px-3 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B] inline-flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-[#9E2A2B]" />
                <span>Saved Words (.CSV)</span>
              </button>
              <button
                type="button"
                onClick={() => exportMistakeNotebookToCSV(progress.mistakeNotebook)}
                className="min-h-[40px] px-3 py-2 rounded-xl border border-[#E7E0D6] dark:border-[#2E2924] bg-[#FAF7F2] dark:bg-[#141210] text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB] hover:border-[#9E2A2B] inline-flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5 text-[#9E2A2B]" />
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
                    <Wifi className="w-4 h-4 text-[#2D6A4F]" />
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
              <div className="text-xs font-semibold text-[#2D6A4F] dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>BhashaSetu is installed on your home screen (Standalone Mode).</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={install}
                className="w-full min-h-[46px] px-5 py-2.5 rounded-xl bg-[#9E2A2B] text-white text-xs font-semibold hover:bg-[#872223] transition-colors inline-flex items-center justify-center gap-2"
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
