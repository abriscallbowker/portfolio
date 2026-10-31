import {BodyLink} from "@/components/body-link";
import {PortableImage as WritingImage} from "@/components/portable-image";
import {PortableVideo} from "@/components/portable-video";
import {PortableText, type PortableTextComponents} from "next-sanity";
import {urlFor} from "@/sanity/lib/image";
import {getWritingHeading} from "@/lib/writing-headings";

type PortableImage = {
  _type: "image";
  alt?: string;
  caption?: string;
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
  caption?: string;
  asset?: {
    url?: string;
  };
};

function MediaCaption({caption}: {caption?: string}) {
  const text = caption?.trim();
  if (!text) return null;

  return (
    <figcaption className="text-center text-body-sm italic text-subdued">
      {text}
    </figcaption>
  );
}

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
    h1: ({children, value}) => (
      <h1 id={getWritingHeading(value)?.id} tabIndex={-1} className="writing-anchor mt-16 text-portable-h1 text-ink first:mt-0">{children}</h1>
    ),
    h2: ({children, value}) => (
      <h2 id={getWritingHeading(value)?.id} tabIndex={-1} className="writing-anchor mt-14 text-portable-h2 text-ink first:mt-0">{children}</h2>
    ),
    h3: ({children, value}) => (
      <h3 id={getWritingHeading(value)?.id} tabIndex={-1} className="writing-anchor mt-12 text-portable-h3 text-ink first:mt-0">{children}</h3>
    ),
    h4: ({children, value}) => (
      <h4 id={getWritingHeading(value)?.id} tabIndex={-1} className="writing-anchor mt-10 text-portable-h4 text-ink first:mt-0">{children}</h4>
    ),
    h5: ({children, value}) => (
      <h5 id={getWritingHeading(value)?.id} tabIndex={-1} className="writing-anchor mt-8 text-portable-h5 text-ink first:mt-0">{children}</h5>
    ),
    h6: ({children, value}) => (
      <h6 id={getWritingHeading(value)?.id} tabIndex={-1} className="writing-anchor mt-8 text-portable-h5 text-ink first:mt-0">{children}</h6>
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
      const alt = value.alt?.trim() ?? "";

      return (
        <figure className="flex flex-col gap-2">
          <div className="overflow-hidden">
            <WritingImage
              src={urlFor(value).width(1600).url()}
              alt={alt}
              width={width}
              height={height}
            />
          </div>
          <MediaCaption caption={value.caption} />
        </figure>
      );
    },
    video: ({value}: {value: PortableVideoValue}) => {
      if (!value?.asset?.url) return null;
      const alt = value.alt?.trim();

      return (
        <figure className="flex flex-col gap-2">
          <div className="overflow-hidden">
            <PortableVideo src={value.asset.url} alt={alt || undefined} />
          </div>
          <MediaCaption caption={value.caption} />
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
