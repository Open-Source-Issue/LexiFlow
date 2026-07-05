import { IEditorAdapter } from './IEditorAdapter';
import { DefaultAdapter } from './DefaultAdapter';
import { GoogleDocsAdapter } from './GoogleDocsAdapter';
import { NotionAdapter } from './NotionAdapter';

export * from './IEditorAdapter';
export * from './DefaultAdapter';
export * from './GoogleDocsAdapter';
export * from './NotionAdapter';

export class EditorAdapterFactory {
  // Order matters: More specific adapters should be checked before the DefaultAdapter
  private static adapters: IEditorAdapter[] = [
    new GoogleDocsAdapter(),
    new NotionAdapter(),
    new DefaultAdapter()
  ];

  /**
   * Finds the most appropriate adapter for the given HTML element.
   */
  static getAdapterFor(target: HTMLElement): IEditorAdapter {
    for (const adapter of this.adapters) {
      if (adapter.matches(target)) {
        return adapter;
      }
    }
    
    // Fallback to default if no specific adapter matches, though DefaultAdapter usually matches anyway
    return new DefaultAdapter();
  }
}
