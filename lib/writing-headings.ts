export type WritingHeading = {
  id: string;
  text: string;
  level: number;
};

export function getWritingHeading(block: unknown): WritingHeading | null {
  if (!block || typeof block !== "object") return null;
  const value = block as {
    _type?: string;
    _key?: string;
    style?: string;
    children?: Array<{text?: string}>;
  };
  if (value._type !== "block" || !value._key || !/^h[1-6]$/.test(value.style ?? "")) {
    return null;
  }

  const text = (value.children ?? []).map((child) => child.text ?? "").join("").trim();
  if (!text) return null;

  return {
    id: `heading-${value._key}`,
    text,
    level: Number(value.style?.slice(1)),
  };
}

export function getWritingHeadings(body: unknown): WritingHeading[] {
  if (!Array.isArray(body)) return [];
  return body.flatMap((block) => {
    const heading = getWritingHeading(block);
    return heading ? [heading] : [];
  });
}
