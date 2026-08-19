const BLURS = [0.25, 0.5, 1, 2, 4, 8, 16, 32] as const;
const STEP = 100 / BLURS.length;

function maskImage(index: number) {
  const start = index * STEP;
  const mid1 = (index + 1) * STEP;
  const mid2 = (index + 2) * STEP;
  const end = (index + 3) * STEP;

  if (index === BLURS.length - 1) {
    return `linear-gradient(to bottom, rgba(0, 0, 0, 0) ${start}%, rgba(0, 0, 0, 1) 100%)`;
  }

  if (index === BLURS.length - 2) {
    return `linear-gradient(to bottom, rgba(0, 0, 0, 0) ${start}%, rgba(0, 0, 0, 1) ${mid1}%, rgba(0, 0, 0, 1) 100%)`;
  }

  return `linear-gradient(to bottom, rgba(0, 0, 0, 0) ${start}%, rgba(0, 0, 0, 1) ${mid1}%, rgba(0, 0, 0, 1) ${mid2}%, rgba(0, 0, 0, 0) ${end}%)`;
}

function ProgressiveBlur({rotate}: {rotate?: boolean}) {
  return (
    <div
      className="progressive-blur"
      style={rotate ? {transform: "rotate(180deg)"} : undefined}
    >
      <div className="progressive-blur__inner">
        {BLURS.map((blur, index) => {
          const mask = maskImage(index);

          return (
            <div
              key={blur}
              style={{
                opacity: 1,
                position: "absolute",
                inset: 0,
                zIndex: index + 1,
                pointerEvents: "none",
                borderRadius: 0,
                maskImage: mask,
                WebkitMaskImage: mask,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function ViewportGlass() {
  return (
    <>
      <div className="progressive-blur-wrap progressive-blur-wrap--top">
        <ProgressiveBlur rotate />
      </div>
      <div className="progressive-blur-wrap progressive-blur-wrap--bottom">
        <ProgressiveBlur />
      </div>
    </>
  );
}

export function DisableViewportGlass() {
  return (
    <style>{`.progressive-blur-wrap{display:none!important}`}</style>
  );
}
