export function reportError(error: unknown, context?: string): void {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
  const prefix = context ? `[${context}]` : "[error]";
  // eslint-disable-next-line no-console
  console.error(prefix, message);
}

