# Sanity Studio

Standalone Studio for the portfolio CMS. Content lives in the `production` dataset of project `3kp8xzok`.

```bash
cd cms
npm install
cp .env.example .env
# add SANITY_API_WRITE_TOKEN from Sanity manage, then:
npm run dev
```

Studio runs at http://localhost:3333.

To import writing from the Framer CSV:

```bash
npm run import:framer
```
