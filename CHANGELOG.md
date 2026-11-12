# Changelog

## v1.3.0 – Poke harder (2026-11-12)

- Added a poke counter and a five-segment patience meter, with Calm → Meltdown moods
- Rapid pokes (within 1.8s) build a streak; patience refills once you stop
- The potato now talks: reaction speech bubbles float up and fade
- Gave the potato a wobbly, hand-drawn silhouette instead of a plain oval
- Redrew every face: brows that tilt with anger, layered glossy eyes, blush, teeth, tongues
- Each style got its own sprout, plus freckles and blemishes placed clear of the face
- Steam puffs and a twitchy sway appear when the potato loses its temper
- The small potato now has eyes that follow you and a faint sparkle trail
- Added drifting background motes in both light and dark moods

## v1.2.0 – Standalone potato (2026-11-12)

- Restored the missing canvas engine (the four art styles, poke reaction, particles, and gaze)
- Removed all generated app-builder scaffolding, platform hooks, and build artifacts
- Replaced the platform-specific PWA/OG middleware with a plain `manifest.webmanifest`
- Added a proper potato app icon, social cards, and an MIT license
- Pruned unused dependencies and simplified the Vite, TypeScript, and ESLint configs
- Kept the little potato on screen when poked near an edge
- Moved the hint text into the DOM so it respects safe-area insets
- Kept the v1.1.0 mobile polish: DPR up to 3, haptics, 44px touch targets, particle cap

## v1.1.0 – Mobile / Redmi polish (2026-11-12)

- Sharper canvas on high-DPI screens (DPR up to 3)
- Better layout on tall phones + safe-area / notch handling
- Larger style buttons, improved touch tracking
- Haptic feedback on poke (where supported)
- Particle limit for smoother performance on mid-range devices
- Disabled overscroll / pull-to-refresh
- Viewport tuned for game-like experience (`user-scalable=no`, `viewport-fit=cover`)

## v1.0.0 – Initial

- Four art styles (Soft, Pixel, Sticker, Ink)
- Interactive hanging potato + little potato cursor
