# Design System — pf-2.0-2026

## Fonts

| Role | Font | Weights |
|------|------|---------|
| Display / Headings | Averia Serif Libre | Light 300, Regular 400, Bold 700 |
| Body / UI | DM Sans | Regular 400, Medium 500, SemiBold 600 |

CSS vars: `--font-averia`, `--font-dm-sans`

## Type Scale

| Token | Size | Line Height | Tracking | Font | Usage |
|-------|------|-------------|----------|------|-------|
| display-hero | 36px | 44px | -1.44px | Averia Serif Libre | Hero "Hi! I'm Vinoy Varghese" |
| display-lg | 40px | 48px | -0.80px | Averia Serif Libre | Testimonials heading |
| heading-section | 36px | 44px | -0.72px | Averia Serif Libre | About Me section headings |
| heading-card | 28px | 36px | -0.56px | Averia Serif Libre | Case study card titles |
| body-page-desc | 20px | 30px | -0.20px | DM Sans Regular | Tab intro paragraphs |
| body-card | 19px | 28px | -0.19px | DM Sans Regular | Card subtitles, body text |
| body-hero-bio | 16px | 24px | -0.16px | DM Sans Regular | Hero bio paragraph |
| label-meta | 14px | 20px | — | DM Sans Medium | Meta tags (B2B · FinTech) |
| nav-tab | 16px | 20px | -0.16px | DM Sans Regular/SemiBold | Tab navigation pills |
| cta-link | 19px | 28px | -0.19px | DM Sans Medium | "View Case Study →" |
| footer-text | 18px | 24px | — | DM Sans Regular | Footer links |

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#ffffff` | Page background |
| `--color-text-primary` | `#000000` | Headlines, primary text |
| `--color-text-body` | `#757575` | Page desc paragraphs, card subtitles |
| `--color-text-bio` | `#636363` | Hero bio paragraph |
| `--color-text-muted` | `#888888` | Meta tags |
| `--color-text-inactive` | `#696969` | Inactive nav tabs |
| `--color-accent` | `#b48a42` | "View Case Study →" gold links |
| `--color-surface-warm` | `#f5eee2` | Active tab pill bg, CTA button text |
| `--color-surface-subtle` | `#f2f2f2` | Card image area backgrounds |
| `--color-surface-alt` | `#f0f0f0` | About Me section placeholders |
| `--color-surface-dark` | `#292929` | Book a Call button background |
| `--color-badge-latest` | `#f5e7ce` | "Latest" badge on newest card |
| `--color-border` | `#e6e6e6` | All card borders |
| `--color-divider` | `#d9d9d9` | Vertical divider (meta | date) |

## Layout Grid

```
Canvas width:    1440px
Content inset:   200px left + 200px right
Content width:   1040px
Hero Y:          265px from top
Tab nav Y:       795px from top
Content Y:       1060px from top
```

## Border Radius

| Context | Radius |
|---------|--------|
| Cards | 0 (sharp) |
| Tab pills | 60px |
| Book a Call button | 4px |
| Latest badge | 0 (sharp) |

## Spacing System

| Context | Value |
|---------|-------|
| Card internal padding H | 40px |
| Card internal padding T | 40px |
| Card internal padding B | 32px |
| Gap between cards (row) | 20px |
| Gap within card header | 24px |
| Gap between title/subtitle | 8px |
| Tab nav gap | 16px |
| Footer link gap | 20px |

## Component Patterns

### Tab Pill
- Active: `bg-[#f5eee2]` + DM Sans SemiBold + `text-black`
- Inactive: transparent + DM Sans Regular + `text-[#696969]`
- Padding: `px-6 py-3` (24px / 12px)
- Radius: `rounded-[60px]`

### Meta Tag Row
- Tags separated by 4px dot (`#888` filled circle, size 4px)
- Groups separated by 1px vertical divider (height 16px, `#d9d9d9`)
- All text: DM Sans Medium 14px `#888`

### Case Study Card
- Border: `1px solid #e6e6e6`
- Image bg: `#f2f2f2`
- "View Case Study →": DM Sans Medium 19px `#b48a42`
- Sharp corners throughout

### Latest Badge
- `bg-[#f5e7ce]`, position absolute top-right of card
- Padding: `px-4 py-[6px]`
- DM Sans Medium 14px

## Assets

```
assets/
├── work/
│   ├── fusepay-card-image.png
│   ├── connectandsell-card-image.png
│   ├── coditas-bg-gradient.png
│   ├── coditas-ui.png
│   ├── weekday-bg-texture.png
│   └── weekday-ui.png
├── ai-experiments/
│   ├── name-my-frame-screenshot.png
│   ├── mylos-adventures-screenshot.png
│   └── grok-ad-screenshot.png
├── playground/
│   └── (TBD — Figma rate limit during planning)
└── about-me/
    ├── hero-vinoy-photo.png
    ├── vinoy-portrait.png
    ├── testimonial-francesco-photo.png
    └── cta-bg-texture.png
```
