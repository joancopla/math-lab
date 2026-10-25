# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Math Lab 1r ESO: a static, backend-free math practice web app in **Catalan** for a 12-year-old student (1r d'ESO). All user-facing text, code comments and the README are in Catalan; keep it that way. Four topics are built, *potències*, *divisibilitat*, *enters* and *fraccions*; *decimals* is still a placeholder.

## Commands

- Run the app: open `index.html` directly in a browser (file:// works, no server needed). For browser automation, any static server works, e.g. `npx http-server .`.
- Tests: `node tests/generators.test.js [N]` generates N exercises (default 3000) per skill × level and checks them. There's no build, linter, package.json or dependencies.
- There is no per-test filter. To test one skill, temporarily lower N or narrow the loop in the test file.

## Architecture

**Plain classic scripts, not ES modules.** This is deliberate so the app works from `file://`. Everything hangs off the global `window.MathLab` (`ML`), and each file is an IIFE. Load order in `index.html` matters: core → topics → views → `app.js`. A new script must be added to `index.html` **and**, if it's topic logic, to the file list in `tests/generators.test.js`. The test runs those files in a Node `vm` context, so topic files must not touch the DOM at load time (only inside `mount`).

**Core (`js/core/`)**, shared by all topics:
- `registry.js`: `ML.topics.register(def)`. A topic def has `id, title, icon, color, description, errors, skills[], visuals[]` (or `comingSoon: true`), plus an optional `pathTitle` for the home path heading. Each skill has `generate(level)` for levels 1–3.
- `checker.js`: the central idea. An exercise declares `input.type` (`number` | `power` | `choice`), `answer` and `traps`. A trap is a predictable wrong answer: `{match | test, id, msg}`. `evaluate()` compares values by normalized keys (`power` is `"base^exp"`, and the base may be a letter). It ignores any trap whose match equals the answer, and otherwise returns the first matching trap. That's how the app knows *which* typical mistake the student made. For `power` answers there's a generic fallback (`forma_equivalent`, `base_canviada`, `exponent_incorrecte`); anything else falls back to `altre`. Fraction answers use `input: { type: 'fraction' }` with `answer: { num, den }`: by default the exact (irreducible) fraction is required, and an equivalent one gets the generic `fraccio_no_irreductible` feedback; `anyForm: true` accepts any equivalent fraction. The fraccions generators skip answers that reduce to a whole number. For negative answers use `input: { type: 'number', signed: true }`: it adds a +/− button (mobile numeric keypads often lack the minus sign), and the test rejects negative answers without it. An exercise can also have `accept(value)` when several answers are right (e.g. a missing digit), and a `fallback` message instead of the generic one.
- `exercise-view.js`: `ML.mountExercise(container, ex, {topic, mode, onFirstAnswer, onNext})` renders any exercise. `practice` mode allows retries and hints; `challenge` mode gives a single attempt. `onFirstAnswer` fires after the feedback is rendered, so callers can tweak it.
- `storage.js`: the only code that touches `localStorage` (key `mathlab-1reso.v1`). It tracks per skill/level stats (`run`/`bestRun`; a star needs `STAR_RUN` = 5 correct answers in a row), per-error counts keyed `"topic:errorId"`, the daily streak, challenge records and points.

**Topics (`js/topics/<id>/`)**: `errors.js` holds the error catalog (`id → {title, explain}`, shown on the progress page). `exercises.js` holds the generators, built with the `numEx`/`powEx`/`choiceEx` helpers and `t(match, id, msg)` for traps. `visual.js` (optional) provides `mount(container) → cleanup`. A topic can have several visuals (potències also has `pas-a-pas.js`, a step-by-step explanation animated with the Web Animations API), each with an optional `emoji` for its card. A visual may take an optional part from the route: `#/tema/:id/visual/:vid/:part` calls `mount(container, { tema: part })`. `index.js` registers the topic. Every trap `id` must exist in the topic's `errors` or in `checker.coreErrors`, and the test enforces this. `js/topics/properament.js` registers the "coming soon" topics: remove an entry when you implement that topic.

**Views and router**: `js/app.js` is a hash router (`#/`, `#/tema/:id`, `#/tema/:id/practica/:skill/:level`, `#/tema/:id/visual/:vid`, `#/repte/:id`, `#/progres`). Views are `ML.views.x(root, ...params)` and may return a cleanup function. The challenge mode, progress page and stars work automatically for any registered topic. The home screen and the Tema/Visualitza/Repte links in the top menu follow the topic in the URL, or else the last practised one (`navTopic` in `app.js`).

## Conventions

- The visual design follows Stitch mockups from the user (a game style: rounded cards, 3D buttons, Space Grotesk + Plus Jakarta Sans). Icons are Material Symbols ligatures: `<span class="ico">name</span>`, and `ico fill` gives the filled style. Each skill has a `rule` (HTML formula), which is shown on the home path, in the practice header and in error feedback. `mountExercise` accepts `feedbackHost`, which the practice view uses for its two-column layout.
- The icon font is subset with `icon_names=` in `index.html` (1.2 MB down to about 10 KB). If you use a new icon, add its name there in alphabetical order, or it won't render. Icons always carry `aria-hidden="true"`.
- Colors only ever come from tokens in `:root`: the semantic ones (`--blue`, `--ink`…) and a scale (`--slate-200`, `--amber-300`…). Never put hex values in components. If you need a new color, add a token first.
- Practice runs in rounds of `SESSION` (10) exercises and ends with a summary. The day streak counts days where the daily goal (`DAILY_GOAL`, 10 exercises in practice or challenge mode) was met. `storage.daily` keeps per-day counts, and `recordAnswer` returns `goalReached` when that answer completes the goal. Celebrations (confetti and toasts) live in `js/core/celebrate.js` and respect `prefers-reduced-motion`. The student's name is asked after her first correct answer, not on the home screen.
- The mobile media queries go at the **end** of `css/styles.css`, so they override the base rules. Below 720px the section menu becomes a fixed bottom bar. On a 390×844 screen the practice view must show the exercise and the Comprova button without scrolling.
- Don't add features that only look real: the mockups included class rankings, a weekly chest, XP levels, a daily mission and an institution/Generalitat footer, and none of them were built. They need a backend, or they'd be fake or impersonation.
- Math HTML helpers live in `ML.utils`: `pw(base, exp)` for powers, `repeat`, `frac`, and `fmt` for Catalan number formatting (`.` thousands separator from 5 digits up). `parseNumber` accepts `1.000`, `1 000` and `−3`.
- Catalan text follows post-2017 normative rules (e.g. "dona", not "dóna"), and multiplication is written with `·`. To review Catalan content, use the user's `corrector-catala-adversari` skill if it's available.
- After changing generators, run the test. It checks that correct answers validate, no trap is accepted as correct, there's no `NaN`/`undefined` in texts and choice options are unique.
