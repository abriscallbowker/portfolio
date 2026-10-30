"use client";

import Image from "next/image";
import {useState} from "react";
import {MediaGhost} from "@/components/media-ghost";

export function PortableImage({
  src,
  alt,
  width,
  height,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
}) {
  const [readySrc, setReadySrc] = useState<string | null>(null);

  return (
    <MediaGhost ready={readySrc === src}>
      <Image
        key={src}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="block h-auto w-full"
        sizes="(min-width: 640px) 640px, 100vw"
        onLoad={() => setReadySrc(src)}
      />
    </MediaGhost>
  );
}
