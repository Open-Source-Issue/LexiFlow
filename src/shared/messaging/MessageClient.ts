import { MessageAction, ExtensionResponse } from "../types";
import { LexiflowTimeoutError } from "../errors/LexiflowErrors";

export class MessageClient {
  /**
   * Sends a typed message to the background script and awaits the response.
   * Throws a LexiflowTimeoutError if the background script doesn't respond within the timeout.
   */
  static async send<T = any>(
    action: MessageAction,
    payload: any = {},
    timeoutMs: number = 15000
  ): Promise<ExtensionResponse<T>> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new LexiflowTimeoutError(`Request for ${action} timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      try {
        chrome.runtime.sendMessage(
          { action, ...payload, timestamp: Date.now() },
          (response) => {
            clearTimeout(timeoutId);
            
            if (chrome.runtime.lastError) {
              return resolve({
                success: false,
                error: {
                  code: 'CHROME_RUNTIME_ERROR',
                  message: chrome.runtime.lastError.message || 'Unknown Chrome runtime error'
                }
              });
            }
            
            resolve(response || { success: true });
          }
        );
      } catch (err: any) {
        clearTimeout(timeoutId);
        resolve({
          success: false,
          error: {
            code: 'MESSAGING_EXCEPTION',
            message: err.message
          }
        });
      }
    });
  }
}
