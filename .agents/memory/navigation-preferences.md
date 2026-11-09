---
name: Navigation preferences
description: User-approved scope for adapting the original Figma navigation and page-loading behavior.
---

Keep Figma as the visual baseline, but honor the user's explicit request for a premium, translucent bottom bar and a small oval “Eʼlon berish” button with a white megaphone and lime text on navy.

**Why:** The user supplied a button reference and requested these changes rather than an entirely new design.

**How to apply:** Preserve these intentional adaptations during later Figma-matching work.

Prioritize smooth navigation after the initial load over independently loading each browser route.

**Why:** The user specifically objected to seeing “Bundling” when entering each page. A somewhat larger initial development bundle is an intentional tradeoff.

**How to apply:** Do not restore route-by-route development loading without addressing the visible delays it introduces.

The map should occupy the whole screen, with circular animal-photo markers outlined in lime and a location button in the lower-right corner. Use Google Maps or Yandex Maps as the requested provider.

**Why:** The user supplied a full-screen map reference and explicitly requested Google Maps or Yandex Maps, not a small map above a listing feed.

**How to apply:** Preserve the edge-to-edge map beneath the floating navigation. Never present OpenStreetMap as if it were the requested provider.
