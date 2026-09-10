type ServerError = {
  message?: unknown;
  details?: unknown;
  hint?: unknown;
  code?: unknown;
};

const readablePart = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;

export function getServerErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'string') return error.trim() || fallback;
  if (!error || typeof error !== 'object') return fallback;

  const serverError = error as ServerError;
  const message = readablePart(serverError.message);
  const details = readablePart(serverError.details);
  const hint = readablePart(serverError.hint);
  const code = readablePart(serverError.code);
  const parts = [message, details, hint].filter(
    (part, index, values): part is string => Boolean(part) && values.indexOf(part) === index,
  );

  if (parts.length === 0) return fallback;

  const reason = parts.join(' — ');
  return code ? `${reason} (${code})` : reason;
}