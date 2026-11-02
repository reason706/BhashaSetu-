# BhashaSetu — Production-Ready UI, Curriculum Ordering & High-Impact Feature Plan (Revised)

This revised plan transforms **BhashaSetu** into a cohesive, production-grade English mastery platform across mobile, tablet, and desktop. In addition to re-sequencing all 12 core lectures in strict CEFR order (`B1: 01–04`, `B2: 05–08`, `C1: 09–12`), consolidating curriculum filters, compacting mobile vocabulary cards (`10 per batch`), and separating **Progress**, **Settings**, and **About** into dedicated pages, this revision adds **6 high-value "must-have" learning features** that elevate retention, speaking fluency, and motivation.

---

## User Review & Confirmed Decisions + New Must-Have Additions

> [!IMPORTANT]
> Below are your confirmed layout and workflow decisions, followed by the **6 new high-impact features** added in this revision:

### Confirmed Core Decisions
- **Sequential CEFR Level Ordering (`01–12`)**: Strictly ordered so **B1** = Lectures `01–04`, **B2** = Lectures `05–08`, and **C1** = Lectures `09–12`.
- **Unified Filter Bar + Search + Clean Course Cards**: Single filter bar (`By Track | Grid | Roadmap Table`, `All | B1 | B2 | C1`, `All Status | To Do | Completed`) above Search and decluttered Lecture Cards (no word-count heading after lecture number, no sub-module buttons inside the card).
- **Streamlined Lecture Player Top Bar**: `← All Lectures` on the left, live **Lecture Progress `%` Bar** on the right, **`⋮` Three-Dot Menu** on mobile/tablet (housing **Mistake Notes** and **Study Cheat Sheet**), and removal of redundant top-bar buttons (`Audio Dictation Bee`, `Real-Life Dialogue`, `Switch Lecture`).
- **Compact Mobile Vocabulary Cards + `10 Words` Batching**: Icon-only Bookmark button, compact `1.0x` and `0.65x` audio buttons side-by-side, concise Nepali meaning, example sentence, prominent **Phonics Tip**, **10 words initially** with **Load More Words (+10)**, and a cleaned-up **Section Vocabulary Bank** title.

### 6 New High-Impact Features Added in This Revision
1. **Interactive Role-Play Mode (`Practice as Speaker A / B`) in Real-Life Dialogues**:
   - In addition to two-person conversational audio (`Voice A` + `Voice B` with distinct pitch and natural `380ms` turn pauses), learners can toggle **Role-Play Mode**: the app speaks Character A's turn aloud and automatically activates the microphone (or waits) for you to speak Character B's reply!
2. **1-Click "Hide Word (Self-Test)" Toggle on Vocabulary Cards**:
   - A compact eye-mask toggle in the vocabulary header lets learners mask the English word text while keeping the `1.0x / 0.65x` audio buttons, Nepali meaning, and Phonics Tip visible—turning Step 01 into an instant listening & recall drill.
3. **Quick Smart Filters Inside the Section Vocabulary Bank**:
   - Adds clean 1-click filter tabs (`All Words`, `Silent Letters Only`, `Saved Words`) inside each lecture's **Section Vocabulary Bank** so learners can immediately isolate tricky silent-letter words from the 850+ section entries.
4. **"Resume Next Step" & "Quick Mistake Drill" Action Bar on the Home Page**:
   - The top Course Progress banner on the Home page includes a smart **Resume Where You Left Off** button (jumping straight to your exact unfinished lecture and step) plus a **Quick Mistake Review** shortcut when you have active items in your Mistake Notebook.
5. **Printable CEFR Track Certificates & Weak-Area Diagnosis on the `Progress` Page**:
   - Completing all 4 lectures in `B1 (01–04)`, `B2 (05–08)`, or `C1 (09–12)` unlocks a printable **CEFR Track Mastery Certificate**, paired with **Visual Skill Breakdown Charts** (Vocabulary, Spelling & Dictation, Grammar, Dialogue) and a **Focus Areas** diagnostic card highlighting which skill needs review.
6. **Interactive A–Z Silent-Letter Reference Matrix on the `About` Page + Voice Accent Selector in `Settings`**:
   - The new **About** page pairs the **Spiral 4-Pillar (+ Dialogue) Bridge Methodology** with an interactive **Master Silent-Letter Reference Matrix** (clickable audio examples for `kn-`, `wr-`, `-mb`, `-bt`, `-stle`, `ps-`, `pn-`, `rh-`, `gh`, `ch /k/`).
   - The dedicated **Settings** page adds a **Preferred English Voice / Accent Selector** (choosing from available device voices + testing both Speaker A and Speaker B voices), **Daily Study Goal (`5 / 10 / 15 / 30 min`)**, and **JSON Backup Export & Restore**.

---

## 1. Overview & Core Concept

- **What It Does**: Delivers a clutter-free, editorial-grade English learning experience where every screen has a clear visual hierarchy, zero developer-note filler text, ergonomic mobile touch targets (`≥ 44px`), and complete offline capability.
- **Target Audience**: Intermediate to advanced (`B1–C1`) learners who want structured progression, accurate pronunciation/spelling mastery, and actionable analytics.

---

## 2. User Experience & Visual Design

### A. Sequential Curriculum Order (`Lectures 01–12`)
All 12 core lectures and their linked vocabulary, pronunciation items, sentence builders, dialogues, and section lexicons are organized sequentially by CEFR level:

| Level Track | Lecture # | Lecture Title | Core Grammar & Spelling Focus |
| :--- | :--- | :--- | :--- |
| **B1 Foundation** | **Lecture 01** | Everyday Silent Consonants (`kn-`, `wr-`, `-mb`, `-bt`) | Final Silent `-e` Dropping & `SVO vs. SOV` Word Order |
| **B1 Foundation** | **Lecture 02** | Workplace & Travel Silent Letters (`gh`, `h`, `p`, `l`) | `I Before E Except After C` & Articles / Prepositions |
| **B1 Foundation** | **Lecture 03** | Everyday Action & Household Silent Letters (`-stle`, `-sten`) | Plural Nouns (`-ies`, `-ves`) & Causative Verbs (`Have/Get`) |
| **B1 Foundation** | **Lecture 04** | Culinary, Travel & Lifestyle Loanwords (`-et`, `l`, `u`) | `-able` vs. `-ible` & Countable vs. Uncountable Nouns |
| **B2 Intermediate** | **Lecture 05** | Academic & Media Silent Clusters (`sc-`, `-mn`, `-gn`) | CVC Consonant Doubling & Present Perfect vs. Past Simple |
| **B2 Intermediate** | **Lecture 06** | Professional & Medical Silent Letters (`ps-`, `-rt`, `s`) | Double Consonants (`ac-`, `oc-`) & Polite Indirect Questions |
| **B2 Intermediate** | **Lecture 07** | Business, Finance & Law Silent Letters (`b`, `c`, `g`, `p`) | `-cede / -ceed / -sede` & Passive Voice in Business |
| **B2 Intermediate** | **Lecture 08** | Media, Technology & Communication (`-gue`, `u`, `p`) | Prefix Integrity (`un-`, `dis-`, `mis-`) & Reported Speech |
| **C1 Advanced** | **Lecture 09** | Advanced Vowel Compression (Schwa `/ə/`) & Word Stress | `-ance / -ence` Suffixes & Relative Clauses (`who/which/whose`) |
| **C1 Advanced** | **Lecture 10** | Advanced Greek & Latin Silent Letters (`ps-`, `pn-`, `rh-`) | Confusable Homophones & Conditional Sentences (`1st/2nd/3rd`) |
| **C1 Advanced** | **Lecture 11** | Academic Rhetoric & Greek `CH` (`/k/`) | `-cious / -tious` Suffixes & Contrastive Markers (`Although/Despite`) |
| **C1 Advanced** | **Lecture 12** | Executive & Diplomatic Loanwords (`-ps`, `-p`, `-z`) | Classical Plurals (`-is → -es`, `-on → -a`) & Negative Inversion |

---

### B. Home Page (`Lectures` View) Architecture
1. **Smart Course Progress & Quick-Resume Banner**:
   - Displays overall completion (`X / 12 Lectures`), B1/B2/C1 track progress bars, a **Continue Lecture XX →** primary button, and a **Custom AI Lesson** creator button.
2. **Unified Filter & Search Bar**:
   - **Row 1 (All Filters in One Bar)**:
     - *View Mode*: `By Track` | `Grid` | `Roadmap Table`
     - *Level Filter*: `All` | `B1` | `B2` | `C1` *(+ `Custom` if AI lessons exist)*
     - *Status Filter*: `All Status` | `To Do` | `Completed`
   - **Row 2 (Search Bar Directly Below Filters)**:
     - Instant search input across lecture numbers, titles, grammar rules, and focus words.
3. **Clean, Production-Ready Lecture Cards**:
   - **Header**: `Lecture 01 · Level B1 · Category` (with a clean `✓ Completed` badge if finished — **no word-count heading** after lecture number).
   - **Body**: Title, concise subtitle, and 4 quiet focus-word tags.
   - **Footer**: Estimated minutes (`15 min`), quiz accuracy (if completed), and a single **Start Lecture →** (or **Review →**) button. No sub-module buttons or word-bank banners inside the card.

---

### C. Lecture Player Page, Compact Vocabulary Cards & Two-Voice Dialogue
1. **Top Bar (`← All Lectures` + Live `%` Progress Bar + `⋮` Menu)**:
   - **Left**: `← All Lectures`
   - **Right**:
     - **Lecture Progress `%` Bar**: Visual bar + percentage (`0%` to `100%`) tracking completed steps (`0/5` to `5/5`) in the current lecture.
     - **Mobile & Tablet (`< 1024px`)**: **`⋮` Three-Dot Menu** button opening a clean popover with **Mistake Notes (`X`)** and **Study Cheat Sheet**.
     - **Desktop (`≥ 1024px`)**: Clean secondary buttons for **Mistake Notes (`X`)** and **Cheat Sheet**.
2. **Compact Mobile-First Vocabulary Cards (Step 01)**:
   - **Header Row**: `01 · Noun · Silent "k" & "gh"` on the left; **icon-only Bookmark button** (`Bookmark` / `BookmarkCheck`) in the top-right corner.
   - **Headword & Dual Audio Row**: Word with crimson dotted silent letters + IPA on the left; compact **Listen (`1.0x`)** and **Slow (`0.65x`)** buttons side-by-side on the right.
   - **Self-Test Word Mask Toggle**: A header toggle (`Mask Words for Self-Test`) lets learners hide the English headwords and test recall from audio and meaning.
   - **Compact Meaning, Example & Prominent Phonics Tip**: Concise Nepali meaning, 1-line example sentence with mini audio icon, and a highlighted **Phonics Tip** box.
   - **`10 Words` Batching + `Load More Words (+10)`**: Shows 10 words initially and loads 10 more per click.
   - **Clean Section Vocabulary Bank**: Simplified title (`Section 01 Vocabulary Bank`) with quick filter tabs (`All`, `Silent Letters`, `Saved`) and zero redundant filler text.
3. **Two-Person Conversational Dialogue + Role-Play Mode (Step 05)**:
   - **Dual-Voice Audio**: Assigns two distinct voices/pitches (`Speaker A` vs. `Speaker B`) with a `380ms` conversational pause between turns so `Listen to Dialogue` sounds like two people talking.
   - **Role-Play Practice Mode (`Practice as Speaker A / B`)**: Lets the learner choose a character; the app speaks the partner's lines and prompts the learner to speak their character's lines into the microphone.

---

### D. Dedicated `Progress`, `Settings`, and `About` Pages
1. **`Progress` Page**:
   - **4 Top KPI Cards**: Study Streak, Lectures Completed (`X/12`), Overall Accuracy (`%`), and SRS Mastered Words.
   - **Visual Skill Breakdown Charts**: Progress bars and accuracy percentages for **Vocabulary & SRS**, **Spelling & Dictation**, **Grammar Capstone**, and **Dialogue Comprehension**, plus a **Recommended Focus Area** callout.
   - **CEFR Track Mastery & Printable Certificates**: Track cards for `B1 (01–04)`, `B2 (05–08)`, and `C1 (09–12)` with a **View Certificate** modal (`window.print()`) when a track is completed.
2. **`Settings` Page**:
   - **Language Display Preference**: `English Only`, `English + Word Meanings`, `Full Nepali Support`.
   - **Voice Persona, Speed & Dual-Speaker Test Studio**: Select speech speed (`0.75x`, `1.0x`, `1.1x`), choose preferred English voice accent, and tap **Test Conversation Voices** to preview both Speaker A and Speaker B.
   - **Study Goal & Theme**: Target CEFR level (`B1/B2/C1`), Daily Goal (`5 / 10 / 15 / 30 min`), and Warm Cream vs. Dark Ink theme toggle.
   - **Data Backup & Restore**: **Export Progress (`.json`)**, **Import Backup (`.json`)**, and **Offline PWA Install** controls.
3. **`About` Page (New Navbar Tab)**:
   - **Spiral 4-Pillar (+ Dialogue) Bridge Methodology** visual guide.
   - **Interactive A–Z Silent-Letter Reference Matrix**: Clickable cards for every major silent-letter rule in English with instant audio playback.

---

## 3. Technical Architecture & Data Strategy

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                       BhashaSetu Application Shell (App)                     │
│  Top Navbar (Desktop) / Bottom Tab Bar (Mobile):                             │
│  [ Lectures ]  [ Dictionary ]  [ Progress ]  [ Settings ]  [ About ]         │
└──────┬───────────────┬───────────────┬─────────────┬─────────────┬───────────┘
       │               │               │             │             │
       ▼               ▼               ▼             ▼             ▼
┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌───────────┐ ┌───────────────┐
│ Home Syllabus│ │LecturePlayer │ │ProgressPage│ │SettingsPg │ │  AboutPage    │
│ • Resume CTA │ │ • % Bar +[⋮] │ │ • 4 KPIs   │ │ • Language│ │ • 4-Pillar    │
│ • Unified    │ │ • 10/Batch   │ │ • Skill    │ │ • Voice & │ │   Bridge      │
│   Filter Bar │ │   Compact    │ │   Charts   │ │   2-Voice │ │ • Interactive │
│ • Search Bar │ │   Vocab Cards│ │ • B1/B2/C1 │ │   Preview │ │   Silent-     │
│ • Clean      │ │ • 2-Voice    │ │   Certifi- │ │ • Backup  │ │   Letter A-Z  │
│   Lecture    │ │   Dialogue + │ │   cates    │ │   Export/ │ │   Audio       │
│   Cards      │ │   Role-Play  │ │ • History  │ │   Restore │ │   Matrix      │
└──────────────┘ └──────────────┘ └────────────┘ └───────────┘ └───────────────┘
```
