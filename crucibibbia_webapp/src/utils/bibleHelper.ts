/**
 * Helper for Bible scripture references
 * Maps Italian book names to their number (1-66) for wol.jw.org links
 */

const bookNumbers: Record<string, number> = {
  // Old Testament
  genesi: 1, gen: 1, ge: 1,
  esodo: 2, eso: 2, es: 2,
  levitico: 3, lev: 3, le: 3,
  numeri: 4, num: 4, nu: 4,
  deuteronomio: 5, deut: 5, de: 5, dt: 5,
  giosuè: 6, giosue: 6, gios: 6, gs: 6,
  giudici: 7, giud: 7, gdc: 7,
  rut: 8, ru: 8,
  '1 samuele': 9, '1samuele': 9, '1 sam': 9, '1sam': 9,
  '2 samuele': 10, '2samuele': 10, '2 sam': 10, '2sam': 10,
  '1 re': 11, '1re': 11,
  '2 re': 12, '2re': 12,
  '1 cronache': 13, '1cronache': 13, '1 cron': 13, '1cron': 13,
  '2 cronache': 14, '2cronache': 14, '2 cron': 14, '2cron': 14,
  esdra: 15, esd: 15,
  neemia: 16, nee: 16, ne: 16,
  ester: 17, est: 17,
  giobbe: 18, giob: 18, gb: 18,
  salmi: 19, salmo: 19, sal: 19, sl: 19,
  proverbi: 20, prov: 20, pr: 20,
  ecclesiaste: 21, eccl: 21, ec: 21,
  'cantico dei cantici': 22, cantico: 22, cant: 22, ca: 22,
  isaia: 23, isa: 23, is: 23,
  geremia: 24, ger: 24, gr: 24,
  lamentazioni: 25, lam: 25, la: 25,
  ezechiele: 26, ezec: 26, ez: 26,
  daniele: 27, dan: 27, da: 27,
  osea: 28, ose: 28, os: 28,
  gioele: 29, gioe: 29, gl: 29,
  amos: 30, am: 30,
  abdia: 31, abd: 31, ab: 31,
  giona: 32, gio: 32,
  michea: 33, mic: 33, mi: 33,
  naum: 34, na: 34,
  abacuc: 35, abac: 35,
  sofonia: 36, sof: 36, so: 36,
  aggeo: 37, agg: 37, ag: 37,
  zaccaria: 38, zacc: 38, zc: 38,
  malachia: 39, mal: 39, ml: 39,

  // New Testament
  matteo: 40, matt: 40, mt: 40,
  marco: 41, mar: 41, mr: 41, mc: 41,
  luca: 42, luc: 42, lu: 42, lc: 42,
  giovanni: 43, giov: 43, gv: 43,
  atti: 44, at: 44,
  romani: 45, rom: 45, ro: 45,
  '1 corinti': 46, '1corinti': 46, '1 cor': 46, '1cor': 46,
  '2 corinti': 47, '2corinti': 47, '2 cor': 47, '2cor': 47,
  galati: 48, gal: 48,
  efesini: 49, efes: 49, ef: 49,
  filippesi: 50, fil: 50, flp: 50,
  colossesi: 51, col: 51,
  '1 tessalonicesi': 52, '1tessalonicesi': 52, '1 tess': 52, '1tess': 52,
  '2 tessalonicesi': 53, '2tessalonicesi': 53, '2 tess': 53, '2tess': 53,
  '1 timoteo': 54, '1timoteo': 54, '1 tim': 54, '1tim': 54,
  '2 timoteo': 55, '2timoteo': 55, '2 tim': 55, '2tim': 55,
  tito: 56, tit: 56,
  filemone: 57, filem: 57, flm: 57,
  ebrei: 58, ebr: 58, eb: 58,
  giacomo: 59, giac: 59, gc: 59,
  '1 pietro': 60, '1pietro': 60, '1 pt': 60, '1pt': 60,
  '2 pietro': 61, '2pietro': 61, '2 pt': 61, '2pt': 61,
  '1 giovanni': 62, '1giovanni': 62, '1 gv': 62, '1gv': 62,
  '2 giovanni': 63, '2giovanni': 63, '2 gv': 63, '2gv': 63,
  '3 giovanni': 64, '3giovanni': 64, '3 gv': 64, '3gv': 64,
  giuda: 65,
  rivelazione: 66, riv: 66, apocalisse: 66, apoc: 66, ap: 66,
};

export interface ScriptureReference {
  bookNumber: number;
  chapter: number;
  verses?: string;
}

/**
 * Parse a scripture reference from text
 */
export function parseScriptureReference(text: string): ScriptureReference | null {
  const pattern = /(\d?\s?[A-Za-zÀ-ÿ]+)\s+(\d+)(?::(\d+(?:[,\-–]\s?\d+)*))?/i;
  const match = text.match(pattern);

  if (!match) return null;

  const bookName = match[1].trim().toLowerCase();
  const chapter = parseInt(match[2]);
  const verses = match[3] || undefined;

  const bookNumber = bookNumbers[bookName];
  if (!bookNumber) return null;

  return { bookNumber, chapter, verses };
}

/**
 * Get WOL URL for a scripture reference
 */
export function getWolUrl(reference: ScriptureReference): string {
  const { bookNumber, chapter, verses } = reference;

  // Extract first verse number if available
  const firstVerse = verses ? verses.match(/(\d+)/)?.[1] : undefined;

  if (firstVerse) {
    return `https://wol.jw.org/it/wol/b/r6/lp-i/nwtsty/${bookNumber}/${chapter}#s=${firstVerse}&study=discover`;
  }
  return `https://wol.jw.org/it/wol/b/r6/lp-i/nwtsty/${bookNumber}/${chapter}#study=discover`;
}

/**
 * Get WOL URL from clue text
 */
export function getWolUrlFromText(text: string): string | null {
  const reference = parseScriptureReference(text);
  return reference ? getWolUrl(reference) : null;
}

/**
 * Check if text contains a scripture reference
 */
export function containsScriptureReference(text: string): boolean {
  return parseScriptureReference(text) !== null;
}
