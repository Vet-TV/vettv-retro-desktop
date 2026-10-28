/** Gentle parody gags for VetPad. Original copy only. */
export const AUTOSAVE_QUIPS = [
  'Autosave: thought about saving. Decided to believe in you instead.',
  'Autosave: your words are safe in our hearts (not on disk).',
  'Autosave: saved 0 bytes with 100% enthusiasm.',
  'Autosave: consulted the CRT. It said "press Save".',
  'Autosave: buffering vibes… done.',
]

export const ABOUT_LINES = [
  'VetPad 0.1 "Static Cling"',
  'A VetTV Studios production. Typed live, in front of a studio audience.',
  'Features: letters, numbers, and nearly all of the punctuation.',
  'Memory: 640 jokes, which should be enough for anybody.',
  'No paper clips were harmed in the making of this editor.',
]

export function randomQuip(): string {
  return AUTOSAVE_QUIPS[Math.floor(Math.random() * AUTOSAVE_QUIPS.length)]
}
