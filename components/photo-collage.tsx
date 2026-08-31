"use client";

import {hoverSpring} from "@/lib/motion";
import {personalPhotos} from "@/lib/site";
import {motion} from "motion/react";
import Image from "next/image";

const cardClassName =
  "overflow-visible rounded-[10px] border-[5px] border-white shadow-[0_0_0_1px_rgb(0_0_0_/_0.12),0_0_12px_rgb(0_0_0_/_0.04)]";

function PhotoCard({
  src,
  alt,
  label,
  sizes,
  className,
  rotate = 0,
}: {
  src: string;
  alt: string;
  label: string;
  sizes: string;
  className: string;
  rotate?: number;
}) {
  return (
    <motion.div
      data-cursor="interactive"
      className={`group ${cardClassName} ${className}`}
      initial={false}
      animate={{rotate, scale: 1}}
      whileHover={{
        scale: 1.1,
        rotate: 0,
        transition: hoverSpring,
      }}
      transition={hoverSpring}
    >
      <div className="relative size-full overflow-hidden rounded-[5px]">
        <Image src={src} alt={alt} fill className="object-cover" sizes={sizes} />
        <span className="pointer-events-none absolute bottom-0 left-0 z-[1] rounded-tr-[4px] bg-white px-1.5 py-0.5 text-xs font-medium text-black transition-opacity duration-200 md:opacity-0 md:group-hover:opacity-100">
          {label}
        </span>
      </div>
    </motion.div>
  );
}

export function PhotoCollage() {
  return (
    <div className="w-full overflow-visible">
      <div className="relative mx-auto hidden h-[288px] w-full max-w-[608px] overflow-visible pt-10 md:block">
        {personalPhotos.map((photo) => (
          <PhotoCard
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            label={photo.label}
            sizes="(min-width: 768px) 184px, 50vw"
            rotate={photo.rotate}
            className={`absolute h-[248px] w-[184px] ${photo.className}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2 overflow-visible md:hidden">
        {personalPhotos.map((photo) => (
          <PhotoCard
            key={`${photo.src}-mobile`}
            src={photo.src}
            alt={photo.alt}
            label={photo.label}
            sizes="(min-width: 768px) 184px, 50vw"
            className="relative aspect-[3/4] w-full min-w-0"
          />
        ))}
      </div>
    </div>
  );
}
