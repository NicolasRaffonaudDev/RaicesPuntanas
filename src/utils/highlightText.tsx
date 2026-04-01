const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const highlightText = (text: string, query: string) => {
  const trimmed = query.trim();
  if (!trimmed) return text;

  const escaped = escapeRegExp(trimmed);
  if (!escaped) return text;

  const regex = new RegExp(`(${escaped})`, "ig");
  const parts = text.split(regex);
  const lowerQuery = trimmed.toLowerCase();

  return parts.map((part, index) => {
    if (!part) return null;
    const isMatch = part.toLowerCase() === lowerQuery;
    if (!isMatch) return <span key={`${part}-${index}`}>{part}</span>;

    return (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-amber-200/20 px-1 text-amber-100"
      >
        {part}
      </mark>
    );
  });
};
