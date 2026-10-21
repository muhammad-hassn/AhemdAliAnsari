export function reportError(error: unknown, context?: string): void {
  const message = error instanceof Error ? error.message : String(error);
  const prefix = context ? `[${context}]` : "[error]";
  // eslint-disable-next-line no-console
  console.error(prefix, message);
}

