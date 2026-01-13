'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/db/database';

function hexToHSL(hex: string) {
    // Convert hex to RGB first
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r,g,b),
        cmax = Math.max(r,g,b),
        delta = cmax - cmin,
        h = 0,
        s = 0,
        l = 0;

    if (delta == 0)
        h = 0;
    else if (cmax == r)
        h = ((g - b) / delta) % 6;
    else if (cmax == g)
        h = (b - r) / delta + 2;
    else
        h = (r - g) / delta + 4;

    h = Math.round(h * 60);

    if (h < 0)
        h += 360;

    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return h + " " + s + "% " + l + "%";
}


export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<any>({});

  useEffect(() => {
    const loadTheme = async () => {
      const settings = await db.shopSettings.toCollection().first();
      if (settings) {
        const newTheme: any = {};
        if(settings.primaryColor) {
          newTheme['--primary'] = hexToHSL(settings.primaryColor);
        }
        if(settings.secondaryColor) {
          newTheme['--secondary'] = hexToHSL(settings.secondaryColor);
        }
        setTheme(newTheme);

        if (settings.font) {
          const fontLink = document.createElement('link');
          fontLink.href = `https://fonts.googleapis.com/css2?family=${settings.font.replace(/ /g, '+')}:wght@400;700&display=swap`;
          fontLink.rel = 'stylesheet';
          document.head.appendChild(fontLink);
          document.body.style.fontFamily = `'${settings.font}', sans-serif`;
        }
      }
    };

    loadTheme();
  }, []);

  return (
    <>
      <style jsx global>{`
        :root {
          ${Object.entries(theme)
            .map(([key, value]) => `${key}: ${value};`)
            .join('\n')}
        }
      `}</style>
      {children}
    </>
  );
}
