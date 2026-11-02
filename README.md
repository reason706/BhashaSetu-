# BhashaSetu (भाषासेतु) — Nepali-to-English Phonics, Silent-Letter & Syntax Mastery Platform

<div align="center">

![CEFR B1–C1](https://img.shields.io/badge/Curriculum-CEFR_B1_to_C1-B91C1C?style=for-the-badge)
![Lexicon](https://img.shields.io/badge/Lexicon-10%2C400%2B_Words-D97706?style=for-the-badge)
![PWA Offline](https://img.shields.io/badge/PWA-Offline_Ready-15803D?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-React_19_%2B_Vite-1C1917?style=for-the-badge)

**Bridging Phonetic Devanagari Habits and Non-Phonetic English Orthography, Pronunciation & Syntax.**

[Key Features](#-key-features) • [The 4-Pillar Linguistic Bridge](#-the-4-pillar-linguistic-bridge) • [Curriculum Roadmap](#-sequential-cefr-curriculum-lectures-0112) • [Practice Hub & Fluency Arena](#-10-tool-practice-hub--fluency-arena) • [Getting Started](#-getting-started) • [Project Architecture](#-project-architecture)

</div>

---

## 📖 Overview

**BhashaSetu (भाषासेतु)** is a specialized, offline-capable Progressive Web Application (PWA) designed for native Nepali speakers and South Asian learners transitioning from **B1 (Lower-Intermediate)** to **C1 (Advanced Executive & Academic)** English.

Unlike generic language apps that treat English as a purely vocabulary-memorization exercise, BhashaSetu directly targets the **structural friction between Devanagari and English**:
1. **Orthographic Friction (Silent Letters)**: Devanagari is phonemic (*what is written is spoken*), whereas English preserves historical silent consonant clusters (`kn-`, `wr-`, `-mb`, `-bt`, `-st-`, `-sc-`, `-gh-`, `-mn`) and unpronounced vowels.
2. **Syntactic Friction (SOV → SVO)**: Nepali follows a **Subject–Object–Verb (SOV)** postpositional structure, while English requires **Subject–Verb–Object (SVO)** word order, auxiliary inversion, and indirect polite framing.
3. **Phonetic Reduction & Connected Speech**: Native English speakers compress unstressed vowels into schwa (`/ə/`) and link words together (*"Could you"* → `/ˈkʊdʒuː/`), creating listening comprehension barriers even when learners know the written words.

---

## 🏛️ The 4-Pillar Linguistic Bridge

Every lecture unit and practice module in BhashaSetu is built around four interconnected linguistic pillars:

| Pillar | Linguistic Focus | Core Problem Solved for Nepali Speakers |
| :--- | :--- | :--- |
| **01. Silent-Letter Phonics** | Color-coded orthographic segmentation (`K` + `night`, `Plum` + `b` + `er`, `Sub` + `t` + `le`) | Eliminates over-pronouncing silent consonants and dropping silent letters when writing. |
| **02. Multi-Speed Audio Calibration** | Dual-rate synthesis (`1.0x Natural` vs. `0.5x Careful` & `0.75x Dialogue`) + pitch calibration | Trains the ear to distinguish individual phonemes before blending them at natural conversational tempo. |
| **03. Orthographic Spelling Rules** | Etymological & morphological spelling patterns (`-ceed/-sede/-cede`, doubling rules, Greek/French loanwords) | Replaces rote spelling memorization with predictable structural rules. |
| **04. Contrastive Syntax (SOV → SVO)** | Side-by-side Nepali SOV vs. English SVO structural formulas | Fixes direct-translation interference (*"discussed about"*, *"return back"*, *"according to me"*). |

---

## ✨ Key Features

### 1. 🎓 12 Sequential CEFR Lectures (5 Connected Modules Each)
Each lecture follows a structured 5-step mastery pipeline with real-time progress tracking:
- **Step 01 — Vocabulary & Phonics**: Interactive word cards with red-underlined silent letters, IPA transcriptions, Nepali meanings, phonics tips, variable-speed audio (`1.0x` / `0.5x`), and progressive batch loading (10 words per batch + scannable Extended Word Bank).
- **Step 02 — Reading & Audio Shadowing**: Context-rich passages with sentence-by-sentence clickable audio playback and target word highlighting.
- **Step 03 — Spelling Rules & Pattern Quiz**: Explicit orthographic rules paired with diagnostic multiple-choice and spelling trap exercises.
- **Step 04 — Contrastive Grammar & Syntax Quiz**: Side-by-side Nepali-to-English structural formulas with interactive error-correction drills.
- **Step 05 — Real-Life Conversation Dialogue**: Single-narrator natural reading mode with adjustable speeds (`1.0x`, `0.75x`, `0.5x`), sentence-level tap-to-listen, key phrase breakdowns, and reading comprehension checks.

### 2. ⚡ 24-Hour "Daily Challenge" 3-Question Pop-Up Quiz
- Automatically triggers once every 24 hours on the Home Dashboard (and can be launched manually anytime).
- Draws dynamically from the learner's **previously studied lectures, bookmarked words, and Spaced Repetition (SRS) queue**.
- Tests 3 complementary retention angles in under 60 seconds:
  1. **Audio Dictation & Spelling Trap**
  2. **Contextual Meaning & Usage**
  3. **Silent-Letter Phonics Identification**

### 3. 📚 10,400+ Word Interactive Dictionary & SRS Engine
- **6 Integrated Study Modes**:
  1. **Lexicon Cards**: Detailed phonics cards with silent-letter segmentation and audio.
  2. **Vocab List Table**: High-density, scannable master vocabulary table with instant filtering.
  3. **SRS Flashcards**: Spaced-repetition review deck (`New` → `Learning` → `Review` → `Mastered`).
  4. **Audio Dictation Bee**: Listen-and-spell keyboard practice with letter-by-letter diffing.
  5. **Speed Quiz**: Rapid-fire meaning and spelling recognition.
  6. **Mistake Notebook**: Automatic capture of missed quiz items—words only graduate after **2 consecutive correct practices**.

### 4. 🎙️ Settings Audio Speed Calibrator & Live Voice Pronunciation Lab
- **Dialogue Audio Speed & Pitch Calibration**: Test and lock in preferred playback speeds (`0.5x`, `0.75x`, `1.0x`) and pitch profiles (`0.85 Low Clarity`, `1.00 Natural`, `1.10 Crisp`) on long-form dialogues before starting a lecture.
- **Live Voice Pronunciation & Speech Recognition Tester**: Speak target silent-letter words into the microphone using the Web Speech API (`SpeechRecognition`) to receive instant phonetic accuracy scores and coaching feedback.

### 5. 🌐 Tri-Modal Language Scaffolding
Switch seamlessly at any time between three display modes:
- **English Only (Immersion)**: Full English interface and explanations for advanced B2/C1 immersion.
- **English + Word Meanings**: Clean English UI with concise Nepali word glosses (`नेपाली अर्थ`).
- **Full Nepali Support**: Bilingual headings, Devanagari syntax comparisons, and Nepali phonics guidance.

---

## 🛠️ 10-Tool Practice Hub & Fluency Arena

The dedicated **Practice Hub** provides 10 specialized interactive modules for targeted skill building:

| # | Arena Tool | Description |
| :-: | :--- | :--- |
| **1** | **Silent-Letter Detective** | Interactive passage highlighter game—spot and tap every word containing a hidden silent letter in realistic workplace, culinary, and legal texts. |
| **2** | **Confusable Words & Homophones** | Side-by-side semantic and orthographic comparison + quiz for *Knight/Night, Principle/Principal, Stationery/Stationary, Whole/Hole, Compliment/Complement, Discreet/Discrete*. |
| **3** | **Nepali Interference Fixer** | Diagnostic drill correcting high-frequency L1 translation traps (*"discussed about"*, *"return back"*, *"gave an exam"*, *"I am having a headache"*, *"cousin brother"*). |
| **4** | **Connected Speech Decoder** | Audio comparison (`1.0x` vs. `0.5x`) and dictation for native reductions (*"Could you"* → `/ˈkʊdʒuː/`, *"Did you"* → `/ˈdɪdʒuː/`, *"Would have"* → `/ˈwʊdəv/`). |
| **5** | **60-Second Spelling Sprint** | Timed arcade challenge testing rapid completion of missing silent consonant clusters (`kn`, `wr`, `mb`, `bt`, `st`, `sc`, `gh`) with combo multipliers. |
| **6** | **Word Family & Root Tree Explorer** | Interactive morphological trees showing when silent letters stay silent vs. when they **wake up** in derived words (*Sign → Signature/Signal*, *Doubt → Dubious*, *Muscle → Muscular*, *Autumn → Autumnal*). |
| **7** | **Real-World Role-Play Simulator** | Branching workplace conversations (*Job Interview in Kathmandu*, *Bank Mortgage & Receipt Verification*) with real-time tone coaching and B2/C1 phrasing feedback. |
| **8** | **Hands-Free Shadowing Studio** | Automated 3-stage rhythm loop (`0.75x Careful Listen` → `3s Speak Aloud Countdown` → `1.0x Natural Compare`) across all 12 lecture dialogues. |
| **9** | **Custom Flashcard Deck Builder** | Create personal vocabulary cards with custom IPA, Nepali meanings, silent-letter notes, and an interactive flip-card player. |
| **10** | **Master Vocab Table & Printable PDF** | Searchable Master Vocabulary List table and print-ready study sheets (A–Z Silent-Letter Rules, SVO vs. SOV Syntax Formulas, and Personal Mistake Sheets). |

---

## 🗺️ Sequential CEFR Curriculum (Lectures 01–12)

The curriculum is organized into three sequential CEFR tracks:

### Track 1 · B1 Lower-Intermediate Foundation (Lectures 01–04)
- **Lecture 01**: *Silent Initial Consonants (`kn-`, `wr-`, `ps-`) & Core SVO Word Order*
- **Lecture 02**: *Silent Final & Medial Labials (`-mb`, `-bt`, `-mn`) & Present Perfect vs. Past Simple*
- **Lecture 03**: *Deceptive Vowel Digraphs, `-f/-fe` Plural Transformations & Causative Verbs*
- **Lecture 04**: *Silent `-l-` & `-t-` Clusters (`-lm-`, `-lk-`, `-stle`, `-sten`) & Precision Quantifiers*

### Track 2 · B2 Upper-Intermediate Workplace & Media (Lectures 05–08)
- **Lecture 05**: *Consonant Doubling Rules, Unstressed Schwa (`/ə/`) & Polite Indirect Questions*
- **Lecture 06**: *`-ceed`, `-sede`, `-cede` Orthography & Workplace Passive Voice*
- **Lecture 07**: *Silent `-gh-` & `-ght` Patterns, Modal Perfects & Diplomatic Hedging*
- **Lecture 08**: *Silent `-h-` & `-w-` Clusters & Reported Speech in Professional Briefings*

### Track 3 · C1 Advanced Academic & Executive Mastery (Lectures 09–12)
- **Lecture 09**: *Assimilated Negative Prefixes (`il-`, `ir-`, `im-`, `in-`) & Mixed Conditionals*
- **Lecture 10**: *Academic Confusables, Silent `-c-` (`sc-`) & Subordinating Contrastive Clauses*
- **Lecture 11**: *Greek & French Loanword Orthography (`ph-`, `ch-`, `-que`, `-ps`) & Cleft Sentences*
- **Lecture 12**: *Classical Irregular Plurals (`-is → -es`, `-on → -a`) & Negative Inversion (`Not only...`)*

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `v18+` (recommended `v20+`)
- **npm** `v9+`

### Installation & Local Development

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd bhashasetu
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables (Optional — for Custom AI Lecture Generation)**
   Create a `.env` file in the root directory if you want to enable the **Create AI Lecture** generator powered by `@google/genai`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: All 12 core lectures, the 10,400+ word lexicon, the 10 Practice Hub tools, and browser TTS/STT audio work 100% offline without any API key.)*

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Type-check & Build for Production**
   ```bash
   npm run lint
   npm run build
   npm start
   ```

---

## 🏗️ Project Architecture

```text
├── public/
│   ├── manifest.json               # PWA Web App Manifest & install metadata
│   └── sw.js                       # Offline-first Service Worker caching strategy
├── src/
│   ├── components/
│   │   ├── AboutView.tsx           # 4-Pillar Linguistic Bridge & A–Z Silent-Letter Reference
│   │   ├── AILessonModal.tsx       # Custom AI Lecture generator modal (@google/genai)
│   │   ├── DailyChallengeModal.tsx # 24-hour 3-question retention pop-up quiz
│   │   ├── DictionaryView.tsx      # 10,400+ Lexicon cards, Vocab Table, SRS, Dictation & Mistake Notebook
│   │   ├── LecturePlayer.tsx       # 5-Module interactive lecture player & drawer tools
│   │   ├── PracticeArenaView.tsx   # 10-tool Practice Hub, Role-Play, Shadowing & Printable PDF sheets
│   │   └── ProgressSettingsView.tsx# Skill analytics, 14-day heatmap, 8 badges, Audio & Voice Lab
│   ├── data/
│   │   ├── syllabus.ts             # Core CEFR B1–C1 sequential 12-lecture curriculum
│   │   ├── lectureEnhancements.ts  # Extended vocabulary, reading passages & single-tone dialogues
│   │   └── massiveLexicon.ts       # 10,400+ derived lexicon generator & curated silent-letter seeds
│   ├── hooks/
│   │   └── usePWA.ts               # PWA installation prompt & online/offline status hooks
│   ├── services/
│   │   ├── geminiService.ts        # Structured JSON schema generation for custom AI units
│   │   ├── speech.ts               # Web Speech API synthesis (variable rate & pitch)
│   │   └── storage.ts              # LocalStorage persistence, SRS scheduling, streaks & backup/restore
│   ├── types/
│   │   └── curriculum.ts           # Strict TypeScript interfaces for curriculum, SRS & analytics
│   ├── App.tsx                     # Application shell, unified syllabus filters & navigation
│   └── index.css                   # Editorial Warm Paper (#FAF7F2) & Dark Ink (#141210) theme tokens
├── server.ts                       # Express + Vite middleware server
└── package.json
```

---

## 🎨 Design Philosophy

BhashaSetu uses an **Editorial Warm Paper & Ink** aesthetic crafted for long-form reading comfort and zero visual fatigue:
- **Warm Editorial Paper (`#FAF7F2`) & Dark Ink (`#141210`)**: High-contrast, glare-free surfaces in both Light and Dark modes.
- **Semantic Orthographic Highlighting**: Crimson (`#B91C1C`) dotted underlines exclusively mark silent letters inside English words so learners develop instant visual recognition.
- **Polyglot Typography**: Pairs editorial display serifs with clean UI sans-serifs, `JetBrains Mono` for IPA phonetic transcriptions (`/ˈsʌt.əl/`), and `Noto Sans Devanagari` for Nepali script clarity.

---

## 📄 License

This project is open-source and available under the **MIT License**.
