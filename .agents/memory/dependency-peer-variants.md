---
name: Dependency peer variants
description: Same-version Drizzle type conflicts caused by distinct dependency peer resolutions.
---

SQL builders, schema objects and the database client must resolve to the same Drizzle package instance across workspace packages.

**Why:** Adding Firebase introduced OpenTelemetry peer dependencies. pnpm then resolved two instances of the same Drizzle version with different peer sets; their private SQL types were incompatible even though their version numbers matched.

**How to apply:** Compare resolved peer variants before changing query logic or upgrading Drizzle to address a SQL type error. Keep database operators and schema consumers on a consistent instance.
