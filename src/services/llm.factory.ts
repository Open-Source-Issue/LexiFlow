import { LLMProvider } from '../shared/types';
import { GeminiProvider } from './gemini.provider';

export type AIProviderName = 'gemini' | 'openai' | 'claude';

export class LLMFactory {
  static createProvider(providerName: AIProviderName | string, apiKey: string): LLMProvider {
    switch (providerName) {
      case 'gemini':
        return new GeminiProvider(apiKey);
      case 'openai':
      case 'claude':
        throw new Error(`Provider ${providerName} is not yet implemented.`);
      default:
        throw new Error(`Unknown provider ${providerName}.`);
    }
  }
}
