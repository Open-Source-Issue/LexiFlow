import { LexiflowNetworkError, LexiflowTimeoutError, LexiflowRateLimitError } from "../../shared/errors/LexiflowErrors";

export interface HttpRequestOptions extends RequestInit {
  timeoutMs?: number;
}

export class HttpService {
  /**
   * Performs an HTTP POST request with built-in timeout and custom error handling.
   */
  static async post<T>(url: string, body: any, options: HttpRequestOptions = {}): Promise<T> {
    const { timeoutMs = 15000, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(fetchOptions.headers || {})
        },
        body: JSON.stringify(body),
        signal: controller.signal,
        ...fetchOptions
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new LexiflowRateLimitError();
        }
        throw new LexiflowNetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error: any) {
      clearTimeout(id);
      
      if (error.name === 'AbortError') {
        throw new LexiflowTimeoutError();
      }
      
      if (error instanceof LexiflowNetworkError || error instanceof LexiflowRateLimitError) {
        throw error;
      }
      
      throw new LexiflowNetworkError(error.message);
    }
  }
  
  /**
   * Performs an HTTP GET request with built-in timeout and custom error handling.
   */
  static async get<T>(url: string, options: HttpRequestOptions = {}): Promise<T> {
    const { timeoutMs = 15000, ...fetchOptions } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(fetchOptions.headers || {})
        },
        signal: controller.signal,
        ...fetchOptions
      });
      
      clearTimeout(id);
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new LexiflowRateLimitError();
        }
        throw new LexiflowNetworkError(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json() as T;
    } catch (error: any) {
      clearTimeout(id);
      
      if (error.name === 'AbortError') {
        throw new LexiflowTimeoutError();
      }
      
      if (error instanceof LexiflowNetworkError || error instanceof LexiflowRateLimitError) {
        throw error;
      }
      
      throw new LexiflowNetworkError(error.message);
    }
  }
}
