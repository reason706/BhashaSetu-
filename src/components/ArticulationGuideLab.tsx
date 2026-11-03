import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Turtle,
  Mic,
  Radio,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { LanguageMode } from '../types/curriculum';
import { speechService, PronunciationResult } from '../services/speech';

export interface ArticulationPhonemeProfile {
  id: string;
  symbol: string;
  title: string;
  nepaliTitle: string;
  voiced: boolean;
  placeOfArticulation: string;
  mannerOfArticulation: string;
  lipPosition: 'labiodental' | 'rounded' | 'spread' | 'neutral' | 'bilabial-closed';
  tonguePathD: string;
  tongueTipCoord: { x: number; y: number };
  contactPointCoord: { x: number; y: number; label: string };
  airflowType: 'fricative' | 'approximant' | 'plosive' | 'sibilant';
  englishSteps: string[];
  nepaliGuidance: string;
  throatTestInstruction: string;
  practiceWords: {
    word: string;
    ipa: string;
    nepali: string;
    silentNote?: string;
  }[];
}

const ARTICULATION_PROFILES: ArticulationPhonemeProfile[] = [
  {
    id: 'art-v',
    symbol: '/v/',
    title: 'Voiced Labiodental Fricative (/v/ in "Vest", "Vine", "Receive")',
    nepaliTitle: 'माथिल्लो दाँत र तल्लो ओठ छोएर बोलिने कम्पनयुक्त /v/',
    voiced: true,
    placeOfArticulation: 'Labiodental (Upper Teeth + Lower Lip)',
    mannerOfArticulation: 'Continuous Fricative',
    lipPosition: 'labiodental',
    tonguePathD: 'M 75 160 Q 125 135 165 145 Q 195 150 210 155',
    tongueTipCoord: { x: 210, y: 155 },
    contactPointCoord: { x: 232, y: 142, label: 'Upper Teeth Touch Lower Lip' },
    airflowType: 'fricative',
    englishSteps: [
      'Rest the edge of your upper front teeth lightly on the inside of your lower lip.',
      'Do NOT press both lips together (that creates Nepali "भ" /bʱ/ or "व" /ʋ/).',
      'Blow a steady stream of air between your teeth and lower lip while vibrating your vocal cords ("vvvvv").',
    ],
    nepaliGuidance:
      'नेपाली "भ" वा "व" जस्तो दुवै ओठ नजोड्नुहोस्। माथिल्लो दाँतले तल्लो ओठ हल्का थिचेर घाँटीमा कम्पन (vibration) सहित हावा बाहिर निकाल्नुहोस्।',
    throatTestInstruction:
      'Touch your throat: you MUST feel strong vocal cord buzzing during /v/.',
    practiceWords: [
      { word: 'Vest', ipa: '/vest/', nepali: 'इस्टकोट / भित्री गन्जी' },
      { word: 'Receive', ipa: '/rɪˈsiːv/', nepali: 'प्राप्त गर्नु', silentNote: 'EI after C + final /v/' },
      { word: 'Perceive', ipa: '/pəˈsiːv/', nepali: 'महसुस गर्नु', silentNote: 'EI after C + final /v/' },
      { word: 'Vineyard', ipa: '/ˈvɪn.jəd/', nepali: 'अङ्गुरको बगैँचा' },
    ],
  },
  {
    id: 'art-w',
    symbol: '/w/',
    title: 'Voiced Labial-Velar Approximant (/w/ in "West", "Wednesday")',
    nepaliTitle: 'दुवै ओठ गोलो पारेर दाँत नछोई बोलिने /w/',
    voiced: true,
    placeOfArticulation: 'Bilabial Rounded + Raised Back of Tongue',
    mannerOfArticulation: 'Approximant Glide',
    lipPosition: 'rounded',
    tonguePathD: 'M 75 155 Q 115 112 160 140 Q 190 155 205 158',
    tongueTipCoord: { x: 205, y: 158 },
    contactPointCoord: { x: 238, y: 138, label: 'Tight Lip Rounding (No Tooth Contact)' },
    airflowType: 'approximant',
    englishSteps: [
      'Bring both lips forward into a tight, small circle—just like saying "oo" (/uː/) or blowing out a candle.',
      'Keep your upper teeth completely away from your lower lip.',
      'Quickly glide from the tight "oo" lip circle into the following vowel ("oo-est" -> "West", "oo-enz-day" -> "Wednesday").',
    ],
    nepaliGuidance:
      'मैनबत्ती निभाउँदा वा "ऊ" भन्दा जस्तै दुवै ओठ गोलो पारेर अगाडि ल्याउनुहोस्। दाँतले तल्लो ओठ कहिल्यै छुनु हुँदैन।',
    throatTestInstruction:
      'Touch your throat: vocal cords vibrate smoothly as your lips glide open.',
    practiceWords: [
      { word: 'Wednesday', ipa: '/ˈwenz.deɪ/', nepali: 'बुधबार', silentNote: 'Silent middle "d" and "e"' },
      { word: 'West', ipa: '/west/', nepali: 'पश्चिम' },
      { word: 'Wholesome', ipa: '/ˈhəʊl.səm/', nepali: 'पौष्टिक', silentNote: 'Note: "Wh-" before O uses /h/!' },
      { word: 'Warrant', ipa: '/ˈwɒr.ənt/', nepali: 'आधिकारिक पुर्जी' },
    ],
  },
  {
    id: 'art-th-voiceless',
    symbol: '/θ/',
    title: 'Voiceless Dental Fricative (/θ/ in "Thin", "Thumb", "Thought")',
    nepaliTitle: 'दाँतको बीचमा जिब्रोको टुप्पो राखेर हावा फुकिने /θ/',
    voiced: false,
    placeOfArticulation: 'Interdental (Tongue Tip Between Upper & Lower Teeth)',
    mannerOfArticulation: 'Voiceless Fricative',
    lipPosition: 'neutral',
    tonguePathD: 'M 75 162 Q 130 140 185 138 Q 215 136 232 135',
    tongueTipCoord: { x: 232, y: 135 },
    contactPointCoord: { x: 230, y: 133, label: 'Tongue Tip Between Front Teeth' },
    airflowType: 'fricative',
    englishSteps: [
      'Place the very tip of your tongue lightly between your upper and lower front teeth.',
      'Do not bite down hard; leave a tiny gap between the tongue surface and upper teeth.',
      'Blow quiet, continuous air over your tongue tip without vibrating your throat.',
    ],
    nepaliGuidance:
      'नेपाली "थ" बोल्दा जिब्रो दाँतको पछाडि ठोक्किन्छ र झट्का निस्कन्छ। अङ्ग्रेजी /θ/ मा जिब्रोको टुप्पो दाँतको बीचमा हल्का बाहिर निकालेर निरन्तर नरम हावा बगाउनुपर्छ।',
    throatTestInstruction:
      'Touch your throat: there should be ZERO vocal cord vibration (pure whispered air).',
    practiceWords: [
      { word: 'Thumb', ipa: '/θʌm/', nepali: 'बुढी औँला', silentNote: 'Silent final "b"' },
      { word: 'Thought', ipa: '/θɔːt/', nepali: 'विचार / सोचाइ', silentNote: 'Silent "gh"' },
      { word: 'Thigh', ipa: '/θaɪ/', nepali: 'तिघ्रा', silentNote: 'Silent final "gh"' },
      { word: 'Thorough', ipa: '/ˈθʌr.ə/', nepali: 'पूर्ण / विस्तृत', silentNote: 'Silent final "gh"' },
    ],
  },
  {
    id: 'art-sh',
    symbol: '/ʃ/',
    title: 'Voiceless Postalveolar Sibilant (/ʃ/ in "Sheet", "Schedule", "Champagne")',
    nepaliTitle: 'जिब्रोको अघिल्लो भाग तालुतिर उठाएर बोलिने मोटो /ʃ/ (श)',
    voiced: false,
    placeOfArticulation: 'Postalveolar (Behind the Tooth Ridge)',
    mannerOfArticulation: 'Hushing Sibilant Fricative',
    lipPosition: 'rounded',
    tonguePathD: 'M 75 160 Q 135 125 192 118 Q 208 122 214 132',
    tongueTipCoord: { x: 214, y: 132 },
    contactPointCoord: { x: 198, y: 115, label: 'Postalveolar Roof Arch' },
    airflowType: 'sibilant',
    englishSteps: [
      'Raise the blade of your tongue toward the roof of the mouth just behind the front gum ridge (alveolar ridge).',
      'Push your lips slightly forward in a gentle square/round shape (unlike the flat smile of /s/).',
      'Channel a broad "shhhh" air stream (like asking someone to be quiet in a library).',
    ],
    nepaliGuidance:
      'पातलो "स" (/s/) भन्दा फरक पार्न जिब्रोलाई दाँतको गिजाभन्दा अलि पछाडि तालुतिर उचाल्नुहोस् र ओठ हल्का गोलो पारेर "श..." आवाज निकाल्नुहोस्।',
    throatTestInstruction:
      'Touch your throat: voiceless hushing sound (no throat vibration).',
    practiceWords: [
      { word: 'Schedule', ipa: '/ˈʃed.juːl/', nepali: 'समय तालिका', silentNote: 'UK /ʃ/ or US /sk/' },
      { word: 'Champagne', ipa: '/ʃæmˈpeɪn/', nepali: 'स्याम्पेन', silentNote: 'CH = /ʃ/ + silent "g"' },
      { word: 'Conscientious', ipa: '/ˌkɒn.ʃiˈen.ʃəs/', nepali: 'कर्तव्यनिष्ठ' },
      { word: 'Stationery', ipa: '/ˈsteɪ.ʃən.ər.i/', nepali: 'कागज-कलम सामग्री' },
    ],
  },
  {
    id: 'art-f',
    symbol: '/f/',
    title: 'Voiceless Labiodental Fricative (/f/ in "Fasten", "Freight", "Pneumonia-contrast")',
    nepaliTitle: 'माथिल्लो दाँतले तल्लो ओठ छोएर हावा बगाइने /f/ (नेपाली "फ" भन्दा भिन्न)',
    voiced: false,
    placeOfArticulation: 'Labiodental (Upper Teeth + Lower Lip)',
    mannerOfArticulation: 'Voiceless Fricative',
    lipPosition: 'labiodental',
    tonguePathD: 'M 75 160 Q 125 140 165 148 Q 195 152 210 156',
    tongueTipCoord: { x: 210, y: 156 },
    contactPointCoord: { x: 232, y: 142, label: 'Upper Teeth on Lower Lip' },
    airflowType: 'fricative',
    englishSteps: [
      'Same exact mouth position as /v/: touch your upper front teeth lightly to your bottom lip.',
      'Never press both lips together like Nepali "फ" (/pʰ/).',
      'Blow a steady, unvoiced stream of air through the small gap between teeth and lower lip.',
    ],
    nepaliGuidance:
      'नेपाली "फ" बोल्दा दुवै ओठ जोडेर खोलिन्छ। तर अङ्ग्रेजी /f/ (र "ph") बोल्दा माथिल्लो दाँत तल्लो ओठमा राखेर निरन्तर हावा फुकिन्छ।',
    throatTestInstruction:
      'Touch your throat: NO vibration (unlike /v/).',
    practiceWords: [
      { word: 'Fasten', ipa: '/ˈfɑː.sən/', nepali: 'बाँध्नु / कस्नु', silentNote: 'Silent "t" in "-sten"' },
      { word: 'Freight', ipa: '/freɪt/', nepali: 'मालसामान ढुवानी', silentNote: 'Silent "gh"' },
      { word: 'Soften', ipa: '/ˈsɒf.ən/', nepali: 'नरम पार्नु', silentNote: 'Silent "t" in "-ften"' },
      { word: 'Rough', ipa: '/rʌf/', nepali: 'खस्रो', silentNote: 'Final "gh" pronounced /f/' },
    ],
  },
];

interface ArticulationGuideLabProps {
  languageMode: LanguageMode;
  preferredSpeechRate: number;
}

export const ArticulationGuideLab: React.FC<ArticulationGuideLabProps> = ({
  languageMode,
  preferredSpeechRate,
}) => {
  const [selectedId, setSelectedId] = useState<string>(ARTICULATION_PROFILES[0].id);
  const [recordingWord, setRecordingWord] = useState<string | null>(null);
  const [evalMap, setEvalMap] = useState<Record<string, PronunciationResult>>({});

  const showNepali = languageMode !== 'english-only';

  const activeProfile = useMemo(
    () => ARTICULATION_PROFILES.find((p) => p.id === selectedId) || ARTICULATION_PROFILES[0],
    [selectedId]
  );

  const handlePracticeSpeak = async (word: string) => {
    setRecordingWord(word);
    try {
      const res = await speechService.evaluatePronunciation(word);
      setEvalMap((prev) => ({ ...prev, [word]: res }));
    } finally {
      setRecordingWord(null);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1C1917] rounded-2xl border border-[#E6E0D4] dark:border-stone-800 p-5 sm:p-7 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-[#E6E0D4] dark:border-stone-800 pb-5">
        <p className="text-xs font-semibold text-[#B91C1C] dark:text-red-400">
          Interactive Vocal Tract Sagittal Diagram & Articulatory Phonetics
        </p>
        <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-100 mt-1">
          IPA Mouth, Tongue & Lip Articulation Guide
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl">
          Inspect the exact cross-section position of the tongue tip, teeth, lips, and vocal cords for English phonemes that differ from Nepali articulatory habits.
        </p>
      </div>

      {/* Phoneme Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {ARTICULATION_PROFILES.map((profile) => {
          const isSelected = profile.id === selectedId;
          return (
            <button
              key={profile.id}
              onClick={() => setSelectedId(profile.id)}
              className={`px-4 py-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-stone-900 dark:bg-amber-600 text-white border-stone-900 dark:border-amber-500 shadow-sm'
                  : 'bg-[#FAF7F2] dark:bg-stone-900 text-stone-800 dark:text-stone-200 border-[#E6E0D4] dark:border-stone-800 hover:border-stone-400'
              }`}
            >
              <span className="font-mono text-base font-bold">{profile.symbol}</span>
              <span className="text-xs font-semibold">
                {profile.placeOfArticulation.split('(')[0].trim()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Two-Zone Sandbox Layout (Left: Interactive SVG Vocal Tract Stage, Right: Step-by-Step Control Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Zone: SVG Sagittal Vocal Tract Diagram */}
        <div className="lg:col-span-6 rounded-2xl border border-[#E6E0D4] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <span className="font-mono text-lg font-bold text-[#B91C1C] dark:text-amber-400">
                {activeProfile.symbol}
              </span>
              <span className="text-xs text-stone-500 dark:text-stone-400 ml-2">
                {activeProfile.placeOfArticulation}
              </span>
            </div>
            <span
              className={`text-xs font-mono font-bold ${
                activeProfile.voiced
                  ? 'text-[#15803D] dark:text-emerald-400'
                  : 'text-[#D97706] dark:text-amber-400'
              }`}
            >
              {activeProfile.voiced ? '● VOICED (Throat Vibrates)' : '○ VOICELESS (Air Only)'}
            </span>
          </div>

          {/* Sagittal Cross-Section SVG */}
          <div className="relative w-full aspect-[4/3] bg-white dark:bg-[#141210] rounded-xl border border-[#E6E0D4] dark:border-stone-800 flex items-center justify-center overflow-hidden p-2">
            <svg
              viewBox="0 0 320 240"
              className="w-full h-full max-h-[280px]"
              role="img"
              aria-label={`Sagittal vocal tract diagram for ${activeProfile.symbol}`}
            >
              {/* Coordinate Grid Lines */}
              <line x1="0" y1="60" x2="320" y2="60" stroke="#E6E0D4" strokeOpacity="0.4" strokeDasharray="3 3" />
              <line x1="0" y1="120" x2="320" y2="120" stroke="#E6E0D4" strokeOpacity="0.4" strokeDasharray="3 3" />
              <line x1="0" y1="180" x2="320" y2="180" stroke="#E6E0D4" strokeOpacity="0.4" strokeDasharray="3 3" />

              {/* Pharynx & Back Wall */}
              <path
                d="M 55 40 L 55 215"
                fill="none"
                stroke="#78716C"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Hard Palate, Alveolar Ridge & Upper Lip */}
              <path
                d="M 55 55 Q 90 55 120 75 Q 165 82 205 110 Q 222 115 232 118 Q 248 112 252 124"
                fill="none"
                stroke="#57534E"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Upper Front Teeth */}
              <polygon points="226,115 235,115 233,134 227,134" fill="#F5F5F4" stroke="#78716C" strokeWidth="1.5" />

              {/* Lower Jaw & Lower Lip (shifts dynamically by lipPosition) */}
              <path
                d={
                  activeProfile.lipPosition === 'labiodental'
                    ? 'M 95 210 Q 170 200 225 162 Q 233 145 232 138'
                    : activeProfile.lipPosition === 'rounded'
                    ? 'M 95 210 Q 170 200 228 160 Q 248 146 254 140'
                    : 'M 95 210 Q 170 200 228 165 Q 240 155 244 148'
                }
                fill="none"
                stroke="#57534E"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Lower Front Teeth */}
              <polygon points="222,155 230,155 229,142 223,142" fill="#F5F5F4" stroke="#78716C" strokeWidth="1.5" />

              {/* Dynamic Tongue Contour */}
              <path
                d={activeProfile.tonguePathD}
                fill="rgba(185, 28, 28, 0.14)"
                stroke="#B91C1C"
                strokeWidth="5"
                strokeLinecap="round"
              />

              {/* Tongue Tip Node */}
              <circle
                cx={activeProfile.tongueTipCoord.x}
                cy={activeProfile.tongueTipCoord.y}
                r="5"
                fill="#B91C1C"
              />

              {/* Contact / Constriction Highlight Ring */}
              <circle
                cx={activeProfile.contactPointCoord.x}
                cy={activeProfile.contactPointCoord.y}
                r="11"
                fill="none"
                stroke="#D97706"
                strokeWidth="2.5"
                strokeDasharray="3 2"
              />

              {/* Airflow Stream Arrows */}
              <path
                d="M 85 135 Q 150 105 268 134"
                fill="none"
                stroke="#0284C7"
                strokeWidth="2"
                strokeDasharray="5 3"
              />
              <polygon points="268,130 277,134 268,138" fill="#0284C7" />

              {/* Vocal Cords Box at Larynx */}
              <rect
                x="46"
                y="185"
                width="24"
                height="16"
                rx="4"
                fill={activeProfile.voiced ? '#15803D' : '#78716C'}
              />
              <text x="76" y="197" fontSize="10" fill={activeProfile.voiced ? '#15803D' : '#78716C'} fontWeight="bold">
                {activeProfile.voiced ? 'Vocal Cords: VIBRATING (zzz)' : 'Vocal Cords: OPEN (quiet)'}
              </text>

              {/* Anatomical Labels */}
              <text x="135" y="70" fontSize="9.5" fill="#78716C" fontWeight="600">
                Hard Palate
              </text>
              <text x="195" y="102" fontSize="9.5" fill="#78716C" fontWeight="600">
                Tooth Ridge
              </text>
              <text x="120" y="168" fontSize="10" fill="#B91C1C" fontWeight="bold">
                Tongue Body
              </text>
              <text x="160" y="34" fontSize="10.5" fill="#D97706" fontWeight="bold">
                Focal Target: {activeProfile.contactPointCoord.label}
              </text>
            </svg>
          </div>

          <div className="mt-3 text-xs text-stone-600 dark:text-stone-400 flex items-center justify-between">
            <span>
              <strong>Throat Check:</strong> {activeProfile.throatTestInstruction}
            </span>
          </div>
        </div>

        {/* Right Zone: Step-by-Step Instructions & Live Microphone Drills */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          <div className="rounded-2xl border border-[#E6E0D4] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900 p-5 space-y-3">
            <h4 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">
              {activeProfile.title}
            </h4>
            {showNepali && (
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                {activeProfile.nepaliTitle}
              </p>
            )}

            <ol className="space-y-2 pt-1">
              {activeProfile.englishSteps.map((step, idx) => (
                <li
                  key={idx}
                  className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 flex items-start gap-2.5"
                >
                  <span className="font-mono font-bold text-[#B91C1C] dark:text-amber-400 shrink-0">
                    0{idx + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            {showNepali && (
              <div className="pt-2 border-t border-[#E6E0D4] dark:border-stone-800 text-xs text-stone-600 dark:text-stone-300">
                <strong className="text-stone-900 dark:text-stone-100">नेपाली उच्चारण विधि:</strong>{' '}
                {activeProfile.nepaliGuidance}
              </div>
            )}
          </div>

          {/* Target Practice Words with Model Audio & Mic Test */}
          <div className="rounded-2xl border border-[#E6E0D4] dark:border-stone-800 bg-white dark:bg-[#1C1917] p-5 space-y-3">
            <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
              Practice Target Words with {activeProfile.symbol} + Silent-Letter Rules
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeProfile.practiceWords.map((item) => {
                const res = evalMap[item.word];
                const isRec = recordingWord === item.word;
                return (
                  <div
                    key={item.word}
                    className="p-3.5 rounded-xl border border-[#E6E0D4] dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-900 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-serif text-base font-bold text-stone-900 dark:text-stone-100">
                          {item.word}
                        </div>
                        <div className="font-mono text-[11px] text-stone-500">
                          {item.ipa} · {item.nepali}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => speechService.speakWord(item.word, preferredSpeechRate)}
                          className="p-2 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 cursor-pointer"
                          title="Listen 1.0x"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => speechService.speakWord(item.word, 0.65)}
                          className="p-2 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-300 cursor-pointer"
                          title="Slow 0.65x"
                        >
                          <Turtle className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handlePracticeSpeak(item.word)}
                          disabled={recordingWord !== null}
                          className={`p-2 rounded-lg text-white cursor-pointer ${
                            isRec ? 'bg-[#B91C1C]' : 'bg-stone-900 dark:bg-amber-600'
                          }`}
                          title="Record & Test"
                        >
                          {isRec ? (
                            <Radio className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Mic className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {item.silentNote && (
                      <div className="text-[11px] text-[#B91C1C] dark:text-amber-400 font-medium">
                        Rule: {item.silentNote}
                      </div>
                    )}

                    {res && (
                      <div className="text-[11px] font-mono pt-1 border-t border-[#E6E0D4] dark:border-stone-800 flex items-center justify-between">
                        <span className="truncate">Heard: “{res.transcript}”</span>
                        <span
                          className={
                            res.score >= 80
                              ? 'text-[#15803D] font-bold'
                              : 'text-[#D97706] font-bold'
                          }
                        >
                          {res.score}%
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
