import React, { useState } from 'react';
import {
  Compass,
  Volume2,
  Turtle,
  BookOpen,
  Mic,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Layers,
  Globe,
} from 'lucide-react';
import { LanguageMode } from '../types/curriculum';
import { speechService } from '../services/speech';

interface AboutViewProps {
  languageMode: LanguageMode;
  preferredSpeechRate: number;
  onStartCurriculum: () => void;
  onOpenSettings: () => void;
}

interface SilentRuleEntry {
  cluster: string;
  silentLetter: string;
  origin: string;
  ruleSummary: string;
  nepaliSummary: string;
  examples: {
    word: string;
    silentPart: string;
    ipa: string;
    nepali: string;
  }[];
}

const SILENT_LETTER_MATRIX: SilentRuleEntry[] = [
  {
    cluster: 'KN-',
    silentLetter: 'Silent K before N',
    origin: 'Old English / Germanic',
    ruleSummary: 'When a word begins with "kn-", the "k" is silent and pronunciation starts directly with /n/.',
    nepaliSummary: 'शब्दको सुरुमा "kn-" आउँदा "k" मौन रहन्छ र उच्चारण सिधै "न" (/n/) बाट सुरु हुन्छ।',
    examples: [
      { word: 'Knight', silentPart: 'K, gh', ipa: '/naɪt/', nepali: 'योद्धा' },
      { word: 'Knowledge', silentPart: 'K, d', ipa: '/ˈnɒl.ɪdʒ/', nepali: 'ज्ञान' },
      { word: 'Kneel', silentPart: 'K', ipa: '/niːl/', nepali: 'घुँडा टेक्नु' },
      { word: 'Knuckle', silentPart: 'K', ipa: '/ˈnʌk.əl/', nepali: 'औँलाको जोर्नी' },
    ],
  },
  {
    cluster: 'WR-',
    silentLetter: 'Silent W before R',
    origin: 'Old English',
    ruleSummary: 'Initial "wr-" drops the /w/ sound completely; pronounce only the /r/.',
    nepaliSummary: '"wr-" बाट सुरु हुने शब्दहरूमा "w" कहिल्यै बोलिँदैन, सिधै "र" (/r/) बाट उच्चारण गरिन्छ।',
    examples: [
      { word: 'Wrist', silentPart: 'W', ipa: '/rɪst/', nepali: 'नाडी' },
      { word: 'Wrestle', silentPart: 'W, t', ipa: '/ˈres.əl/', nepali: 'कुस्ती खेल्नु' },
      { word: 'Wrinkle', silentPart: 'W', ipa: '/ˈrɪŋ.kəl/', nepali: 'चाउरी / मुजा' },
      { word: 'Wreck', silentPart: 'W', ipa: '/rek/', nepali: 'भग्नावशेष' },
    ],
  },
  {
    cluster: '-MB',
    silentLetter: 'Silent B after M',
    origin: 'Anglo-Saxon Assimilation',
    ruleSummary: 'At the end of a root word or before "-er/-ing", "b" after "m" is silent.',
    nepaliSummary: 'मूल शब्दको अन्त्यमा "-mb" आउँदा वा "-er/-ing" थपिँदा "m" पछिको "b" सधैँ मौन रहन्छ।',
    examples: [
      { word: 'Plumber', silentPart: 'b', ipa: '/ˈplʌm.ər/', nepali: 'धारा मिस्त्री' },
      { word: 'Climb', silentPart: 'b', ipa: '/klaɪm/', nepali: 'चढ्नु' },
      { word: 'Thumb', silentPart: 'b', ipa: '/θʌm/', nepali: 'बुढी औँला' },
      { word: 'Comb', silentPart: 'b', ipa: '/kəʊm/', nepali: 'काइँयो' },
    ],
  },
  {
    cluster: '-BT',
    silentLetter: 'Silent B before T',
    origin: 'Latin Etymological Spelling',
    ruleSummary: 'Renaissance scholars inserted "b" to reflect Latin roots (debitum, dubitare), but it is never spoken.',
    nepaliSummary: 'ल्याटिन मूल देखाउन लेखाइमा "b" राखिए पनि उच्चारण गर्दा "b" पूर्ण रूपमा छोडिन्छ।',
    examples: [
      { word: 'Doubt', silentPart: 'b', ipa: '/daʊt/', nepali: 'शंका' },
      { word: 'Debt', silentPart: 'b', ipa: '/det/', nepali: 'ऋण / कर्जा' },
      { word: 'Subtle', silentPart: 'b', ipa: '/ˈsʌt.əl/', nepali: 'सूक्ष्म' },
      { word: 'Subpoena', silentPart: 'b, o', ipa: '/səˈpiː.nə/', nepali: 'अदालती म्याद' },
    ],
  },
  {
    cluster: '-STLE / -STEN',
    silentLetter: 'Silent Medial T',
    origin: 'Consonant Cluster Simplification',
    ruleSummary: 'Between /s/ and /l/ or /n/, the middle "t" is dropped for smooth articulation.',
    nepaliSummary: '"-stle" र "-sten" समूहका शब्दहरूमा बीचको "t" उच्चारण हुँदैन।',
    examples: [
      { word: 'Castle', silentPart: 't', ipa: '/ˈkɑː.səl/', nepali: 'किल्ला / गढी' },
      { word: 'Whistle', silentPart: 'h, t', ipa: '/ˈwɪs.əl/', nepali: 'सिठी' },
      { word: 'Fasten', silentPart: 't', ipa: '/ˈfɑː.sən/', nepali: 'बाँध्नु / कस्नु' },
      { word: 'Listen', silentPart: 't', ipa: '/ˈlɪs.ən/', nepali: 'ध्यान दिएर सुन्नु' },
    ],
  },
  {
    cluster: 'PS- / PN-',
    silentLetter: 'Silent Initial P',
    origin: 'Classical Greek',
    ruleSummary: 'Greek medical and academic loanwords starting with "ps-" or "pn-" drop the initial /p/ in English.',
    nepaliSummary: 'ग्रीक मूलका "ps-" र "pn-" शब्दहरूमा सुरुको "p" मौन रहन्छ।',
    examples: [
      { word: 'Psychology', silentPart: 'P', ipa: '/saɪˈkɒl.ə.dʒi/', nepali: 'मनोविज्ञान' },
      { word: 'Pneumonia', silentPart: 'P', ipa: '/njuːˈməʊ.ni.ə/', nepali: 'निमोनिया' },
      { word: 'Psalm', silentPart: 'P, l', ipa: '/sɑːm/', nepali: 'धार्मिक भजन' },
      { word: 'Pseudonym', silentPart: 'P', ipa: '/ˈsjuː.də.nɪm/', nepali: 'उपनाम' },
    ],
  },
  {
    cluster: '-GN / -MN',
    silentLetter: 'Silent G or N',
    origin: 'Latin / French',
    ruleSummary: 'In root-final "-gn" and "-mn", the "g" or final "n" is silent (though voiced in derivatives like signature/autumnal).',
    nepaliSummary: 'शब्दको अन्त्यमा "-gn" आउँदा "g" र "-mn" आउँदा "n" मौन रहन्छ।',
    examples: [
      { word: 'Foreign', silentPart: 'g', ipa: '/ˈfɒr.ən/', nepali: 'विदेशी' },
      { word: 'Campaign', silentPart: 'g', ipa: '/kæmˈpeɪn/', nepali: 'अभियान' },
      { word: 'Autumn', silentPart: 'n', ipa: '/ˈɔː.təm/', nepali: 'शरद ऋतु' },
      { word: 'Column', silentPart: 'n', ipa: '/ˈkɒl.əm/', nepali: 'स्तम्भ / खम्बा' },
    ],
  },
  {
    cluster: 'FRENCH -ET / -OT',
    silentLetter: 'Silent Final T or S',
    origin: 'French Culinary & Diplomatic Loans',
    ruleSummary: 'French loanwords keep their written final "t" or "s" but end on a long vowel (/eɪ/ or /əʊ/).',
    nepaliSummary: 'फ्रेन्च मूलका परिकार र कूटनीतिक शब्दहरूमा अन्तिम "t" वा "s" मौन रहन्छ।',
    examples: [
      { word: 'Buffet', silentPart: 't', ipa: '/ˈbʊf.eɪ/', nepali: 'बफे भोज' },
      { word: 'Bouquet', silentPart: 't', ipa: '/buˈkeɪ/', nepali: 'फूलको गुच्छा' },
      { word: 'Depot', silentPart: 't', ipa: '/ˈdep.əʊ/', nepali: 'गोदाम / डिपो' },
      { word: 'Rendezvous', silentPart: 'z, s', ipa: '/ˈrɒn.deɪ.vuː/', nepali: 'तोकिएको भेटघाट' },
    ],
  },
];

export const AboutView: React.FC<AboutViewProps> = ({
  languageMode,
  preferredSpeechRate,
  onStartCurriculum,
  onOpenSettings,
}) => {
  const [activeClusterFilter, setActiveClusterFilter] = useState<string>('ALL');
  const isFullNepali = languageMode === 'full-nepali';

  const visibleMatrix =
    activeClusterFilter === 'ALL'
      ? SILENT_LETTER_MATRIX
      : SILENT_LETTER_MATRIX.filter((item) => item.cluster === activeClusterFilter);

  return (
    <div className="main w-full max-w-[1240px] mx-auto px-4 lg:px-10 pt-4 md:pt-7 pb-28 flex flex-col gap-5 md:gap-6">
      {/* .ls-head */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="serif m-0 text-[28px] md:text-[34px] leading-[1.1] text-[#1C1917] dark:text-[#F5F2EB]">About guide</h1>
        <span className="tag t-ink !text-xs !px-3 !py-1.5">Offline-ready PWA</span>
      </div>

      {/* .hero with illustration underlay */}
      <section className="hero flex flex-col gap-2.5" aria-labelledby="about-hero-title">
        <div className="art opacity-50" aria-hidden="true">
          <svg viewBox="0 0 320 300" width="100%" height="100%" style={{ display: 'block', overflow: 'visible' }}>
            <circle cx="160" cy="150" r="140" fill="#D7C6AE" fillOpacity="0.55" />
            <circle cx="160" cy="150" r="140" fill="none" stroke="#CBB89D" strokeOpacity="0.6" />
            <g transform="translate(50 68) rotate(-6 110 82)">
              <rect x="18" y="20" width="86" height="122" rx="6" fill="#FAF7F0" stroke="#E2DACB" strokeWidth="1.5" />
              <rect x="112" y="20" width="86" height="122" rx="6" fill="#FAF7F0" stroke="#E2DACB" strokeWidth="1.5" />
              <rect x="103" y="18" width="10" height="126" rx="4" fill="#9E2A2B" />
              <text x="62" y="114" textAnchor="middle" fill="#9E2A2B" fontSize="36" fontWeight="600" fontFamily="Noto Sans Devanagari, serif">अ</text>
              <text x="155" y="114" textAnchor="middle" fill="#2D6A4F" fontSize="38" fontWeight="600" fontFamily="Fraunces, Georgia, serif">A</text>
            </g>
          </svg>
        </div>
        <div className="body flex flex-col gap-2.5">
          <span className="eyebrow">
            <span className="np normal-case tracking-normal">भाषासेतु</span> · The Spiral 4-pillar bridge methodology
          </span>
          <h2 id="about-hero-title" className="serif m-0 text-[22px] md:text-[28px] leading-[1.2] text-[#1C1917] dark:text-[#F5F2EB]">
            Bridging Devanagari habits and English spelling, sound and word order.
          </h2>
          <p className="m-0 text-[15px] leading-[1.6] text-[#57534E] dark:text-[#A8A29E]">
            Devanagari (Nepali) is phonetically transparent—every written letter is pronounced, and sentences follow a
            Subject–Object–Verb (SOV) order. English is etymological—preserving silent letters from Old English, Latin,
            Greek and French while using Subject–Verb–Object (SVO) syntax. BhashaSetu bridges these two systems step by step.
          </p>
          {isFullNepali && (
            <p className="np m-0 text-sm text-[#57534E] dark:text-[#A8A29E]">
              नेपाली (देवनागरी) मा जे लेखिन्छ त्यही बोलिन्छ र क्रिया वाक्यको अन्त्यमा आउँछ। अङ्ग्रेजीमा भने ऐतिहासिक मौन अक्षरहरू (Silent Letters) र कर्ता–क्रिया–कर्म (SVO) संरचना हुन्छ। भाषासेतुले यी दुई भाषाबीच वैज्ञानिक पुल निर्माण गर्छ।
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            <button onClick={onStartCurriculum} className="btn btn-p">
              Explore lectures (01–12)
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={onOpenSettings} className="btn btn-g !bg-white/75 dark:!bg-[#1F1C18]/80">
              <Globe className="w-4 h-4" />
              {languageMode === 'english-only'
                ? 'Mode: English only'
                : languageMode === 'english-meanings'
                ? 'Mode: English + meanings'
                : 'Mode: Full Nepali'}
            </button>
          </div>
        </div>
      </section>

      {/* The 5 Connected Modules Inside Every Lecture */}
      <section className="space-y-4">
        <div>
          <h2 className="serif h2 text-[#1C1917] dark:text-[#F5F2EB]">
            How every lecture works
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
            Instead of memorizing isolated word lists, you encounter the same target words across five connected modules so recognition, pronunciation, spelling, syntax, and conversation reinforce one another:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: 'Step 01',
              icon: BookOpen,
              title: 'Vocabulary & Silent Phonics',
              desc: 'Silent letters are highlighted in crimson with a dotted underline alongside IPA, slow 0.65x audio, and an 870-word section vocabulary bank.',
            },
            {
              step: 'Step 02',
              icon: Mic,
              title: 'Syllable Stress & Live Mic',
              desc: 'Break multi-syllable words into stressed chunks, compare phonetic respellings (Queue → "KYOO"), and test your voice with instant scoring.',
            },
            {
              step: 'Step 03',
              icon: Sparkles,
              title: 'Spelling Rules & Dictation Bee',
              desc: 'Master orthographic formulas (consonant doubling, -ceed/-sede/-cede, IE/EI) and type words from audio in the Spelling Bee.',
            },
            {
              step: 'Step 04',
              icon: Layers,
              title: 'Grammar & Sentence Builder',
              desc: 'Compare English SVO and Nepali SOV word order visually, assemble scrambled sentence tiles, and complete capstone exercises.',
            },
            {
              step: 'Step 05',
              icon: MessageSquare,
              title: 'Two-Voice Real-Life Dialogue',
              desc: 'Listen to a realistic conversation with distinct voices for Speaker A and Speaker B, practice role-play turns, and answer comprehension questions.',
            },
          ].map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.step}
                className="card !p-[18px] flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className={`ico ${['i-crim', 'i-sage', 'i-ochre', 'i-ink', 'i-crim'][Number(pillar.step.slice(-1)) - 1] || 'i-crim'}`}>
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="mono muted text-xs font-semibold">{pillar.step}</span>
                  </div>
                  <h3 className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Sequential CEFR Curriculum Architecture (B1 -> B2 -> C1) */}
      <section className="card p-6 space-y-4">
        <div>
          <div className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
            Sequential CEFR Track Architecture
          </div>
          <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
            Structured Progression from B1 Foundation to C1 Mastery (Lectures 01–12)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-ipa text-xs font-semibold px-2.5 py-0.5 rounded bg-[#9E2A2B]/10 text-[#9E2A2B] dark:text-[#F87171]">
                Track 1 · Level B1
              </span>
              <span className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                Lectures 01 – 04
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Lower-Intermediate Foundation
            </h3>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
              Covers core silent consonants (<em>kn-, wr-, -mb, -stle</em>), deceptive vowel digraphs, French culinary terms, plural spelling transformations, SVO word order, causatives, and quantifiers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-ipa text-xs font-semibold px-2.5 py-0.5 rounded bg-[#D97706]/15 text-[#D97706] dark:text-amber-400">
                Track 2 · Level B2
              </span>
              <span className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                Lectures 05 – 08
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Upper-Intermediate Workplace & Media
            </h3>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
              Covers workplace loanwords, <em>sc- / -mn / -gn</em> clusters, consonant doubling, the <em>-sede/-ceed/-cede</em> rule, negative prefixes, polite indirect questions, passive voice, and reported speech.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-ipa text-xs font-semibold px-2.5 py-0.5 rounded bg-[#2D6A4F]/15 text-[#2D6A4F] dark:text-emerald-400">
                Track 3 · Level C1
              </span>
              <span className="font-ipa text-xs text-[#57534E] dark:text-[#A8A29E]">
                Lectures 09 – 12
              </span>
            </div>
            <h3 className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
              Advanced Academic & Executive Mastery
            </h3>
            <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
              Covers academic schwa reduction, high-level confusables, Greek/French rhetorical loanwords, classical plurals (<em>criteria, phenomena</em>), relative clauses, conditionals, contrast clauses, and negative inversion.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive A-Z Silent-Letter Reference Matrix */}
      <section className="card p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#E7E0D6] dark:border-[#2E2924] pb-4">
          <div>
            <div className="text-xs font-semibold text-[#9E2A2B] dark:text-[#F87171]">
              Interactive Phonics Reference
            </div>
            <h2 className="text-xl font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-0.5">
              Master English Silent-Letter Rules Matrix (Tap Any Word to Hear)
            </h2>
            <p className="text-xs sm:text-sm text-[#57534E] dark:text-[#A8A29E] mt-0.5">
              Compare why silent letters exist in written English and listen to each example at natural (1.0x) or slow (0.65x) speed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveClusterFilter('ALL')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                activeClusterFilter === 'ALL'
                  ? 'bg-[#9E2A2B] text-white'
                  : 'bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
              }`}
            >
              All Clusters ({SILENT_LETTER_MATRIX.length})
            </button>
            {SILENT_LETTER_MATRIX.map((entry) => (
              <button
                key={entry.cluster}
                onClick={() => setActiveClusterFilter(entry.cluster)}
                className={`min-h-[34px] px-2.5 py-1 rounded-lg font-ipa text-xs font-semibold transition-colors ${
                  activeClusterFilter === entry.cluster
                    ? 'bg-[#9E2A2B] text-white'
                    : 'bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] text-[#57534E] dark:text-[#A8A29E]'
                }`}
              >
                {entry.cluster}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibleMatrix.map((entry) => (
            <div
              key={entry.cluster}
              className="p-5 rounded-xl bg-[#FAF7F2] dark:bg-[#141210] border border-[#E7E0D6] dark:border-[#2E2924] space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-ipa text-xs font-bold px-2.5 py-0.5 rounded bg-[#9E2A2B]/12 text-[#9E2A2B] dark:text-[#F87171]">
                    {entry.cluster}
                  </span>
                  <h3 className="text-base font-semibold text-[#1C1917] dark:text-[#F5F2EB] mt-1.5">
                    {entry.silentLetter}
                  </h3>
                </div>
                <span className="text-[11px] font-ipa text-[#57534E] dark:text-[#A8A29E]">
                  {entry.origin}
                </span>
              </div>

              <p className="text-xs text-[#57534E] dark:text-[#A8A29E] leading-relaxed">
                {entry.ruleSummary}
              </p>
              {languageMode !== 'english-only' && (
                <p className="font-nepali text-xs text-[#57534E] dark:text-[#A8A29E]">
                  {entry.nepaliSummary}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {entry.examples.map((ex) => (
                  <div
                    key={ex.word}
                    className="p-2.5 rounded-lg bg-white dark:bg-[#1F1C18] border border-[#E7E0D6] dark:border-[#2E2924] flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#1C1917] dark:text-[#F5F2EB]">
                          {ex.word}
                        </span>
                        <span className="font-ipa text-[11px] text-[#9E2A2B] dark:text-[#F87171]">
                          (silent {ex.silentPart})
                        </span>
                      </div>
                      <div className="text-[11px] text-[#57534E] dark:text-[#A8A29E] truncate">
                        <span className="font-ipa">{ex.ipa}</span>
                        {languageMode !== 'english-only' && (
                          <span className="font-nepali ml-1.5">· {ex.nepali}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          speechService.speak(ex.word, { rate: preferredSpeechRate })
                        }
                        className="p-1.5 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#9E2A2B] text-[#9E2A2B]"
                        title={`Listen to ${ex.word} (1.0x)`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => speechService.speak(ex.word, { rate: 0.62 })}
                        className="p-1.5 rounded-lg border border-[#E7E0D6] dark:border-[#2E2924] hover:border-[#D97706] text-[#D97706]"
                        title={`Listen to ${ex.word} slow (0.65x)`}
                      >
                        <Turtle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
