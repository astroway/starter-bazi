/**
 * Written from a real response, not from the docs.
 *
 * Every field below was present in the body `POST /v1/bazi/chart` and
 * `POST /v1/bazi/luck-pillars` returned on 2026-09-21. Fields the API may omit
 * are optional here; the rest are not, so a shape change shows up as a type
 * error rather than as `undefined` on the page.
 */

export interface BirthInput {
  date: string;
  time: string;
  timezone: string;
  latitude: string;
  longitude: string;
  gender: 'male' | 'female';
}

export type ElementName = 'Wood' | 'Fire' | 'Earth' | 'Metal' | 'Water';

export interface HiddenStem {
  stem: string;
  stemIndex: number;
  element: ElementName;
  yin: boolean;
  /** principal, middle or residual: how much of the branch this stem speaks for. */
  role: string;
  weight: number;
}

export interface NaYin {
  chinese: string;
  pinyin: string;
  english: string;
  element: ElementName;
  jiaziIndex: number;
  elementName: string;
}

export interface Pillar {
  name: 'year' | 'month' | 'day' | 'hour';
  stem: string;
  branch: string;
  pillar: string;
  animal: string;
  animalName: string;
  stemElement: ElementName;
  stemElementName: string;
  hiddenStems: HiddenStem[];
  naYin: NaYin;
  dayMasterStage: { stage: string; chinese: string; name: string };
}

export interface ElementBalance {
  visible: Record<ElementName, number>;
  withHiddenStems: Record<ElementName, number>;
  weighted: Record<ElementName, number>;
  dominantElement: ElementName;
  dominantElementName: string;
  missingElements: ElementName[];
  missingElementNames: string[];
  weighting: string;
}

export interface Strength {
  framework: string;
  supportScore: number;
  drainScore: number;
  supportRatio: number;
  verdict: string;
  hasSeason: boolean;
  hasRoot: boolean;
  hasAllies: boolean;
  favourableElements: ElementName[];
  unfavourableElements: ElementName[];
  caveat: string;
}

export interface SymbolicStar {
  key: string;
  chinese: string;
  pinyin: string;
  english: string;
  pillars: string[];
  meaning: string;
  schoolNote?: string;
}

export interface Interaction {
  type: string;
  chinese: string;
  english: string;
  pillars: string[];
  members: string[];
  producesElement?: ElementName;
  schoolNote?: string;
}

export interface Chart {
  solarYear: number;
  pillars: Pillar[];
  dayMaster: { stem: string; element: ElementName; elementName: string; polarity: string };
  elementBalance: ElementBalance;
  strength: Strength;
  symbolicStars: { byYearPillar: SymbolicStar[]; byDayPillar: SymbolicStar[] };
  interactions: Interaction[];
  stageSchool: string;
  methodology: string;
  source: string;
  disclaimer: string;
}

export interface LuckPillar {
  pillar: string;
  stem: string;
  branch: string;
  element: ElementName;
  elementName: string;
  ageStart: number;
}

export interface Luck {
  direction: 'forward' | 'backward';
  count: number;
  startAge: { years: number; months: number };
  /** The solar term the count was measured to, with the exact Beijing moment. */
  startReference: { term: string; pinyin: string; beijing: string; days: number };
  luckPillars: LuckPillar[];
  methodology: string;
}

export interface Reading {
  chart: Chart;
  /** null when the second call failed; the page says so rather than hiding it. */
  luck: Luck | null;
}
