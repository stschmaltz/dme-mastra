export function parseJsonFromText<T = unknown>(text: string): T {
  const cleaned = text.trim();

  const attempts: { label: string; content: string }[] = [
    { label: "raw text", content: cleaned },
  ];

  const fencedMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    attempts.push({ label: "fenced code block", content: fencedMatch[1] });
  }

  const startCandidates = [cleaned.indexOf("{"), cleaned.indexOf("[")].filter(
    (value) => value >= 0,
  );
  const endCandidates = [cleaned.lastIndexOf("}"), cleaned.lastIndexOf("]")].filter(
    (value) => value >= 0,
  );

  if (startCandidates.length > 0 && endCandidates.length > 0) {
    const startIndex = Math.min(...startCandidates);
    const endIndex = Math.max(...endCandidates);

    if (startIndex < endIndex) {
      attempts.push({ label: "json slice", content: cleaned.slice(startIndex, endIndex + 1) });
    }
  }

  const tried = new Set<string>();

  for (const attempt of attempts) {
    const snippet = attempt.content.trim();

    if (!snippet || tried.has(snippet)) continue;
    tried.add(snippet);

    try {
      return JSON.parse(snippet) as T;
    } catch {
      // Continue to next attempt
    }
  }

  throw new Error(
    `Unable to parse JSON from AI response. Received text: ${cleaned.slice(0, 200)}`,
  );
}
