# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

Click-Chord is a browser music app. Users click boxes to play chords from a
major key, play bass lines and melodies, build drum loops, record progressions
into a quantized loop, and sample sounds from the microphone. It is a client-only
React 19 app built with Vite, and all audio goes through
[Tone.js](https://tonejs.github.io/) (v15) on top of the Web Audio API. There
is no backend.

## Setup and commands

Requires Node.js `^20.19.0 || >=22.12.0`.

```sh
npm install
npm start          # dev server at http://localhost:3000 (alias: npm run dev)
npm run build      # production build to dist/
npm run preview    # serve dist/ locally
npm run lint       # ESLint (flat config in eslint.config.js)
npm run format     # Prettier, writes in place
```

`npm test` runs Vitest unit tests and `npm run test:e2e` runs Playwright
journey and accessibility tests (set `CHROMIUM_PATH` if Playwright's own
browsers aren't installed). Before finishing a change, run `npm run lint`,
the tests, and `npm run build`, and check that Prettier leaves your files
unchanged (`npx prettier --check <files>`). For audio or UI changes, run the dev server
and exercise the feature in a browser.

## Layout

```
index.html              Vite entry HTML (metadata, font, manifest)
public/                 Static assets: drum samples (.wav), icons, manifest
src/main.jsx            Mounts the app; hash routes pick Click-Chord or
                        Drawsound (#/drawsound)
src/global-style.css    Global styles
src/app/main.jsx        App component: all top-level state, the Tone
                        transport, drum sequencer, loop playback, recording
src/chords/chords.js    Builds chords for every key from scale theory;
                        owns the chord PolySynth / SampleInstrument
src/mono-instrument/    Shared one-note-at-a-time instrument: notes per key,
                        synth textures, octave math (instruments.js lists them)
src/bass/bass.js        The bass: its register and sound textures
src/melody/melody.js    The melody: its register and sound textures
src/drums/drum-sounds.js  Drum voice factories (samples and synthesized)
src/progression-recorder/quantize.js  Snaps recorded takes to a grid
src/sampler/            Mic capture, pitch detection, loop-point finding,
                        and SampleInstrument (plays chords from a sample)
src/drawsound/          Drawsound page: drawing analysis, composition,
                        mappings (creative rules), Tone playback and WAV
                        export, its components, and *.test.js unit tests
e2e/                    Playwright tests
src/<component>/        One folder per UI component:
                        <name>.jsx + <name>.module.css
```

## Code style

- Prettier config (`.prettierrc`): no semicolons, single quotes (including
  JSX), no trailing commas, 2 space indent, 80 column width, always
  parenthesize arrow params.
- Plain JavaScript and JSX. No TypeScript.
- Function components with hooks. ESLint enforces the `react-hooks` rules.
- Styling uses CSS Modules (`styles.foo` from `*.module.css`). No UI
  library; MUI was removed to keep the bundle small, so do not add one.
- File and folder names are kebab-case. Each component lives in its own
  folder named after it.
- Comments are short and explain _why_, not what. Match the existing
  density; most functions have none or one line.
- Prefer deriving musical data from theory (intervals, MIDI numbers) over
  hard-coded note tables, as `chords.js` and `bass.js` do.

## Audio conventions

- Browsers block audio until a user gesture. Every handler that makes sound
  calls `await Tone.start()` first. Keep doing this in new handlers.
- There is one shared `Tone.getTransport()`. The drum sequencer and the loop
  playback both use it, so stop it only through `stopTransportIfIdle()` in
  `src/app/main.jsx`, never directly.
- Tone nodes created at module scope (synths, players, drum voices) are
  long-lived. When replacing one, `dispose()` the old node to avoid leaks
  (see `setDrumVoice` and the `voice` helper in `drum-sounds.js`).
- Schedule sounds with the `time` argument Tone passes to callbacks rather
  than `Tone.now()`, so playback stays in sync with the transport.
- Chord roots are voiced between A2 and Ab3; bass tonics between E1 and Eb2;
  melody tonics between C4 and B4.
  Keep new notes inside these registers or the existing octave-range helpers.
- Static audio files are loaded from `public/` with relative paths like
  `./kick-deep.wav`.

## Git

- Commit messages are a single imperative sentence in sentence case with no
  trailing period, describing the user-visible change (for example, "Give
  the bass its own sound options").
- Work on a feature branch; the default branch is `master`.
- Do not commit `dist/` or `node_modules/`.
