# Creation Design & Events – Visual Theme Guide

A concise reference for the unified palette, typography, and UI tokens used across the site. Use these defaults to avoid color drift and keep the luxury feel consistent.

## Palette (Hex)
- Ivory (Background): `#FAF6F0`
- Soft Ivory (Surfaces): `#F3EDE4` / `#FFFFFF`
- Ink (Primary Text): `#1D2A39`
- Ink Soft (Secondary Text): `#3F5F47`
- Champagne Gold (Accent): `#D8C9A6`
- Accent Soft (Hover/Gradients): `#E5D8BD` / `#E8B8C8`
- Line/Border: `color-mix(in srgb, #D8C9A6 45%, transparent)` or `#E1D7C5`
- Support Accent: Forest Green `#3F5F47` for subtle highlights

### Usage
- Backgrounds: use Ivory (`var(--ts-bg)`) and Soft Ivory (`var(--ts-bg-soft)`). Avoid dark backgrounds unless a specific section requires contrast.
- Text: Ink for primary (`var(--ts-ink)`), Ink Soft for body/secondary (`var(--ts-ink-soft)`).
- Borders/Dividers: `var(--ts-line)`; keep subtle.
- Buttons/CTAs: Champagne Gold (`var(--ts-accent)`) base with slight darken on hover; text in Ink. Secondary buttons can use Ink outline on ivory background.
- Gradients: gold → gold-soft, e.g. `linear-gradient(135deg, #D8C9A6 0%, #E5D8BD 100%)`.
- Shadows: soft, cool-toned (`rgba(29,42,57,0.25–0.35)`), avoid harsh black.

## Typography
- Display/Headings: `Playfair Display` (or `Cormorant Garamond` as fallback).
- Body: `Inter` (or `Source Sans 3` fallback).
- Keep headings tight letter-spacing (-0.01 to -0.02em) and body at normal spacing.

## Tailwind/CSS Tokens
- Colors are mapped to CSS variables in `src/styles.scss` and exposed in Tailwind as `ts-*`:
  - `bg-ts-bg`, `bg-ts-bg-soft`, `text-ts-ink`, `text-ts-ink-soft`, `border-ts-line`, `bg-ts-paper`, `text-ts-accent`.
- Prefer using these tokens instead of hard-coded hex values.
- Buttons: use `bg-gradient-to-r from-ts-accent to-ts-accent-soft text-ts-ink` with rounded corners and soft shadow.

## Do / Don’t
- Do keep sections light and airy; only use dark overlays on images for readability.
- Do keep gold as the primary CTA color; use green accents sparingly.
- Don’t mix in the old Bitcoin orange or dark gradients; they clash with the new luxury palette.
- Don’t introduce new bright colors without review; stay within the ivory/gold/ink/green family.

## Components to Align
- Navbar, buttons, and cards should use the tokenized colors above.
- Forms: white/ivory surfaces, Ink text, gold focus ring (`focus:ring-ts-accent`).
- Badges/eyebrows: gold background at ~20% opacity with Ink text.

## Quick Checklist
- Replace any stray `#f7931a` or dark UI backgrounds.
- Use `ts-*` classes/variables for new sections.
- Verify contrast: Ink on Ivory and Ivory on Gold both pass AA for body text.

## Contrast Guidance (Practical Pairings)
- Text: use `text-ts-ink` on `bg-ts-bg` / `bg-ts-paper`; for secondary, `text-ts-ink-soft` on the same backgrounds.
- Buttons/CTAs: `from-ts-accent to-ts-accent-soft` backgrounds with Ink text; avoid gold text on ivory for body copy (too low contrast).
- Overlays on photos: keep a dark overlay (Ink at ~70–80% opacity) and place light/ivory text on top.
- Avoid: light-on-light (gold on ivory) except for very large decorative headings; avoid reintroducing old orange or heavy dark gradients.
