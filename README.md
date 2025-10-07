<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" aria-label="TopStone mark">
  <defs>
    <style>
      :root { --ts-bronze: #B08968; }
    </style>
  </defs>
  <!-- Slab plate -->
  <rect x="20" y="20" width="200" height="200" rx="24" fill="#0B0B0C"/>
  <!-- Transcend cut (bevel) -->
  <path d="M220 95 L95 220 L220 220 Z" fill="var(--ts-bronze)"/>
  <!-- T (negative carve) -->
  <rect x="64" y="60" width="112" height="18" fill="#F3F2EF"/>
  <rect x="112" y="78" width="16" height="88" fill="#F3F2EF"/>
  <!-- S (negative carve) -->
  <path d="M152 176c0 14-12 24-32 24-18 0-32-7-40-18l14-10c6 7 15 12 26 12 10 0 16-3 16-8 0-5-5-8-20-11-24-5-38-13-38-30 0-16 15-28 38-28 18 0 31 6 39 16l-14 10c-6-7-15-10-25-10-12 0-18 4-18 10 0 5 6 8 22 11 22 5 36 12 36 30Z" fill="#F3F2EF"/>
</svg>


<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 220" aria-label="TopStone logotype">
  <!-- Icon -->
  <g transform="translate(0,0) scale(0.9)">
    <rect x="20" y="20" width="200" height="200" rx="24" fill="#0B0B0C"/>
    <path d="M220 95 L95 220 L220 220 Z" fill="#B08968"/>
    <rect x="64" y="60" width="112" height="18" fill="#F3F2EF"/>
    <rect x="112" y="78" width="16" height="88" fill="#F3F2EF"/>
    <path d="M152 176c0 14-12 24-32 24-18 0-32-7-40-18l14-10c6 7 15 12 26 12 10 0 16-3 16-8 0-5-5-8-20-11-24-5-38-13-38-30 0-16 15-28 38-28 18 0 31 6 39 16l-14 10c-6-7-15-10-25-10-12 0-18 4-18 10 0 5 6 8 22 11 22 5 36 12 36 30Z" fill="#F3F2EF"/>
  </g>

  <!-- Wordmark + tagline -->
  <g transform="translate(235,40)">
    <text x="0" y="60" font-family="Cinzel, 'Cormorant Garamond', serif" font-size="64" letter-spacing="2" fill="#0B0B0C">
      TOPSTONE
    </text>
    <text x="0" y="110" font-family="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
          font-size="18" letter-spacing="2.5" fill="#6B7280">
      Superficies que trascienden
    </text>
  </g>
</svg>


:root{
  --ts-ink:#0B0B0C;
  --ts-bone:#F3F2EF;
  --ts-bronze:#B08968;
}
.logo--bronze { color: var(--ts-bronze); fill: var(--ts-bronze); }


love the slogan choice. here’s a logo concept that fits TopStone — “Superficies que trascienden” and looks premium on web, print, and etched on stone.

Concept (clean + timeless)

Monogram + wordmark. A chiselled “TS” monogram inside a subtle slab silhouette with a diagonal “transcend” cut. It suggests a large-format tile and the idea of rising beyond the surface.

Shapes: square/portrait slab with a 12–15° diagonal bevel slicing upward; negative-space forms the T and S.

Vibe: architectural, luxe, minimal—works as an icon, watermark, or emboss.

Palette

Charcoal: #0B0B0C (primary for text/icons)

Bone: #F3F2EF (light background)

Bronze accent: #B08968 (subtle highlight, CTAs)

White: #FFFFFF (reverse lockup)

Type pairing

Wordmark: Cinzel (or Cormorant Garamond if you prefer softer serifs). Uppercase with a bit of tracking for stone-brand elegance.

Tagline: Inter (medium), letter-spaced to breathe under the wordmark.

Lockups

Horizontal: [Icon] — TOPSTONE ⏎ “Superficies que trascienden”

Stacked: Icon above, then TOPSTONE, then the tagline

Icon-only: The TS monogram for favicon/social/engraving

Clearspace & sizing

Clearspace = height of the T (one “T-unit”) all around.

Minimum sizes:

Icon-only: 16 px (favicon), 24 px UI

Full lockup with tagline: 120 px width (web), 35 mm (print)

SVG — Icon-only monogram (ready to drop in /assets/logo_topstone-mark.svg)

Pure vector, no fonts. Bronze variant included via a CSS var.

SVG — Horizontal lockup (icon + wordmark + tagline)

Uses system/Google fonts. If you want this 100% vector, I can convert to outlines next.

Usage on your site

Header (light background): use the charcoal icon + black wordmark; tagline optional in navbar (keep it on hero instead).

Hero on photo/dark: use white/bronze reverse: change #0B0B0C to #FFFFFF and #F3F2EF to #0B0B0C, or simply add filter: invert(1) for the icon.

Engraving/etching: use single-color mark (all #0B0B0C or all white). The monogram works at 1-color without losing recognition.

Drop-in CSS tokens (match your site)
:root{
  --ts-ink:#0B0B0C;
  --ts-bone:#F3F2EF;
  --ts-bronze:#B08968;
}
.logo--bronze { color: var(--ts-bronze); fill: var(--ts-bronze); }

What I can do next

Convert the wordmark + tagline to outlines (SVG paths) so it renders identically everywhere.

Provide a stacked variant and favicon (16/32/48/512).

Generate dark/light/mono export set and a tiny brand sheet PDF.

If you want me to tweak the monogram angles or make the “S” more geometric (less calligraphic), say the word and I’ll adjust + send outlined SVGs.