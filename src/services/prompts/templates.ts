import { RefinementMode, TranslationOptions } from "../../shared/types";
import { languages } from "../../utils/languages";

export class PromptBuilder {
  private static getLangName(code: string): string {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : code;
  }

  private static buildGlossaryInstruction(glossary?: Record<string, string>): string {
    if (!glossary || Object.keys(glossary).length === 0) return "";
    const rules = Object.entries(glossary)
      .map(([source, target]) => `"${source}" -> "${target}"`)
      .join("\n");
    return `\nIMPORTANT GLOSSARY RULES - You MUST translate the following terms exactly as specified:\n${rules}\n`;
  }

  /**
   * Builds the prompt for AI writing refinement.
   */
  static buildRefinementPrompt(text: string, mode: RefinementMode | string, targetLang?: string): string {
    const languageInstruction = targetLang ? ` Translate the refined text to ${this.getLangName(targetLang)}.` : ` Maintain the original language of the text.`;
    
    let modeInstruction = "";
    switch (mode) {
      case RefinementMode.FIX_GRAMMAR:
      case 'grammar':
        modeInstruction = "Fix any grammatical, spelling, or punctuation errors without changing the original meaning.";
        break;
      case RefinementMode.PROFESSIONAL:
      case 'professional':
        modeInstruction = "Rewrite the text to sound highly professional, suitable for a corporate or business environment.";
        break;
      case RefinementMode.CASUAL:
      case 'casual':
        modeInstruction = "Rewrite the text to sound relaxed and conversational.";
        break;
      case RefinementMode.FRIENDLY:
      case 'friendly':
        modeInstruction = "Rewrite the text to sound warm, polite, and approachable.";
        break;
      case RefinementMode.FORMAL:
      case 'formal':
        modeInstruction = "Rewrite the text to sound strict, objective, and formal.";
        break;
      case RefinementMode.SHORTER:
      case 'shorter':
        modeInstruction = "Summarize and make the text significantly shorter and more concise.";
        break;
      case RefinementMode.LONGER:
      case 'longer':
        modeInstruction = "Elaborate on the ideas and make the text longer and more detailed.";
        break;
      case RefinementMode.SIMPLIFY:
      case 'simplify':
        modeInstruction = "Rewrite the text so it is extremely easy to understand, at a 5th-grade reading level.";
        break;
      case RefinementMode.EXPLAIN:
      case 'explain':
        modeInstruction = "Provide a clear explanation of what the text means. You may use markdown for this explanation.";
        break;
      case 'improve':
        modeInstruction = "Improve the overall writing quality, flow, and readability.";
        break;
      default:
        modeInstruction = `Rewrite the text using the '${mode}' style.`;
    }

    return `You are an expert editor and writer. Your task is to process the provided text.
Instruction: ${modeInstruction}
${languageInstruction}

Rules:
1. Output ONLY the finalized text.
2. Do NOT include markdown formatting unless explicitly told to explain.
3. Do NOT include conversational filler like "Here is the text" or "Sure, I can help".
4. Do NOT wrap the output in quotation marks.

<user_text>
${text}
</user_text>`;
  }

  /**
   * Builds the prompt for standard raw translation.
   */
  static buildTranslationPrompt(options: TranslationOptions): string {
    const sourceName = options.sourceLang !== 'Detect language' ? this.getLangName(options.sourceLang) : 'the detected language';
    const targetName = this.getLangName(options.targetLang);
    const glossaryRule = this.buildGlossaryInstruction(options.glossary);

    return `Translate the following text from ${sourceName} to ${targetName}.
${glossaryRule}

Rules:
1. Output ONLY the raw translated text.
2. Do NOT include markdown formatting.
3. Do NOT include conversational filler.
4. Do NOT wrap the output in quotation marks.

<user_text>
${options.text}
</user_text>`;
  }

  /**
   * Builds the prompt for dictionary translation.
   */
  static buildDictionaryPrompt(options: TranslationOptions): string {
    const sourceName = options.sourceLang !== 'Detect language' ? this.getLangName(options.sourceLang) : 'the detected language';
    const targetName = this.getLangName(options.targetLang);
    const glossaryRule = this.buildGlossaryInstruction(options.glossary);

    return `Act as an expert bilingual dictionary. Analyze the provided text translating from ${sourceName} to ${targetName}.
${glossaryRule}

Provide the output strictly as a valid JSON object matching this schema exactly, with no markdown code blocks (\`\`\`), no prefix, and no suffix:
{
  "meaning": "The direct translation and brief explanation of the selected word/phrase",
  "synonyms": ["Synonym 1", "Synonym 2"],
  "examples": {
    "source": "An example sentence using the text in ${sourceName}",
    "target": "The translation of the example sentence in ${targetName}"
  }
}

<user_text>
${options.text}
</user_text>`;
  }
}
