import { IEditorAdapter } from './IEditorAdapter';

export class DefaultAdapter implements IEditorAdapter {
  readonly name = 'DefaultAdapter';

  matches(target: HTMLElement): boolean {
    const tagName = target.tagName.toLowerCase();
    const isInput = tagName === 'input' && target.getAttribute('type') !== 'password';
    const isTextarea = tagName === 'textarea';
    const isContentEditable = target.isContentEditable;
    
    return isInput || isTextarea || isContentEditable;
  }

  getText(target: HTMLElement): string {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      if (start !== end) {
        return target.value.substring(start, end);
      }
      return target.value;
    }

    if (target.isContentEditable) {
      const selection = window.getSelection();
      if (selection && selection.toString().length > 0) {
        return selection.toString();
      }
      return target.innerText || target.textContent || "";
    }

    return "";
  }

  replaceText(target: HTMLElement, replacement: string): void {
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const start = target.selectionStart ?? 0;
      const end = target.selectionEnd ?? 0;
      
      target.focus();
      if (start !== end) {
        target.setRangeText(replacement, start, end, 'select');
      } else {
        target.value = replacement;
      }
      
      // Dispatch events for React/Angular bindings
      target.dispatchEvent(new Event('input', { bubbles: true }));
      target.dispatchEvent(new Event('change', { bubbles: true }));
      return;
    }

    if (target.isContentEditable) {
      target.focus();
      const selection = window.getSelection();
      
      // Use execCommand to preserve Undo stack natively when possible
      if (document.queryCommandSupported('insertText')) {
        const success = document.execCommand('insertText', false, replacement);
        if (success) return;
      }

      // Fallback
      if (selection && selection.rangeCount > 0 && selection.toString().length > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(replacement));
      } else {
        target.innerText = replacement;
      }
      
      target.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
  }
}
