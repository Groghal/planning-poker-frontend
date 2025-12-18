import type { EmojiEntry } from './emojiTypes';

let cached: EmojiEntry[] | null = null;
let inFlight: Promise<EmojiEntry[]> | null = null;

const toUPlusFromHexcode = (hexcode: string) =>
  hexcode
    .split('-')
    .filter(Boolean)
    .map((h) => `U+${h.toUpperCase()}`)
    .join(' ');

export async function loadEmojiData(): Promise<EmojiEntry[]> {
  if (cached) return cached;
  if (inFlight) return inFlight;

  inFlight = import('emojibase-data/en/compact.json').then((mod) => {
    const raw = (mod as { default: unknown }).default as Array<{
      unicode?: string;
      label?: string;
      hexcode?: string;
      tags?: string[];
    }>;

    const out: EmojiEntry[] = raw
      .filter((e) => typeof e.unicode === 'string' && typeof e.label === 'string' && typeof e.hexcode === 'string')
      .map((e) => {
        const unicode = e.unicode as string;
        const label = e.label as string;
        const hexcode = (e.hexcode as string).toUpperCase();
        const tags = Array.isArray(e.tags) ? e.tags : [];
        const search = `${label} ${tags.join(' ')} ${hexcode}`.toLowerCase();
        const title = `${label} • ${toUPlusFromHexcode(hexcode)}`;
        return { unicode, label, hexcode, tags, search, title };
      });

    cached = out;
    return out;
  }).finally(() => {
    inFlight = null;
  });

  return inFlight;
}


