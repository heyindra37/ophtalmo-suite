/**
 * Replace {{fieldId}} placeholders with the given values. Leaves unknown placeholders
 * (e.g. {{date+1}}, handled separately by dateEngine) untouched.
 */
export function renderFieldPlaceholders(text: string, values: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, id: string) => values[id] ?? match);
}
