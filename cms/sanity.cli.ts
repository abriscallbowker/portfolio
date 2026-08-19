import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'hznmqs29',
    dataset: 'production',
  },
  studioHost: 'alex-briscall-bowker',
  deployment: {
    appId: 'v7htq1mkr4kss0al0zxab7u9',
    autoUpdates: true,
  },
  typegen: {
    enabled: true,
    path: '../app/**/*.{ts,tsx}',
    schema: 'schema.json',
    generates: '../sanity.types.ts',
  },
})
