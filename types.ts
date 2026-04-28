export enum ContentVerdict {
  AI = 'AI',
  HUMAN = 'HUMAN',
  MIXED = 'MIXED',
  UNCERTAIN = 'UNCERTAIN'
}

export enum AIModel {
  DEEPSEEK = 'deepseek',
  GEMINI = 'gemini'
}

export interface AnnotatedSegment {
  text: string;
  reason: string;
  category: string;
  isAiFeature: boolean;
}

export interface PlagiarismMatch {
  url?: string;
  title?: string;
  snippet: string;
}

export interface KeywordDensity {
  phrase: string;
  count: number;
  percentage: number;
}

export interface TextStatistics {
  wordCount: number;
  uniqueWords: number;
  charCount: number;
  charCountNoSpaces: number;
  sentenceCount: number;
  longestSentenceWords: number;
  shortestSentenceWords: number;
  avgSentenceWords: number;
  avgSentenceChars: number;
  avgWordLength: number;
  paragraphCount: number;
  keywordDensity: {
    oneWord: KeywordDensity[];
    twoWords: KeywordDensity[];
    threeWords: KeywordDensity[];
  };
}

export interface AnalysisResult {
  verdict: ContentVerdict;
  confidenceScore: number; // 0 to 100 representing probability of AI
  reasoning: string;
  keyIndicators: string[];
  annotatedSegments: AnnotatedSegment[];
  originalText?: string;
  stylometricAnalysis: {
    sentenceVariety: string;
    vocabularyComplexity: string;
    emotionalTone: string;
  };
  plagiarismReport?: {
    matches: PlagiarismMatch[];
    score: number;
  };
  textStats?: TextStatistics;
}

export interface GrammarError {
  text: string;
  reason: string;
  severity: 'error' | 'warning' | 'suggestion';
  position: {
    start: number;
    end: number;
  };
}

export interface GrammarStats {
  totalErrors: number;
  errors: GrammarError[];
  score: number; // 0-100, where 100 is perfect grammar
  suggestions: string[];
}

export interface HistoryItem extends AnalysisResult {
  id: string;
  timestamp: number;
  preview: string;
}
