# Background Effects Feature

## Overview
Add decorative background patterns to your entire site through the Theme Customization settings.

## Available Effects

### 1. **None** (default)
No background effect applied.

### 2. **Floral Garden**
Scattered flower patterns with soft radial gradients in sage green and rose blush accents.
- Best for: Elegant, romantic themes
- Opacity: Subtle (0.05-0.1)

### 3. **Grass Borders**
Grass texture effect on top and bottom edges of the page.
- Best for: Nature-themed events, outdoor venues
- Effect: Linear gradients with vertical striping pattern

### 4. **Elegant Vines**
Decorative vine elements in top-left and bottom-right corners.
- Best for: Sophisticated, luxury events
- Effect: Radial gradients forming corner accents

### 5. **Botanical Pattern**
Subtle crosshatch leaf pattern across the entire background.
- Best for: Minimal, modern aesthetic
- Effect: Repeating diagonal lines

### 6. **Subtle Leaves**
Minimal leaf emoji accents in corners (🌿 🍃).
- Best for: Clean, organic look
- Effect: Single decorative elements

## How to Use

1. Go to **Admin Panel** → **Settings**
2. Expand **Theme Customization** section
3. Find **Background Effect** dropdown
4. Select your desired effect
5. Click **Save Settings**
6. The effect applies instantly site-wide

## Technical Details

### CSS Classes Applied
Each effect applies a class to the `<body>` element:
- `bg-effect-floral-garden`
- `bg-effect-grass-borders`
- `bg-effect-elegant-vines`
- `bg-effect-botanical-pattern`
- `bg-effect-subtle-leaves`

### Implementation
- Effects use `::before` and `::after` pseudo-elements
- `position: fixed` ensures effects stay in place during scroll
- `pointer-events: none` prevents interaction interference
- `z-index: 0` keeps effects behind content

### Customization
To modify effects, edit `src/styles.scss` starting at line ~1245.

Each effect can be customized:
- **Opacity**: Adjust `rgba()` alpha values
- **Colors**: Change from sage green (`#a8c5a4`) to your brand colors
- **Size/Position**: Modify gradients, dimensions, and positioning
- **Animation**: Add `animation` properties for subtle movement

## Performance
All effects are CSS-only with no JavaScript overhead. They're rendered once and use GPU-accelerated properties for smooth performance.

## Browser Compatibility
Works in all modern browsers (Chrome, Firefox, Safari, Edge). Gracefully degrades in older browsers.
