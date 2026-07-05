import { EditorAdapterFactory, IEditorAdapter } from '../adapters';

export type FieldFocusHandler = (
  element: HTMLElement | null, 
  adapter: IEditorAdapter | null, 
  rect: DOMRect | null
) => void;

export class FieldDetectionEngine {
  private static activeElement: HTMLElement | null = null;
  private static activeAdapter: IEditorAdapter | null = null;
  private static focusHandler: FieldFocusHandler | null = null;
  private static selectionTimeout: number | null = null;

  /**
   * Initializes the event listeners for field detection.
   */
  static start(onFocusChange: FieldFocusHandler): void {
    this.focusHandler = onFocusChange;

    document.addEventListener('focusin', this.handleFocusIn);
    document.addEventListener('focusout', this.handleFocusOut);
    document.addEventListener('selectionchange', this.handleSelectionChange);
    document.addEventListener('click', this.handleClick);
  }

  /**
   * Cleans up all event listeners.
   */
  static stop(): void {
    document.removeEventListener('focusin', this.handleFocusIn);
    document.removeEventListener('focusout', this.handleFocusOut);
    document.removeEventListener('selectionchange', this.handleSelectionChange);
    document.removeEventListener('click', this.handleClick);
    
    this.activeElement = null;
    this.activeAdapter = null;
    this.focusHandler = null;
    if (this.selectionTimeout) {
      window.clearTimeout(this.selectionTimeout);
    }
  }

  static getActiveElement(): HTMLElement | null {
    return this.activeElement;
  }

  static getActiveAdapter(): IEditorAdapter | null {
    return this.activeAdapter;
  }

  private static handleClick = (e: MouseEvent) => {
    // Also check on click in case focus events didn't fire properly (e.g. some contenteditables)
    const target = e.target as HTMLElement;
    if (target && !this.activeElement) {
      this.evaluateTarget(target);
    }
  };

  private static handleFocusIn = (e: FocusEvent) => {
    const target = e.target as HTMLElement;
    if (target) {
      this.evaluateTarget(target);
    }
  };

  private static handleFocusOut = (_e: FocusEvent) => {
    // Delay slightly to check if focus moved to our own popup UI
    setTimeout(() => {
      const active = document.activeElement as HTMLElement;
      // If focus moved to body or outside an editable area, and not to our popup
      if (!active || active === document.body) {
        this.notify(null, null, null);
      } else {
        this.evaluateTarget(active);
      }
    }, 100);
  };

  private static handleSelectionChange = () => {
    // Debounce selection change since it fires very frequently
    if (this.selectionTimeout) {
      window.clearTimeout(this.selectionTimeout);
    }

    this.selectionTimeout = window.setTimeout(() => {
      if (this.activeElement && this.activeAdapter) {
        // Notify of potential rect updates
        this.notify(this.activeElement, this.activeAdapter, this.activeElement.getBoundingClientRect());
      } else {
        // Try to find if there is an active selection in an editable
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const node = selection.focusNode;
          if (node) {
            const element = node.nodeType === Node.ELEMENT_NODE ? node as HTMLElement : node.parentElement;
            if (element) {
              this.evaluateTarget(element);
            }
          }
        }
      }
    }, 150);
  };

  private static evaluateTarget(target: HTMLElement) {
    // Check if it's our own UI
    if (target.closest('#lexiflow-full-page-popup-container') || target.closest('#crxjs-app') || target.closest('#lexiflow-floating-ui')) {
      return;
    }

    // Use the factory to find a matching adapter
    const adapter = EditorAdapterFactory.getAdapterFor(target);
    
    // If it matches (is editable according to adapter)
    if (adapter.matches(target)) {
      this.activeElement = target;
      this.activeAdapter = adapter;
      this.notify(target, adapter, target.getBoundingClientRect());
    }
  }

  private static notify(element: HTMLElement | null, adapter: IEditorAdapter | null, rect: DOMRect | null) {
    if (this.focusHandler) {
      this.focusHandler(element, adapter, rect);
    }
  }
}
