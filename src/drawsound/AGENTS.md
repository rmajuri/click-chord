# AGENTS.md: Drawsound

Guidance for AI coding agents working in `src/drawsound/`. The root
`AGENTS.md` still applies for setup, code style and git. This file covers
what is specific to Drawsound, and where it differs from the rest of the app.

## What it is

Drawsound is a separate page (`#/drawsound`, routed in `src/main.jsx`) that
turns a photo of a child's drawing into an original song. A parent uploads a
photo (or picks a built-in example), the page analyzes it in the browser,
composes a song from what it measured, and plays it with Tone.js.

Two product commitments shape every change here:

- **Privacy.** Children's drawings never leave the device. Do not add
  network calls, analytics, or third-party services that receive images,
  descriptions or features. Saved creations live only in `localStorage`. Any
  future AI interpretation must be opt-in with explicit, informed consent.
- **Accessibility is core, not an add-on.** Blind and low-vision children
  are intended users. Every feature needs a nonvisual path (see
  Accessibility below). Do not claim in UI copy that Drawsound makes
  drawing fully accessible; it hasn't been tested with its intended users.

## How it works

The pipeline is pure functions until audio:

```
image pixels ──analyzeDrawing──▶ features ──compose──▶ composition ──player──▶ sound
(image-tools)                    (JSON)                (JSON)          (Tone.js)
```

- `image-tools.js`: browser only. Loads files, applies rotate and crop,
  downsamples to `ANALYSIS_SIZE` (120px) pixels, and makes thumbnails.
- `analyze-drawing.js`: pure. Separates ink from paper (paper brightness is
  judged per block, so shadows aren't ink), then measures palette, warmth,
  32 time slices, line direction and curviness, shapes, 3×3 regions and
  balance. Adds a `seed` hash.
- `compose.js`: pure. Builds the song (key, mode, tempo, chords, melody,
  shape motifs, pad, bass, drums) and its plain-language `explanation`.
  Also `composeRegionPhrase` for exploring by sound.
- `mappings.js`: every creative rule (color to key and instrument, styles,
  keyword nudges, shape motifs). Change behavior here first.
- `music-theory.js`: modes, progressions, scale degree to MIDI, chord names,
  nearest chord tone.
- `describe.js`: plain-language descriptions of the drawing and each region.
- `instruments.js`: Tone.js instrument recipes and `buildEnsemble`.
- `player.js`: live playback, region previews, and `renderToWav`.
- `wav.js`: pure 16-bit PCM WAV encoder.
- `creations-store.js`: `localStorage` save, load and delete.
- `examples.js`: paints the built-in example drawings on a canvas.
- `speech.js`: `speechSynthesis` helpers and the spoken instructions.
- `drawsound.jsx`: the page (state, player lifecycle, handlers). The other
  `*.jsx` files are its presentational pieces.
- `drawsound.module.css`: styles for the whole page.
- `test-images.js`: raster helpers for test drawings without a canvas.

### Differences from the rest of the app

- **One folder, one stylesheet.** Drawsound's components live together in
  this folder and share `drawsound.module.css`, rather than one folder per
  component. Keep new Drawsound components here.
- **Design tokens are page-scoped.** Colors, fonts and the hand-drawn
  `--wobble` radii are custom properties on `.page`, not in
  `global-style.css`. Use them instead of new literal colors.
- **Registers.** The melody sits between scale degrees `MELODY_LOW` and
  `MELODY_HIGH` above a root between G3 and F#4; pad an octave below; bass
  two octaves below. The Click-Chord chord and bass registers don't apply.
- **Transport.** Click-Chord clears the shared transport when it unmounts,
  so Drawsound's player owns it while this page is open and may stop and
  cancel it directly. Don't import Click-Chord's transport helpers here.

## Rules that keep it working

- **Stay deterministic.** The same pixels and settings must give the same
  features and song. Never use `Math.random()`, `Date.now()` or iteration
  order of unordered data in `analyze-drawing.js` or `compose.js`. Use
  `createRandom(seed)` from `compose.js`. A new "version" changes only
  `settings.variation`, which reseeds the details while key, mode, tempo
  and the melody's shape stay put.
- **Features are a saved format.** Creations store `features` and
  `settings` as JSON and recompose on open. If you rename or remove a
  feature field, old saves break; add fields with safe defaults instead, or
  bump the storage key in `creations-store.js`.
- **Keep the music coherent.** Pitched notes must stay in the scale (tests
  check this), strong beats snap to chord tones, and the song ends on the
  home note. Map drawing traits to _musical_ choices, never straight to raw
  frequencies or random beeps.
- **Mappings are creative choices, not facts.** Phrase UI copy and
  explanations as "Drawsound does X", not "red means anger". Add or change
  rules in `mappings.js` and update the matching text in `explain()`.
- **Times are seconds.** Compositions are built in 16th-note steps and
  scheduled as `step * stepSeconds`. Don't schedule with Tone time strings
  like `'8n'`: during an offline export the global context is swapped, so
  they could read the wrong transport's tempo.
- **Build audio nodes through `exclusive()`.** `Tone.Offline` swaps the
  global context while an export sets up. Anything in `player.js` that
  creates nodes (loading, previews, export) goes through `exclusive()` so it
  never lands in the wrong context. Pass `buildEnsemble` its output node;
  don't connect to `Tone.getDestination()` in live code.
- **Unlock audio from gestures.** Browsers need a user gesture before
  sound. Use `player.unlock()` or `player.play()` (both call `Tone.start()`)
  in click handlers, as the existing handlers do.
- **Dispose what you build.** Ensembles and preview voices are rebuilt
  often. Every recipe in `instruments.js` returns its extra effect nodes so
  `dispose()` can free them; keep that true for new recipes.
- **Don't re-render per frame.** The playheads move by setting the
  `--progress` custom property on the page element from a
  `requestAnimationFrame` loop. Keep it that way rather than putting
  playback position in React state.

## Accessibility

Every change should keep these working, and new features need the same:

- Real controls with visible text labels (`button`, `label`, native radios
  and selects). Inputs hidden for styling stay focusable (`.fileInput`).
- Status changes go to the page's `role='status'` region; errors use
  `role='alert'`. Choosing a drawing moves focus to Play.
- The Explore grid uses a roving `tabIndex` with arrow keys, Home and End.
  Each region plays a phrase and announces a description.
- Nothing is shown by color alone: the song picture uses shapes for parts,
  and regions show an amount word.
- Honor `prefers-reduced-motion`, `prefers-contrast: more` and
  `forced-colors`. Targets are at least 44px tall.
- The drawing canvas has `role='img'` with the generated description; the
  song picture SVG has a text summary.

## Testing

```sh
npm test            # Vitest unit tests (src/**/*.test.js)
npm run test:e2e    # Playwright journeys + axe checks (e2e/drawsound.spec.js)
```

- Unit tests build drawings with `test-images.js` and assert musical
  behavior: determinism, notes in scale, height to pitch, empty paper to
  rests, busier drawings to more notes, style and setting effects, and
  explanations. Add a test for any new mapping.
- The e2e tests cover upload and playback, styles and versions, WAV export
  (including that it isn't silent), save and reopen, keyboard-only use, the
  Explore grid, bad files, reduced motion and axe. They start their own dev
  server on port 3100. If Playwright's browsers aren't installed, set
  `CHROMIUM_PATH` to a local Chromium.
- Tests prove the song plays, not that it sounds good. After audio changes,
  listen in a browser with each example drawing and each style.
