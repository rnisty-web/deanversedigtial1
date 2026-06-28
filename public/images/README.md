# Brand image assets

Copy your existing image files into this folder. **Do not commit placeholder SVGs** — use your real brand assets.

## Required files

| File | Purpose | Referenced in |
|------|---------|---------------|
| `deanverse-digital-logo.svg` | Primary logo (sharp at all sizes) | Header, footer, auth, admin, portal |
| `deanverse-digital-logo.png` | PNG fallback + Open Graph / social previews | JSON-LD, `ogImage`, SVG fallback |
| `image0.png` | Profile / headshot photo | About page, hero, testimonials |
| `background.png` | Full-page background texture | `BackgroundLayer` site-wide backdrop |

## Logo setup

1. Save your SVG as **`public/images/deanverse-digital-logo.svg`**
2. Keep the PNG at **`public/images/deanverse-digital-logo.png`** (already added)
3. Paths are configured in `src/lib/constants.ts`:

```ts
assets: {
  logo: "/images/deanverse-digital-logo.svg",
  logoRaster: "/images/deanverse-digital-logo.png",
  profile: "/images/image0.png",
  background: "/images/background.png",
}
```

The site uses the SVG everywhere via `BrandLogo`. If the SVG is missing, it automatically falls back to the PNG.

## Recommended specs

- **deanverse-digital-logo.svg** — vector logo, transparent background preferred
- **deanverse-digital-logo.png** — at least 800×1000 px for the full lockup
- **image0.png** — square or portrait crop, at least 800×800 px
- **background.png** — wide landscape (e.g. 1920×1080 or larger), optimized for web

After adding files, restart the dev server if images do not appear immediately.
