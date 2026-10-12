export type Language = 'uz' | 'en';
export type Theme = 'dark' | 'light';

export type CelestialCategory =
  | 'planet'
  | 'dwarf-planet'
  | 'moon'
  | 'asteroid'
  | 'comet'
  | 'star'
  | 'nebula'
  | 'galaxy'
  | 'black-hole'
  | 'exoplanet';

export interface PlanetData {
  id: string;
  nameUz: string;
  nameEn: string;
  taglineUz: string;
  taglineEn: string;
  typeUz: string;
  typeEn: string;
  diameterKm: number;
  massKg: string;
  gravityMps2: number;
  distanceFromSunKm: string;
  distanceAU: number;
  dayLengthHours: string;
  yearLengthDays: string;
  avgTempC: number;
  moonsCount: number;
  atmosphereUz: string;
  atmosphereEn: string;
  compositionUz: string;
  compositionEn: string;
  factsUz: string[];
  factsEn: string[];
  descriptionUz: string;
  descriptionEn: string;
  colorHex: string;
  accentHex: string;
  visualScale: number; // For 3D scale relative to Earth
  orbitRadiusAU: number; // Scale for 3D visualization
  orbitSpeed: number; // Relative orbital velocity
  hasRings?: boolean;
  ringInnerRadius?: number;
  ringOuterRadius?: number;
  axialTiltDeg: number;
}

export interface MoonPhaseInfo {
  id: string;
  nameUz: string;
  nameEn: string;
  illumination: number; // 0 - 100%
  descriptionUz: string;
  descriptionEn: string;
  phaseAngleDeg: number;
}

export interface SpaceObjectItem {
  id: string;
  nameUz: string;
  nameEn: string;
  category: CelestialCategory;
  shortDescUz: string;
  shortDescEn: string;
  fullDescUz: string;
  fullDescEn: string;
  distanceUz: string;
  distanceEn: string;
  featuresUz: string[];
  featuresEn: string[];
  image?: string;
  colorHex: string;
}

export interface StarItem {
  id: string;
  name: string;
  constellationUz: string;
  constellationEn: string;
  spectralType: string;
  temperatureK: number;
  distanceLightYears: string;
  solarRadius: number; // relative to Sun
  solarMass: number; // relative to Sun
  luminositySolar: string;
  descriptionUz: string;
  descriptionEn: string;
  factsUz: string[];
  factsEn: string[];
  colorHex: string;
}

export interface GalaxyItem {
  id: string;
  nameUz: string;
  nameEn: string;
  typeUz: string;
  typeEn: string;
  distanceLightYears: string;
  diameterLightYears: string;
  starsCountEstimate: string;
  descriptionUz: string;
  descriptionEn: string;
  factsUz: string[];
  factsEn: string[];
  image?: string;
}

export interface MissionItem {
  id: string;
  name: string;
  yearLaunched: string;
  agency: string;
  destinationUz: string;
  destinationEn: string;
  status: 'active' | 'completed' | 'planned';
  purposeUz: string;
  purposeEn: string;
  discoveriesUz: string[];
  discoveriesEn: string[];
  image?: string;
}

export interface QuizQuestion {
  id: string;
  questionUz: string;
  questionEn: string;
  optionsUz: string[];
  optionsEn: string[];
  correctIndex: number;
  explanationUz: string;
  explanationEn: string;
  category: 'planets' | 'solar-system' | 'stars' | 'galaxies' | 'black-holes' | 'moon' | 'missions';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuizScoreRecord {
  id: string;
  playerName: string;
  score: number;
  total: number;
  percentage: number;
  difficulty: 'easy' | 'medium' | 'hard';
  date: string;
}

export interface LessonSection {
  headingUz: string;
  headingEn: string;
  contentUz: string;
  contentEn: string;
  highlightUz?: string;
  highlightEn?: string;
}

export interface LearningLesson {
  id: number;
  slug: string;
  titleUz: string;
  titleEn: string;
  subtitleUz: string;
  subtitleEn: string;
  readTimeMinutes: number;
  sections: LessonSection[];
  keyFactsUz: string[];
  keyFactsEn: string[];
  miniQuiz: {
    questionUz: string;
    questionEn: string;
    optionsUz: string[];
    optionsEn: string[];
    correctIndex: number;
    explanationUz: string;
    explanationEn: string;
  };
}
