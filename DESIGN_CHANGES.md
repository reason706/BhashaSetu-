# BhashaSetu redesign — what changed

The UI/UX redesign artifact was used as a visual and layout reference only.
Nothing was copied in as HTML. All changes are edits to the existing React +
Tailwind source in `src/`. Every route, Firebase call, data model, state field
and feature is kept.

- **Backup:** the pre-redesign source is in `backup/pre-redesign-2026-11-11/`
  (`src/` and `index.html`).
- **Verification:** each step was checked with `npm run lint` (`tsc --noEmit`)
  and `vite build`, plus Playwright screenshots at 1440 px (desktop) and 390 px
  (phone).

## Left untouched on purpose

- **Sidebar** (desktop navigation): markup, styles and behaviour unchanged. The
  colour pass below skipped it on purpose.
- **Mobile bottom bar:** markup, styles and behaviour unchanged.
- **Progress** (overview), **Settings** and **About guide:** these already
  match the redesign (dark streak banner and emblem, KPI tiles, rhythm chart,
  weekly goal, CEFR journey, heatmap, grouped settings with toggles). No layout
  changes.
- **Step content inside the lecture player**, and **each Practice Arena tool's
  internals:** already complete and working. They only received the brand
  colour pass.

## Across the whole app

**Top bar**
- Logo and hamburger on the left, search in the middle, streak, level and
  avatar on the right.
- New **level chip** ("Lv N · title"). It opens Achievements.
- The streak chip is compact on phones (number only).
- On phones, search becomes an icon that expands over the whole bar, with a
  close button. Results close the overlay.
- `/` focuses search. `Escape` closes search and the avatar menu.

**Shared XP / level**
- One `learnerXP` / `learnerLevelNumber` calculation now feeds the top bar,
  Today's goal card and the level-up modal. Before, the goal card and the
  modal used two different formulas.

**Modals and pop-ups** (`src/hooks/useModalBehavior.ts`)
- Same blurred espresso backdrop everywhere.
- Click outside or press `Escape` to close.
- Page scroll is locked while a modal is open.
- **Only one open at a time:** opening a modal closes any other modal and the
  top-bar popovers.
- Applied to: AI lesson, AI roleplay, daily challenge, level-up, reset
  progress, the phone select sheet, the new badge detail and Welcome.
- The AI lesson modal still can't be closed while a lesson is generating.

**Reduced motion**
- `MotionConfig reducedMotion="user"` wraps the app.
- A CSS `prefers-reduced-motion` rule neutralises animations and transitions.
- JavaScript smooth scrolls fall back to instant (`scrollBehavior()` helper).

**Brand colours**
- Tailwind default red `#B91C1C` and the older `#A82020` → crimson `#9E2A2B`.
- Their hover shades → `#872223`.
- Tailwind green `#15803D` → sage `#2D6A4F`.
- Applied in all components, but not in the sidebar or the bottom bar.

**Polish**
- Brand text-selection colour.
- Crimson `focus-visible` ring on links and buttons. Inputs keep their own
  focus styles.

## Home (`App.tsx`)
- **Phone order** follows the design: daily challenge → hero / continue →
  today's goal → quick tools → vocabulary pair → mistake radar → sentence
  coach → your week → snapshot. Desktop keeps the 8/4 two-column layout.
- On phones, the 5 step tiles and the 3 track pills scroll sideways instead of
  truncating ("Gram…", "Dialog…").
- Unchanged: hero, quick tools, word of the day, silent-letter spotlight,
  mistake radar, coach, goal ring, week chart, snapshot.

## Lessons (`App.tsx`)
- Level pills show how many lessons match.
- Topic search shows a live result count and a larger clear button. One
  `lessonMatchesTopic` helper replaces two copies of the filter.
- **Phones:** compact progress strip (lectures, steps, words) and a dark
  "Continue · Step N of 5" strip. The full lesson and track progress card is
  one tap away behind "Show track & quiz details", so nothing was removed.
- The empty "Your custom lessons" state gets a dashed **Create AI lesson**
  card.
- Unchanged: level groups, lesson rows, fold-out details, steps, key words,
  locks, custom lesson list.

## Lecture player (`LecturePlayer.tsx`), all 5 steps
- The title now spans the full width. Before, it was squeezed beside the step
  tabs.
- **New stepper:** icon dots joined by a sage progress line.
  - Every completed step shows a check. Before, only step 1 could show a tick.
  - The current step has a crimson ring.
  - Wider screens add a Done / Now / Next label and a one-line description.
  - Phones show short names.
- Same `goToModule` behaviour. Vocabulary, Pronunciation, Spelling, Grammar
  and Dialogue content is unchanged.

## Practice arena (`PracticeArenaView.tsx`) and its tools
- One shared activity card renderer for the 13 core activities and the
  specialized labs. This removes duplicated markup.
  - **Phones:** a single scannable list (icon, title, one-line description,
    chevron).
  - **Tablet and desktop:** the existing card grid.
- "Explore specialized labs" is now a proper button (`aria-expanded`).
- **Tool pages on phones:** Back and Shuffle become icon buttons, so the
  header fits on one row.
- Every tool's behaviour is unchanged.

## Progress, achievements, settings (`ProgressSettingsView.tsx`)
- **Badge detail pop-up:** tapping (or Enter/Space on) any of the existing 16
  badges opens a sheet. It shows large badge art, tier and category,
  description, a current/target progress bar and status. It is a bottom sheet
  on phones and a centred dialog on desktop. Earned badges still play the
  celebration chime.
- The reset-progress confirmation uses the shared modal behaviour.
- Unchanged: Progress overview, achievements layout, badge data, Settings.

## Dictionary (`DictionaryView.tsx`)
- **Fixed a phone overflow.** The tool tab strip used `-mx-4`, which is wider
  than the page padding, so the page scrolled sideways by 5 px on a 390 px
  screen.
- **Lexicon cards on phones** show the headword, IPA, meaning and actions. The
  example sentence and the silent-letter / AI Guide strip open with
  "Example & phonics". They stay open on tablet and desktop, and whenever an
  AI guide has been fetched.
- Unchanged: tools (cards, table, SRS, match, dictation, speed quiz,
  mistakes), filters, pagination, export, audio loop.

## Added only because the app had no equivalent
- **Welcome onboarding** (`WelcomeOnboarding.tsx`):
  - Steps: welcome → level → daily goal and reminder → explanation language
    → summary → start lesson 01 or explore.
  - Saves through the existing `completeOnboarding()`. The data model already
    had `onboardingComplete`, but no screen used it.
  - Shown only to brand-new learners with no study history, so existing users
    are never interrupted. Skip or Escape keeps current preferences.
- **About guide:** not added. `AboutView` already exists.
- **Pop-ups:** no new pop-up types beyond the badge detail sheet. The existing
  modals were unified instead.

---

# Pass 2 — visual fidelity (the artifact is the source of truth for looks)

## Session 1: shared design system + Home

**Artifact read:** `project/Main.dc.html`, 100% of its 834 lines (CSS lines
1–480 and Home markup lines 481–834, including inline styles).

### Shared design system (`src/index.css`, `@layer components`)
- Ported value-for-value from the artifact's `<style>` block:
  - **Type and colour helpers:** `.serif`, `.np`, `.mono`, `.muted`, `.crim`,
    `.sage`, `.ochre`, `.eyebrow`, `.h2`, `.h3`, `.sec`, `.sil`.
  - **Cards and buttons:** `.card` (plus `.sand`, `.paper`, `.ink`), `.hov`,
    `.btn`, `.btn-p`, `.btn-g`, `.btn-d`, `.btn-sm`, `.ibtn`.
  - **Chips and controls:** `.chip`, `.pill`, `.pill.on`, `.seg`,
    `.tag` (plus `.t-sage`, `.t-crim`, `.t-ochre`, `.t-ink`),
    `.ico` (plus `.sm`, `.xs`, `.i-*`), `.track`, `.fill`, `.input`, `.kbd`.
  - **Feature blocks:** `.hero` (plus `.art`, `.wm`, `.body`), `.step`,
    `.step.sel`, `.steps5`, `.banner` (plus `.rings`, `.bchip`), `.emblem`
    (plus `.o1`, `.o2`, `.core`), `.opt` (plus `.sel`, `.ok`, `.no`), `.kpi`.
  - **Motion:** the `.main > *` page-load stagger.
- Every class has a dark-mode variant.
- **Breakpoints:** the artifact's ≤900px rules map to phones (below `md`).
  The 8/4 split collapses below `xl`, because the artifact collapses it when
  the content area (viewport minus the 240px sidebar) is under 1100px.
- The existing `prefers-reduced-motion` rule also covers the new animations.

### Home diff table (artifact → `src/App.tsx` → change)

| Artifact section | Before | Change |
|---|---|---|
| `.ls-head` (eyebrow, serif 34px, crimson chip) | Bordered header with a subtitle and two small buttons | Eyebrow plus serif 28/34px greeting; crimson `.chip` "B1 · Foundation track". Syllabus kept as a `.chip`. Subtitle and divider dropped, as in the artifact. |
| `.hero`: gradient 135° #EFEADE→#EAE1D2→#E2D6C3, 24px radius, 28/20px padding | 12-column split with a separate book medallion button and its own step grid | Real `.hero`: `.art` illustration underlay (340×320, faded and offset on phones), `.wm` Devanagari watermark, `.body` at most 62% wide, `btn-p` CTA and `btn-g` "Hear title", plus meta. |
| `.steps5` / `.step(.sel)` with 4px progress bars and Done/Now/Next | Bordered tiles that opened the lecture at once | Artifact behaviour: tapping a tile selects it, the CTA becomes "Review / Resume / Start / Jump to step N" and the info line updates. Double-click opens the step directly. |
| (no artifact equivalent) | B1/B2/C1 track buttons | Kept inside the hero as translucent `.chip` cards with `.track` bars. |
| Quick tools `.card.hov` with `.ico` tiles (2 columns below xl) | Custom cards with decorative circles | `.card.hov` buttons with `.ico.i-sage/.i-crim/.i-ink/.i-ochre`. "All labs →" link added. Same four actions. |
| Word of the day `.card` | Custom card | Eyebrow plus `.tag.t-sage` header, serif 36px word with `.sil` silent letters, mono IPA, Nepali line, `btn-p` Play, `.seg` 1.0×/0.5× (new, controls speed), `.ibtn` save word (new, uses `handleToggleSaveWord`). "Another word" moved to the header. |
| Silent-letter spotlight `.card` | Custom card | Same pattern, paper tip box with info icon, dashed "recall then reveal" button (artifact recall pattern), `btn-g` Hear it / 0.5× / AI phonetic guide, Mastered, Next. |
| Mistake radar `.card` plus `.card.paper.hov` tiles | Custom card | Eyebrow and serif "Your mistake radar", `btn-p btn-sm` Targeted fix, three `.card.paper.hov` tiles with `.ico.sm` and coloured counts. Focus area and key targets kept as a muted line. |
| Sentence coach `.card` with `.ico` header, `.input`, `.pill` samples | Custom card | `.ico.i-crim` header, eyebrow plus serif title, `.input` and `btn-p` Check, `.pill` samples, result box with `.tag.t-sage` and serif 20px correction. Live roleplay, Listen, Reset and all AI fields kept. |
| Today's goal (`#F2EBDC` header strip) | Sand header with a pill count | Artifact header "Today's goal · N min target" (links to Settings), 96px ochre ring (sage when met), serif "N min to go", streak, XP and `.tag.t-ochre` level. |
| Your week (7 bars, 120px tall, crimson ring on the selected day, footer tag) | Capsule bars with goal threshold, legend and dots | Artifact bars: sage when the goal is met, `#D9D1C3` otherwise, double-ring selection, footer with day total and `.tag` (met / short / target). Details link kept in the header. |
| Daily challenge `.card.ink` | Light paper row | Espresso `.card.ink`: gold `.ico`, cream full-width button on desktop, compact row on phones. |
| Snapshot `.card.kpi` with `.ico.xs` | Plain stat buttons | `.card.kpi.hov` tiles. Real app data is kept (lectures, words learned, best streak, SRS due); the artifact's "quiz accuracy" number was not invented. |
| `.main` stagger, 1240px max width, 28/40px padding | 82rem container with `space-y` | The `.main` container gets the artifact spacing and the page-load stagger. |

**Intentionally unchanged on Home:** all data and handlers, phone card order
(already matched the artifact), the sidebar and the bottom bar.

**Still different from the artifact:**
- The goal-ring SVG markup wasn't found in the artifact export, so the ring
  sizes and colours follow its CSS tokens instead.
- The Word of the day row has one extra button (Another word, an existing
  feature).

## Session 2: Lessons

**Artifact read:** `project/Lessons.dc.html`, lines 470–803 (all markup,
inline styles and the page script). The `.ls-*` CSS was taken from
`Main.dc.html`. I didn't re-read lines 1–469 (the shared `<style>` block).

| Artifact section | Before | Change |
|---|---|---|
| `.ls-head`: "Lessons" serif 34/28px + `btn-p` Create AI lesson ("AI lesson" on phones) | Eyebrow, long title and subtitle; filter row with a separate AI button | Artifact head, one line |
| `.ls-stats` strip on every screen: Lectures / Steps / Quiz accuracy, `.ico.xs` (hidden on phones), separators | Phone-only strip with words learned | Artifact strip on all sizes. Quiz accuracy is real data (spelling + grammar + dialogue `moduleScores`, same source as LessonProgressCard), "—" when no quizzes yet. Steps count completed lessons as 5. |
| `.ls-resume` dark strip on every screen | Phone only | Espresso strip, crimson number tile, gold "CONTINUE/START · STEP N OF 5", gold play disc. Opens the next step. |
| `.ls-sfield`: 48px field, crimson focus ring, result count + clear | Small pill input | Artifact field; count and clear button only while typing |
| `.ls-tabs`: underline tabs with count badges | Rounded pills with counts | Artifact underline tabs (animated crimson underline, `aria-selected`) |
| (not in artifact) LessonProgressCard | Desktop always; phones behind a toggle | Kept, behind a "Track & quiz details" pill on all sizes |
| Groups: one `.card` per level, `.ls-gh` sand header (tag, serif 18px name, progress `.track` and count) | Sand container with separate bordered cards per lesson | Artifact group cards: Foundation (sage), Workplace (ochre), Advanced (crimson) |
| Rows: `.ls-num` state tile, title, sub, 5 step dots, state tag, lock or chevron, locked rows at 60% opacity | Coloured-border cards with action buttons | Artifact row list. Same unlock rules; tapping a locked row shows the existing "finish lecture N first" toast with its open-previous action. |
| `.lx` panel: Nepali line, `.steps5` step buttons, key-word `.pill`s with mono IPA, `btn-p` CTA | Folded panel | Artifact panel. Key words still open the phonetics pop-up (save, audio). Step buttons show done (sage) and current (crimson ring) and open that step. |
| Empty state `.card.paper` | Plain card | Artifact empty state plus a "Create AI lesson" button |
| Custom lessons: `.g3` of `.card.hov` (`.ico.sm.i-ochre`, "AI · level" tag) + dashed create card | List rows and a separate empty card | Artifact grid. The dashed create card is always there. |

**Logic fix:** the step labels in the expanded panel used the wrong names
("Silent Phonics", "Mastery Quiz"). They now match the real five steps:
Vocabulary, Pronunciation, Spelling, Grammar, Dialogue.

**Intentionally unchanged:** unlock rules, search matching (`lessonMatchesTopic`),
level filter state, AI lesson modal, LessonProgressCard contents.

## Session 3: Lecture player (all 5 steps)

**Artifact read:** `project/LectureMobile.dc.html`, lines 560–1177: head,
stepper, all 5 steps, desktop rail, bottom bar, sheets, completion, intro and
mastery-quiz overlays. Lines 1–559 are the shared stylesheet.

| Artifact | Before | Change (`LecturePlayer.tsx`) |
|---|---|---|
| `.lm-head`: round back `ibtn`, crimson eyebrow "LECTURE 01 · B1 FOUNDATION", serif title, Cheat sheet `btn-g`, 46px sage progress ring, phone kebab | "Back to all lectures" text row, progress bar, three desktop buttons, separate large title block | Artifact head. Title, Nepali title or subtitle, and Completed state merged in. Notes and mistakes buttons stay on lg screens. |
| Phone SHEETS: bottom sheet with grab handle and `.ico.sm` rows | Small dropdown | Bottom sheet in the shared modal stack (blurred backdrop, tap outside or Escape). Opens notes, mistakes or cheat sheet. |
| `.lm-steps` | (ported in pass 1) | Unchanged |
| `.lm-body` + 330px sticky `.lm-rail` | Notes and mistakes only as drawers | On xl: sticky rail with lecture notes textarea (same auto-save), compact mistake-notes card (latest 3 with 2/2 drill progress, "Re-drill & add notes" opens the full panel), espresso cheat-sheet card (opens the existing printable sheet). Below xl the drawers work as before. |
| `.lm-foot`: white bar, `btn-g` Previous, step dots + "Step N of 5", `btn-p` "Continue to step N" / "Finish lecture" | Cream bar with text and a thin progress bar | Artifact footer. Same handlers (step-complete toast, finish chime). |
| Step 2 dark "SAY THIS WORD" card, `.syl` syllable buttons | Light word header | Espresso card: gold eyebrow, serif 40/48px word, mono IPA + syllable count, cream "Normal" / dark "Slow 0.6×" buttons. Syllables are 44px tiles with the stressed one in crimson. |
| Step 5 dark dialogue player | Light header card | Espresso card, gold eyebrow, stacked header, gold active-speed and dark inactive buttons. Playback, shadowing and Nepali toggle unchanged. |
| Step containers `.card` | 17 hand-rolled white containers | Now `.card` (20px radius, artifact border, shadow, dark variant) |

**Not ported:** the artifact's per-word swipe carousel for steps 1 and 3,
and its intro / completion overlays. The app's existing grid of word cards,
dictation bee and completion flow stay. Porting those would replace working
features rather than restyle them.

## Session 4: Practice arena + tools

**Artifact read:** `project/Arena.dc.html`, lines 560–783 (all markup and
the page script). Lines 1–559 are the shared stylesheet. The `.pr-*` tool
classes came from the Main and Arena stylesheets.

| Artifact | Before | Change (`PracticeArenaView.tsx`) |
|---|---|---|
| `.ls-head` "Practice arena" + `btn-p` Daily challenge | Eyebrow, title and subtitle | Artifact head. Daily challenge uses the existing `onOpenDailyChallenge`. |
| `.ls-stats` slim strip | none | Real data only: best sprint, detective cases solved, mistakes to re-drill |
| `.ls-resume` "RECOMMENDED · 3 MIN" | none | Espresso strip with a sage icon tile; opens Spaced repetition review |
| `.ls-sfield` tool search + count | none | New search over tool titles and descriptions (core and labs), with result count and clear button |
| `.ls-tabs` skill tabs with counts | Rounded filter chips + activity-count badge | Underline tabs (All / Vocabulary / Grammar / Speaking) with live counts |
| `.ar-grid`: auto-fill 270px `.card.hov`, category-toned `.ico` (vocabulary crimson, grammar ochre, speaking sage), category `.tag` | Pastel tiles toned by index | Artifact cards. Phones: one bordered list of rows with a chevron. |
| `.ar-labs`: always-visible "Specialised labs" (3 columns, horizontal scroll on phones) | Hidden behind a toggle | Always visible, artifact `.card.hov` lab tiles |
| Empty state `.card.paper` | none | "No tools match" card |
| Tool page header (`btn-g btn-sm` back, `.ico.sm.i-crim`, serif title) | Custom header | Artifact header, Shuffle as `btn-g btn-sm` |
| `.pr-start` / `.pr-big` / `.pr-meta` | Plain centred start and result screens | Gradient start panel with 84px white icon tile on the sprint start, sprint result and exam-simulator start. The sprint start also gets the Tier / Personal best / 60 s meta row. |
| Tool containers `.card` | 20 hand-rolled white containers | `.card` |

**Not ported:** the artifact's "Inside a tool" demo is an illustration, not
a feature. Its tool-switcher tabs (`.pr-tabs`) weren't added, because the
app intentionally has no prev/next tool navigation. Tool logic is unchanged.

## Session 5: Progress / Achievements / Settings

**Artifacts read:**
- `project/Progress.dc.html`: lines 620–end (all of `<main>` plus the page
  script). Lines 1–619 are the shared stylesheet; the `.pg-*` CSS came from
  Main.
- `project/Settings.dc.html`: lines 620–763 (all markup plus the script).

| Artifact | Before | Change (`ProgressSettingsView.tsx`, `index.css`) |
|---|---|---|
| `.pg-head`: "Your journey" + `.seg` Progress / Achievements + period dropdown, one line | Eyebrow, title, subtitle, custom toggle | Artifact head. Achievements tab shows the earned/total badge count. Compact on phones (fixes a 21px phone overflow). |
| `.banner.pg-banner`: emblem left with orbiting `.o1/.o2` rings (18s / 26s), twinkling `.pg-spark`, `.pg-glow`, `.pg-mini` highlights, `.bchip` chips | Emblem right, static rings, 2 chips | Artifact banner. Highlights: study time, words practised, goal days (real data). Chips: best streak, days this week, and a badges chip that opens Achievements. On phones the emblem stays left at 96px with compact highlights, as in the artifact. **Not ported:** the XP bar (this view has no XP value). |
| `.card` containers | Mixed hand-rolled containers | 23 containers moved onto `.card` |
| Settings `.ls-head` "Settings" + `.tag.t-sage` sync state | "Settings & preferences" | Artifact head. Tag reads "Synced to your Google account" or "Saved on this device". |
| Settings rows: `.ico.sm` tinted icon tile per row | Text-only rows | 15 rows get tiles (level, goal, language, reminder, dark, haptics, offline, dialogue speed, word speed, pitch, pronunciation test, export, restore, sync, reset) |
| Settings card headings: serif `.h2` | Crimson uppercase eyebrows | Serif headings |
| Achievements | (badge pop-up added in pass 1) | Badge grid, filters and the pop-up keep the existing 16 badges |

**Not ported:** the Settings "Advanced audio & voice studio" `<details>`
cards and the reset dialog (the app already has both, with more features).
The controls are unchanged (dropdowns, switches, sliders).

## Session 6: Dictionary

**Artifact read:** `project/Dictionary.dc.html`, lines 620–end (all of
`<main>` plus the page script). The `.dc-*` CSS came from Main.

| Artifact | Before | Change (`DictionaryView.tsx`) |
|---|---|---|
| `.ls-head` "Dictionary" + `btn-g` Commuter audio / Export (icon-only on phones) | Eyebrow with word count, long title, subtitle, pill buttons | Artifact head. Audio loop and the export menu work as before (print sheet, CSV). |
| `.ls-stats`: Words / Learned / Saved | none | Real data: lexicon size, mastered words, saved words |
| `.ls-resume` "DUE TODAY" strip | none | Espresso "SRS review" strip; opens SRS flashcards (reshuffled) |
| `.ls-sfield` search | Small input inside a bordered filter card | Standalone 48px field with crimson focus ring. The section dropdown sits beside it; filter card chrome removed. |
| `.ls-tabs` mode tabs with icons | Pill segmented buttons | Underline tabs (Lexicon cards, Vocab table, SRS flashcards, Match game, Audio dictation, Speed quiz, Mistakes) with count badges |
| `.dc-chip` quick filters | Solid crimson active pill | Tinted crimson active chip |
| `.dc-list` / `.dc-w` word cards: serif 28px headword with `.sil`, mono IPA, Nepali, level + status tags, round play/save buttons, dashed `.dc-more` panel (rule tag, example with play, 0.65×, AI explain) | Tall cards with everything always visible | Artifact cards (auto-fill 300px; one bordered list on phones). Tap a word to expand. The phonetics pop-up stays on the headword. Lecture link, meaning reveal (English-only mode), mastered toggle and AI explanation are all kept. |
