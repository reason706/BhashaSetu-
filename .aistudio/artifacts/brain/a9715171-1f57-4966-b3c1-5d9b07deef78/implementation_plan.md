# BhashaSetu: Home Page UI/UX Restructure, Gmail-Style Foldable Sidebar & AI Suite Plan

## 1. App Overview & Objectives
**BhashaSetu (भाषासेतु)** is a bilingual Nepali-to-English learning workspace designed around a calm, literary editorial aesthetic. This update elevates the workspace layout, declutters the Home page into an intentional **Clean Focus** hierarchy, introduces a **Gmail-style foldable desktop sidebar**, and expands the **Server-Side Gemini 3.8 Flash AI Suite** across four practical language-learning workflows.

### Primary Objectives
1. **Gmail-Style Foldable Navigation Rail**: Allow users to toggle the left sidebar via a top-left menu button (next to the BhashaSetu brand mark, just like Gmail/Google Workspace) between a full `240px` labeled drawer and a compact `72px` icon-only rail with instant tooltips—plus optional hover peek and persistent state in `localStorage`.
2. **Clean-Focus Home Page UI/UX Arrangement**: Reorganize the Home page into 5 balanced, non-repetitive zones that eliminate duplicate analytics clutter (moving deep 4-Pillar & CEFR Track charts exclusively to the Progress page) while putting daily study, weekly rhythm, and interactive AI coaching front and center.
3. **Complete 4-Part Gemini AI Suite**:
   - **AI Sentence & Grammar Coach Card (Home Page)**: Check any English sentence or Nepali thought for grammar, SVO vs. SOV word order, natural phrasing, and Devanagari explanation.
   - **AI Silent-Letter & Pronunciation Explainer (Home Word Spotlight & Dictionary)**: One-click deep phonological breakdown explaining *why* a word has silent letters, how to position the tongue/lips compared to Nepali sounds, and a memory trick.
   - **AI Roleplay Conversation Partner (Dedicated Modal / Practice Hub & Home Launch)**: Interactive multi-turn bilingual roleplay scenarios (e.g., *Job Interview in Kathmandu*, *Clinic Visit*, *Client Meeting*, *Airport Immigration*) with voice input/playback and live grammar hints.
   - **Enhanced AI Custom Lesson Generator**: Topic presets + custom prompt builder generating full 4-module interactive lessons saved for offline study.

---

## 2. Target Audience & User Personas
- **Intermediate Nepali Learners (CEFR B1–C1)**: Students, job seekers, and working professionals who already know basic words but struggle with English silent letters, word stress, and translating Nepali SOV (`कर्ता + कर्म + क्रिया`) thoughts into natural English SVO sentences.
- **Desktop & Laptop Study Sessions**: Learners who want a distraction-free workspace where the navigation rail can fold into compact icons (like Gmail) to maximize screen space during reading, lessons, or AI coaching.

---

## 3. Core Functional & Technical Requirements

### A. Gmail-Style Foldable Desktop Sidebar
- **Header Hamburger / Collapse Toggle**: Place a clean circular/rounded icon button (`Menu` / `PanelLeft`) immediately to the left of the `भ BhashaSetu` brand mark in the top header bar on desktop (`md+`), matching Gmail's top-left collapse pattern.
- **Unfolded State (`w-60` / `240px`)**:
  - Displays section headers (`LEARN`, `YOUR JOURNEY`), icons + full text labels (`Home`, `Lessons`, `Dictionary`, `Practice arena`, `Progress`, `Settings`, `About guide`), a primary `+ Create AI lesson` button, and the bottom offline readiness card.
- **Folded State (`w-[72px]`)**:
  - Hides text labels and section headers; centers each navigation icon inside a clean `44x44px` interactive button with an instant custom hover tooltip (`Home`, `Lessons`, etc.) and active indicator pill.
  - Converts the `+ Create AI lesson` action into a compact crimson icon button (`Sparkles`) and the offline card into a compact status indicator with tooltip.
  - Persists the user's folded/unfolded preference in `localStorage` (`bhashasetu_sidebar_collapsed`).

### B. Clean-Focus Home Page Arrangement (5 Intentional Zones)
To keep the Home page calm, scannable, and high-utility, we will arrange the layout into these 5 ordered zones (removing the duplicate 4-Pillar and CEFR Track charts from Home so they live cleanly in the **Progress** tab):

1. **Zone 1 — Personal Greeting & Quick Action Header**:
   - Time-of-day greeting (`"Good morning, {FirstName}"`), encouraging subtitle, and quick-launch buttons for **Create AI Lesson** and **AI Roleplay Partner**.
2. **Zone 2 — Primary Hero Lesson Card (`START / CONTINUE YOUR PATH`)**:
   - Full-width warm editorial banner highlighting the user's current/next lesson, step progress (`Step X of 5`), primary `"Start lesson"` / `"Continue lesson"` CTA, and the interactive Open-Book (`अ | A`) pronunciation trigger.
3. **Zone 3 — 4-Metric KPI Summary Strip**:
   - 4 balanced cards in a single row: `Words learned`, `Lessons completed (X of 12)`, `Daily streak (X days)`, and `Current level (B1/B2/C1)` with tabular numerals.
4. **Zone 4 — Two-Column Core Workspace (`Pick Up Where You Left Off` + `Your Week` Chart)**:
   - **Left Column (7 cols)**: Three high-utility continuation cards (`Saved words & flashcards`, `Quick pronunciation check`, `60-second word sprint`) plus a 4th interactive row for `AI Roleplay Conversation`.
   - **Right Column (5 cols)**: `"Your week"` 7-day vertical capsule bar chart (`M T W T F S S`) showing daily study minutes vs. the user's daily goal.
5. **Zone 5 — Interactive AI Coaching & Word Spotlight Split**:
   - **Left / Top Card — AI Sentence & Grammar Coach**:
     - Interactive input box where learners type (or dictate via microphone) an English sentence or a Nepali sentence they want to express in English.
     - Returns structured bilingual coaching: **Corrected Natural English**, **Polite/Professional Alternative**, **SVO vs. SOV Grammar Breakdown in Nepali Devanagari**, and **One-Tap Audio Playback**.
     - Includes 3 quick-try example chips for instant testing.
   - **Right / Bottom Card — Silent-Letter Word Spotlight + AI Phonetic Explainer**:
     - Highlights a tricky silent-letter word with segmented orthography, `1.0x` and `0.5x` audio, Nepali meaning reveal, `Mark Mastered`, and an **"Ask AI Why & How to Pronounce"** button that reveals the etymological reason for the silent letter, mouth/tongue placement compared to Nepali sounds, and a bilingual mnemonic.

### C. Server-Side Gemini 3.8 Flash API Endpoints (`/server.ts`)
All Gemini API calls will run strictly on the server in `/server.ts` using `@google/genai` (`model: 'gemini-3.8-flash'`) with structured JSON schemas (`responseSchema`):
1. `POST /api/lessons/generate` *(Existing, enhanced with quick topic presets)*: Generates a complete 4-module bilingual lecture.
2. `POST /api/ai/sentence-coach` *(New)*: Analyzes a user's English or Nepali input sentence and returns `{ correctedEnglish, naturalAlternative, nepaliMeaning, grammarTipNepali, svoComparisonNote, mistakeCategory }`.
3. `POST /api/ai/word-explainer` *(New)*: Explains a target word's silent letters and pronunciation for Nepali speakers, returning `{ word, silentReasonNepali, mouthPositionNepali, nepaliSoundComparison, memoryTrickNepali, extraExampleEnglish, extraExampleNepali }`.
4. `POST /api/ai/roleplay` *(New)*: Handles multi-turn bilingual conversation practice for real-world scenarios (Job Interview, Doctor/Clinic, Workplace Meeting, Travel/Airport), returning `{ replyEnglish, replyNepaliTranslation, userFeedbackNepali, improvedUserSentence, suggestedNextResponses }`.

---

## 4. Design & UX Direction
- **Warm Paper & Ink Palette**: Preserves BhashaSetu's signature `#F7F4EC` warm paper canvas, `#FFFFFF` card surfaces with `#E6E0D4` hairline borders, `#A82020` Nepali crimson primary accents, and `#1F5C3D` forest green completion states (plus full Dark Mode parity).
- **Editorial Typography**: `Fraunces` serif for display titles, `Plus Jakarta Sans` + `Noto Sans Devanagari` for bilingual body clarity, and `JetBrains Mono` (`tabular-nums`) for IPA transcriptions, timers, and chart metrics.
- **Zero-Pill Metadata & Clean Hierarchy**: Unboxed metadata separated by `·` bullets, single-level card elevation, and smooth layout transitions when folding/unfolding the sidebar.
