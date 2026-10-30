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

The portfolio starts at port 3000 and Sanity Studio at port 3333. If a port is in use, each server increments to the next available port and prints its selected port in the terminal. This also applies when running `npm run dev:app`, `npm run dev:studio`, or `npm run dev --prefix cms` separately.

Open the portfolio URL printed in the terminal (normally [http://localhost:3000](http://localhost:3000)) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
