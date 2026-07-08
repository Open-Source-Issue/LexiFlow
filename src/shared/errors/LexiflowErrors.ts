/**
 * Base error class for all Lexiflow custom errors.
 */
export class LexiflowError extends Error {
  public code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class LexiflowNetworkError extends LexiflowError {
  constructor(message: string = "A network error occurred.") {
    super(message, 'NETWORK_ERROR');
  }
}

export class LexiflowRateLimitError extends LexiflowError {
  constructor(message: string = "Rate limit exceeded. Please try again later.") {
    super(message, 'RATE_LIMIT');
  }
}

export class LexiflowTimeoutError extends LexiflowError {
  constructor(message: string = "The request timed out.") {
    super(message, 'TIMEOUT_ERROR');
  }
}

export class LexiflowProviderError extends LexiflowError {
  constructor(message: string = "The AI provider returned an error.") {
    super(message, 'PROVIDER_ERROR');
  }
}

export class LexiflowAuthError extends LexiflowError {
  constructor(message: string = "Invalid or missing API key.") {
    super(message, 'AUTH_ERROR');
  }
}
