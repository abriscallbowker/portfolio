import {NotFoundContent} from "@/components/not-found-content";
import {DisableViewportGlass} from "@/components/viewport-glass";
import type {Metadata} from "next";

export const metadata: Metadata = {
  title: {
    absolute: "404…",
  },
  description: "Oops, page not found.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <>
      <DisableViewportGlass />
      <main className="flex h-dvh items-center justify-center bg-background px-4">
        <NotFoundContent />
      </main>
    </>
  );
}
