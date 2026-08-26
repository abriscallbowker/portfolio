import {BodyLink} from "@/components/body-link";
import {PortableVideo} from "@/components/portable-video";
import Image from "next/image";
import {PortableText, type PortableTextComponents} from "next-sanity";
import {urlFor} from "@/sanity/lib/image";

type PortableImage = {
  _type: "image";
  alt?: string;
  asset?: {
    _id?: string;
    metadata?: {
      lqip?: string;
      dimensions?: {width: number; height: number};
    };
  };
};

type PortableVideoValue = {
  _type: "video";
  alt?: string;
  asset?: {
    url?: string;
  };
};

function isEmptyBlock(block: unknown) {
  if (!block || typeof block !== "object") return false;
  const value = block as {_type?: string; children?: Array<{text?: string}>};
  if (value._type !== "block") return false;
  const text = (value.children ?? []).map((child) => child.text ?? "").join("");
  return text.trim().length === 0;
}

const components: PortableTextComponents = {
  block: {
    normal: ({children}) => (
      <p className="text-body-md text-ink">{children}</p>
    ),
    h1: ({children}) => (
      <h1 className="mt-16 text-portable-h1 text-ink first:mt-0">{children}</h1>
    ),
    h2: ({children}) => (
      <h2 className="mt-14 text-portable-h2 text-ink first:mt-0">{children}</h2>
    ),
    h3: ({children}) => (
      <h3 className="mt-12 text-portable-h3 text-ink first:mt-0">{children}</h3>
    ),
    h4: ({children}) => (
      <h4 className="mt-10 text-portable-h4 text-ink first:mt-0">{children}</h4>
    ),
    h5: ({children}) => (
      <h5 className="mt-8 text-portable-h5 text-ink first:mt-0">{children}</h5>
    ),
    blockquote: ({children}) => (
      <blockquote className="border-l-2 border-border pl-4 text-body-md text-subdued">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({children}) => (
      <ul className="list-disc space-y-2 pl-6 text-body-md text-ink">
        {children}
      </ul>
    ),
    number: ({children}) => (
      <ol className="list-decimal space-y-2 pl-6 text-body-md text-ink">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({children}) => <li className="pl-1">{children}</li>,
    number: ({children}) => <li className="pl-1">{children}</li>,
  },
  marks: {
    em: ({children}) => <em>{children}</em>,
    strong: ({children}) => <strong className="font-medium">{children}</strong>,
    link: ({children, value}) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = href.startsWith("http");
      return (
        <BodyLink href={href} external={external}>
          {children}
        </BodyLink>
      );
    },
  },
  types: {
    image: ({value}: {value: PortableImage}) => {
      if (!value?.asset) return null;
      const dimensions = value.asset.metadata?.dimensions;
      const width = dimensions?.width ?? 1600;
      const height = dimensions?.height ?? 1000;
      const caption = value.alt?.trim();

      return (
        <figure className="flex flex-col gap-3">
          <div className="overflow-hidden">
            <Image
              src={urlFor(value).width(1600).url()}
              alt={caption || ""}
              width={width}
              height={height}
              className="h-auto w-full"
              placeholder={value.asset.metadata?.lqip ? "blur" : "empty"}
              blurDataURL={value.asset.metadata?.lqip}
              sizes="(min-width: 640px) 640px, 100vw"
            />
          </div>
          {caption ? (
            <figcaption className="text-center text-body-xs italic text-subdued">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
    video: ({value}: {value: PortableVideoValue}) => {
      if (!value?.asset?.url) return null;
      const caption = value.alt?.trim();

      return (
        <figure className="flex flex-col gap-3">
          <div className="overflow-hidden">
            <PortableVideo src={value.asset.url} alt={caption || undefined} />
          </div>
          {caption ? (
            <figcaption className="text-center text-body-xs italic text-subdued">
              {caption}
            </figcaption>
          ) : null}
        </figure>
      );
    },
  },
};

export function PortableBody({value}: {value: unknown}) {
  if (!Array.isArray(value) || value.length === 0) return null;
  const blocks = value.filter((block) => !isEmptyBlock(block));
  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-6">
      <PortableText value={blocks} components={components} />
    </div>
  );
}
