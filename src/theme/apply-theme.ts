import { siteConfig } from '@config/site-config';

export function applySiteTheme(): void {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const tokens = siteConfig.theme?.tokens ?? {};
  Object.entries(tokens).forEach(([token, value]) => {
    if (value) {
      root.style.setProperty(`--${token}`, value);
    }
  });

  const fonts = siteConfig.theme?.fonts ?? {};
  Object.entries(fonts).forEach(([token, value]) => {
    if (value) {
      root.style.setProperty(`--font-${token}`, value);
    }
  });
}
