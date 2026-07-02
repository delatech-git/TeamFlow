// NOTE: We intentionally do NOT `import { defineConfig } from "prisma/config"`.
// In some deploy environments (e.g. Render) the Prisma CLI loads this config
// file from a context where `prisma/config` is not resolvable, causing:
//   "Failed to load config file ... Cannot find module 'prisma/config'".
// Exporting a plain object avoids that module-resolution issue entirely.
// See https://github.com/prisma/prisma/issues/28607

// Load .env for local dev; on Render env vars are injected natively
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("dotenv").config();
} catch {}

export default {
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
};
