interface ErrorWithMessage {
  message?: string;
  error?: string;
}

const isErrorWithMessage = (value: unknown): value is ErrorWithMessage => {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('message' in value || 'error' in value)
  );
};

const extractErrorMessage = (error: unknown): string => {
  if (isErrorWithMessage(error)) {
    return error.message || error.error || JSON.stringify(error);
  }
  if (typeof error === 'object' && error !== null) {
    return JSON.stringify(error);
  }
  return String(error);
};

// Перегрузки функции
export function translateError(errorKey: string | string[]): string;
export function translateError(errorKey: unknown): string;
export function translateError(errorKey: string | string[] | unknown): string {
  if (!errorKey) return 'An unknown error occurred.';

  if (Array.isArray(errorKey)) {
    return translateError(errorKey[0]);
  }

  // Если errorKey не строка и не массив, преобразуем в строку
  if (typeof errorKey !== 'string') {
    return translateError(extractErrorMessage(errorKey));
  }

  const errorMap: Record<string, string> = {
    USER_ALREADY_EXISTS: 'A user with this email already exists.',
    USER_NOT_FOUND: 'User not found.',
    INVALID_LOGIN_OR_PASSWORD: 'Invalid email or password.',
    UNAUTHORIZED: 'You are not authorized. Please log in.',
    ACCESS_DENIED: 'Access denied.',
    USER_IS_NOT_EXIST: 'User does not exist.',
    PASSWORD_IS_NOT_VALID_FORMAT:
      'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
    PASSWORD_INVALID_LENGTH:
      'Password length must be between 8 and 12 characters.',
    LOGIN_IS_NOT_VALID_FORMAT: 'Please enter a valid email address.',
    FILE_SIZE_LIMIT: 'File size exceeds the allowed limit (1 MB).',
    FILE_UPLOAD_ERROR: 'Error uploading file. Please try again later.',
    FILE_REMOVE_ERROR: 'Error removing file.',
    FILE_NOT_FOUND: 'File not found.',
    'Bad Request': 'Bad Request.',
    'Internal server error': 'Internal server error.',
    'Token expired': 'Session expired. Please log in again.',
    'Invalid token': 'Invalid authorization token.',
  };

  return errorMap[errorKey] || errorKey;
}
