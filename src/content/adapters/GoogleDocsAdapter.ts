import { IEditorAdapter } from './IEditorAdapter';

export class GoogleDocsAdapter implements IEditorAdapter {
  readonly name = 'GoogleDocsAdapter';

  matches(_target: HTMLElement): boolean {
    return window.location.hostname === 'docs.google.com';
  }

  getText(_target: HTMLElement): string {
    // In Google Docs, text selection is notoriously complex due to the canvas-like rendering (kix).
    // However, the browser's native window.getSelection() often catches the invisible overlaid text.
    // For a robust enterprise implementation, this would interact with the Docs specific DOM or Canvas APIs.
    // For now, we rely on the standard selection API which reliably captures the overlaid selection div for text extraction.
    const selection = window.getSelection();
    return selection ? selection.toString() : "";
  }

  replaceText(_target: HTMLElement, replacement: string): void {
    // Google Docs uses a canvas-based editor (kix). DOM manipulation is strictly unsafe and breaks the doc state.
    // Fallback: Copy to clipboard and instruct the user to paste.
    navigator.clipboard.writeText(replacement).then(() => {
      // In a production app with a UI state, we would trigger a React toast notification.
      // Since this is the content script boundary, an alert or styled console works for MVP.
      console.log("[Lexiflow] Google Docs detected. Text copied to clipboard. Please paste manually (Ctrl/Cmd + V).");
      alert("Lexiflow: AI text copied to clipboard. Please paste it directly into your document.");
    }).catch(err => {
      console.error("[Lexiflow] Failed to copy text to clipboard", err);
      alert("Lexiflow: Failed to copy to clipboard.");
    });
  }
}
