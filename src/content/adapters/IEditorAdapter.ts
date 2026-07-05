export interface IEditorAdapter {
  /**
   * The name of the adapter for logging/debugging (e.g., "GoogleDocsAdapter")
   */
  readonly name: string;

  /**
   * Checks if this adapter should be active for the current domain/element.
   * Return true if the adapter can handle the current page/element context.
   */
  matches(target: HTMLElement): boolean;

  /**
   * Gets the currently selected text or the full text of the active field.
   */
  getText(target: HTMLElement): string;

  /**
   * Replaces the currently selected text or the full field text with the provided replacement.
   * Should attempt to preserve native Undo (Ctrl/Cmd + Z) where possible.
   * If replacing is impossible/unsafe (e.g., Google Docs), fallback to copying to clipboard and alerting the user.
   */
  replaceText(target: HTMLElement, replacement: string): void;
}
