/**
 * Supported refinement modes for AI writing.
 */
export enum RefinementMode {
  TRANSLATE = 'translate',
  FIX_GRAMMAR = 'fix_grammar',
  PROFESSIONAL = 'professional',
  CASUAL = 'casual',
  FRIENDLY = 'friendly',
  FORMAL = 'formal',
  SHORTER = 'shorter',
  LONGER = 'longer',
  SIMPLIFY = 'simplify',
  EXPLAIN = 'explain',
  REWRITE = 'rewrite',
  MAKE_NATURAL = 'make_natural',
  MORE_CONFIDENT = 'more_confident',
  MORE_POLITE = 'more_polite',
  MORE_PERSUASIVE = 'more_persuasive',
  ACADEMIC = 'academic',
  BUSINESS = 'business',
  MARKETING = 'marketing',
  EMAIL = 'email',
  SOCIAL_MEDIA = 'social_media',
  BULLET_POINTS = 'bullet_points',
  EXPAND_IDEAS = 'expand_ideas',
  CONTINUE_WRITING = 'continue_writing',
  SUMMARIZE = 'summarize'
}

/**
 * Options passed to the LLM provider for text refinement.
 */
export interface LLMRequestOptions {
  mode: RefinementMode | string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  sourceLang?: string;
  targetLang?: string;
}

export interface TranslationOptions {
  text: string;
  sourceLang: string;
  targetLang: string;
  glossary?: Record<string, string>;
}

export interface DictionaryResult {
  meaning: string;
  synonyms: string[];
  examples: {
    source: string;
    target: string;
  };
}

/**
 * Declares the capabilities of a specific LLM Provider.
 */
export interface ProviderCapabilities {
  supportsStreaming: boolean;
  supportsStructuredOutput: boolean;
  supportsVision?: boolean;
}

/**
 * Generic interface that all LLM Providers must implement.
 */
export interface LLMProvider {
  capabilities: ProviderCapabilities;
  refineText(text: string, options: LLMRequestOptions): Promise<string>;
  translateRaw(options: TranslationOptions): Promise<string>;
  translateDictionary(options: TranslationOptions): Promise<DictionaryResult>;
}

/**
 * Standardized response format from the MessageClient.
 */
export interface ExtensionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Actions supported by the MessageClient.
 */
export type MessageAction = 
  | 'translate'
  | 'speak'
  | 'openDashboard'
  | 'showFullPagePopup'
  | 'translateFullPage'
  | 'resetFullPageSettings'
  | 'updateSelectedText'
  | 'openPopupFromShortcut'
  | 'REFINE_TEXT'
  | 'TRANSLATE_TEXT'
  | 'DETECT_LANGUAGE'
  | 'RESTORE_AND_REPLACE';

