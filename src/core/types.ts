export type AIProvider = 'gemini' | 'openai' | 'claude';

export interface TranslationOptions {
  text: string;
  sourceLang: string;
  targetLang: string;
  glossary?: Record<string, string>;
}

export interface RefinementOptions {
  text: string;
  targetLang: string;
  mode: 'improve' | 'grammar' | 'professional' | 'casual' | 'shorter' | 'longer' | 'simplify' | 'friendly' | 'formal' | 'explain';
}

export interface DictionaryResult {
  meaning: string;
  synonyms: string[];
  examples: {
    source: string;
    target: string;
  };
}

export interface LLMProvider {
  /** Translate text quickly, returning only the translated string. */
  translateRaw(options: TranslationOptions): Promise<string>;
  
  /** Translate text and enrich with dictionary info (meaning, synonyms, examples). */
  translateDictionary(options: TranslationOptions): Promise<DictionaryResult>;

  /** Rewrite or refine text based on specific modes. */
  refineText(options: RefinementOptions): Promise<string>;
}
