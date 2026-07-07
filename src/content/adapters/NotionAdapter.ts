import { IEditorAdapter } from './IEditorAdapter';
import { DefaultAdapter } from './DefaultAdapter';

export class NotionAdapter implements IEditorAdapter {
  readonly name = 'NotionAdapter';
  private defaultAdapter = new DefaultAdapter();

  matches(target: HTMLElement): boolean {
    return window.location.hostname === 'www.notion.so' || target.closest('.notion-app-inner') !== null;
  }

  getText(target: HTMLElement): string {
    // Notion uses contenteditable blocks, so the default adapter's logic works well for extraction.
    return this.defaultAdapter.getText(target);
  }

  replaceText(target: HTMLElement, replacement: string): void {
    // Notion uses React-controlled contenteditable elements.
    // Forcing an insertText command preserves the React state and undo history natively.
    target.focus();
    
    // Use document.execCommand to hook into Notion's native undo stack
    let success = false;
    if (document.queryCommandSupported('insertText')) {
      success = document.execCommand('insertText', false, replacement);
    }
    
    if (!success) {
      // Fallback to default adapter if execCommand is deprecated/disabled
      this.defaultAdapter.replaceText(target, replacement);
    }
  }
}
