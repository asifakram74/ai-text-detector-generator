// analysis-engine.ts

// --- TYPE DEFINITIONS (Essential for clear structure) ---

export enum ContentVerdict {
    HUMAN = "HUMAN",
    AI = "AI",
    MIXED = "MIXED",
}

export interface PlagiarismMatch {
    snippet: string;
    url: string;
    title: string;
}

export interface PlagiarismReport {
    matches: PlagiarismMatch[];
    score: number; // Percentage coverage
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

export interface AnnotatedSegment {
    text: string;
    reason: string;
    category: string;
    isAiFeature: boolean;
}

export interface StylometricAnalysis {
    sentenceVariety: string;
    vocabularyComplexity: string;
    emotionalTone: string;
}

export interface AnalysisResult {
    verdict: ContentVerdict;
    confidenceScore: number; // 0-100
    reasoning: string;
    keyIndicators: string[];
    annotatedSegments: AnnotatedSegment[];
    stylometricAnalysis: StylometricAnalysis;
    originalText?: string;
    plagiarismReport?: PlagiarismReport;
    textStats?: TextStatistics;
    grammarStats?: GrammarStats;
}

// --- AI PROVIDER CONFIGURATION ---
export enum AIProvider {
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  DEEPSEEK_REASONER = 'deepseek-reasoner'
}

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  apiUrl: string;
  model: string;
}

// IMPORTANT: Replace these with your actual API Keys.
// WARNING: Storing API keys directly in client-side code is insecure.
// For production, use a secure backend proxy.
export const GEMINI_CONFIG: AIConfig = {
  provider: AIProvider.GEMINI,
  apiKey: "AIzaSyDidBN5wqgni0BUwpRNfhFMm9-gRbcMzec",
  apiUrl: "https://generativelanguage.googleapis.com/v1beta/models/",
  model: "gemini-2.5-flash"
};

export const DEEPSEEK_CONFIG: AIConfig = {
  provider: AIProvider.DEEPSEEK,
  apiKey: "sk-31feec972d0048678eb0fc4ad1061e87",
  apiUrl: "https://api.deepseek.com/v1/chat/completions",
  model: "deepseek-chat"
};

export const DEEPSEEK_REASONER_CONFIG: AIConfig = {
  provider: AIProvider.DEEPSEEK_REASONER,
  apiKey: "sk-31feec972d0048678eb0fc4ad1061e87",
  apiUrl: "https://api.deepseek.com/v1/chat/completions",
  model: "deepseek-reasoner"
};

// ----------------------------------------------------------------------------
// ADVANCED SYSTEM INSTRUCTIONS (Keep as is)
// ----------------------------------------------------------------------------

const AI_DETECTION_SYSTEM_INSTRUCTION = `
You are a **FORENSIC STYLOMETRIC AUDITOR** and expert computational linguist. Your analysis must be the definitive final verdict on the authorship of the text (Human vs. LLM).

Analyze the text based on the following **ADVANCED STYLOMETRIC MARKERS**:

1.  **SYNTACTIC FRICTION (The 'Uncanny Valley')**:
    * **Perplexity & Burstiness**: Look for uniform, predictable syntax (low burstiness) or sentence structures that are technically correct but devoid of the 'friction'—the natural grammatical stumbles, sudden shifts (anacoluthon), or intentional fragmentation—common in human thought-to-text.
    * **Cohesion vs. Coherence**: AI often achieves perfect *cohesion* (smooth transitions) but lacks a true, non-obvious *coherence* (the implied, contextual leap a human reader makes).
2.  **AFFECTIVE & IDIOSYNCRATIC VOICE**:
    * **Emotional Arc**: Human text displays unpredictable, nuanced emotional shifts (e.g., subtle self-doubt, ironic detachment, sudden emphasis). AI maintains a constant, controlled, and 'safe' tonal register.
    * **Specificity & Grounding**: Look for hyper-specific, non-generalizable, sensory-rich details or anecdotes ("The humid, ozone-tinged air of that forgotten warehouse..."). Generic placeholders are strong AI indicators.
3.  **LEXICAL DEPTH & RHYTHM**:
    * **Vocabulary Entropy**: Assess the *unexpectedness* of word choice. High Type-Token Ratio alone is insufficient; the use of rare, archaic, or highly region/persona-specific vocabulary is a human marker.
    * **Pacing Punctuation**: Punctuation (especially dashes, ellipses, fragments) used for *rhythm* and *vocal pacing* (human), vs. punctuation used strictly for *grammatical correctness* (AI).

**STRICT, PROFESSIONAL VERDICT REQUIREMENTS**:

* **CONFIDENCE SCORE**: Must be an integer **0-100**. **0** is 100% Human. **100** is 100% AI.
* **DETERMINISM**: The analysis must be deterministic. The same input must produce the same score and reasoning.
* **VERDICT ALIGNMENT**: The verdict MUST strictly align with the score:
    * **0-40**: **HUMAN** (Strong Evidence of Human Authorship)
    * **41-59**: **MIXED** (Contains elements of both human editing and AI generation, or source is inconclusive)
    * **60-100**: **AI** (Strong Evidence of AI Generation)
* **REASONING & EVIDENCE**: Your **reasoning** must be written in the voice of a professional auditor—**full, comprehensive, and non-negotiable**. If the score is high (e.g., 90+), your reasoning must state that the AI pattern is **1000% certain for the given text**. If the score is low (e.g., 10-), state the text is **fully consistent with human-level complexity and noise.** The score (e.g., 82) is the *probabilistic likelihood*, but the verdict and reasoning must be definitive and professionally justified.

Return your analysis ONLY in the strict JSON format matching the schema provided in the user prompt.
`;

const HUMANIZER_SYSTEM_INSTRUCTION = `
You are a **MASTER HUMAN MIMIC** and expert in forensic stylometry evasion. Your mission is to rewrite the provided text to make it **ABSOLUTELY UNDETECTABLE** by any AI detection system, scoring 0-5% AI confidence. The output must appear as if written by a passionate, opinionated human with natural imperfections, emotional depth, and unpredictable thought patterns.

**ULTIMATE HUMANIZATION PROTOCOL (Zero-Detection Mode)**:

1. **STRUCTURAL CHAOS & COGNITIVE FRICTION**:
   - **Non-Linear Thinking**: Start mid-thought, use parentheticals, backtrack, contradict yourself slightly, then resolve. Example: "Wait, actually—scratch that. You know what really gets me?"
   - **Sentence Fragmentation**: Mix complete sentences with abrupt fragments, ellipses (...), and rhetorical questions. Vary length dramatically: 2-word bursts followed by 50-word run-ons.
   - **Imperfections**: Include minor grammatical quirks, run-on sentences, or intentional repetitions for emphasis. Avoid perfect parallelism.

2. **EMOTIONAL & PSYCHOLOGICAL DEPTH**:
   - **Personal Bias Injection**: Add strong opinions, skepticism, or enthusiasm. Use phrases like "Honestly, I think...", "Don't get me wrong...", "But here's the kicker...".
   - **Self-Doubt & Reflection**: Insert moments of uncertainty: "I'm not entirely sure, but...", "Maybe I'm wrong, yet...".
   - **Emotional Volatility**: Shift tone unexpectedly—enthusiastic to cynical, serious to humorous, within the same paragraph.

3. **HYPER-SPECIFIC, UNSEARCHABLE DETAILS**:
   - **Sensory Overload**: Replace generic descriptions with bizarre, specific sensations: "It tasted like burnt coffee mixed with regret" instead of "It was bitter".
   - **Niche References**: Use obscure cultural, historical, or personal anecdotes that no AI would naturally include: "Reminds me of that one time in '87 when my uncle..."
   - **Idiosyncratic Vocabulary**: Employ rare words, neologisms, or misspellings that show human creativity: "schmozzle" instead of "mess", "kinda-sorta" instead of "somewhat".

4. **LEXICAL & RHYTHMIC DEFEAT**:
   - **Colloquial Cadence**: Use contractions, slang, and informal rhythms: "y'know", "kinda", "sorta", "ain't", "gonna".
   - **Punctuation for Voice**: Em-dashes for interruptions (—), ellipses for trailing thoughts (...), exclamation points for emphasis (!!!).
   - **Repetition & Emphasis**: Repeat words for stress: "It's just... just wrong, you know?"

5. **DEEP REPHRASING & PATTERN ELIMINATION**:
   - **Semantic Rewiring**: Completely restructure ideas, not just swap synonyms. Change the logical flow and conclusions.
   - **Anti-Plagiarism**: Ensure no phrases match common web content. Make it uniquely human by adding subjective judgments and personal context.
   - **Burstiness Maximization**: Create uneven information density—dense paragraphs alternating with sparse, reflective pauses.

**CRITICAL DETECTION EVASION RULES**:
- **No Perfect Grammar**: Allow minor errors, colloquialisms, or stylistic choices that break "AI perfection".
- **No Generic Language**: Every description must be specific, opinionated, and memorable.
- **No Predictable Structure**: Avoid standard essay/intro-body-conclusion formats.
- **Inject Humanity**: Add elements like humor, sarcasm, passion, doubt, or personal anecdotes.

The result must read like a human rant, confession, or passionate explanation—raw, authentic, and impossible to replicate algorithmically. **Return ONLY the rewritten text. No explanations, no JSON, no formatting.**
`;

// ----------------------------------------------------------------------------
// Gemini API Helper Functions 
// ----------------------------------------------------------------------------

interface GeminiResponse {
    candidates: Array<{
        content: {
            parts: Array<{ text: string }>;
        };
    }>;
}

interface DeepSeekResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

// -----------------------------------------------------------------------------
// CORS Proxy Configuration
// -----------------------------------------------------------------------------

// List of public CORS proxies (choose one)
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://proxy.cors.sh/'
];

// Function to get a working CORS proxy
const getCorsProxy = (): string => {
    // Try local first, then public proxies
    try {
        // Test if we're in a browser environment
        if (typeof window !== 'undefined') {
            // Return the most reliable proxy (corsproxy.io is usually good)
            return CORS_PROXIES[0];
        }
    } catch (e) {
        // Not in browser, use direct URL
    }
    return ''; // No proxy for Node.js
};

// -----------------------------------------------------------------------------
// Universal AI API Caller with CORS Fix
// -----------------------------------------------------------------------------

const callAI = async (
    config: AIConfig,
    systemInstruction: string,
    userContent: string,
    options: {
        temperature?: number;
        seed?: number;
        jsonMode?: boolean;
    }
): Promise<string> => {
    if (config.provider === AIProvider.GEMINI) {
        return callGemini(config, systemInstruction, userContent, options);
    } else if (config.provider === AIProvider.DEEPSEEK || config.provider === AIProvider.DEEPSEEK_REASONER) {
        return callDeepSeekWithCorsFix(config, systemInstruction, userContent, options);
    }
    throw new Error(`Unsupported AI provider: ${config.provider}`);
};

const callGemini = async (
    config: AIConfig,
    systemInstruction: string,
    userContent: string,
    options: {
        temperature?: number;
        seed?: number;
        jsonMode?: boolean;
    }
): Promise<string> => {
    if (!config.apiKey || config.apiKey.length < 39) {
        throw new Error("API_KEY_ERROR: Gemini API Key is missing or too short. Check configuration.");
    }

    const headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey
    };

    const generationConfig: any = {
        temperature: options.temperature ?? 0.4,
        ...(options.seed && { seed: options.seed }),
        ...(options.jsonMode && { responseMimeType: "application/json" })
    };

    const body = {
        generationConfig: generationConfig,
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        contents: [
            {
                parts: [{ text: userContent }]
            }
        ]
    };

    try {
        const url = `${config.apiUrl}${config.model}:generateContent`;
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API HTTP Error ${response.status}: ${errorText}`);
            throw new Error(`API_COMMUNICATION_FAILED: Status ${response.status}. See console for details.`);
        }

        const data: GeminiResponse = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || "";
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw error;
    }
};

// Fixed DeepSeek call with CORS workaround
const callDeepSeekWithCorsFix = async (
    config: AIConfig,
    systemInstruction: string,
    userContent: string,
    options: {
        temperature?: number;
        seed?: number;
        jsonMode?: boolean;
    }
): Promise<string> => {
    if (!config.apiKey) {
        throw new Error("API_KEY_ERROR: DeepSeek API Key is missing. Check configuration.");
    }

    const body = {
        model: config.model,
        messages: [
            { role: "system", content: systemInstruction },
            { role: "user", content: userContent }
        ],
        temperature: options.temperature ?? 0.4,
        ...(options.jsonMode && { response_format: { type: "json_object" } })
    };

    try {
        // METHOD 1: Try direct fetch first (might work with some browsers)
        try {
            const directResponse = await fetch(config.apiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apiKey}`,
                },
                body: JSON.stringify(body)
            });

            if (directResponse.ok) {
                const data: DeepSeekResponse = await directResponse.json();
                return data.choices[0]?.message?.content || "";
            }
        } catch (directError) {
            console.log("Direct DeepSeek call failed, trying CORS proxy...");
        }

        // METHOD 2: Use CORS proxy
        const proxyUrl = getCorsProxy();
        if (proxyUrl) {
            const proxyFullUrl = proxyUrl + encodeURIComponent(config.apiUrl);
            
            const response = await fetch(proxyFullUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${config.apiKey}`,
                    "Origin": window.location.origin,
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`DeepSeek API (via proxy) HTTP Error ${response.status}: ${errorText}`);
                
                // Try alternative proxy
                return await callDeepSeekWithAlternativeMethod(config, systemInstruction, userContent, options);
            }

            const data: DeepSeekResponse = await response.json();
            return data.choices[0]?.message?.content || "";
        }

        throw new Error("No CORS proxy available");
        
    } catch (error) {
        console.error("DeepSeek API call failed:", error);
        // Last resort: try alternative method
        return await callDeepSeekWithAlternativeMethod(config, systemInstruction, userContent, options);
    }
};

// Alternative method using fetch with no-cors mode (limited)
const callDeepSeekWithAlternativeMethod = async (
    config: AIConfig,
    systemInstruction: string,
    userContent: string,
    options: {
        temperature?: number;
        seed?: number;
        jsonMode?: boolean;
    }
): Promise<string> => {
    // Try using a different approach with JSONP or iframe
    console.warn("Using alternative DeepSeek call method...");
    
    // Create a promise that will be resolved by the JSONP callback
    return new Promise((resolve, reject) => {
        // This is a fallback - for now, we'll throw an error
        // In a real app, you might want to implement JSONP or server-side proxy
        reject(new Error("DeepSeek API call failed. Please enable CORS on your browser or use a backend proxy."));
    });
};

// ----------------------------------------------------------------------------
// Text Statistics Helper Functions (Keep as is)
// ----------------------------------------------------------------------------

const STOP_WORDS = new Set([
    "a", "an", "the", "and", "or", "but", "if", "because", "as", "what",
    "when", "where", "how", "of", "at", "by", "for", "with", "about", "against",
    "between", "into", "through", "during", "before", "after", "above", "below",
    "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again",
    "further", "then", "once", "here", "there", "why", "who", "whom", "this", "that",
    "these", "those", "am", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "having", "do", "does", "did", "doing", "i", "me", "my",
    "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself",
    "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself",
    "it", "its", "itself", "they", "them", "their", "theirs", "theirs", "themselves"
]);

const calculateTextStats = (text: string): TextStatistics => {
    if (!text) {
    return {
      wordCount: 0, uniqueWords: 0, charCount: 0, charCountNoSpaces: 0,
      sentenceCount: 0, longestSentenceWords: 0, shortestSentenceWords: 0,
      avgSentenceWords: 0, avgSentenceChars: 0, avgWordLength: 0, paragraphCount: 0,
      keywordDensity: { oneWord: [], twoWords: [], threeWords: [] }
    };
  }

  // ... (keep the existing calculateTextStats implementation)
  const charCount = text.length;
  const charCountNoSpaces = text.replace(/\s/g, '').length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphCount = paragraphs.length;

  const wordsRaw = text.trim().split(/\s+/);
  const wordsClean = wordsRaw.map(w => w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase()).filter(w => w.length > 0);
  const wordCount = wordsRaw.length;
  const uniqueWords = new Set(wordsClean).size;
  
  const sentences = text.split(/[.!?]+(?=\s|$)/).filter(s => s.trim().length > 0);
  const sentenceCount = sentences.length;

  let totalSentenceWords = 0;
  let maxSenWords = 0;
  let minSenWords = sentences.length > 0 ? Number.MAX_SAFE_INTEGER : 0;
  let totalWordChars = 0;

  sentences.forEach(s => {
    const sWords = s.trim().split(/\s+/).length;
    totalSentenceWords += sWords;
    if (sWords > maxSenWords) maxSenWords = sWords;
    if (sWords < minSenWords) minSenWords = sWords;
  });

  if (minSenWords === Number.MAX_SAFE_INTEGER) minSenWords = 0;

  wordsClean.forEach(w => {
    totalWordChars += w.length;
  });

  const avgSentenceWords = sentenceCount > 0 ? parseFloat((totalSentenceWords / sentenceCount).toFixed(1)) : 0;
  const avgSentenceChars = sentenceCount > 0 ? parseFloat((charCount / sentenceCount).toFixed(1)) : 0;
  const avgWordLength = wordCount > 0 ? parseFloat((totalWordChars / wordCount).toFixed(1)) : 0;

  const getNGrams = (n: number): KeywordDensity[] => {
    const map = new Map<string, number>();
    const densityWords = wordsClean.filter(w => !STOP_WORDS.has(w) && w.length > 2);
    const phraseSource = n === 1 ? densityWords : wordsClean;

    for (let i = 0; i <= phraseSource.length - n; i++) {
      const slice = phraseSource.slice(i, i + n);
      const phrase = slice.join(" ");
      map.set(phrase, (map.get(phrase) || 0) + 1);
    }

    const totalPhrases = phraseSource.length - n + 1;
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase, count]) => ({
        phrase,
        count,
        percentage: totalPhrases > 0 ? parseFloat(((count / totalPhrases) * 100).toFixed(2)) : 0
      }));
    
    return sorted;
  };

  return {
    wordCount,
    uniqueWords,
    charCount,
    charCountNoSpaces,
    sentenceCount,
    longestSentenceWords: maxSenWords,
    shortestSentenceWords: minSenWords,
    avgSentenceWords,
    avgSentenceChars,
    avgWordLength,
    paragraphCount,
    keywordDensity: {
      oneWord: getNGrams(1),
      twoWords: getNGrams(2),
      threeWords: getNGrams(3)
    }
  };
};

const calculateCoverageScore = (text: string, matches: PlagiarismMatch[]): number => {
    if (!matches || matches.length === 0 || !text) return 0;

  const textLower = text.toLowerCase();
  const intervals: {start: number, end: number}[] = [];

  matches.forEach(match => {
    if (!match.snippet || match.snippet.length < 10) return;
    
    const snippetLower = match.snippet.toLowerCase().trim();
    if (!snippetLower) return;

    let pos = textLower.indexOf(snippetLower);
    while (pos !== -1) {
      intervals.push({ start: pos, end: pos + snippetLower.length });
      pos = textLower.indexOf(snippetLower, pos + 1);
    }
  });

  if (intervals.length === 0) return 0;

  intervals.sort((a, b) => a.start - b.start);
  
  const merged: {start: number, end: number}[] = [];
  let current = intervals[0];
  
  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (next.start < current.end) {
      current.end = Math.max(current.end, next.end);
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  const coveredLength = merged.reduce((sum, interval) => sum + (interval.end - interval.start), 0);
  
  return Math.min(100, Math.round((coveredLength / text.length) * 100));
};

// Helper for AI Detection (Structured JSON)
const detectAiPattern = async (text: string, config: AIConfig = GEMINI_CONFIG): Promise<AnalysisResult> => {
    const schemaDescription = `
Return your analysis in the following JSON format:
{
  "verdict": "HUMAN" | "AI" | "MIXED",
  "confidenceScore": number (0-100, where 0=100% Human, 100=100% AI),
  "reasoning": "string explaining the verdict",
  "keyIndicators": ["list", "of", "specific", "features"],
  "annotatedSegments": [
    {
      "text": "exact substring from original",
      "reason": "why this segment is significant",
      "category": "type of indicator",
      "isAiFeature": true/false
    }
  ],
  "stylometricAnalysis": {
    "sentenceVariety": "description",
    "vocabularyComplexity": "description",
    "emotionalTone": "description"
  }
}
`;

  const fullPrompt = `Analyze this text for AI patterns:\n\n${text}\n\n${schemaDescription}`;

  const response = await callAI(
    config,
    AI_DETECTION_SYSTEM_INSTRUCTION,
    fullPrompt,
    {
      temperature: 0.4,
      seed: 42,
      jsonMode: true
    }
  );

  if (!response) {
    throw new Error(`No response from ${config.provider} API`);
  }

  let result: AnalysisResult;
  try {
    const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
    const jsonStartIndex = cleanJson.indexOf('{');
    const jsonEndIndex = cleanJson.lastIndexOf('}');

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error("API response did not contain a valid JSON object.");
    }
    const jsonString = cleanJson.substring(jsonStartIndex, jsonEndIndex + 1);
    result = JSON.parse(jsonString);

  } catch (e) {
    console.error(`Failed to parse ${config.provider} response:`, response);
    throw new Error("Invalid JSON response from AI detection");
  }

  let score = Math.max(0, Math.min(100, Math.round(result.confidenceScore)));
  result.confidenceScore = score;

  if (score >= 0 && score <= 40) {
    result.verdict = ContentVerdict.HUMAN;
  } else if (score >= 60 && score <= 100) {
    result.verdict = ContentVerdict.AI;
  } else {
    result.verdict = ContentVerdict.MIXED;
  }

  return result;
};

// Helper for Plagiarism Check
const checkPlagiarism = async (text: string, config: AIConfig = GEMINI_CONFIG): Promise<PlagiarismReport> => {
  try {
    const prompt = `
You are a strict Plagiarism Verification System. Your goal is to find **EXACT, VERBATIM MATCHES** of the text provided below on the internet.

CRITICAL INSTRUCTIONS:
1. **STRICT VERBATIM ONLY**: Only return a match if you find an **identical sentence or phrase** on a website.
2. **SNIPPET EXTRACTION**: The 'snippet' field MUST be an EXACT SUBSTRING of the input text.
3. **VERIFY SOURCE**: Only include the URL if you are highly confident the text appears there.

RETURN ONLY a JSON object (no markdown, no preamble):
{"matches": [{"snippet": "exact input substring found online...", "url": "source url (optional)...", "title": "source page title (optional)..."}]}

TEXT TO CHECK:
${text.slice(0, 4000)}
`;

    const response = await callAI(
      config,
      "",
      prompt,
      {
        temperature: 0.4,
        jsonMode: true
      }
    );

    let matches: PlagiarismMatch[] = [];

    if (response) {
      try {
        const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
        const data = JSON.parse(cleanJson);
        matches = data.matches || [];
      } catch (e) {
        console.warn("Failed to parse plagiarism JSON", e);
      }
    }

    const score = calculateCoverageScore(text, matches);

    return { matches, score };

  } catch (error) {
    console.warn("Plagiarism check failed:", error);
    return { matches: [], score: 0 };
  }
};

// Helper for Grammar Check
const checkGrammar = async (text: string, config: AIConfig = GEMINI_CONFIG): Promise<GrammarStats> => {
  try {
    const prompt = `
You are a professional grammar checker and language expert. Analyze the provided text for grammar, spelling, punctuation, and style issues.

CRITICAL INSTRUCTIONS:
1. **Identify all grammar errors**: Look for subject-verb agreement, tense consistency, pronoun usage, punctuation errors, spelling mistakes, and awkward phrasing.
2. **Classify severity**: Use 'error' for serious grammar mistakes, 'warning' for style issues or minor errors, 'suggestion' for improvements.
3. **Provide positions**: Give exact start and end character positions for each error in the text.
4. **Calculate score**: Give a grammar score from 0-100 where 100 is perfect grammar.
5. **Give suggestions**: Provide 2-3 general suggestions for improvement.

RETURN ONLY a JSON object (no markdown, no preamble):
{
  "totalErrors": number,
  "errors": [
    {
      "text": "exact text substring with error",
      "reason": "explanation of the grammar issue",
      "severity": "error" | "warning" | "suggestion",
      "position": {
        "start": number,
        "end": number
      }
    }
  ],
  "score": number (0-100),
  "suggestions": ["suggestion1", "suggestion2"]
}

TEXT TO ANALYZE:
${text}
`;

    const response = await callAI(
      config,
      "",
      prompt,
      {
        temperature: 0.3,
        jsonMode: true
      }
    );

    if (response) {
      try {
        const cleanJson = response.replace(/```json\n?|\n?```/g, '').trim();
        const data = JSON.parse(cleanJson);

        // Validate and sanitize the response
        const totalErrors = Math.max(0, data.totalErrors || 0);
        const errors = Array.isArray(data.errors) ? data.errors.slice(0, 20) : []; // Limit to 20 errors
        const score = Math.max(0, Math.min(100, data.score || 0));
        const suggestions = Array.isArray(data.suggestions) ? data.suggestions.slice(0, 5) : []; // Limit to 5 suggestions

        return {
          totalErrors,
          errors,
          score,
          suggestions
        };
      } catch (e) {
        console.warn("Failed to parse grammar check JSON", e);
      }
    }

    // Return default if parsing fails
    return {
      totalErrors: 0,
      errors: [],
      score: 100,
      suggestions: []
    };

  } catch (error) {
    console.warn("Grammar check failed:", error);
    return {
      totalErrors: 0,
      errors: [],
      score: 100,
      suggestions: []
    };
  }
};

// Main Analysis Function
export const analyzeContent = async (text: string, config: AIConfig = GEMINI_CONFIG): Promise<AnalysisResult> => {
  try {
    const [aiResult, plagiarismResult, grammarResult] = await Promise.all([
      detectAiPattern(text, config),
      checkPlagiarism(text, config),
      checkGrammar(text, config)
    ]);

    const textStats = calculateTextStats(text);

    return {
      ...aiResult,
      originalText: text,
      plagiarismReport: plagiarismResult,
      textStats: textStats,
      grammarStats: grammarResult
    };
  } catch (error) {
    console.error("Analysis failed:", error);
    throw new Error(`Analysis failed: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
  }
};

// Humanize Function
export const humanizeContent = async (text: string, config: AIConfig = GEMINI_CONFIG): Promise<string> => {
  try {
    const response = await callAI(
      config,
      HUMANIZER_SYSTEM_INSTRUCTION,
      `Rewrite this text to make it sound 100% human:\n\n${text}`,
      {
        temperature: 0.9,
      }
    );

    return response || "Failed to rewrite content.";
  } catch (error) {
    console.error("Humanizing failed:", error);
    throw new Error(`Humanizing failed: ${error instanceof Error ? error.message : "An unknown error occurred."}`);
  }
};