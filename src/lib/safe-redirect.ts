export function safeRedirect(url: string | null | undefined, fallback = "/"): string {
  if (!url) return fallback;
  try {
    const parsed = new URL(url, "http://localhost");
    if (parsed.hostname !== "localhost") return fallback;
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    if (url.startsWith("/") && !url.startsWith("//")) return url;
    return fallback;
  }
}
