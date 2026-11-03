import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Turtle,
  Mic,
  CheckCircle2,
  XCircle,
  Headphones,
  RotateCcw,
  Award,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { LanguageMode, MistakeItem } from '../types/curriculum';
import { speechService, PronunciationResult } from '../services/speech';

export interface MinimalPairWord {
  word: string;
  ipa: string;
  nepaliMeaning: string;
  phonemeSymbol: string;
  articulationCue: string;
  nepaliCue: string;
  exampleSentence: string;
}

export interface MinimalPairContrastGroup {
  id: string;
  title: string;
  nepaliTitle: string;
  contrastBadge: string;
  whyNepaliLearnersMix: string;
  nepaliExplanation: string;
  pairs: {
    id: string;
    wordA: MinimalPairWord;
    wordB: MinimalPairWord;
    contextSentence: string;
    targetChoiceInContext: 'A' | 'B';
  }[];
}

const MINIMAL_PAIR_GROUPS: MinimalPairContrastGroup[] = [
  {
    id: 'mp-v-vs-w',
    title: '/v/ vs. /w/ Contrast (Labiodental vs. Rounded Lips)',
    nepaliTitle: '/v/ र /w/ बीचको ध्वनि भिन्नता (व उच्चारण भ्रम)',
    contrastBadge: '/v/ vs /w/',
    whyNepaliLearnersMix:
      'Nepali uses a single bilabial approximant "व" (/ʋ/) for both sounds. English strictly separates biting the lower lip (/v/) from rounding both lips without tooth contact (/w/).',
    nepaliExplanation:
      'नेपालीमा "व" एउटै अक्षर भएकाले /v/ र /w/ एउटै सुनिन्छ। तर अङ्ग्रेजीमा /v/ बोल्दा माथिल्लो दाँतले तल्लो ओठ छुन्छ भने /w/ बोल्दा ओठ गोलो मात्र पारिन्छ।',
    pairs: [
      {
        id: 'pair-vest-west',
        wordA: {
          word: 'Vest',
          ipa: '/vest/',
          nepaliMeaning: 'इस्टकोट / भित्री गन्जी',
          phonemeSymbol: '/v/',
          articulationCue: 'Touch top teeth gently against lower lip and vibrate vocal cords.',
          nepaliCue: 'माथिल्लो दाँतले तल्लो ओठ हल्का छोएर "भेस्ट" जस्तो कम्पन निकाल्नुहोस्।',
          exampleSentence: 'He wore a warm woolen vest under his trekking jacket.',
        },
        wordB: {
          word: 'West',
          ipa: '/west/',
          nepaliMeaning: 'पश्चिम दिशा',
          phonemeSymbol: '/w/',
          articulationCue: 'Round both lips like saying "oo" (/uː/) — teeth must NOT touch lips.',
          nepaliCue: 'दुवै ओठ गोलो पारेर ("उ-एस्ट" जस्तो) बोल्नुहोस्, दाँतले ओठ नछुनुहोस्।',
          exampleSentence: 'Pokhara lies to the west of Kathmandu Valley.',
        },
        contextSentence: 'The sun sets in the ___ behind the Dhaulagiri mountain range.',
        targetChoiceInContext: 'B',
      },
      {
        id: 'pair-vine-wine',
        wordA: {
          word: 'Vine',
          ipa: '/vaɪn/',
          nepaliMeaning: 'लहरा (अङ्गुर आदिको)',
          phonemeSymbol: '/v/',
          articulationCue: 'Top teeth on bottom lip -> /vaɪn/.',
          nepaliCue: 'माथिल्लो दाँत तल्लो ओठमा राखेर /vaɪn/ उच्चारण गर्नुहोस्।',
          exampleSentence: 'Green pumpkin vines climbed over the courtyard fence.',
        },
        wordB: {
          word: 'Wine',
          ipa: '/waɪn/',
          nepaliMeaning: 'दाखमद्य / वाइन',
          phonemeSymbol: '/w/',
          articulationCue: 'Rounded lips without tooth contact -> /waɪn/.',
          nepaliCue: 'ओठ गोलो पारेर दाँत नछोई /waɪn/ उच्चारण गर्नुहोस्।',
          exampleSentence: 'Marpha is famous for its sweet Himalayan apple wine.',
        },
        contextSentence: 'Climbing ___ plants covered the stone wall of the garden.',
        targetChoiceInContext: 'A',
      },
      {
        id: 'pair-vet-wet',
        wordA: {
          word: 'Vet',
          ipa: '/vet/',
          nepaliMeaning: 'पशु चिकित्सक',
          phonemeSymbol: '/v/',
          articulationCue: 'Bite lower lip gently for initial /v/.',
          nepaliCue: 'तल्लो ओठमा माथिल्लो दाँत छुवाएर /vet/ भन्नुहोस्।',
          exampleSentence: 'The village vet examined the injured calf carefully.',
        },
        wordB: {
          word: 'Wet',
          ipa: '/wet/',
          nepaliMeaning: 'भिजेको / चिसो',
          phonemeSymbol: '/w/',
          articulationCue: 'Pucker lips into a tight circle for initial /w/.',
          nepaliCue: 'ओठ गोलो पारेर /wet/ भन्नुहोस्।',
          exampleSentence: 'Keep your passport dry during the wet monsoon season.',
        },
        contextSentence: 'We took our sick puppy to the ___ clinic this morning.',
        targetChoiceInContext: 'A',
      },
    ],
  },
  {
    id: 'mp-s-vs-sh',
    title: '/s/ vs. /ʃ/ Contrast (Alveolar vs. Postalveolar Sibilant)',
    nepaliTitle: '/s/ (स) र /ʃ/ (श/ष) उच्चारण भिन्नता',
    contrastBadge: '/s/ vs /ʃ/',
    whyNepaliLearnersMix:
      'In spoken Nepali, स, श, and ष are usually pronounced identically as /s/. In English, merging /s/ and /ʃ/ changes "seat" into "sheet" or "sip" into "ship".',
    nepaliExplanation:
      'नेपाली बोलीचालीमा स, श र ष उस्तै बोलिन्छ। तर अङ्ग्रेजीमा /s/ र /ʃ/ नछुट्याउँदा "Seat" (सिट) र "Sheet" (तन्ना/पाना) को अर्थ नै बदलिन्छ।',
    pairs: [
      {
        id: 'pair-seat-sheet',
        wordA: {
          word: 'Seat',
          ipa: '/siːt/',
          nepaliMeaning: 'बस्ने सिट / आसन',
          phonemeSymbol: '/s/',
          articulationCue: 'Tongue tip near front teeth ridge; narrow hiss with lips spread.',
          nepaliCue: 'जिब्रोको टुप्पो अगाडिको दाँतको पछाडि राखेर पातलो "स" (/siːt/) निकाल्नुहोस्।',
          exampleSentence: 'Please fasten your seatbelt while in your window seat.',
        },
        wordB: {
          word: 'Sheet',
          ipa: '/ʃiːt/',
          nepaliMeaning: 'कागजको पाना / तन्ना',
          phonemeSymbol: '/ʃ/',
          articulationCue: 'Pull tongue slightly back toward roof of mouth and round lips ("shhh").',
          nepaliCue: 'जिब्रो अलि पछाडि तानेर ओठ हल्का गोलो पारी "श" (/ʃiːt/) आवाज निकाल्नुहोस्।',
          exampleSentence: 'Write your answers on the official examination sheet.',
        },
        contextSentence: 'Please sign your name at the bottom of the attendance ___.',
        targetChoiceInContext: 'B',
      },
      {
        id: 'pair-sip-ship',
        wordA: {
          word: 'Sip',
          ipa: '/sɪp/',
          nepaliMeaning: 'एक चुस्की (चिया/पानी)',
          phonemeSymbol: '/s/',
          articulationCue: 'Crisp front hiss /s/ with smiling lip posture.',
          nepaliCue: 'दाँतको ठीक पछाडिबाट पातलो "सिप्" उच्चारण गर्नुहोस्।',
          exampleSentence: 'She took a warm sip of masala tea.',
        },
        wordB: {
          word: 'Ship',
          ipa: '/ʃɪp/',
          nepaliMeaning: 'पानीजहाज',
          phonemeSymbol: '/ʃ/',
          articulationCue: 'Hushing sound /ʃ/ with slightly rounded lips.',
          nepaliCue: 'ओठ अलि अगाडि सारेर मोटो "शिप्" उच्चारण गर्नुहोस्।',
          exampleSentence: 'The cargo ship arrived at the harbour on schedule.',
        },
        contextSentence: 'Take a slow ___ of hot ginger water to soothe your throat.',
        targetChoiceInContext: 'A',
      },
      {
        id: 'pair-save-shave',
        wordA: {
          word: 'Save',
          ipa: '/seɪv/',
          nepaliMeaning: 'बचत गर्नु / जोगाउनु',
          phonemeSymbol: '/s/',
          articulationCue: 'Start with sharp /s/ and end with voiced labiodental /v/.',
          nepaliCue: 'सुरुमा पातलो /s/ र अन्त्यमा दाँतले ओठ छोएर /v/ उच्चारण गर्नुहोस्।',
          exampleSentence: 'Solar panels help mountain lodges save electricity.',
        },
        wordB: {
          word: 'Shave',
          ipa: '/ʃeɪv/',
          nepaliMeaning: 'दाह्री काट्नु / खौरनु',
          phonemeSymbol: '/ʃ/',
          articulationCue: 'Start with broad hushing /ʃ/ and end with /v/.',
          nepaliCue: 'सुरुमा मोटो "श" (/ʃ/) ध्वनि निकाल्नुहोस्।',
          exampleSentence: 'He used warm water and a sharp razor to shave.',
        },
        contextSentence: 'Automatic cloud backups ___ your study progress safely.',
        targetChoiceInContext: 'A',
      },
    ],
  },
  {
    id: 'mp-f-vs-ph',
    title: '/f/ vs. /p/ Contrast (Labiodental Fricative vs. Bilabial Stop)',
    nepaliTitle: '/f/ र नेपाली "फ" (/pʰ/) वा /p/ बीचको भिन्नता',
    contrastBadge: '/f/ vs /p/',
    whyNepaliLearnersMix:
      'Nepali "फ" is an aspirated bilabial stop (/pʰ/ made by popping both lips together), whereas English /f/ is a continuous fricative made with top teeth on the bottom lip.',
    nepaliExplanation:
      'नेपाली "फ" बोल्दा दुवै ओठ जोडेर हावा फालिन्छ, तर अङ्ग्रेजी /f/ बोल्दा दुवै ओठ कहिल्यै जोडिँदैन—माथिल्लो दाँतले तल्लो ओठ छोएर निरन्तर हावा बगाइन्छ।',
    pairs: [
      {
        id: 'pair-fan-pan',
        wordA: {
          word: 'Fan',
          ipa: '/fæn/',
          nepaliMeaning: 'पङ्खा / प्रशंसक',
          phonemeSymbol: '/f/',
          articulationCue: 'Top teeth rest on lower lip; blow continuous air without closing lips.',
          nepaliCue: 'माथिल्लो दाँतले तल्लो ओठ छोएर निरन्तर हावा फुक्दै /fæn/ भन्नुहोस्।',
          exampleSentence: 'Turn on the ceiling fan during the warm afternoon.',
        },
        wordB: {
          word: 'Pan',
          ipa: '/pæn/',
          nepaliMeaning: 'तावा / भाँडो',
          phonemeSymbol: '/p/',
          articulationCue: 'Close both lips completely, then release a crisp puff of air.',
          nepaliCue: 'दुवै ओठ जोडेर खोल्दै /pæn/ भन्नुहोस्।',
          exampleSentence: 'Heat a spoonful of mustard oil in the iron pan.',
        },
        contextSentence: 'She roasted cumin seeds in a heavy cast-iron ___.',
        targetChoiceInContext: 'B',
      },
      {
        id: 'pair-fast-past',
        wordA: {
          word: 'Fast',
          ipa: '/fɑːst/',
          nepaliMeaning: 'छिटो / तीव्र (वा व्रत)',
          phonemeSymbol: '/f/',
          articulationCue: 'Continuous friction between top teeth and lower lip.',
          nepaliCue: 'दुवै ओठ नजोडी दाँत र तल्लो ओठबाट हावा बगाएर /fɑːst/ भन्नुहोस्।',
          exampleSentence: 'Fiber-optic internet provides fast connectivity.',
        },
        wordB: {
          word: 'Past',
          ipa: '/pɑːst/',
          nepaliMeaning: 'विगत / बितेको समय',
          phonemeSymbol: '/p/',
          articulationCue: 'Both lips press together and release cleanly.',
          nepaliCue: 'दुवै ओठ जोडेर /pɑːst/ भन्नुहोस्।',
          exampleSentence: 'Historians study ancient manuscripts to understand the past.',
        },
        contextSentence: 'Express trains travel very ___ between major cities.',
        targetChoiceInContext: 'A',
      },
    ],
  },
  {
    id: 'mp-th-vs-t',
    title: '/θ/ vs. /t/ Contrast (Dental Fricative vs. Plosive)',
    nepaliTitle: '/θ/ (थ) र /t/ (ट/त) उच्चारण भिन्नता',
    contrastBadge: '/θ/ vs /t/',
    whyNepaliLearnersMix:
      'English "th" (/θ/) requires placing the tongue tip lightly between the front teeth and blowing air continuously, rather than tapping the roof of the mouth like Nepali "थ" or "ट".',
    nepaliExplanation:
      'अङ्ग्रेजी "th" (/θ/) बोल्दा जिब्रोको टुप्पो माथिल्लो र तल्लो दाँतको बीचमा हल्का बाहिर निकालेर हावा बगाउनुपर्छ।',
    pairs: [
      {
        id: 'pair-thin-tin',
        wordA: {
          word: 'Thin',
          ipa: '/θɪn/',
          nepaliMeaning: 'पातलो / दुब्लो',
          phonemeSymbol: '/θ/',
          articulationCue: 'Place tongue tip gently between front teeth and blow air softly.',
          nepaliCue: 'जिब्रोको टुप्पो दाँतको बीचमा राखेर हावा फुक्दै /θɪn/ भन्नुहोस्।',
          exampleSentence: 'At high altitude, the mountain air becomes very thin.',
        },
        wordB: {
          word: 'Tin',
          ipa: '/tɪn/',
          nepaliMeaning: 'टिनको बट्टा / जस्ता',
          phonemeSymbol: '/t/',
          articulationCue: 'Tap tongue tip briskly behind upper front teeth ridge.',
          nepaliCue: 'जिब्रो दाँतको पछाडि ठोक्काएर /tɪn/ भन्नुहोस्।',
          exampleSentence: 'Grandmother stored cardamom pods in a small metal tin.',
        },
        contextSentence: 'Climbers carry oxygen cylinders because the air is ___ near the summit.',
        targetChoiceInContext: 'A',
      },
      {
        id: 'pair-three-tree',
        wordA: {
          word: 'Three',
          ipa: '/θriː/',
          nepaliMeaning: 'तीन (३)',
          phonemeSymbol: '/θ/',
          articulationCue: 'Start with tongue tip between teeth (/θ/) before retracting to /r/.',
          nepaliCue: 'जिब्रो दाँतको बीचमा राखेर हावा फुक्दै /θriː/ उच्चारण गर्नुहोस्।',
          exampleSentence: 'The workshop lasts for three consecutive days.',
        },
        wordB: {
          word: 'Tree',
          ipa: '/triː/',
          nepaliMeaning: 'रूख / वृक्ष',
          phonemeSymbol: '/t/',
          articulationCue: 'Crisp alveolar stop /t/ transitioning into /r/.',
          nepaliCue: 'माथिल्लो गिजामा जिब्रो ठोक्काएर /triː/ भन्नुहोस्।',
          exampleSentence: 'Villagers rested under the shade of a banyan tree.',
        },
        contextSentence: 'We planted a young rhododendron ___ in the school garden.',
        targetChoiceInContext: 'B',
      },
    ],
  },
];

interface MinimalPairLabProps {
  languageMode: LanguageMode;
  preferredSpeechRate: number;
  onRecordMistake?: (mistake: Omit<MistakeItem, 'id' | 'consecutiveCorrect' | 'createdAt'>) => void;
}

export const MinimalPairLab: React.FC<MinimalPairLabProps> = ({
  languageMode,
  preferredSpeechRate,
  onRecordMistake,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(MINIMAL_PAIR_GROUPS[0].id);
  const [activeMode, setActiveMode] = useState<'explore' | 'ear-quiz' | 'voice-duel'>('explore');

  // Blind Ear-Training Quiz state
  const [quizTargetSide, setQuizTargetSide] = useState<'A' | 'B'>('A');
  const [quizPairIndex, setQuizPairIndex] = useState<number>(0);
  const [hasPlayedMysteryAudio, setHasPlayedMysteryAudio] = useState<boolean>(false);
  const [selectedGuess, setSelectedGuess] = useState<'A' | 'B' | null>(null);
  const [earQuizScore, setEarQuizScore] = useState<number>(0);
  const [earQuizAttempts, setEarQuizAttempts] = useState<number>(0);
  const [earQuizStreak, setEarQuizStreak] = useState<number>(0);

  // Voice Duel state
  const [recordingKey, setRecordingKey] = useState<string | null>(null);
  const [voiceResults, setVoiceResults] = useState<Record<string, PronunciationResult>>({});

  const showNepali = languageMode !== 'english-only';

  const activeGroup = useMemo(
    () => MINIMAL_PAIR_GROUPS.find((g) => g.id === selectedGroupId) || MINIMAL_PAIR_GROUPS[0],
    [selectedGroupId]
  );

  const currentQuizPair = activeGroup.pairs[quizPairIndex % activeGroup.pairs.length];
  const mysteryWordObj = quizTargetSide === 'A' ? currentQuizPair.wordA : currentQuizPair.wordB;

  const startNewEarQuestion = (nextIdx?: number) => {
    const randomSide: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
    setQuizTargetSide(randomSide);
    if (typeof nextIdx === 'number') {
      setQuizPairIndex(nextIdx);
    }
    setSelectedGuess(null);
    setHasPlayedMysteryAudio(false);
  };

  const handlePlayMysteryAudio = (rate = preferredSpeechRate) => {
    setHasPlayedMysteryAudio(true);
    speechService.speakWord(mysteryWordObj.word, rate);
  };

  const handleGuessEarQuiz = (side: 'A' | 'B') => {
    if (selectedGuess !== null) return;
    setSelectedGuess(side);
    setEarQuizAttempts((prev) => prev + 1);
    const isCorrect = side === quizTargetSide;
    if (isCorrect) {
      setEarQuizScore((prev) => prev + 1);
      setEarQuizStreak((prev) => prev + 1);
    } else {
      setEarQuizStreak(0);
      const wrongWord = side === 'A' ? currentQuizPair.wordA : currentQuizPair.wordB;
      if (onRecordMistake) {
        onRecordMistake({
          lectureId: 'minimal-pair-lab',
          lectureNumber: 1,
          category: 'vocabulary',
          sourceType: 'dictation',
          prompt: `Minimal Pair Ear Test (${activeGroup.contrastBadge}): Heard "${mysteryWordObj.word}" (${mysteryWordObj.ipa})`,
          nepaliHint: mysteryWordObj.nepaliMeaning,
          userWrongAnswer: `${wrongWord.word} (${wrongWord.ipa})`,
          correctAnswer: `${mysteryWordObj.word} (${mysteryWordObj.ipa})`,
          explanation: `${mysteryWordObj.articulationCue} — ${mysteryWordObj.nepaliCue}`,
        });
      }
    }
  };

  const handleRecordMinimalPairWord = async (pairId: string, side: 'A' | 'B', wordObj: MinimalPairWord) => {
    const key = `${pairId}-${side}`;
    setRecordingKey(key);
    try {
      const res = await speechService.evaluatePronunciation(wordObj.word);
      setVoiceResults((prev) => ({ ...prev, [key]: res }));
    } finally {
      setRecordingKey(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E6E0D4] dark:border-stone-800 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E6E0D4] dark:border-stone-800 pb-5">
        <div>
          <p className="text-xs font-semibold text-[#B91C1C] dark:text-red-400">
            Phoneme Contrast & Acoustic Discrimination Lab
          </p>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
            Minimal Pair Ear-Training & Pronunciation Studio
          </h3>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
            Train your ear and mouth to separate English phoneme pairs that commonly merge in Nepali speech (
            <span className="font-mono font-semibold">/v/ vs /w/</span> ·{' '}
            <span className="font-mono font-semibold">/s/ vs /ʃ/</span> ·{' '}
            <span className="font-mono font-semibold">/f/ vs /p/</span> ·{' '}
            <span className="font-mono font-semibold">/θ/ vs /t/</span>).
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[#F5F0E6] dark:bg-stone-900 p-1.5 rounded-xl border border-[#E6E0D4] dark:border-stone-800 self-start">
          <button
            onClick={() => setActiveMode('explore')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeMode === 'explore'
                ? 'bg-stone-900 dark:bg-amber-600 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            1. Side-by-Side Compare
          </button>
          <button
            onClick={() => {
              setActiveMode('ear-quiz');
              startNewEarQuestion(0);
            }}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeMode === 'ear-quiz'
                ? 'bg-[#B91C1C] text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            2. Blind Ear Quiz
          </button>
          <button
            onClick={() => setActiveMode('voice-duel')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeMode === 'voice-duel'
                ? 'bg-[#15803D] text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
            }`}
          >
            3. Voice Contrast Duel
          </button>
        </div>
      </div>

      {/* Contrast Group Selector Tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {MINIMAL_PAIR_GROUPS.map((group) => {
          const isSelected = group.id === selectedGroupId;
          return (
            <button
              key={group.id}
              onClick={() => {
                setSelectedGroupId(group.id);
                startNewEarQuestion(0);
              }}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#FAF7F2] dark:bg-stone-800 border-[#B91C1C] dark:border-amber-500 shadow-sm'
                  : 'bg-white dark:bg-stone-900/60 border-[#E6E0D4] dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              <div className="font-mono text-sm font-bold text-[#B91C1C] dark:text-amber-400">
                {group.contrastBadge}
              </div>
              <div className="text-xs font-bold text-stone-900 dark:text-stone-100 mt-1 line-clamp-1">
                {group.title.replace(/\/.*\/ Contrast /, '')}
              </div>
              {showNepali && (
                <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-1">
                  {group.nepaliTitle}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Linguistic Coaching Banner */}
      <div className="bg-[#FAF7F2] dark:bg-stone-900/90 rounded-xl p-4 border border-[#E6E0D4] dark:border-stone-800 space-y-1.5">
        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
          Why Nepali Speakers Mix {activeGroup.contrastBadge}:
        </div>
        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
          {activeGroup.whyNepaliLearnersMix}
        </p>
        {showNepali && (
          <p className="text-xs text-amber-800 dark:text-amber-300 font-medium pt-1">
            नेपाली टिप: {activeGroup.nepaliExplanation}
          </p>
        )}
      </div>

      {/* MODE 1: SIDE-BY-SIDE COMPARE */}
      {activeMode === 'explore' && (
        <div className="space-y-4">
          {activeGroup.pairs.map((pair) => (
            <div
              key={pair.id}
              className="rounded-xl border border-[#E6E0D4] dark:border-stone-800 p-4 sm:p-5 bg-white dark:bg-stone-900/50 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { side: 'A' as const, data: pair.wordA },
                  { side: 'B' as const, data: pair.wordB },
                ].map(({ side, data }) => (
                  <div
                    key={side}
                    className="rounded-xl border border-[#E6E0D4] dark:border-stone-800 p-4 bg-[#FAF7F2] dark:bg-stone-900 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-xs font-mono font-bold text-[#B91C1C] dark:text-amber-400">
                            Phoneme {data.phonemeSymbol}
                          </span>
                          <h4 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
                            {data.word}
                          </h4>
                          <span className="font-mono text-xs text-stone-500 dark:text-stone-400">
                            {data.ipa} · {data.nepaliMeaning}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => speechService.speakWord(data.word, preferredSpeechRate)}
                            className="p-2.5 rounded-lg bg-stone-900 dark:bg-amber-600 text-white hover:opacity-90 transition-opacity cursor-pointer"
                            title={`Listen to ${data.word}`}
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => speechService.speakWord(data.word, 0.65)}
                            className="p-2.5 rounded-lg bg-white dark:bg-stone-800 border border-[#E6E0D4] dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 transition-colors cursor-pointer"
                            title={`Slow 0.65x playback for ${data.word}`}
                          >
                            <Turtle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#E6E0D4] dark:border-stone-800 space-y-1 text-xs">
                        <p className="text-stone-700 dark:text-stone-300 font-medium">
                          <strong className="text-stone-900 dark:text-stone-100">Mouth Cue:</strong>{' '}
                          {data.articulationCue}
                        </p>
                        {showNepali && (
                          <p className="text-stone-500 dark:text-stone-400">{data.nepaliCue}</p>
                        )}
                        <p className="text-stone-600 dark:text-stone-400 italic pt-1">
                          “{data.exampleSentence}”
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6E0D4] dark:border-stone-800 text-xs">
                <span className="text-stone-600 dark:text-stone-400">
                  Compare back-to-back to lock the acoustic difference in your ear:
                </span>
                <button
                  onClick={() => {
                    speechService.speakSentence(
                      `${pair.wordA.word}. ... ${pair.wordB.word}.`,
                      0.82
                    );
                  }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#F5F0E6] dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-bold hover:bg-[#E6E0D4] transition-colors cursor-pointer"
                >
                  <Headphones className="w-3.5 h-3.5 text-[#B91C1C] dark:text-amber-400" />
                  Play Both Back-to-Back ({pair.wordA.word} → {pair.wordB.word})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODE 2: BLIND EAR-TRAINING QUIZ */}
      {activeMode === 'ear-quiz' && (
        <div className="rounded-2xl border border-[#E6E0D4] dark:border-stone-800 p-5 sm:p-6 bg-[#FAF7F2] dark:bg-stone-900 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#B91C1C] dark:text-amber-400">
                Blind Acoustic Discrimination Test · {activeGroup.contrastBadge}
              </span>
              <h4 className="font-serif text-lg sm:text-xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                Listen to the Mystery Word & Identify the Exact Phoneme
              </h4>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono tabular-nums text-stone-700 dark:text-stone-300">
              <span>
                Score: <strong>{earQuizScore}/{earQuizAttempts}</strong>
              </span>
              <span>·</span>
              <span>
                Streak: <strong>{earQuizStreak}</strong>
              </span>
            </div>
          </div>

          {/* Mystery Audio Trigger Box */}
          <div className="bg-white dark:bg-[#1C1917] rounded-xl p-5 border border-[#E6E0D4] dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                {selectedGuess === null
                  ? 'Mystery Word Hidden — Click Play to Listen Carefully'
                  : `Revealed: "${mysteryWordObj.word}" (${mysteryWordObj.ipa})`}
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Pay close attention to the initial consonant onset ({currentQuizPair.wordA.phonemeSymbol} vs{' '}
                {currentQuizPair.wordB.phonemeSymbol}).
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => handlePlayMysteryAudio(preferredSpeechRate)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B91C1C] text-white text-xs font-bold hover:bg-red-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                {hasPlayedMysteryAudio ? 'Replay Mystery Word (1.0x)' : 'Play Mystery Word (1.0x)'}
              </button>
              <button
                onClick={() => handlePlayMysteryAudio(0.65)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold hover:bg-stone-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Turtle className="w-4 h-4" />
                0.65x Slow
              </button>
            </div>
          </div>

          {/* Choice Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { side: 'A' as const, item: currentQuizPair.wordA },
              { side: 'B' as const, item: currentQuizPair.wordB },
            ].map(({ side, item }) => {
              const isSelected = selectedGuess === side;
              const isCorrectChoice = quizTargetSide === side;
              let borderStyle = 'border-[#E6E0D4] dark:border-stone-800 bg-white dark:bg-[#1C1917]';
              if (selectedGuess !== null) {
                if (isCorrectChoice) {
                  borderStyle = 'border-[#15803D] bg-emerald-50/70 dark:bg-emerald-950/30';
                } else if (isSelected) {
                  borderStyle = 'border-[#B91C1C] bg-red-50/70 dark:bg-red-950/30';
                }
              }

              return (
                <button
                  key={side}
                  onClick={() => handleGuessEarQuiz(side)}
                  disabled={selectedGuess !== null}
                  className={`p-5 rounded-xl border-2 text-left transition-all cursor-pointer ${borderStyle}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#B91C1C] dark:text-amber-400">
                      Option {side} · Phoneme {item.phonemeSymbol}
                    </span>
                    {selectedGuess !== null && isCorrectChoice && (
                      <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
                    )}
                    {selectedGuess !== null && isSelected && !isCorrectChoice && (
                      <XCircle className="w-5 h-5 text-[#B91C1C]" />
                    )}
                  </div>
                  <div className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
                    {item.word}
                  </div>
                  <div className="font-mono text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    {item.ipa} · {item.nepaliMeaning}
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400 mt-2">
                    {item.articulationCue}
                  </p>
                </button>
              );
            })}
          </div>

          {selectedGuess !== null && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-[#E6E0D4] dark:border-stone-800">
              <div className="text-xs sm:text-sm">
                {selectedGuess === quizTargetSide ? (
                  <span className="font-bold text-[#15803D] dark:text-emerald-400">
                    Spot on! You accurately distinguished {mysteryWordObj.word} ({mysteryWordObj.ipa}).
                  </span>
                ) : (
                  <span className="font-bold text-[#B91C1C] dark:text-red-400">
                    The spoken word was “{mysteryWordObj.word}” ({mysteryWordObj.ipa}). Cue:{' '}
                    {mysteryWordObj.articulationCue}
                  </span>
                )}
              </div>
              <button
                onClick={() => startNewEarQuestion(quizPairIndex + 1)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 dark:bg-amber-600 text-white text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer self-start sm:self-auto whitespace-nowrap shrink-0"
              >
                Next Ear-Training Pair
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: VOICE CONTRAST DUEL */}
      {activeMode === 'voice-duel' && (
        <div className="space-y-4">
          <div className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            Speak both words in each minimal pair into your microphone to verify that your pronunciation produces two distinct English words:
          </div>
          {activeGroup.pairs.map((pair) => (
            <div
              key={pair.id}
              className="rounded-xl border border-[#E6E0D4] dark:border-stone-800 p-4 sm:p-5 bg-[#FAF7F2] dark:bg-stone-900 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {[
                { side: 'A' as const, item: pair.wordA },
                { side: 'B' as const, item: pair.wordB },
              ].map(({ side, item }) => {
                const key = `${pair.id}-${side}`;
                const isRec = recordingKey === key;
                const res = voiceResults[key];
                return (
                  <div
                    key={side}
                    className="bg-white dark:bg-[#1C1917] rounded-xl p-4 border border-[#E6E0D4] dark:border-stone-800 space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-[#B91C1C] dark:text-amber-400">
                          Target {side} · {item.phonemeSymbol}
                        </span>
                        <h5 className="font-serif text-xl font-bold text-stone-900 dark:text-stone-100">
                          {item.word}{' '}
                          <span className="font-mono text-xs font-normal text-stone-500">
                            {item.ipa}
                          </span>
                        </h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => speechService.speakWord(item.word, preferredSpeechRate)}
                          className="p-2 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-200 cursor-pointer"
                          title="Hear model"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRecordMinimalPairWord(pair.id, side, item)}
                          disabled={recordingKey !== null}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                            isRec
                              ? 'bg-[#B91C1C] text-white'
                              : 'bg-stone-900 dark:bg-amber-600 text-white hover:opacity-90'
                          }`}
                        >
                          {isRec ? (
                            <>
                              <Radio className="w-3.5 h-3.5 animate-spin" />
                              Listening...
                            </>
                          ) : (
                            <>
                              <Mic className="w-3.5 h-3.5" />
                              Speak “{item.word}”
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      {item.articulationCue}
                    </p>

                    {res && (
                      <div
                        className={`p-3 rounded-lg border text-xs ${
                          res.score >= 80
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        }`}
                      >
                        <div className="font-bold flex items-center justify-between">
                          <span>Heard: “{res.transcript}”</span>
                          <span className="font-mono tabular-nums">Match: {res.score}%</span>
                        </div>
                        <p className="mt-1">{res.feedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
