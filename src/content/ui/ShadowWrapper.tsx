import { createRoot, Root } from 'react-dom/client';

export class ShadowDOMManager {
  /**
   * Creates a Shadow DOM container and returns a React Root mounted inside it.
   * Clones any extension-injected styles into the Shadow Root for complete isolation.
   */
  static createShadowRoot(id: string = 'lexiflow-shadow-host'): Root {
    const container = document.createElement('div');
    container.id = id;
    
    // Ensure the host container doesn't interfere with page layout
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.zIndex = '2147483647';
    container.style.pointerEvents = 'none'; // Let clicks pass through empty areas
    
    document.body.appendChild(container);
    
    const shadowRoot = container.attachShadow({ mode: 'open' });
    
    // Clone styles from document head to shadow root
    // In dev, Vite uses <style type="text/css" data-vite-dev-id="...">
    // In prod, crxjs injects <link rel="stylesheet" href="chrome-extension://...">
    const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
    styles.forEach(node => {
      if (node.tagName.toLowerCase() === 'link') {
        const href = (node as HTMLLinkElement).href;
        if (href && href.startsWith('chrome-extension://' + chrome.runtime.id)) {
          shadowRoot.appendChild(node.cloneNode(true));
        }
      } else if (node.tagName.toLowerCase() === 'style') {
        // Clone styles that belong to the extension (Tailwind, custom CSS)
        // This is safe because CSS scoping inside shadow DOM won't leak out to the host page
        const text = node.textContent || '';
        if (node.hasAttribute('data-vite-dev-id') || text.includes('lexiflow') || text.includes('tailwind') || text.includes('--tw-')) {
          shadowRoot.appendChild(node.cloneNode(true));
        }
      }
    });
    
    const mountPoint = document.createElement('div');
    mountPoint.id = 'lexiflow-mount-point';
    // Re-enable pointer events for our UI. Because the React children are position: absolute, 
    // the mount point itself will be 0x0 size and won't block the screen.
    mountPoint.style.pointerEvents = 'auto'; 
    
    // Stop event propagation so host page doesn't receive our UI interactions and trigger weird behaviors
    const stopProp = (e: Event) => e.stopPropagation();
    mountPoint.addEventListener('keydown', stopProp);
    mountPoint.addEventListener('keyup', stopProp);
    mountPoint.addEventListener('keypress', stopProp);
    mountPoint.addEventListener('mousedown', stopProp);
    mountPoint.addEventListener('mouseup', stopProp);
    mountPoint.addEventListener('click', stopProp);
    
    shadowRoot.appendChild(mountPoint);
    
    return createRoot(mountPoint);
  }
}
