"use client";

import {useGreetingReveal} from "@/components/greeting-reveal";
import {useReducedMotion} from "motion/react";
import {useEffect, useState} from "react";

const NAME = "I'm Alex BB.";

export const greetingReveal = {
  stagger: 0.05,
  duration: 0.4,
} as const;

function greetingForHour(hour: number) {
  if (hour >= 4 && hour < 12) return "Good morning,";
  if (hour >= 12 && hour < 17) return "Good afternoon,";
  return "Good evening,";
}

function greetingLine(greeting: string) {
  return greeting ? `${greeting} ${NAME}` : "";
}

function greetingRevealMs(length: number) {
  if (length === 0) return 0;
  return ((length - 1) * greetingReveal.stagger + greetingReveal.duration) * 1000;
}

export function Greeting() {
  const {played, complete} = useGreetingReveal();
  const [skipIntro] = useState(played);
  const reduceMotion = useReducedMotion();
  const [greeting, setGreeting] = useState(() =>
    skipIntro ? greetingForHour(new Date().getHours()) : "",
  );

  useEffect(() => {
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);

  useEffect(() => {
    if (skipIntro) return;

    const line = greetingLine(greeting);
    if (!line) return;

    if (reduceMotion) {
      complete();
      return;
    }

    const id = window.setTimeout(complete, greetingRevealMs(line.length));
    return () => window.clearTimeout(id);
  }, [complete, greeting, reduceMotion, skipIntro]);

  const line = greetingLine(greeting);
  const reveal = Boolean(line && !skipIntro && !reduceMotion);

  return (
    <p className="min-h-6 text-body-md text-ink">
      {reveal ? (
        <span className="greeting" aria-label={line}>
          {line.split("").map((character, index) => (
            <span
              className="greeting__character"
              aria-hidden="true"
              key={`${character}-${index}`}
              style={{
                animationDelay: `${index * greetingReveal.stagger}s`,
              }}
            >
              {character === " " ? "\u00A0" : character}
            </span>
          ))}
        </span>
      ) : (
        <span>{line}</span>
      )}
    </p>
  );
}
