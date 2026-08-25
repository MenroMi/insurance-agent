/**
 * The visible text of a rendered tree, one text node per line.
 *
 * `container.textContent` concatenates adjacent elements with no separator, so
 * a kicker reading "Pierwszy contact" followed by a heading "Krótka rozmowa"
 * comes out as "Pierwszy contactKrótka rozmowa". A `\bcontact\b` guard then
 * silently passes, because the character after "contact" is a word character.
 * That is a guard that looks like it works and does not.
 *
 * Joining text nodes with a newline restores the boundaries, which keeps both
 * halves of a word-boundary pattern meaningful. It matters in both directions:
 * `\bpartners\b` must catch the English slug without firing on the ordinary
 * Polish "partnerskiej".
 */
export function renderedText(container: HTMLElement): string {
  const walker = container.ownerDocument.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT
  );

  const lines: string[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const value = node.nodeValue?.trim();
    if (value) lines.push(value);
  }

  return lines.join('\n');
}
