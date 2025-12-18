export const APP_NAME = 'African Currency Platform';
export const APP_VERSION = '1.0.0';

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

export const CACHE_DURATION = {
  SHORT: 300, // 5 minutes
  MEDIUM: 3600, // 1 hour
  LONG: 86400, // 24 hours
};

export const ERROR_MESSAGES = {
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden',
  BAD_REQUEST: 'Bad request',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation failed',
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Successfully created',
  UPDATED: 'Successfully updated',
  DELETED: 'Successfully deleted',
  RETRIEVED: 'Successfully retrieved',
};

export const TRANSACTION_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 1000000,
};

export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
};

export const RATE_LIMIT = {
  WINDOW_TIME: 60, // 1 minute
  MAX_REQUESTS: 100,
};

export const STELLAR_NETWORK_URLS = {
  testnet: 'https://horizon-testnet.stellar.org',
  public: 'https://horizon.stellar.org',
};
