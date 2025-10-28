# LiveWindow — Overlay Enhancement Approach

This document outlines a pragmatic approach to adding a set of new, visually rich overlays to the LiveWindow project. The goal is to add them all as new overlay files rather than modifying existing overlays. Each overlay will be light-weight by default (CSS/Canvas) and optionally progressive-enhanced with WebGL/Three.js when available.

## New overlays to add
Each overlay will live in `LiveWindow/overlays/` as a single HTML file (with inline or companion CSS/JS). Filenames:

- `volumetric-fog.html` — layered fog with depth-simulating gradients and particle scattering (Canvas fallback)
- `volumetric-clouds.html` — multi-layer parallax clouds with noise-driven movement (Canvas or CSS)
- `enhanced-rain.html` — rain with ripple-on-impact and variable wind
- `compute-snow.html` — snow with per-flake physics and accumulation hinting
- `atmospheric-scatter.html` — dusk/dawn color shifts using gradient + light scattering simulation
- `floating-embers-v2.html` — improved embers with depth and bloom-like glow
- `particle-dust.html` — subtle drifting dust particles for interior scenes
- `swirling-leaves.html` — leaf sprites with swirling motion, collisions with edges
- `sunbeams.html` — light shafts with radial blur and soft edges

Each file will be a drop-in overlay that matches the project's overlay loading expectations (self-contained HTML fragment). We'll create skeletons first; advanced WebGL enhancements will be progressive and optional.

## Design constraints and decisions

- Non-destructive: Do not modify existing overlay files. Add new files only.
- Progressive enhancement: Start with CSS/Canvas implementations that work everywhere. Provide optional WebGL (Three.js) versions that are loaded only if the renderer is available (dynamic feature-detect and lazy load).
- Performance first: Keep default particle counts low and expose a data- attribute (e.g. `data-quality`) to scale density.
- Single-responsibility overlays: Each overlay handles only its visual effect and communicates with the host via a simple global API described below.

## Integration contract — how overlays communicate with LiveWindow

Overlays must be self-contained and follow these conventions so `displayService` can load them without modifications:

- The overlay HTML is an embeddable fragment that expects to be inserted into a container element by the `DisplayService`.
- Optional JS API: an overlay may expose a global function named `initOverlay(container, options)` which is called by the host if present. It should also expose `destroyOverlay()` to clean up timers, listeners and WebGL contexts.
- Attributes: overlays can read `data-quality`, `data-theme`, `data-seed` from their container element to tune behavior.

Example minimal JS contract (pseudocode):

```
// if present, LiveWindow will call initOverlay when overlay is shown
function initOverlay(container, options) {
  // create canvas or DOM nodes inside container
}

function destroyOverlay() {
  // remove listeners and free resources
}
```

## File template (skeleton)

Each overlay will use the same skeleton when first added. This keeps the repo consistent and reviewers focused on integration.

File: `LiveWindow/overlays/<overlay-name>.html`

Contents (skeleton):

- Minimal inline styles to ensure full-bleed visuals
- A root container element (e.g., `<div class="overlay-root" data-quality="medium"></div>`)
- A small inline script that defines `initOverlay` and `destroyOverlay` hooks

## displayService integration notes

We will not change existing overlay registrations. Instead, we will add the new overlay file paths to the same overlay list in `js/services/displayService.js`. If the project prefers not to touch that file, document the exact array to update in this `approach.md` file. The new overlays should be appended to the `overlays` array.

Suggested overlay array entries (paths relative to LiveWindow root):

```
'overlays/volumetric-fog.html',
"overlays/volumetric-clouds.html",
"overlays/enhanced-rain.html",
"overlays/compute-snow.html",
"overlays/atmospheric-scatter.html',
"overlays/floating-embers-v2.html',
"overlays/particle-dust.html",
"overlays/swirling-leaves.html",
"overlays/sunbeams.html",
```

If you prefer the path style used currently in the repository, use consistent quoting and ordering.

## Progressive enhancement: optional Three.js/WebGL

- Each overlay will check for `window.THREE` or attempt to lazy-load a local minimal Three.js build only when needed.
- Provide a small `overlay-common.js` helper (optional) that exports `loadScript(url)` and `supportsWebGL()` to gates WebGL features.

## Quality & performance knobs

- Use `data-quality` (low|medium|high) on the container element to scale particle counts.
- Respect `prefers-reduced-motion` media query and provide a still or minimal animation fallback.
- Use requestAnimationFrame loops and throttle on visibilitychange (pause when hidden).

## Testing & verification

Manual verification checklist:

1. Load each overlay using the existing overlay switcher and verify it renders full-bleed inside the host container.
2. Toggle `data-quality` and confirm visual density changes.
3. Open devtools -> Performance and ensure FPS remains acceptable (target > 45 on a mid-range laptop for medium quality).
4. Confirm `destroyOverlay()` frees resources (no retained timers or rAF after hiding).

Automated tests (suggested):

- Add a small Karma unit test that loads overlay HTML into a test container and asserts `initOverlay` is callable.
- Add a lightweight visual smoke test (Cypress or Puppeteer) that opens the page and snapshots the canvas element (optional).

## Minimal rollout plan

1. Create the skeleton overlay files in `LiveWindow/overlays/`.
2. Append overlay paths to the `overlays` array in `js/services/displayService.js` (or provide a short patch for maintainers to apply).
3. Add `overlays/overlay-common.js` helper and reference from skeletons.
4. Run manual QA, iterate on visuals.
5. Optionally add WebGL-enhanced variants behind a `data-webgl` flag.

## Next steps (developer actions)

1. Create overlay skeleton files (one commit).
2. Update `js/services/displayService.js` to register the new overlays (small commit) — do not remove or alter existing overlays.
3. Implement one progressive-enhanced overlay (e.g. `volumetric-fog.html`) to serve as a pattern for the others.
4. Add tests described above and create a PR with screenshots.

---

If you'd like, I can now create the skeleton overlay files and append the new overlay paths to `js/services/displayService.js` for you. Tell me which step to take next (create skeletons, update `displayService` paths, or implement the first overlay in full).
