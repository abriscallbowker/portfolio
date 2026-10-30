import type {ReactNode} from "react";

export function MediaGhost({
  ready,
  children,
}: {
  ready: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden"
      aria-busy={!ready}
    >
      {!ready && <div className="media-ghost absolute inset-0" aria-hidden="true" />}
      <div className="w-full" style={{opacity: ready ? 1 : 0}}>
        {children}
      </div>
    </div>
  );
}
