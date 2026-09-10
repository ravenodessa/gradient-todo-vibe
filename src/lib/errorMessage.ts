type ServerError = {
  message?: unknown;
  code?: unknown;
};

const readablePart = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

export function getServerErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error.trim() || fallback;
  if (!error || typeof error !== 'object') return fallback;

  const serverError = error as ServerError;
  const message = readablePart(serverError.message);
  const code = readablePart(serverError.code);
  if (!message) return fallback;
  return code ? `${message} (${code})` : message;
}