import { LLMProvider, ProviderCapabilities, LLMRequestOptions, TranslationOptions, DictionaryResult } from '../shared/types';
import { HttpService } from './api/HttpService';
import { PromptBuilder } from './prompts/templates';

const DEFAULT_MODEL = "gemini-2.5-flash";

export class GeminiProvider implements LLMProvider {
  public capabilities: ProviderCapabilities = {
    supportsStreaming: false,
    supportsStructuredOutput: true,
    supportsVision: false
  };

  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("Gemini API key is not configured.");
    }
    this.apiKey = apiKey;
  }

  async refineText(text: string, options: LLMRequestOptions): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${this.apiKey}`;
    const prompt = PromptBuilder.buildRefinementPrompt(text, options.mode, options.targetLang);

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.4,
        maxOutputTokens: options.maxTokens ?? 1500
      }
    };

    const response = await HttpService.post<any>(url, body, { timeoutMs: 15000 });

    if (Array.isArray(response?.candidates) && response.candidates.length > 0) {
      return response.candidates[0]?.content?.parts?.[0]?.text?.trim() || "";
    }
    
    throw new Error("No response generated from Gemini.");
  }

  async translateRaw(options: TranslationOptions): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${this.apiKey}`;
    const prompt = PromptBuilder.buildTranslationPrompt(options);

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1500
      }
    };

    const response = await HttpService.post<any>(url, body, { timeoutMs: 15000 });

    if (Array.isArray(response?.candidates) && response.candidates.length > 0) {
      return response.candidates[0]?.content?.parts?.[0]?.text?.trim() || "";
    }
    
    throw new Error("No response generated from Gemini.");
  }

  async translateDictionary(options: TranslationOptions): Promise<DictionaryResult> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_MODEL}:generateContent?key=${this.apiKey}`;
    const prompt = PromptBuilder.buildDictionaryPrompt(options);

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1500
      }
    };

    const response = await HttpService.post<any>(url, body, { timeoutMs: 15000 });

    if (Array.isArray(response?.candidates) && response.candidates.length > 0) {
      const resultText = response.candidates[0]?.content?.parts?.[0]?.text || "";
      
      try {
        const cleaned = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned) as DictionaryResult;
      } catch (e) {
        // Fallback to returning raw text in the meaning field if parsing fails
        return {
          meaning: resultText,
          synonyms: [],
          examples: { source: "", target: "" }
        } as DictionaryResult;
      }
    }
    
    throw new Error("No response generated from Gemini.");
  }
}
