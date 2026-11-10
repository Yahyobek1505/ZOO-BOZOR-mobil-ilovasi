---
name: Expo web startup animations
description: Reanimated entering effects can make Expo web's server-rendered loading screen invisible.
---

Avoid `entering` layout animations on the only visible element of Expo web's initial font-loading screen. Server rendering may emit it with `visibility: hidden` until hydration starts the animation, leaving a blank preview. Render the logo visibly and animate only its rotation; keep text entrance effects secondary.

**Why:** The preview repeatedly showed a blank white root while the directly routed screens rendered. The root was still displaying the server-rendered loading screen, whose entrance animation hid its contents.

**How to apply:** When changing app startup or font-loading behavior in Expo web, inspect the server-rendered root and keep one static visible fallback until fonts and route hydration finish.
