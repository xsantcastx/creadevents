The mission of this redesign is to centralize and standardize all UI elements (buttons, links, headings, etc.) into a single styling system.

We want to:

Migrate all important styles (buttons, links, titles, states, hover effects, etc.) into reusable CSS classes or design tokens.

Define a global color system (primary, secondary, accent, background, text, success, warning, error) instead of hard-coding colors in each component.

Prepare the system for theming, so we can easily:

Swap color palettes

Switch between light/dark or different layout styles

Apply client-specific branding

Integrate this with a future Settings / Personalization page, where an admin can:

Select colors from a color picker

Change themes (e.g. “Classic”, “Modern”, “Minimal”)

Update the look & feel of the site without redeploying or editing the code directly.

In short: we’re building a theme and layout system where the design lives in one place, and can be updated dynamically from the app’s settings.