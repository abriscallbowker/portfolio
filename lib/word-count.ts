type PortableChild = {
  text?: string;
};

type PortableBlock = {
  _type?: string;
  children?: PortableChild[];
};

export function wordCount(blocks: unknown[] | null | undefined) {
  if (!blocks?.length) return 0;

  const text = (blocks as PortableBlock[])
    .filter((block) => block._type === "block")
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text ?? "")
    .join(" ");

  return text.trim().split(/\s+/).filter(Boolean).length;
}
