<div align="center">

# Poke the Potato

**A tiny, slightly grumpy canvas toy.**

Move the little potato. Poke the big one. Watch the eyebrows happen.

[![MIT License](https://img.shields.io/badge/license-MIT-C4965E?style=flat-square)](LICENSE)
[![React 19](https://img.shields.io/badge/react-19-C4965E?style=flat-square)](https://react.dev)
[![Built with Vite](https://img.shields.io/badge/built%20with-Vite-C4965E?style=flat-square)](https://vite.dev)
[![TanStack Start](https://img.shields.io/badge/TanStack-Start-C4965E?style=flat-square)](https://tanstack.com/start)

```text
      .-"""-.
     /  . .  \
    |  (o o)  |     <- the big one (do not poke)
     \  \_/  /
      `-----'
         |
         |
        \|/
```

</div>

---

![Soft style](public/screenshots/styles-soft.png)

## Once upon a potato

There is a large potato. It hangs from a string and minds its own business.

There is a small potato. It is you, basically.

Move the small one toward the big one, then click (or tap) when you are close. The big one
becomes dramatically upset for a moment, which is the entire point. It calms down. You can do it
again. This is a complete game loop, and we stand by it.

## Four moods, one potato

Every style is drawn on a single `<canvas>` by hand — no sprite sheets, no image loading, no
waiting. Switching moods is instant, and the whole potato is redrawn every frame.

<table>
  <tr>
    <td align="center" width="50%">
      <img src="public/screenshots/styles-soft.png" alt="Soft style" width="100%" />
      <br />
      <b>Soft</b><br />
      Warm, buttery, gently shaded.
    </td>
    <td align="center" width="50%">
      <img src="public/screenshots/style-pixel.png" alt="Pixel style" width="100%" />
      <br />
      <b>Pixel</b><br />
      Chunky blocks and quiet nostalgia.
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <img src="public/screenshots/style-sticker.png" alt="Sticker style" width="100%" />
      <br />
      <b>Sticker</b><br />
      Thick outlines, zero regrets.
    </td>
    <td align="center" width="50%">
      <img src="public/screenshots/style-ink.png" alt="Ink style" width="100%" />
      <br />
      <b>Ink</b><br />
      Wobbly lines on warm paper.
    </td>
  </tr>
</table>

## How to play

| You want to…       | Mouse                  | Finger                |
| ------------------ | ---------------------- | --------------------- |
| Move the small one | Move the cursor        | Drag                  |
| Poke the big one   | Click when you're near | Tap when you're close |
| Change the mood    | Tap a style pill       | Tap a style pill      |

The big potato only reacts when the little one is within poking distance. It has boundaries. It
also has a flash, a puff of particles, and a short haptic buzz on supported phones.

## Keeping score

The counter in the corner is not decorative. Every poke is counted, and the five-segment meter
above it tracks the potato's patience:

| Mood       | What it means                                      |
| ---------- | -------------------------------------------------- |
| Calm       | All five segments. Fresh potato, fresh start.       |
| Wary       | One poke in. It noticed you.                        |
| Annoyed    | Two in a row. The eyebrows are doing something.     |
| Furious    | Three. Steam is now canonically part of the design. |
| Meltdown   | Four or more. Speech bubbles turn honest.           |

Pokes within about **1.8 seconds** of each other count as a streak. Stop poking, and the meter
slowly refills on its own. The potato is forgiving, eventually.

## Little details

- The big potato is not a perfect oval — its silhouette wobbles through 44 hand-placed points, so no two frames are quite alike.
- Each of the four moods has its own sprout, shading, and facial features, including brows that tilt further with every poke.
- Pokes spawn a speech bubble ("eep!", "rude!", "stop it!", "I'm a potato!") that floats up and fades.
- Past three pokes, steam puffs rise from the potato and the swaying gets twitchy.
- The small potato watches your cursor, leaves a faint sparkle trail when it moves, and has its own tiny face.
- Warm background motes drift upward in every mood, subtle on paper styles, brighter on the dark ones.
- Everything is drawn per frame on a single canvas — no sprite sheets, no images, no loading spinner.

## Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:8080> for the landing page, or go straight to
<http://localhost:8080/play> to poke the potato. The dev server is bound to `0.0.0.0:8080`, so you
can also open it from your phone on the same network.

## Build it

```bash
npm run build
```

The default build targets Vercel through Nitro. For a plain Node server instead:

```bash
NITRO_PRESET=node-server npm run build
node .output/server/index.mjs
```

## Small screens, big feelings

This toy was tuned on a Redmi-class Android phone, because that is where potatoes are poked most:

- Canvas resolution follows `devicePixelRatio` up to **3×**, so the edges stay crisp.
- `visualViewport` and `ResizeObserver` keep the stage sized when the browser bars slide around.
- `env(safe-area-inset-*)` keeps the style pills and the hint out of notches and home bars.
- Style pills are **44px tall** — friendly to thumbs.
- A short vibration on poke, where the browser supports it.
- Particles are capped at **80**, because mid-range phones deserve smooth potatoes too.
- Overscroll, pull-to-refresh, text selection, and double-tap zoom are switched off.

## The potato map

```text
src/
  components/PotatoStage.tsx   the whole toy: four art styles, poke physics, particles
  routes/__root.tsx            document shell, social cards, PWA links
  routes/index.tsx             the landing page
  routes/play.tsx              the game itself
  lib/error-component.tsx      a graceful "oops" screen
  router.tsx                   TanStack Router setup
  styles.css                   page reset and game-mode scroll rules
public/
  manifest.json                installable web app manifest
  icon.png                     the potato in app-icon form
  favicon.svg                  the potato in tiny form
  og.jpg, x-banner.jpg         social preview cards
public/screenshots/            the four moods, a clean hero, and a phone-sized potato
```

## Scripts

| Command             | What it does                                |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Start the dev server on `0.0.0.0:8080`      |
| `npm run build`     | Production build (Vercel preset by default) |
| `npm run preview`   | Preview the production build                |
| `npm run typecheck` | TypeScript, no output                       |
| `npm run lint`      | ESLint                                      |
| `npm run format`    | Prettier                                    |

## License

MIT — see [LICENSE](LICENSE).

<div align="center">

Made with warm brown pixels.<br />
No potatoes were harmed; one was mildly inconvenienced.

</div>
