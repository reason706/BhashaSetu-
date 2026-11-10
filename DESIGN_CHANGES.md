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
