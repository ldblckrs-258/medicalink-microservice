/**
 * Shortens the given text to the specified maximum length.
 *
 * @param text       The original text to shorten.
 * @param maxLength  The maximum allowed length for the shortened text.
 * @param keepWord   If true, the function will attempt to cut at the last space
 *                   before the maxLength to avoid breaking words (default: true).
 *                   If false, the text is simply sliced at the exact maxLength.
 * @returns          The shortened text, trimmed of leading/trailing whitespace.
 */
export const shortenText = (
  text: string,
  maxLength: number,
  options?: { keepWord?: boolean; ellipsis?: boolean },
): string => {
  const { keepWord = true, ellipsis = true } = options || {};
  if (text.length <= maxLength) return text;
  if (!keepWord) {
    return text.slice(0, maxLength).trim() + (ellipsis ? '...' : '');
  }

  let truncated = text.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    truncated = truncated.slice(0, lastSpaceIndex);
  }

  return truncated.trim() + (ellipsis ? '...' : '');
};
