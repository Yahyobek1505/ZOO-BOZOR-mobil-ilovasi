---
name: Figma asset downloads
description: Prevent empty design assets from being treated as successfully downloaded.
---

Validate nonempty bytes and image format before handing downloaded Figma assets to UI implementation.

**Why:** In this environment, Python urllib downloads returned without an error but produced empty files for Figma MCP asset URLs. Curl retrieved the actual image bodies.

**How to apply:** Prefer curl for these URLs and verify file sizes or format after download. Do not interpret successful transport or a populated asset manifest as proof that the actual images exist.
