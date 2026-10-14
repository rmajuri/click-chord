// Every way a drawing turns into music is decided here. These are creative
// choices for Drawsound, not universal meanings of colors or shapes, so they
// live in one place where they're easy to read and change.

export const COLOR_FAMILIES = [
  'red',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'brown',
  'black',
  'gray'
]

// Swatches used to draw notes in the music view
export const COLOR_SWATCHES = {
  red: '#d94a3d',
  orange: '#ec8a2f',
  yellow: '#e2b21b',
  green: '#4b9a5f',
  blue: '#3a6ea8',
  purple: '#7d55a6',
  pink: '#e07aa5',
  brown: '#8a5a3b',
  black: '#2f2d38',
  gray: '#7d7a85'
}

// The biggest color picks the key and the lead instrument. The second color
// picks the instrument for little motifs.
export const COLOR_MAPPINGS = {
  red: { key: 'D', instrument: 'pluck' },
  orange: { key: 'E', instrument: 'marimba' },
  yellow: { key: 'G', instrument: 'bell' },
  green: { key: 'F', instrument: 'reed' },
  blue: { key: 'A', instrument: 'flute' },
  purple: { key: 'Eb', instrument: 'glass' },
  pink: { key: 'Bb', instrument: 'kalimba' },
  brown: { key: 'C', instrument: 'marimba' },
  black: { key: 'C', instrument: 'keys' },
  gray: { key: 'C', instrument: 'keys' }
}

export const WARM_COLORS = ['red', 'orange', 'yellow', 'pink', 'brown']
export const COOL_COLORS = ['green', 'blue', 'purple']

export const INSTRUMENT_LABELS = {
  bell: 'music-box bells',
  marimba: 'a wooden marimba',
  flute: 'a soft flute',
  pluck: 'a plucked guitar',
  reed: 'a gentle clarinet',
  glass: 'glassy chimes',
  kalimba: 'a kalimba',
  keys: 'an electric piano'
}

// Sound choices offered to the listener. "colors" lets the drawing decide.
export const STYLES = [
  {
    id: 'colors',
    label: "Drawing's colors",
    hint: 'The colors pick the instruments',
    tempo: 1,
    drums: 'light',
    bass: true,
    pad: 'auto',
    reverb: 0.3
  },
  {
    id: 'music-box',
    label: 'Music box',
    hint: 'Tinkly bells, no drums',
    lead: 'bell',
    sparkle: 'glass',
    tempo: 0.9,
    drums: 'none',
    bass: false,
    pad: 'airy',
    reverb: 0.38
  },
  {
    id: 'marimba',
    label: 'Marimba band',
    hint: 'Wooden mallets and shakers',
    lead: 'marimba',
    sparkle: 'kalimba',
    tempo: 1,
    drums: 'light',
    bass: true,
    pad: 'warm',
    reverb: 0.22
  },
  {
    id: 'dreamy',
    label: 'Dreamy',
    hint: 'Slow and floaty',
    lead: 'flute',
    sparkle: 'glass',
    tempo: 0.8,
    drums: 'none',
    bass: true,
    pad: 'airy',
    reverb: 0.5
  },
  {
    id: 'band',
    label: 'Playground band',
    hint: 'Guitar, piano and drums',
    lead: 'pluck',
    sparkle: 'keys',
    tempo: 1.08,
    drums: 'full',
    bass: true,
    pad: 'warm',
    reverb: 0.2
  }
]

export const DEFAULT_SETTINGS = {
  style: 'colors',
  variation: 0,
  mood: 'auto',
  tempo: 'auto',
  bars: 8
}

export const TEMPO_FACTORS = { slower: 0.85, auto: 1, faster: 1.15 }

// What the child or parent says the drawing is can nudge the music. Nothing
// is guessed from the picture itself.
export const KEYWORD_NUDGES = [
  {
    words: ['sun', 'sunny', 'happy', 'party', 'birthday', 'rainbow', 'flower'],
    brightness: 0.12,
    tempo: 6
  },
  {
    words: ['night', 'moon', 'star', 'stars', 'sleep', 'dream', 'bedtime'],
    brightness: -0.1,
    tempo: -12,
    legato: 0.3
  },
  {
    words: ['ocean', 'sea', 'water', 'rain', 'river', 'wave', 'waves', 'fish'],
    legato: 0.4,
    tempo: -4
  },
  {
    words: ['storm', 'monster', 'dragon', 'dinosaur', 'volcano', 'spooky'],
    brightness: -0.18,
    tempo: 8,
    busy: 0.2
  },
  {
    words: [
      'dog',
      'cat',
      'bunny',
      'rabbit',
      'bird',
      'horse',
      'puppy',
      'kitten'
    ],
    tempo: 4,
    busy: 0.1
  },
  {
    words: ['car', 'train', 'rocket', 'plane', 'race', 'truck', 'bike'],
    tempo: 12,
    busy: 0.2
  },
  {
    words: ['house', 'home', 'family', 'mom', 'dad', 'friend', 'friends'],
    brightness: 0.05
  }
]

// Each kind of shape becomes a short motif: scale steps and lengths in 16ths
export const SHAPE_MOTIFS = {
  round: {
    degrees: [0, 2, 4, 2],
    steps: [2, 2, 2, 2],
    label: 'a rolling tune'
  },
  boxy: { degrees: [0, 0, 4, 0], steps: [2, 2, 2, 2], label: 'steady repeats' },
  pointy: {
    degrees: [0, 3, 1, 4],
    steps: [2, 2, 2, 2],
    label: 'a zigzag tune'
  },
  line: {
    degrees: [0, 1, 2, 3, 4],
    steps: [1, 1, 1, 1, 4],
    label: 'a quick run'
  },
  squiggle: {
    degrees: [0, 1, 0, -1, 0, 2],
    steps: [1, 1, 1, 1, 2, 2],
    label: 'a wiggly tune'
  }
}

export const SHAPE_LABELS = {
  round: 'round',
  boxy: 'boxy',
  pointy: 'pointy',
  line: 'line-like',
  squiggle: 'squiggly'
}
