This is the open-source code of my portfolio.

You can view my portfolio at [alexbriscallbowker.com](https://alexbriscallbowker.com)

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Use Node.js 22.12 or later. Install both the portfolio and Studio dependencies:

```bash
npm ci
npm ci --prefix cms
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open the Portfolio URL printed in your terminal. `npm run dev` starts both the
portfolio and Sanity Studio on available ports. In Conductor it uses the workspace's
allocated `CONDUCTOR_PORT` range; elsewhere it searches from ports 3000 and 3333,
skipping ports already in use.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
