import { format } from "date-fns";

/** Route head() metadata for a Control Center screen. */
export function adminHead(title: string, description: string) {
  const full = `${title} — Kixto Control Center`;
  return () => ({
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  });
}

export function fmt(value: unknown, pattern = "d MMM yyyy, HH:mm") {
  if (!value) return "—";
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? "—" : format(d, pattern);
}

export function text(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export type AnyRow = Record<string, unknown> & { id?: string };