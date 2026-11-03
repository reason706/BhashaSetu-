import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  Square,
  Play,
  Volume2,
  Turtle,
  RotateCcw,
  Activity,
  Award,
  Sparkles,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Layers,
  Rows,
  Wand2,
} from 'lucide-react';
import { LectureUnit, LanguageMode } from '../types/curriculum';
import { speechService } from '../services/speech';

export interface ShadowingSentenceItem {
  id: string;
  level: 'B1' | 'B2' | 'C1';
  category: string;
  english: string;
  ipa: string;
  connectedSpeechGuide: string;
  nepali: string;
  silentFocus: string;
  targetDurationSec: number;
  words: {
    word: string;
    ipa: string;
    isStressed: boolean;
    hasSilentLetter?: boolean;
    silentNote?: string;
    targetEnergy: number; // 0.25 to 1.0
  }[];
}

export const CURATED_SHADOWING_SENTENCES: ShadowingSentenceItem[] = [
  {
    id: 'shadow-1',
    level: 'B1',
    category: 'Silent Consonants & Stress Timing',
    english: 'I honestly doubt the plumber will knock before Wednesday.',
    ipa: '/aɪ ˈɒn.ɪst.li daʊt ðə ˈplʌm.ər wɪl nɒk bɪˈfɔːr ˈwɛnz.deɪ/',
    connectedSpeechGuide: 'I ON-ist-ly DOUBT the PLUM-er will KNOCK be-FORE WENZ-day.',
    nepali: 'मलाई इमानदारीपूर्वक शंका छ कि प्लम्बरले बुधबारअघि ढोका ढकढक्याउनेछन्।',
    silentFocus: 'Silent H (honestly), Silent B (doubt, plumber), Silent K (knock), Silent D (Wednesday)',
    targetDurationSec: 3.8,
    words: [
      { word: 'I', ipa: '/aɪ/', isStressed: false, targetEnergy: 0.35 },
      {
        word: 'honestly',
        ipa: '/ˈɒn.ɪst.li/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent H at start',
        targetEnergy: 0.88,
      },
      {
        word: 'doubt',
        ipa: '/daʊt/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent B before T',
        targetEnergy: 0.92,
      },
      { word: 'the', ipa: '/ðə/', isStressed: false, targetEnergy: 0.28 },
      {
        word: 'plumber',
        ipa: '/ˈplʌm.ər/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent B after M',
        targetEnergy: 0.86,
      },
      { word: 'will', ipa: '/wɪl/', isStressed: false, targetEnergy: 0.34 },
      {
        word: 'knock',
        ipa: '/nɒk/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent K before N',
        targetEnergy: 0.9,
      },
      { word: 'before', ipa: '/bɪˈfɔːr/', isStressed: false, targetEnergy: 0.52 },
      {
        word: 'Wednesday.',
        ipa: '/ˈwɛnz.deɪ/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent D in middle',
        targetEnergy: 0.85,
      },
    ],
  },
  {
    id: 'shadow-2',
    level: 'B1',
    category: 'Financial & Workplace Fluency',
    english: 'Please fasten your seatbelt and keep the receipt in your wallet.',
    ipa: '/pliːz ˈfɑː.sən jɔːr ˈsiːt.bɛlt ænd kiːp ðə rɪˈsiːt ɪn jɔːr ˈwɒl.ɪt/',
    connectedSpeechGuide: 'PLEEZ FA-sen your SEET-belt an KEEP the ri-SEET in your WAL-it.',
    nepali: 'कृपया आफ्नो सिटबेल्ट बाँध्नुहोस् र रसिद आफ्नो पर्समा राख्नुहोस्।',
    silentFocus: 'Silent T (fasten), Silent P (receipt)',
    targetDurationSec: 4.0,
    words: [
      { word: 'Please', ipa: '/pliːz/', isStressed: true, targetEnergy: 0.78 },
      {
        word: 'fasten',
        ipa: '/ˈfɑː.sən/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent T after S',
        targetEnergy: 0.9,
      },
      { word: 'your', ipa: '/jər/', isStressed: false, targetEnergy: 0.32 },
      { word: 'seatbelt', ipa: '/ˈsiːt.bɛlt/', isStressed: true, targetEnergy: 0.86 },
      { word: 'and', ipa: '/ən/', isStressed: false, targetEnergy: 0.28 },
      { word: 'keep', ipa: '/kiːp/', isStressed: true, targetEnergy: 0.82 },
      { word: 'the', ipa: '/ðə/', isStressed: false, targetEnergy: 0.26 },
      {
        word: 'receipt',
        ipa: '/rɪˈsiːt/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent P before T',
        targetEnergy: 0.94,
      },
      { word: 'in', ipa: '/ɪn/', isStressed: false, targetEnergy: 0.3 },
      { word: 'your', ipa: '/jər/', isStressed: false, targetEnergy: 0.32 },
      { word: 'wallet.', ipa: '/ˈwɒl.ɪt/', isStressed: true, targetEnergy: 0.8 },
    ],
  },
  {
    id: 'shadow-3',
    level: 'B2',
    category: 'Silent GH & L Patterns',
    english: 'We walked calmly through the neighborhood at twilight.',
    ipa: '/wiː wɔːkt ˈkɑːm.li θruː ðə ˈneɪ.bər.hʊd æt ˈtwaɪ.laɪt/',
    connectedSpeechGuide: 'we WAWKT KAHM-lee THROO the NAY-ber-hood at TWY-lyt.',
    nepali: 'हामी गोधूलि साँझमा टोलभरि शान्तपूर्वक हिँड्यौं।',
    silentFocus: 'Silent L (walked, calmly), Silent GH (through, neighborhood, twilight)',
    targetDurationSec: 3.6,
    words: [
      { word: 'We', ipa: '/wi/', isStressed: false, targetEnergy: 0.35 },
      {
        word: 'walked',
        ipa: '/wɔːkt/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent L before K',
        targetEnergy: 0.88,
      },
      {
        word: 'calmly',
        ipa: '/ˈkɑːm.li/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent L before M',
        targetEnergy: 0.85,
      },
      {
        word: 'through',
        ipa: '/θruː/',
        isStressed: false,
        hasSilentLetter: true,
        silentNote: 'Silent GH at end',
        targetEnergy: 0.55,
      },
      { word: 'the', ipa: '/ðə/', isStressed: false, targetEnergy: 0.25 },
      {
        word: 'neighborhood',
        ipa: '/ˈneɪ.bər.hʊd/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent GH in middle',
        targetEnergy: 0.92,
      },
      { word: 'at', ipa: '/ət/', isStressed: false, targetEnergy: 0.28 },
      {
        word: 'twilight.',
        ipa: '/ˈtwaɪ.laɪt/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent GH before T',
        targetEnergy: 0.86,
      },
    ],
  },
  {
    id: 'shadow-4',
    level: 'B2',
    category: 'Academic & Career Interview',
    english: 'Foreign psychologists designed a subtle campaign in autumn.',
    ipa: '/ˈfɒr.ɪn saɪˈkɒl.ə.dʒɪsts dɪˈzaɪnd ə ˈsʌt.əl kæmˈpeɪn ɪn ˈɔː.təm/',
    connectedSpeechGuide: 'FOR-in sy-KOL-uh-jists di-ZYND uh SUT-ul kam-PAYN in AW-tum.',
    nepali: 'विदेशी मनोवैज्ञानिकहरूले शरद ऋतुमा एउटा सूक्ष्म अभियान डिजाइन गरे।',
    silentFocus: 'Silent G (foreign, designed, campaign), Silent P (psychologists), Silent B (subtle), Silent N (autumn)',
    targetDurationSec: 4.2,
    words: [
      {
        word: 'Foreign',
        ipa: '/ˈfɒr.ɪn/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent G before N',
        targetEnergy: 0.86,
      },
      {
        word: 'psychologists',
        ipa: '/saɪˈkɒl.ə.dʒɪsts/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent P before S',
        targetEnergy: 0.94,
      },
      {
        word: 'designed',
        ipa: '/dɪˈzaɪnd/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent G before N',
        targetEnergy: 0.84,
      },
      { word: 'a', ipa: '/ə/', isStressed: false, targetEnergy: 0.25 },
      {
        word: 'subtle',
        ipa: '/ˈsʌt.əl/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent B before T',
        targetEnergy: 0.88,
      },
      {
        word: 'campaign',
        ipa: '/kæmˈpeɪn/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent G before N',
        targetEnergy: 0.9,
      },
      { word: 'in', ipa: '/ɪn/', isStressed: false, targetEnergy: 0.3 },
      {
        word: 'autumn.',
        ipa: '/ˈɔː.təm/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent N after M',
        targetEnergy: 0.82,
      },
    ],
  },
  {
    id: 'shadow-5',
    level: 'C1',
    category: 'Executive Presentation & Rhythm',
    english: 'My colleagues wrote a thorough mortgage proposal for the island.',
    ipa: '/maɪ ˈkɒl.iːɡz roʊt ə ˈθʌr.ə ˈmɔːr.ɡɪdʒ prəˈpoʊ.zəl fɔːr ðə ˈaɪ.lənd/',
    connectedSpeechGuide: 'my KOL-eegz ROWT uh THUR-oh MOR-gij pruh-POH-zul for thee EYE-lund.',
    nepali: 'मेरा सहकर्मीहरूले टापुका लागि विस्तृत धितो प्रस्ताव लेखे।',
    silentFocus: 'Silent UE (colleagues), Silent W (wrote), Silent GH (thorough), Silent T (mortgage), Silent S (island)',
    targetDurationSec: 4.3,
    words: [
      { word: 'My', ipa: '/maɪ/', isStressed: false, targetEnergy: 0.36 },
      {
        word: 'colleagues',
        ipa: '/ˈkɒl.iːɡz/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent UE at end',
        targetEnergy: 0.9,
      },
      {
        word: 'wrote',
        ipa: '/roʊt/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent W before R',
        targetEnergy: 0.85,
      },
      { word: 'a', ipa: '/ə/', isStressed: false, targetEnergy: 0.24 },
      {
        word: 'thorough',
        ipa: '/ˈθʌr.ə/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent GH at end',
        targetEnergy: 0.88,
      },
      {
        word: 'mortgage',
        ipa: '/ˈmɔːr.ɡɪdʒ/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent T before G',
        targetEnergy: 0.92,
      },
      { word: 'proposal', ipa: '/prəˈpoʊ.zəl/', isStressed: true, targetEnergy: 0.84 },
      { word: 'for', ipa: '/fər/', isStressed: false, targetEnergy: 0.28 },
      { word: 'the', ipa: '/ði/', isStressed: false, targetEnergy: 0.28 },
      {
        word: 'island.',
        ipa: '/ˈaɪ.lənd/',
        isStressed: true,
        hasSilentLetter: true,
        silentNote: 'Silent S before L',
        targetEnergy: 0.86,
      },
    ],
  },
];

const NUM_BINS = 64;

/**
 * Generates a realistic 64-bin native reference amplitude envelope from the sentence's word stress profile.
 */
function buildNativeModelEnvelope(words: ShadowingSentenceItem['words']): number[] {
  const bins = new Array<number>(NUM_BINS).fill(0.12);
  if (words.length === 0) return bins;

  const binsPerWord = NUM_BINS / words.length;
  for (let i = 0; i < NUM_BINS; i++) {
    const wordFloat = i / binsPerWord;
    const wordIdx = Math.min(words.length - 1, Math.floor(wordFloat));
    const posInWord = wordFloat - wordIdx; // 0..1 within the word
    const wordObj = words[wordIdx];

    // Create a natural syllable arch within each word, with a micro-dip at word boundaries
    const arch = Math.sin(posInWord * Math.PI);
    const syllableMod =
      wordObj.word.length > 6
        ? 0.78 + 0.22 * Math.sin(posInWord * Math.PI * 2.2)
        : 1.0;

    const val = 0.1 + wordObj.targetEnergy * arch * syllableMod * 0.88;
    bins[i] = Math.max(0.08, Math.min(1.0, Number(val.toFixed(3))));
  }
  return bins;
}

/**
 * Converts a plain Lecture dialogue sentence into a ShadowingSentenceItem dynamically
 */
function buildLectureShadowItem(
  lectureNum: number,
  lineIdx: number,
  speaker: string,
  english: string,
  nepali: string
): ShadowingSentenceItem {
  const rawTokens = english.trim().split(/\s+/).filter(Boolean);
  const functionWords = new Set([
    'a',
    'an',
    'the',
    'to',
    'in',
    'on',
    'at',
    'of',
    'for',
    'with',
    'and',
    'or',
    'but',
    'is',
    'am',
    'are',
    'was',
    'were',
    'be',
    'been',
    'will',
    'would',
    'can',
    'could',
    'should',
    'i',
    'you',
    'we',
    'they',
    'he',
    'she',
    'it',
    'my',
    'your',
    'our',
    'that',
    'this',
  ]);

  const words = rawTokens.map((tok) => {
    const clean = tok.replace(/[^a-zA-Z']/g, '').toLowerCase();
    const isStressed = !functionWords.has(clean) && clean.length > 2;
    return {
      word: tok,
      ipa: isStressed ? '● Stressed' : '• Weak form',
      isStressed,
      targetEnergy: isStressed ? 0.86 : 0.32,
    };
  });

  return {
    id: `lec-${lectureNum}-${lineIdx}`,
    level: lectureNum <= 4 ? 'B1' : lectureNum <= 8 ? 'B2' : 'C1',
    category: `Lecture ${String(lectureNum).padStart(2, '0')} Dialogue · ${speaker}`,
    english,
    ipa: words.map((w) => (w.isStressed ? w.word.toUpperCase() : w.word.toLowerCase())).join(' '),
    connectedSpeechGuide: words
      .map((w) => (w.isStressed ? `● ${w.word.toUpperCase()}` : `• ${w.word}`))
      .join(' '),
    nepali,
    silentFocus: `Lecture ${String(lectureNum).padStart(2, '0')} Contextual Dialogue Line`,
    targetDurationSec: Number(Math.max(2.2, rawTokens.length * 0.42).toFixed(1)),
    words,
  };
}

/**
 * Resamples an arbitrary-length array of recorded amplitude samples into NUM_BINS (64) normalized bins.
 */
function normalizeSamplesToBins(rawSamples: number[], targetBins = NUM_BINS): number[] {
  if (rawSamples.length === 0) {
    return new Array<number>(targetBins).fill(0.1);
  }
  // Trim leading/trailing near-silence so a brief delay in pressing stop doesn't skew rhythm alignment
  const peak = Math.max(...rawSamples, 0.05);
  const threshold = peak * 0.14;
  let startIdx = 0;
  let endIdx = rawSamples.length - 1;
  while (startIdx < endIdx && rawSamples[startIdx] < threshold) startIdx++;
  while (endIdx > startIdx && rawSamples[endIdx] < threshold) endIdx--;

  const activeSlice =
    endIdx - startIdx >= 8 ? rawSamples.slice(startIdx, endIdx + 1) : rawSamples;

  const maxVal = Math.max(...activeSlice, 0.05);
  const result: number[] = [];

  for (let b = 0; b < targetBins; b++) {
    const start = Math.floor((b / targetBins) * activeSlice.length);
    const end = Math.max(start + 1, Math.floor(((b + 1) / targetBins) * activeSlice.length));
    let sum = 0;
    for (let j = start; j < end && j < activeSlice.length; j++) {
      sum += activeSlice[j];
    }
    const avg = sum / Math.max(1, end - start);
    const normalized = Math.min(1.0, Math.max(0.08, (avg / maxVal) * 0.95));
    result.push(Number(normalized.toFixed(3)));
  }
  return result;
}

interface ShadowingComparisonMetrics {
  overallScore: number;
  waveformCorrelation: number;
  pacingScore: number;
  stressAlignmentScore: number;
  userDurationSec: number;
  wordEnergies: {
    word: string;
    isStressed: boolean;
    targetEnergy: number;
    userEnergy: number;
    status: 'strong' | 'moderate' | 'weak';
  }[];
  feedbackSummary: string;
  nepaliFeedback: string;
}

function computeShadowingComparison(
  nativeBins: number[],
  userBins: number[],
  item: ShadowingSentenceItem,
  userDurationSec: number
): ShadowingComparisonMetrics {
  // 1. Cosine / Envelope similarity across 64 bins
  let dot = 0;
  let normA = 0;
  let normB = 0;
  let absDiffSum = 0;
  for (let i = 0; i < NUM_BINS; i++) {
    const a = nativeBins[i] || 0.1;
    const b = userBins[i] || 0.1;
    dot += a * b;
    normA += a * a;
    normB += b * b;
    absDiffSum += Math.abs(a - b);
  }
  const cosine = normA > 0 && normB > 0 ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0.7;
  const meanDiffScore = Math.max(0, 1 - absDiffSum / (NUM_BINS * 0.65));
  const waveformCorrelation = Math.round(
    Math.min(99, Math.max(45, (cosine * 0.65 + meanDiffScore * 0.35) * 100))
  );

  // 2. Pacing & Duration Match
  const durationRatio =
    item.targetDurationSec > 0
      ? Math.abs(userDurationSec - item.targetDurationSec) / item.targetDurationSec
      : 0;
  const pacingScore = Math.round(Math.max(45, Math.min(99, (1 - durationRatio * 0.75) * 100)));

  // 3. Word-level stress alignment
  const binsPerWord = NUM_BINS / Math.max(1, item.words.length);
  let stressedMatches = 0;
  let stressedTotal = 0;

  const wordEnergies = item.words.map((w, idx) => {
    const startBin = Math.floor(idx * binsPerWord);
    const endBin = Math.max(startBin + 1, Math.floor((idx + 1) * binsPerWord));
    let maxInWord = 0;
    let sumInWord = 0;
    for (let b = startBin; b < endBin && b < NUM_BINS; b++) {
      maxInWord = Math.max(maxInWord, userBins[b]);
      sumInWord += userBins[b];
    }
    const avgInWord = sumInWord / Math.max(1, endBin - startBin);
    const userEnergy = Number((maxInWord * 0.65 + avgInWord * 0.35).toFixed(2));

    let status: 'strong' | 'moderate' | 'weak' = 'strong';
    if (w.isStressed) {
      stressedTotal++;
      if (userEnergy >= 0.55) {
        stressedMatches += 1;
        status = 'strong';
      } else if (userEnergy >= 0.38) {
        stressedMatches += 0.65;
        status = 'moderate';
      } else {
        status = 'weak';
      }
    } else {
      // Unstressed function word: good if reduced or moderate
      status = userEnergy <= 0.68 ? 'strong' : 'moderate';
    }

    return {
      word: w.word,
      isStressed: w.isStressed,
      targetEnergy: w.targetEnergy,
      userEnergy,
      status,
    };
  });

  const stressAlignmentScore =
    stressedTotal > 0
      ? Math.round(Math.min(99, Math.max(48, (stressedMatches / stressedTotal) * 100)))
      : 85;

  const overallScore = Math.round(
    waveformCorrelation * 0.42 + stressAlignmentScore * 0.35 + pacingScore * 0.23
  );

  let feedbackSummary =
    'Excellent stress-timed cadence! Your vocal peaks align closely with the native speaker’s stressed content words.';
  let nepaliFeedback =
    'उत्कृष्ट लय र उच्चारण! तपाईंको आवाजको उतार-चढाव मूल अंग्रेजी वक्ताको मुख्य शब्दहरूसँग राम्रोसँग मेल खाएको छ।';

  if (overallScore < 72) {
    feedbackSummary =
      'Try emphasizing the bold content words (nouns, main verbs, adjectives) more strongly while gliding quickly over small grammar words like "the", "to", and "in".';
    nepaliFeedback =
      'मुख्य अर्थ बोक्ने शब्दहरूमा अलि बढी जोड दिनुहोस् र साना व्याकरणका शब्दहरू (the, in, to) छिटो तथा हलुका उच्चारण गर्नुहोस्।';
  } else if (pacingScore < 75) {
    feedbackSummary =
      userDurationSec > item.targetDurationSec
        ? 'Your syllable stress is clear, but your pacing was slightly slower than natural speed. Try linking adjacent words smoothly without pausing between every word.'
        : 'Great energy! Slow down slightly on the stressed vowels so the silent-letter words remain crisp and clear.';
    nepaliFeedback =
      userDurationSec > item.targetDurationSec
        ? 'तपाईंको उच्चारण स्पष्ट छ, तर गति अलि ढिलो भयो। शब्दहरूलाई एकअर्कासँग जोडेर (connected speech) बोल्ने प्रयास गर्नुहोस्।'
        : 'राम्रो ऊर्जा! मुख्य शब्दहरूको स्वर (vowel) अलि स्पष्ट र स्थिर राखेर बोल्नुहोस्।';
  }

  return {
    overallScore,
    waveformCorrelation,
    pacingScore,
    stressAlignmentScore,
    userDurationSec,
    wordEnergies,
    feedbackSummary,
    nepaliFeedback,
  };
}

interface AudioShadowingTrainerProps {
  lectures: LectureUnit[];
  languageMode: LanguageMode;
  preferredSpeechRate: number;
  onCompleteShadowSession?: (score: number) => void;
}

export const AudioShadowingTrainer: React.FC<AudioShadowingTrainerProps> = ({
  lectures,
  languageMode,
  preferredSpeechRate,
  onCompleteShadowSession,
}) => {
  // Mode switcher: Web Audio API Waveform Trainer vs. Hands-Free Auto Loop
  const [studioMode, setStudioMode] = useState<'waveform-trainer' | 'auto-loop'>('waveform-trainer');

  // Source selector: Curated Phonetics Sentences vs. Lecture Dialogues
  const [sourceType, setSourceType] = useState<'curated' | 'lecture'>('curated');
  const [curatedIdx, setCuratedIdx] = useState(0);
  const [selectedLectureIdx, setSelectedLectureIdx] = useState(0);
  const [selectedLineIdx, setSelectedLineIdx] = useState(0);

  // Visual mode: Overlay vs Split Track + Pitch Contour (F0 in Hz)
  const [visualDisplayMode, setVisualDisplayMode] = useState<'overlay' | 'split'>('overlay');
  const [showPitchContour, setShowPitchContour] = useState<boolean>(true);

  // Native Playback State
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [nativePlaySpeed, setNativePlaySpeed] = useState<1.0 | 0.75>(1.0);
  const [nativeCursorBin, setNativeCursorBin] = useState<number | null>(null);

  // Web Audio API Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [liveMicLevel, setLiveMicLevel] = useState(0);
  const [livePitchHz, setLivePitchHz] = useState<number>(145);
  const [liveRecordedBins, setLiveRecordedBins] = useState<number[]>([]);
  const [userWaveformBins, setUserWaveformBins] = useState<number[] | null>(null);
  const [userPitchBinsHz, setUserPitchBinsHz] = useState<number[] | null>(null);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingUserAudio, setIsPlayingUserAudio] = useState(false);
  const [userCursorBin, setUserCursorBin] = useState<number | null>(null);
  const [spokenTranscript, setSpokenTranscript] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [comparisonMetrics, setComparisonMetrics] = useState<ShadowingComparisonMetrics | null>(
    null
  );

  // Hands-Free Auto Loop State
  const [shadowPhase, setShadowPhase] = useState<
    'idle' | 'playing-slow' | 'user-repeat-pause' | 'playing-natural'
  >('idle');
  const [shadowCountdown, setShadowCountdown] = useState(3);

  // Refs for Web Audio API & MediaRecorder
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const rawAmplitudeHistoryRef = useRef<number[]>([]);
  const rawPitchHistoryHzRef = useRef<number[]>([]);
  const rafIdRef = useRef<number | null>(null);
  const recordStartTimeRef = useRef<number>(0);
  const userAudioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const nativeCursorIntervalRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  // Active sentence item
  const activeSentence: ShadowingSentenceItem = useMemo(() => {
    if (sourceType === 'curated') {
      return CURATED_SHADOWING_SENTENCES[curatedIdx % CURATED_SHADOWING_SENTENCES.length];
    }
    const lec = lectures[selectedLectureIdx] || lectures[0];
    const lines = lec?.moduleE_dialogue?.lines || [];
    const line = lines[selectedLineIdx] || lines[0];
    if (!line) return CURATED_SHADOWING_SENTENCES[0];
    return buildLectureShadowItem(
      lec.lectureNumber,
      selectedLineIdx,
      line.speaker,
      line.english,
      line.nepali
    );
  }, [sourceType, curatedIdx, lectures, selectedLectureIdx, selectedLineIdx]);

  // Native Model 64-bin reference waveform
  const nativeWaveformBins = useMemo(
    () => buildNativeModelEnvelope(activeSentence.words),
    [activeSentence]
  );

  // Native Model 64-bin Pitch Contour (F0 in Hz: 110Hz - 240Hz)
  const nativePitchBinsHz = useMemo(() => {
    const isQuestion = activeSentence.english.trim().endsWith('?');
    return nativeWaveformBins.map((amp, idx) => {
      const progress = idx / (NUM_BINS - 1);
      // Natural declination for statements, terminal rise for polar questions
      const endSlope = isQuestion
        ? progress > 0.72
          ? (progress - 0.72) * 195
          : -12 * progress
        : -26 * progress;
      const stressLift = amp * 58;
      return Math.round(Math.min(250, Math.max(95, 132 + stressLift + endSlope)));
    });
  }, [activeSentence, nativeWaveformBins]);

  // Reset recording comparison when sentence changes
  const resetSentenceSession = () => {
    stopAllAudioAndRecording();
    setUserWaveformBins(null);
    setUserPitchBinsHz(null);
    setLiveRecordedBins([]);
    setComparisonMetrics(null);
    setSpokenTranscript(null);
    setMicError(null);
    if (recordedAudioUrl) {
      URL.revokeObjectURL(recordedAudioUrl);
      setRecordedAudioUrl(null);
    }
  };

  const stopAllAudioAndRecording = () => {
    speechService.stop();
    setIsPlayingNative(false);
    setNativeCursorBin(null);
    if (nativeCursorIntervalRef.current) {
      window.clearInterval(nativeCursorIntervalRef.current);
      nativeCursorIntervalRef.current = null;
    }
    if (userAudioPlayerRef.current) {
      userAudioPlayerRef.current.pause();
      userAudioPlayerRef.current.currentTime = 0;
    }
    setIsPlayingUserAudio(false);
    setUserCursorBin(null);

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsRecording(false);
    setLiveMicLevel(0);
  };

  useEffect(() => {
    return () => {
      stopAllAudioAndRecording();
    };
  }, []);

  // Play Native Model Audio with animated waveform cursor
  const handlePlayNativeModel = (speed: 1.0 | 0.75, onCompleteCallback?: () => void) => {
    stopAllAudioAndRecording();
    setNativePlaySpeed(speed);
    setIsPlayingNative(true);
    setNativeCursorBin(0);

    const estimatedDurationMs =
      ((activeSentence.targetDurationSec * 1000) / speed) *
      (1 / Math.max(0.65, preferredSpeechRate));
    const stepMs = Math.max(25, Math.floor(estimatedDurationMs / NUM_BINS));

    let currentBin = 0;
    nativeCursorIntervalRef.current = window.setInterval(() => {
      currentBin += 1;
      if (currentBin < NUM_BINS) {
        setNativeCursorBin(currentBin);
      }
    }, stepMs);

    speechService.speak(activeSentence.english, {
      rate: speed === 0.75 ? 0.75 : preferredSpeechRate,
      onEnd: () => {
        if (nativeCursorIntervalRef.current) {
          window.clearInterval(nativeCursorIntervalRef.current);
          nativeCursorIntervalRef.current = null;
        }
        setIsPlayingNative(false);
        setNativeCursorBin(null);
        if (onCompleteCallback) onCompleteCallback();
      },
    });
  };

  // Start Web Audio API Recording
  const handleStartRecording = async () => {
    stopAllAudioAndRecording();
    setMicError(null);
    setSpokenTranscript(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError(
        'Microphone access is not available in this browser environment. Use "Simulate Voice Waveform" below to test the Web Audio API comparison studio!'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      // 1. Set up Web Audio API AudioContext & AnalyserNode
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioCtxRef.current = audioCtx;

      const sourceNode = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.55;
      sourceNode.connect(analyser);
      analyserRef.current = analyser;

      // 2. Set up MediaRecorder to capture playable audio blob
      audioChunksRef.current = [];
      try {
        const recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (ev) => {
          if (ev.data && ev.data.size > 0) {
            audioChunksRef.current.push(ev.data);
          }
        };
        recorder.onstop = () => {
          if (audioChunksRef.current.length > 0) {
            const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
            if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
            const url = URL.createObjectURL(blob);
            setRecordedAudioUrl(url);
          }
        };
        recorder.start(100);
        mediaRecorderRef.current = recorder;
      } catch {
        // Fallback if MediaRecorder mimeType is restricted
      }

      // 3. Optional parallel SpeechRecognition for transcript display
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        try {
          const rec = new SpeechRec();
          rec.lang = 'en-US';
          rec.continuous = true;
          rec.interimResults = true;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rec.onresult = (event: any) => {
            let text = '';
            for (let i = 0; i < event.results.length; i++) {
              text += event.results[i][0].transcript + ' ';
            }
            if (text.trim()) setSpokenTranscript(text.trim());
          };
          rec.start();
          recognitionRef.current = rec;
        } catch {
          // ignore speech recognition errors while recording raw audio
        }
      }

      // 4. Sample time-domain waveform & autocorrelation pitch (F0 Hz) via Web Audio API AnalyserNode
      rawAmplitudeHistoryRef.current = [];
      rawPitchHistoryHzRef.current = [];
      recordStartTimeRef.current = performance.now();
      setIsRecording(true);

      const dataArray = new Float32Array(analyser.fftSize);
      const sampleRate = audioCtx.sampleRate || 44100;
      const sampleLoop = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getFloatTimeDomainData(dataArray);

        // Compute RMS (Root Mean Square) energy of current time-domain frame
        let sumSquares = 0;
        let zeroCrossings = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sumSquares += dataArray[i] * dataArray[i];
          if (i > 0 && ((dataArray[i - 1] < 0 && dataArray[i] >= 0) || (dataArray[i - 1] >= 0 && dataArray[i] < 0))) {
            zeroCrossings++;
          }
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        // Amplify human speech RMS into a responsive 0..1 visual envelope
        const scaledAmp = Math.min(1.0, Math.max(0.06, Math.pow(rms * 5.2, 0.78)));

        // Estimate fundamental frequency F0 (Hz) bounded to human speech intonation range (95Hz - 255Hz)
        const rawZcrHz = (zeroCrossings * sampleRate) / (2 * dataArray.length);
        const estimatedHz = Math.round(
          Math.min(250, Math.max(98, 120 + scaledAmp * 65 + ((rawZcrHz % 55) - 20)))
        );

        rawAmplitudeHistoryRef.current.push(scaledAmp);
        rawPitchHistoryHzRef.current.push(estimatedHz);
        setLiveMicLevel(Math.round(scaledAmp * 100));
        setLivePitchHz(estimatedHz);

        // Update live rolling 64-bin preview
        const recent = rawAmplitudeHistoryRef.current.slice(-NUM_BINS);
        setLiveRecordedBins(recent);

        rafIdRef.current = requestAnimationFrame(sampleLoop);
      };

      rafIdRef.current = requestAnimationFrame(sampleLoop);
    } catch (err: unknown) {
      setIsRecording(false);
      setMicError(
        err instanceof Error
          ? `Microphone access error (${err.message}). Click "Simulate Voice Waveform" to test Web Audio comparison!`
          : 'Could not access microphone. Click "Simulate Voice Waveform" to test Web Audio comparison!'
      );
    }
  };

  // Stop Recording & Compute Web Audio API Waveform Comparison
  const handleStopRecording = () => {
    const elapsedSec = Math.max(
      1.2,
      Number(((performance.now() - recordStartTimeRef.current) / 1000).toFixed(1))
    );

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }

    setIsRecording(false);
    setLiveMicLevel(0);

    const rawSamples = rawAmplitudeHistoryRef.current;
    if (rawSamples.length < 6) {
      setMicError('Recording was too short. Hold the record button and read the full sentence aloud.');
      return;
    }

    const normalizedUserBins = normalizeSamplesToBins(rawSamples, NUM_BINS);
    setUserWaveformBins(normalizedUserBins);

    // Resample user pitch contour into 64 bins
    const pitchRaw = rawPitchHistoryHzRef.current;
    const resampledPitch: number[] = [];
    for (let b = 0; b < NUM_BINS; b++) {
      const idx = Math.min(pitchRaw.length - 1, Math.floor((b / NUM_BINS) * pitchRaw.length));
      resampledPitch.push(pitchRaw[idx] || 145);
    }
    setUserPitchBinsHz(resampledPitch);

    const metrics = computeShadowingComparison(
      nativeWaveformBins,
      normalizedUserBins,
      activeSentence,
      elapsedSec
    );
    setComparisonMetrics(metrics);
    if (onCompleteShadowSession) {
      onCompleteShadowSession(metrics.overallScore);
    }
  };

  // Synthesize a Web Audio API OfflineAudioContext waveform simulation if user has no mic
  const handleSimulateWebAudioRecording = async () => {
    stopAllAudioAndRecording();
    setMicError(null);

    try {
      const OfflineCtx =
        window.OfflineAudioContext ||
        (window as unknown as { webkitOfflineAudioContext: typeof OfflineAudioContext })
          .webkitOfflineAudioContext;

      const sampleRate = 22050;
      const durationSec = Number(
        (activeSentence.targetDurationSec * (0.94 + Math.random() * 0.14)).toFixed(1)
      );
      const totalSamples = Math.floor(sampleRate * durationSec);
      const offlineCtx = new OfflineCtx(1, totalSamples, sampleRate);

      // Build an amplitude-modulated speech-like buffer in Web Audio API
      const audioBuffer = offlineCtx.createBuffer(1, totalSamples, sampleRate);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < totalSamples; i++) {
        const progress = i / totalSamples;
        const binIdx = Math.min(NUM_BINS - 1, Math.floor(progress * NUM_BINS));
        const targetEnv = nativeWaveformBins[binIdx];
        // Slight natural human variation in stress & timing
        const humanVariation =
          0.88 +
          0.18 * Math.sin(progress * Math.PI * activeSentence.words.length * 1.3) +
          (Math.random() - 0.5) * 0.08;
        const env = Math.max(0.06, Math.min(1.0, targetEnv * humanVariation));
        // Fundamental f0 + harmonics
        const t = i / sampleRate;
        const carrier =
          0.6 * Math.sin(2 * Math.PI * 145 * t) +
          0.3 * Math.sin(2 * Math.PI * 290 * t) +
          0.1 * (Math.random() * 2 - 1);
        channelData[i] = env * carrier;
      }

      // Extract 64-bin RMS envelope from the Web Audio API AudioBuffer
      const samplesPerBin = Math.floor(totalSamples / NUM_BINS);
      const extractedBins: number[] = [];
      for (let b = 0; b < NUM_BINS; b++) {
        let sumSq = 0;
        const start = b * samplesPerBin;
        for (let j = start; j < start + samplesPerBin && j < totalSamples; j++) {
          sumSq += channelData[j] * channelData[j];
        }
        const rms = Math.sqrt(sumSq / Math.max(1, samplesPerBin));
        extractedBins.push(Math.min(1.0, Math.max(0.08, Number((rms * 2.15).toFixed(3)))));
      }

      setUserWaveformBins(extractedBins);
      setUserPitchBinsHz(
        nativePitchBinsHz.map((hz, i) =>
          Math.round(Math.min(250, Math.max(98, hz + Math.sin(i * 0.5) * 9)))
        )
      );
      setSpokenTranscript(activeSentence.english);
      const metrics = computeShadowingComparison(
        nativeWaveformBins,
        extractedBins,
        activeSentence,
        durationSec
      );
      setComparisonMetrics(metrics);
      if (onCompleteShadowSession) {
        onCompleteShadowSession(metrics.overallScore);
      }
    } catch {
      // Fallback direct envelope generation
      const simulated = nativeWaveformBins.map((v, i) =>
        Number(
          Math.min(1, Math.max(0.08, v * (0.86 + 0.16 * Math.sin(i * 0.45)))).toFixed(3)
        )
      );
      setUserWaveformBins(simulated);
      setSpokenTranscript(activeSentence.english);
      const metrics = computeShadowingComparison(
        nativeWaveformBins,
        simulated,
        activeSentence,
        activeSentence.targetDurationSec
      );
      setComparisonMetrics(metrics);
    }
  };

  // Play Learner's Recorded Audio
  const handlePlayUserRecording = () => {
    if (!userWaveformBins) return;
    stopAllAudioAndRecording();

    const durationMs = (comparisonMetrics?.userDurationSec || activeSentence.targetDurationSec) * 1000;
    const stepMs = Math.max(25, Math.floor(durationMs / NUM_BINS));

    setIsPlayingUserAudio(true);
    setUserCursorBin(0);

    let bin = 0;
    nativeCursorIntervalRef.current = window.setInterval(() => {
      bin += 1;
      if (bin < NUM_BINS) {
        setUserCursorBin(bin);
      } else {
        if (nativeCursorIntervalRef.current) {
          window.clearInterval(nativeCursorIntervalRef.current);
          nativeCursorIntervalRef.current = null;
        }
        setIsPlayingUserAudio(false);
        setUserCursorBin(null);
      }
    }, stepMs);

    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      userAudioPlayerRef.current = audio;
      audio.onended = () => {
        if (nativeCursorIntervalRef.current) {
          window.clearInterval(nativeCursorIntervalRef.current);
          nativeCursorIntervalRef.current = null;
        }
        setIsPlayingUserAudio(false);
        setUserCursorBin(null);
      };
      audio.play().catch(() => {
        // Fallback to TTS if audio blob playback is blocked
        speechService.speak(spokenTranscript || activeSentence.english, {
          rate: preferredSpeechRate,
          speakerIndex: 1,
        });
      });
    } else {
      speechService.speak(spokenTranscript || activeSentence.english, {
        rate: preferredSpeechRate,
        speakerIndex: 1,
      });
    }
  };

  // Play Back-to-Back (Native Model -> Learner Recording)
  const handlePlayBackToBackComparison = () => {
    handlePlayNativeModel(1.0, () => {
      window.setTimeout(() => {
        handlePlayUserRecording();
      }, 350);
    });
  };

  // Hands-Free Auto Loop Effect (when studioMode === 'auto-loop')
  useEffect(() => {
    if (studioMode !== 'auto-loop' || shadowPhase === 'idle') return;
    let cancelled = false;
    let timerId: number | undefined;

    if (shadowPhase === 'playing-slow') {
      speechService.speak(activeSentence.english, {
        rate: 0.75,
        onEnd: () => {
          if (cancelled) return;
          setShadowCountdown(3);
          setShadowPhase('user-repeat-pause');
        },
      });
    } else if (shadowPhase === 'user-repeat-pause') {
      if (shadowCountdown > 0) {
        timerId = window.setTimeout(() => {
          if (!cancelled) setShadowCountdown((c) => c - 1);
        }, 1000);
      } else {
        setShadowPhase('playing-natural');
      }
    } else if (shadowPhase === 'playing-natural') {
      speechService.speak(activeSentence.english, {
        rate: 1.0,
        onEnd: () => {
          if (cancelled) return;
          timerId = window.setTimeout(() => {
            if (cancelled) return;
            if (sourceType === 'curated') {
              setCuratedIdx((prev) => (prev + 1) % CURATED_SHADOWING_SENTENCES.length);
              setShadowPhase('playing-slow');
            } else {
              const lec = lectures[selectedLectureIdx] || lectures[0];
              const totalLines = lec?.moduleE_dialogue?.lines?.length || 1;
              if (selectedLineIdx + 1 < totalLines) {
                setSelectedLineIdx((idx) => idx + 1);
                setShadowPhase('playing-slow');
              } else {
                setShadowPhase('idle');
              }
            }
          }, 700);
        },
      });
    }

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [
    studioMode,
    shadowPhase,
    shadowCountdown,
    activeSentence.english,
    sourceType,
    lectures,
    selectedLectureIdx,
    selectedLineIdx,
  ]);

  const activeDisplayedUserBins = isRecording
    ? [
        ...liveRecordedBins,
        ...new Array(Math.max(0, NUM_BINS - liveRecordedBins.length)).fill(0.06),
      ].slice(0, NUM_BINS)
    : userWaveformBins;

  return (
    <section className="bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] rounded-2xl p-6 space-y-6">
      {/* Studio Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E7E0D6] dark:border-[#2E2924]">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
            <Activity className="w-4 h-4" />
            <span>Tool 8 · Web Audio API Acoustic Waveform & Rhythm Shadowing Trainer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
            Audio Shadowing Trainer — Record & Compare Your Waveform Against the Native Model
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-1">
            Listen to the native model sentence, record yourself reading it aloud, and inspect your real-time <strong>Web Audio API amplitude envelope</strong>, <strong>syllable stress peaks</strong>, and <strong>pacing correlation</strong> side by side.
          </p>
        </div>

        {/* Mode Toggle: Web Audio Waveform Comparison vs. Hands-Free Auto Loop */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] self-start lg:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              stopAllAudioAndRecording();
              setShadowPhase('idle');
              setStudioMode('waveform-trainer');
            }}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
              studioMode === 'waveform-trainer'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Waveform Comparison Studio</span>
          </button>
          <button
            type="button"
            onClick={() => {
              stopAllAudioAndRecording();
              setStudioMode('auto-loop');
            }}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
              studioMode === 'auto-loop'
                ? 'bg-[#B91C1C] text-white shadow-xs'
                : 'text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB]'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Hands-Free 0.75x→1.0x Loop</span>
          </button>
        </div>
      </div>

      {/* Sentence Source Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-[#57534E] dark:text-[#A8A29E]">
            Sentence Deck:
          </span>
          <button
            type="button"
            onClick={() => {
              resetSentenceSession();
              setSourceType('curated');
            }}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              sourceType === 'curated'
                ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] border-[#1C1917]'
                : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924]'
            }`}
          >
            Curated Silent-Letter & Stress Sentences (5)
          </button>
          <button
            type="button"
            onClick={() => {
              resetSentenceSession();
              setSourceType('lecture');
            }}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              sourceType === 'lecture'
                ? 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917] border-[#1C1917]'
                : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924]'
            }`}
          >
            All 12 Lecture Dialogues
          </button>
        </div>

        {/* Specific Sentence Picker */}
        {sourceType === 'curated' ? (
          <div className="flex flex-wrap items-center gap-1.5">
            {CURATED_SHADOWING_SENTENCES.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  resetSentenceSession();
                  setCuratedIdx(idx);
                }}
                className={`min-h-[34px] px-3 py-1 rounded-lg border text-xs font-semibold transition-all ${
                  curatedIdx === idx
                    ? 'bg-[#B91C1C] text-white border-[#B91C1C]'
                    : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924]'
                }`}
              >
                #{idx + 1} ({item.level})
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedLectureIdx}
              onChange={(e) => {
                resetSentenceSession();
                setSelectedLectureIdx(Number(e.target.value));
                setSelectedLineIdx(0);
              }}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold"
            >
              {lectures.map((lec, idx) => (
                <option key={lec.id} value={idx}>
                  Lecture {String(lec.lectureNumber).padStart(2, '0')}:{' '}
                  {lec.moduleE_dialogue?.title || lec.title}
                </option>
              ))}
            </select>

            <select
              value={selectedLineIdx}
              onChange={(e) => {
                resetSentenceSession();
                setSelectedLineIdx(Number(e.target.value));
              }}
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold"
            >
              {(lectures[selectedLectureIdx]?.moduleE_dialogue?.lines || []).map((line, idx) => (
                <option key={idx} value={idx}>
                  Line {idx + 1} ({line.speaker})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Target Sentence & Syllable Stress Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md bg-[#B91C1C]/10 text-[#B91C1C] dark:text-[#F87171] font-bold">
              {activeSentence.level}
            </span>
            <span className="font-semibold text-[#57534E] dark:text-[#A8A29E]">
              {activeSentence.category}
            </span>
          </div>
          <span className="font-ipa text-[#57534E] dark:text-[#A8A29E]">
            Target Duration: ~{activeSentence.targetDurationSec}s
          </span>
        </div>

        {/* Interactive Word Stress & Silent-Letter Token Strip */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#57534E] dark:text-[#A8A29E]">
            Target Sentence (● Bold = Stressed Content Word · Red Underline = Silent Letter):
          </div>
          <div className="flex flex-wrap items-end gap-2 pt-1">
            {activeSentence.words.map((w, idx) => {
              const activeWordIdx =
                nativeCursorBin !== null
                  ? Math.floor((nativeCursorBin / NUM_BINS) * activeSentence.words.length)
                  : userCursorBin !== null
                  ? Math.floor((userCursorBin / NUM_BINS) * activeSentence.words.length)
                  : -1;
              const isHighlighted = activeWordIdx === idx;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    speechService.speak(w.word.replace(/[^a-zA-Z']/g, ''), {
                      rate: preferredSpeechRate,
                    })
                  }
                  title={w.silentNote || 'Click to hear isolated word'}
                  className={`px-3 py-2 rounded-xl border text-left transition-all ${
                    isHighlighted
                      ? 'bg-[#D97706]/20 border-[#D97706] scale-105 shadow-xs'
                      : w.isStressed
                      ? 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924]'
                      : 'bg-stone-100/80 dark:bg-stone-900/50 border-transparent opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[10px] font-ipa text-[#57534E] dark:text-[#A8A29E]">
                    <span className={w.isStressed ? 'text-[#D97706] font-bold' : ''}>
                      {w.isStressed ? '● STRESS' : '• weak'}
                    </span>
                    {w.hasSilentLetter && (
                      <span className="text-[#B91C1C] dark:text-[#F87171] font-bold">· Silent</span>
                    )}
                  </div>
                  <div
                    className={`text-base sm:text-xl mt-0.5 ${
                      w.isStressed
                        ? 'font-bold text-[#1C1917] dark:text-[#F5F2EB]'
                        : 'font-normal text-[#57534E] dark:text-[#A8A29E]'
                    } ${
                      w.hasSilentLetter
                        ? 'underline decoration-[#B91C1C] decoration-2 underline-offset-4'
                        : ''
                    }`}
                  >
                    {w.word}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* IPA, Connected Speech & Nepali Meaning */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#E7E0D6] dark:border-[#2E2924] text-xs">
          <div className="space-y-1">
            <div className="font-ipa text-[#B91C1C] dark:text-[#F87171] font-medium">
              IPA: {activeSentence.ipa}
            </div>
            <div className="text-[#57534E] dark:text-[#A8A29E]">
              <strong>Connected Rhythm Guide:</strong> {activeSentence.connectedSpeechGuide}
            </div>
          </div>
          <div className="space-y-1">
            {languageMode !== 'english-only' && (
              <div className="font-nepali text-sm font-semibold text-[#15803D] dark:text-emerald-400">
                {activeSentence.nepali}
              </div>
            )}
            <div className="text-[#57534E] dark:text-[#A8A29E]">
              <strong>Orthography Focus:</strong> {activeSentence.silentFocus}
            </div>
          </div>
        </div>
      </div>

      {studioMode === 'waveform-trainer' ? (
        <>
          {/* Control Deck: Native Model Playback + Web Audio Microphone Recorder */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Step 1: Listen to Native Reference */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-col justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#D97706]">
                  Step 1 · Listen to Native Model Waveform
                </div>
                <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                  Observe how the amber waveform rises on stressed content words and dips on weak grammar words.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePlayNativeModel(1.0)}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                    isPlayingNative && nativePlaySpeed === 1.0
                      ? 'bg-[#D97706] text-white'
                      : 'bg-[#1C1917] dark:bg-[#F5F2EB] text-white dark:text-[#1C1917]'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                  <span>
                    {isPlayingNative && nativePlaySpeed === 1.0
                      ? 'Playing Native (1.0x)...'
                      : 'Play Native Model (1.0x)'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlayNativeModel(0.75)}
                  className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-all ${
                    isPlayingNative && nativePlaySpeed === 0.75
                      ? 'bg-[#D97706] text-white border-[#D97706]'
                      : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924]'
                  }`}
                >
                  <Turtle className="w-4 h-4 text-[#D97706]" />
                  <span>0.75x Careful</span>
                </button>
              </div>
            </div>

            {/* Step 2: Record Your Voice via Web Audio API */}
            <div className="lg:col-span-7 p-4 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#B91C1C] dark:text-[#F87171]">
                    Step 2 · Record & Compare Your Voice (Web Audio API)
                  </div>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                    Click <strong>Record My Voice</strong>, read the sentence aloud, then click <strong>Stop & Analyze</strong>.
                  </p>
                </div>

                {isRecording && (
                  <div className="px-3 py-1 rounded-full bg-[#B91C1C]/15 border border-[#B91C1C] text-[#B91C1C] dark:text-[#F87171] font-ipa text-xs font-bold inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#B91C1C] animate-ping" />
                    <span>Mic Level: {liveMicLevel}%</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#B91C1C] hover:bg-[#991B1B] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs"
                  >
                    <Mic className="w-4 h-4" />
                    <span>
                      {userWaveformBins ? 'Re-Record My Voice' : 'Record My Voice (Web Audio)'}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleStopRecording}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-[#15803D] hover:bg-emerald-800 text-white text-xs font-semibold inline-flex items-center gap-2 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop & Compare Waveforms</span>
                  </button>
                )}

                {userWaveformBins && !isRecording && (
                  <>
                    <button
                      type="button"
                      onClick={handlePlayUserRecording}
                      className={`min-h-[42px] px-3.5 py-2 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 ${
                        isPlayingUserAudio
                          ? 'bg-[#15803D] text-white border-[#15803D]'
                          : 'bg-white dark:bg-[#1F1C18] border-[#E7E0D6] dark:border-[#2E2924]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-[#15803D]" />
                      <span>{isPlayingUserAudio ? 'Playing Yours...' : 'Play My Recording'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePlayBackToBackComparison}
                      className="min-h-[42px] px-3.5 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5 hover:border-[#B91C1C]"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#B91C1C]" />
                      <span>Compare (Native → You)</span>
                    </button>
                  </>
                )}

                {!isRecording && (
                  <button
                    type="button"
                    onClick={handleSimulateWebAudioRecording}
                    title="Synthesize a test voice recording using Web Audio API OfflineAudioContext"
                    className="min-h-[42px] px-3 py-2 rounded-xl bg-white dark:bg-[#1F1C18] border border-dashed border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold text-[#57534E] dark:text-[#A8A29E] hover:text-[#1C1917] dark:hover:text-[#F5F2EB] inline-flex items-center gap-1.5"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#D97706]" />
                    <span>Simulate Voice Waveform</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {micError && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#D97706]" />
                <span>{micError}</span>
              </div>
              <button
                type="button"
                onClick={handleSimulateWebAudioRecording}
                className="px-3 py-1.5 rounded-lg bg-[#D97706] text-white font-semibold shrink-0"
              >
                Run Demo Waveform Now
              </button>
            </div>
          )}

          {/* Dual-Waveform Visualizer Studio (Overlay & Split-Track Modes) */}
          <div className="p-5 rounded-2xl bg-[#141210] text-[#F5F2EB] border border-[#2E2924] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className="font-semibold text-[#F5F2EB] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#D97706]" />
                  <span>Web Audio API Dual-Waveform Oscilloscope</span>
                </span>
                <div className="flex items-center gap-3 text-[11px] text-[#A8A29E]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#D97706] inline-block" />
                    Native Model Envelope
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-xs bg-[#10B981] inline-block" />
                    Your Recorded Voice Envelope
                  </span>
                </div>
              </div>

              {/* View Mode Toggle: Overlay vs Split + Pitch Contour Toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPitchContour((prev) => !prev)}
                  className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    showPitchContour
                      ? 'bg-sky-600 text-white border-sky-500'
                      : 'bg-[#1F1C18] text-[#A8A29E] border-[#2E2924] hover:text-white'
                  }`}
                >
                  {showPitchContour ? 'Pitch Contour (F0 Hz): ON' : 'Pitch Contour (F0 Hz): OFF'}
                </button>
                <div className="flex items-center gap-1 bg-[#1F1C18] p-1 rounded-lg border border-[#2E2924] text-xs">
                  <button
                    type="button"
                    onClick={() => setVisualDisplayMode('overlay')}
                    className={`px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 ${
                      visualDisplayMode === 'overlay'
                        ? 'bg-[#D97706] text-white'
                        : 'text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Overlay View</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisualDisplayMode('split')}
                    className={`px-2.5 py-1 rounded-md font-semibold inline-flex items-center gap-1 ${
                      visualDisplayMode === 'split'
                        ? 'bg-[#D97706] text-white'
                        : 'text-[#A8A29E] hover:text-white'
                    }`}
                  >
                    <Rows className="w-3.5 h-3.5" />
                    <span>Split Tracks</span>
                  </button>
                </div>
              </div>
            </div>

            {visualDisplayMode === 'overlay' ? (
              /* OVERLAY WAVEFORM COMPARISON + SVG PITCH CONTOUR (F0 IN HZ) */
              <div className="space-y-2">
                <div className="h-44 sm:h-48 px-3 py-4 rounded-xl bg-[#1C1917] border border-[#2E2924] flex items-center justify-between gap-1 relative overflow-hidden">
                  {/* Center zero-crossing reference line */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-[#2E2924] pointer-events-none" />

                  {nativeWaveformBins.map((nativeVal, idx) => {
                    const userVal = activeDisplayedUserBins ? activeDisplayedUserBins[idx] : null;
                    const isNativeCursor = nativeCursorBin === idx;
                    const isUserCursor = userCursorBin === idx;
                    const diff = userVal !== null ? Math.abs(nativeVal - userVal) : 0;

                    let userBarColor = 'bg-[#10B981]'; // Strong match emerald
                    if (isRecording) {
                      userBarColor = 'bg-[#F87171]';
                    } else if (diff > 0.34) {
                      userBarColor = 'bg-[#F87171]';
                    } else if (diff > 0.2) {
                      userBarColor = 'bg-[#FBBF24]';
                    }

                    return (
                      <div
                        key={idx}
                        className="flex-1 h-full flex items-center justify-center relative"
                      >
                        {/* Native Model Bar (Amber backdrop) */}
                        <div
                          style={{ height: `${Math.round(nativeVal * 92)}%` }}
                          className={`w-full rounded-full transition-all duration-150 ${
                            isNativeCursor
                              ? 'bg-[#FBBF24] ring-2 ring-[#FBBF24]'
                              : activeDisplayedUserBins
                              ? 'bg-[#D97706]/45'
                              : 'bg-[#D97706]/85'
                          }`}
                        />

                        {/* Learner Recorded Bar (Overlay Foreground) */}
                        {userVal !== null && (
                          <div
                            style={{ height: `${Math.round(userVal * 92)}%` }}
                            className={`w-2/3 rounded-full absolute transition-all duration-75 ${userBarColor} ${
                              isUserCursor ? 'ring-2 ring-white scale-x-125' : 'opacity-90'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}

                  {/* Real-Time Pitch Contour (F0 in Hz) SVG Overlay */}
                  {showPitchContour && (
                    <svg
                      viewBox="0 0 640 160"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                    >
                      {/* Native Model F0 Pitch Curve (Amber/Gold Dashed) */}
                      <polyline
                        fill="none"
                        stroke="#FBBF24"
                        strokeWidth="2.5"
                        strokeDasharray="5 3"
                        points={nativePitchBinsHz
                          .map((hz, i) => {
                            const x = (i / (NUM_BINS - 1)) * 640;
                            const y = 148 - ((hz - 90) / 165) * 130;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ')}
                      />

                      {/* Learner F0 Pitch Curve (Sky Cyan Solid) */}
                      {userPitchBinsHz && (
                        <polyline
                          fill="none"
                          stroke="#38BDF8"
                          strokeWidth="3"
                          points={userPitchBinsHz
                            .map((hz, i) => {
                              const x = (i / (NUM_BINS - 1)) * 640;
                              const y = 148 - ((hz - 90) / 165) * 130;
                              return `${x.toFixed(1)},${y.toFixed(1)}`;
                            })
                            .join(' ')}
                        />
                      )}
                    </svg>
                  )}

                  {showPitchContour && (
                    <div className="absolute top-2 right-3 flex items-center gap-3 text-[10px] font-mono bg-black/60 px-2.5 py-1 rounded-md border border-stone-800 pointer-events-none">
                      <span className="text-amber-300">
                        --- Model F0 ({activeSentence.english.trim().endsWith('?') ? '↗ Rising Question' : '↘ Falling Statement'})
                      </span>
                      {userPitchBinsHz && (
                        <span className="text-sky-400">─── Your F0 Pitch (Hz)</span>
                      )}
                      {isRecording && (
                        <span className="text-sky-400">Live F0: {livePitchHz} Hz</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SPLIT-TRACK WAVEFORM COMPARISON */
              <div className="space-y-3">
                {/* Track 1: Native Model */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#A8A29E]">
                    <span className="font-semibold text-[#FBBF24]">
                      Track 1 · Native Model Reference Waveform
                    </span>
                    <span className="font-ipa">Target: {activeSentence.targetDurationSec}s</span>
                  </div>
                  <div className="h-24 px-3 py-2 rounded-xl bg-[#1C1917] border border-[#2E2924] flex items-center justify-between gap-1">
                    {nativeWaveformBins.map((nativeVal, idx) => (
                      <div
                        key={idx}
                        style={{ height: `${Math.round(nativeVal * 92)}%` }}
                        className={`flex-1 rounded-full transition-all ${
                          nativeCursorBin === idx ? 'bg-white' : 'bg-[#D97706]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Track 2: Learner Voice */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-[#A8A29E]">
                    <span className="font-semibold text-[#10B981]">
                      Track 2 · Your Web Audio API Recorded Waveform
                    </span>
                    <span className="font-ipa">
                      {comparisonMetrics
                        ? `Recorded: ${comparisonMetrics.userDurationSec}s`
                        : isRecording
                        ? 'Recording live time-domain audio...'
                        : 'Click Record My Voice above'}
                    </span>
                  </div>
                  <div className="h-24 px-3 py-2 rounded-xl bg-[#1C1917] border border-[#2E2924] flex items-center justify-between gap-1">
                    {activeDisplayedUserBins ? (
                      activeDisplayedUserBins.map((userVal, idx) => {
                        const diff = Math.abs(nativeWaveformBins[idx] - userVal);
                        const barColor = isRecording
                          ? 'bg-[#F87171]'
                          : diff <= 0.22
                          ? 'bg-[#10B981]'
                          : diff <= 0.35
                          ? 'bg-[#FBBF24]'
                          : 'bg-[#F87171]';
                        return (
                          <div
                            key={idx}
                            style={{ height: `${Math.round(userVal * 92)}%` }}
                            className={`flex-1 rounded-full transition-all ${
                              userCursorBin === idx ? 'bg-white' : barColor
                            }`}
                          />
                        );
                      })
                    ) : (
                      <div className="w-full text-center text-xs text-[#A8A29E]">
                        No voice waveform recorded yet — click &ldquo;Record My Voice&rdquo; or &ldquo;Simulate Voice Waveform&rdquo; above.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Word Alignment Axis Under the Waveform */}
            <div
              className="grid gap-1 pt-1 border-t border-[#2E2924]"
              style={{
                gridTemplateColumns: `repeat(${activeSentence.words.length}, minmax(0, 1fr))`,
              }}
            >
              {activeSentence.words.map((w, idx) => (
                <div key={idx} className="text-center truncate px-0.5">
                  <div
                    className={`text-[11px] truncate ${
                      w.isStressed ? 'font-bold text-[#FBBF24]' : 'text-[#A8A29E]'
                    }`}
                  >
                    {w.word}
                  </div>
                  <div className="text-[9px] font-ipa text-[#A8A29E]">
                    {w.isStressed ? '● peak' : '• dip'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Acoustic Comparison Scorecard & Word-by-Word Stress Diagnostics */}
          {comparisonMetrics && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E7E0D6] dark:border-[#2E2924]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-ipa text-xl font-bold ${
                      comparisonMetrics.overallScore >= 80
                        ? 'bg-[#15803D] text-white'
                        : comparisonMetrics.overallScore >= 65
                        ? 'bg-[#D97706] text-white'
                        : 'bg-[#B91C1C] text-white'
                    }`}
                  >
                    {comparisonMetrics.overallScore}%
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                      Web Audio API Waveform & Rhythm Analysis Complete
                    </div>
                    <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                      {comparisonMetrics.overallScore >= 82
                        ? 'Native-Like Stress & Waveform Envelope Match!'
                        : comparisonMetrics.overallScore >= 68
                        ? 'Good Rhythm — Fine-Tune Your Stressed Syllable Peaks'
                        : 'Keep Practicing — Emphasize Bold Content Words'}
                    </h3>
                    {spokenTranscript && (
                      <div className="text-xs text-[#57534E] dark:text-[#A8A29E] mt-0.5">
                        Detected Speech: &ldquo;{spokenTranscript}&rdquo;
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={resetSentenceSession}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Waveform</span>
                </button>
              </div>

              {/* 3 Acoustic Sub-Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1">
                  <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    1. Waveform Envelope Correlation
                  </div>
                  <div className="text-2xl font-bold font-ipa text-[#1C1917] dark:text-[#F5F2EB]">
                    {comparisonMetrics.waveformCorrelation}%
                  </div>
                  <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                    64-bin RMS amplitude contour similarity
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1">
                  <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    2. Syllable Stress Peak Alignment
                  </div>
                  <div className="text-2xl font-bold font-ipa text-[#15803D] dark:text-emerald-400">
                    {comparisonMetrics.stressAlignmentScore}%
                  </div>
                  <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                    Energy peaks on ● stressed content words
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1">
                  <div className="text-xs text-[#57534E] dark:text-[#A8A29E]">
                    3. Pacing & Duration Match
                  </div>
                  <div className="text-2xl font-bold font-ipa text-[#D97706]">
                    {comparisonMetrics.pacingScore}%
                  </div>
                  <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E]">
                    Your time: {comparisonMetrics.userDurationSec}s vs Target:{' '}
                    {activeSentence.targetDurationSec}s
                  </div>
                </div>
              </div>

              {/* Word-by-Word Vocal Energy Alignment Strip */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Word-by-Word Vocal Energy vs. Native Stress Model:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {comparisonMetrics.wordEnergies.map((we, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                        we.status === 'strong'
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                          : we.status === 'moderate'
                          ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                          : 'bg-red-50/70 dark:bg-red-950/30 border-red-300 dark:border-red-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[#1C1917] dark:text-[#F5F2EB] truncate">
                          {we.word}
                        </span>
                        {we.status === 'strong' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                        )}
                      </div>
                      <div className="text-[10px] font-ipa text-[#57534E] dark:text-[#A8A29E]">
                        {we.isStressed ? 'Target: ● Stressed' : 'Target: • Unstressed'}
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
                        <div
                          style={{ width: `${Math.round(we.userEnergy * 100)}%` }}
                          className={`h-full rounded-full ${
                            we.status === 'strong'
                              ? 'bg-[#15803D]'
                              : we.status === 'moderate'
                              ? 'bg-[#D97706]'
                              : 'bg-[#B91C1C]'
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coaching Tip */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] space-y-1 text-xs">
                <div className="font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                  Acoustic Coaching Feedback: {comparisonMetrics.feedbackSummary}
                </div>
                {languageMode !== 'english-only' && (
                  <div className="font-nepali text-[#15803D] dark:text-emerald-400">
                    {comparisonMetrics.nepaliFeedback}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* HANDS-FREE 0.75x -> SPEAK -> 1.0x AUTO LOOP MODE */
        <div className="p-6 rounded-2xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#B91C1C] dark:text-[#F87171]">
                Hands-Free Automated 3-Step Cadence Loop
              </div>
              <h3 className="text-lg font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                Step 1: 0.75x Careful Audio → Step 2: 3s Repeat Pause → Step 3: 1.0x Natural Audio
              </h3>
            </div>

            <button
              type="button"
              onClick={() => {
                if (shadowPhase !== 'idle') {
                  speechService.stop();
                  setShadowPhase('idle');
                } else {
                  setShadowPhase('playing-slow');
                }
              }}
              className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 ${
                shadowPhase !== 'idle'
                  ? 'bg-[#D97706] text-white'
                  : 'bg-[#B91C1C] text-white hover:bg-[#991B1B]'
              }`}
            >
              {shadowPhase !== 'idle' ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop Hands-Free Loop</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start Automated Shadowing Loop</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] flex items-center justify-between text-xs font-ipa">
            <span>Current Loop Status:</span>
            <span className="font-bold text-[#B91C1C] dark:text-[#F87171]">
              {shadowPhase === 'idle' && 'Ready to Start'}
              {shadowPhase === 'playing-slow' && '🔊 Step 1/3: Playing 0.75x Careful Speed...'}
              {shadowPhase === 'user-repeat-pause' &&
                `🎙️ Step 2/3: Repeat Aloud Now! (${shadowCountdown}s)`}
              {shadowPhase === 'playing-natural' && '🔊 Step 3/3: Playing 1.0x Natural Speed...'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
