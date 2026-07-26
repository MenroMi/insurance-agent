/** Collects every string from an arbitrarily nested data structure. */
export function collectStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(collectStrings);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectStrings);
  }
  return [];
}

/** Returns strings containing an em-dash or en-dash. See Global Constraints. */
export function findDashViolations(strings: string[]): string[] {
  return strings.filter((s) => s.includes("—") || s.includes("–"));
}
