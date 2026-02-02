/**
 * Format an Archive.org file name into a human-friendly label matching the
 * Archive.org player/list style.
 */
export function formatArchiveFileLabel(fileName: string): string {
  if (!fileName) return "";

  const trimmed = fileName.trim();

  const lastDot = trimmed.lastIndexOf(".");
  const base = lastDot > 0 ? trimmed.slice(0, lastDot) : trimmed;
  const ext = lastDot > 0 ? trimmed.slice(lastDot + 1) : "";

  let label = base
    .replace(/_/g, " ")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  // Ensure track prefix like "001-" becomes "001- "
  label = label.replace(/^(\d+)\s*-\s*/u, "$1- ");

  const extUpper = ext ? ext.toUpperCase() : "";
  return extUpper ? `${label}.${extUpper}` : label;
}
