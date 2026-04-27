# Artificial Intelligence — Landing Page

A modern, responsive AI landing page with a futuristic blue/purple aesthetic, a canvas-rendered neural network "brain", animated lens flares, mouse parallax, and polished entrance transitions. Inspired by the provided reference design.

## Quick start

The project is plain HTML / CSS / JS — there is no build step.

Pick any one of the following to serve the folder over HTTP (recommended over `file://` so the page behaves like in production):

```bash
# Python 3
python3 -m http.server 5173

# Node (npx)
npx serve .

# PHP
php -S localhost:5173
```

Then open: <http://localhost:5173>

You can also just double-click `index.html` to open it directly in a browser — everything will work, but module-style features and some browsers' service-worker behavior expect a real server.

## File structure

```
Kaia Landing/
├── index.html            # Semantic markup, Three.js importmap, hero, nav, mobile menu
├── styles/
│   └── main.css          # Design tokens, layout, CSS bokeh background, responsive, reduced-motion
├── scripts/
│   ├── main.js           # Mobile menu, mouse parallax for the bokeh field
│   └── brain.js          # Three.js 3D brain: wireframe icosphere + bloom postprocessing
└── README.md
```

Three.js is loaded directly from a CDN via an `<script type="importmap">` in `index.html`, so there's no build step. The first load fetches `three.module.js` plus the postprocessing addons.

## Design choices

**Color & atmosphere.** The page sits on a deep navy outer canvas (`#061454`) with a brighter inner "card" — a multi-layer radial + linear gradient from `#1f3bd6` through `#2a52ff` into `#59b6ff`. The card uses long-cycle background-position animation (`cardShift`, 26s) so the gradient slowly breathes. Five blurred radial blobs and two pseudo-element flares drift around as soft lens reflections, blended with `mix-blend-mode: screen` so they feel like real light.

**Typography.** Inter (300/400/500/600/800) was chosen for its modern geometric character and excellent screen rendering. The hero combines an extrabold "Artificial intelligence" headline with a light-weight "landing page" subtitle, with negative letter-spacing on the headline and wide tracking on the nav and CTA — matching the reference.

**Neural network visual (Three.js).** A real 3D scene rendered into the hero's `<canvas>`. The "brain" is a `THREE.Group` containing: an `IcosahedronGeometry(1.25, 3)` rendered as `LineSegments` (the polygonal wireframe), a `Points` mesh at the same vertices using a canvas-generated radial-gradient sprite for soft glowing dots, a slightly larger ghost wireframe rotating in the opposite direction for internal parallax, and a custom-shader `BackSide` sphere providing a Fresnel-style atmospheric rim glow. The whole group rotates slowly on Y, bobs on X, and tilts toward the cursor with a damped lerp. An `EffectComposer` pipeline runs `RenderPass → UnrealBloomPass → OutputPass` to give every bright pixel that cinematic bloom — strength `0.85`, radius `0.55`, threshold `0`. Renderer is transparent (`alpha: true`, clear alpha `0`) so it composites cleanly over the CSS card. Pixel ratio is clamped to 2 for retina sharpness without killing mobile perf. The big white `Ai` glyph sits on top via CSS so it stays crisp text, not a 3D mesh.

**Animation system.** Pure CSS for entrance transitions (staggered "rise" keyframe via `.line--1..5` delays) and ambient motion (gradient/blob floats). JS handles only the things CSS can't do well — pointer parallax with eased smoothing (`lerp` toward target at `0.05`) and the canvas. No external animation libraries — keeps the bundle tiny and the page fast on mobile.

**Mobile menu.** A semantic `<aside>` with `aria-hidden` toggling, slide-in from the left, full-page backdrop, ESC-to-close, focus moved to the first link on open and back to the hamburger on close.

**Accessibility.** Semantic landmarks (`header`, `nav`, `main`, `aside`), ARIA labels on the menu button (`aria-expanded`, `aria-controls`, `aria-label`), visible focus rings via `:focus-visible`, keyboard-operable everywhere, and a `prefers-reduced-motion` block that flattens animation durations and renders the canvas as a single static frame.

**Responsive strategy.** Two-column hero on desktop / wide tablet, collapsing to a single column at `980px` with the AI visual moved above the text via `order: -1`. Sizes use `clamp()` so type and spacing scale fluidly. `overflow-x: hidden` on `html, body` plus `100dvh` on the menu prevents horizontal scroll and mobile-browser-bar jumpiness.

## Customizing

- **Colors:** edit the `:root` custom properties at the top of `styles/main.css`.
- **Copy:** all hero text lives in the `.hero__text` block in `index.html`.
- **Brain density:** change the second argument to `IcosahedronGeometry(radius, detail)` in `scripts/brain.js` — `detail: 2` is sparser, `detail: 4` is denser.
- **Bloom:** tweak `UnrealBloomPass` arguments in `scripts/brain.js` — strength, radius, threshold.
- **Brain colors:** edit the `LineBasicMaterial` colors and the `uColor` uniform on the atmosphere shader in `scripts/brain.js`.

## Browser support

Tested in evergreen Chrome, Safari, and Firefox. Uses widely-supported features only (custom properties, `clamp()`, `IntersectionObserver`, `mix-blend-mode`, `aspect-ratio`).
