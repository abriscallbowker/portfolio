export const site = {
  name: "Alex BB",
  fullName: "Alex Briscall Bowker",
  description: "Writing about product design, creativity, and more.",
  url: "https://alexbowker.com",
  profileImage: "/headshot.webp",
  favicon: "/favicon.png",
  ogImage: "https://alexbowker.com/cover.jpg",
};

export type ExperienceItem = {
  duration: string;
  role: string;
  company: string;
  logo: string;
  href?: string;
  tooltip?: string;
};

export const experience: ExperienceItem[] = [
  {
    duration: "2024 — NOW",
    role: "Founder",
    company: "Visual Binary",
    tooltip: "my own product studio",
    logo: "https://framerusercontent.com/images/VJVHJAn4h1R6CjRW6a5opRCWSC0.jpg",
  },
  {
    duration: "2021 — 2024",
    role: "Product Designer",
    company: "Caura",
    href: "https://caura.com",
    logo: "https://framerusercontent.com/images/gephjMx5QJWY7xkK7eoAYFqGe0.jpg",
  },
  {
    duration: "2019 — 2020",
    role: "Product Manager",
    company: "JPMorgan",
    href: "https://jpmorgan.com",
    logo: "https://framerusercontent.com/images/2Vbio6TdswrHOQTht4K9Kxbcx8I.jpg",
  },
];

export const personalPhotos = [
  {
    src: "/about/xlr.webp",
    alt: "XLR",
    className: "left-[-40px] top-0 z-[1]",
    rotate: -8,
  },
  {
    src: "/about/kilimanjaro.webp",
    alt: "Kilimanjaro",
    className: "left-[125px] top-[-8px] z-[2]",
    rotate: 5,
  },
  {
    src: "/about/manchester-half.webp",
    alt: "Manchester Half Marathon",
    className: "left-[291px] top-[-40px] z-[3]",
    rotate: -6,
  },
  {
    src: "/about/mont-blanc.webp",
    alt: "Mont Blanc",
    className: "left-[456px] top-[-4px] z-[4]",
    rotate: 4,
  },
];

export const music = {
  title: "Easy 2 Luv U",
  artist: "Noise Complaint",
  date: "Feb 12, 2025",
  href: "https://soundcloud.com/noisecomplaintdj/easy2luvu",
  cover:
    "https://framerusercontent.com/images/wJKpgXMwrFjIKU9164o086U9lI.webp",
  note: "In my spare time, I enjoy producing music.",
  arrow:
    "https://framerusercontent.com/images/Z0oJ97B597URbZB5uXMnL0SJoE.svg",
};

export const socials = [
  {
    title: "Email",
    handle: "alex@visualbinary.com",
    href: "mailto:alex@visualbinary.com",
    icon: "email" as const,
  },
  {
    title: "X.com",
    handle: "@alexbbowker",
    href: "https://x.com/alexbbowker",
    icon: "x" as const,
  },
  {
    title: "GitHub",
    handle: "@abriscallbowker",
    href: "https://github.com/abriscallbowker/",
    icon: "github" as const,
  },
  {
    title: "LinkedIn",
    handle: "/in/abriscallbowker",
    href: "https://www.linkedin.com/in/abriscallbowker/",
    icon: "linkedin" as const,
  },
];
