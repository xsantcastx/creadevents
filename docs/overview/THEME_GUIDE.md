# Theme Guide

## ⚠️ CRITICAL: LIGHT GRAY THEME

**IMPORTANT:** This project uses **LIGHT GRAY, NOT DARK GRAY**

When creating new sections or components, **ALWAYS** use light backgrounds with dark text.

---

## Correct Colors

```scss
// ✅ CORRECT - Light theme
background-color: #f5f5f5;  // Light gray background
background-color: #ffffff;  // White
color: #333333;             // Dark text
border: 1px solid #e0e0e0; // Light gray border

// ❌ WRONG - Don't use these!
background-color: #1a1a1a;  // Too dark!
background-color: #2a2a2a;  // Too dark!
color: #ffffff;             // Light text (wrong for main theme)
```

---

## Tailwind Classes

### Background Colors

```html
<!-- Use these -->
<div class="bg-ts-bg">          <!-- Light gray background -->
<div class="bg-ts-bg-soft">     <!-- Softer light background -->
<div class="bg-ts-paper">       <!-- White/card background -->
<div class="bg-white">          <!-- Pure white -->
```

### Text Colors

```html
<!-- Use these -->
<p class="text-ts-ink">         <!-- Dark text (primary) -->
<p class="text-ts-ink-soft">    <!-- Medium dark (secondary) -->
<h1 class="text-luxury-gold">   <!-- Gold accent -->
```

### Borders

```html
<!-- Use these -->
<div class="border border-ts-line">  <!-- Light gray border -->
```

---

## Theme Variables

```javascript
// tailwind.config.js
colors: {
  ts: {
    bg: "var(--ts-bg)",           // Light background
    'bg-soft': "var(--ts-bg-soft)", // Softer light
    ink: "var(--ts-ink)",         // Dark text
    'ink-soft': "var(--ts-ink-soft)", // Medium text
    accent: "var(--ts-accent)",   // Accent color
    line: "var(--ts-line)",       // Border color
    paper: "var(--ts-paper)"      // Card background
  },
  luxury: {
    gold: '#d4af37',     // Luxury gold
    silver: '#c0c0c0',   // Luxury silver
    bronze: '#cd7f32',   // Luxury bronze
  },
  bitcoin: {
    orange: '#f7931a',   // Bitcoin orange (accents only)
    gold: '#ffb81c',     // Gold accent
    // 'dark' colors only for Bitcoin-themed elements!
  }
}
```

---

## Font System

```html
<!-- Headings (luxury feel) -->
<h1 class="font-serif">Playfair Display</h1>

<!-- Body text (modern, readable) -->
<p class="font-sans">Inter</p>
```

---

## Component Example

```html
<!-- ✅ CORRECT Light Theme Component -->
<section class="bg-ts-bg text-ts-ink py-16">
  <div class="container mx-auto">
    <h1 class="font-serif text-luxury-gold text-4xl mb-6">
      Luxury Products
    </h1>
    <div class="bg-ts-paper border border-ts-line rounded-lg p-6 shadow-soft">
      <p class="text-ts-ink-soft font-sans">
        Beautiful light-themed card content...
      </p>
    </div>
  </div>
</section>
```

```html
<!-- ❌ WRONG Dark Theme (Don't do this!) -->
<section class="bg-bitcoin-dark text-white py-16">
  <div class="container mx-auto">
    <h1 class="text-white">This is wrong!</h1>
    <p>Don't use dark backgrounds for main sections!</p>
  </div>
</section>
```

---

## When to Use Dark Colors

**ONLY for Bitcoin-themed elements:**

```html
<!-- Bitcoin-specific sections (rare) -->
<div class="bg-bitcoin-dark text-bitcoin-gold">
  <p>Bitcoin payment integration info...</p>
</div>
```

**Default to light theme everywhere else!**

---

## Quick Reference

| Element | Use | Don't Use |
|---------|-----|-----------|
| Main backgrounds | `bg-ts-bg`, `bg-white` | `bg-bitcoin-dark` |
| Card backgrounds | `bg-ts-paper`, `bg-white` | `bg-gray-800` |
| Text color | `text-ts-ink` | `text-white` |
| Borders | `border-ts-line` | `border-gray-700` |
| Accents | `text-luxury-gold` | N/A |

---

## Remember

**LIGHT GRAY = CORRECT**  
**DARK GRAY = WRONG**

Always check existing components for reference!
