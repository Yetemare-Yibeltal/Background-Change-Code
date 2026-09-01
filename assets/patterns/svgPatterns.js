export const SVG_PATTERNS = {
  dots: (fgColor, bgColor, scale) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${scale}" height="${scale}" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${bgColor}"/>
      <circle cx="50" cy="50" r="25" fill="${fgColor}"/>
    </svg>
  `,
  grid: (fgColor, bgColor, scale) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${scale}" height="${scale}" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${bgColor}"/>
      <path d="M 100 0 L 0 0 0 100" fill="none" stroke="${fgColor}" stroke-width="8"/>
    </svg>
  `,
  stripes: (fgColor, bgColor, scale) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${scale}" height="${scale}" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${bgColor}"/>
      <path d="M-25,25 L25,-25 M0,100 L100,0 M75,125 L125,75" stroke="${fgColor}" stroke-width="15"/>
    </svg>
  `,
  waves: (fgColor, bgColor, scale) => `
    <svg xmlns="http://www.w3.org/2000/svg" width="${scale}" height="${scale}" viewBox="0 0 100 100">
      <rect width="100" height="100" fill="${bgColor}"/>
      <path d="M0 50 Q 25 20, 50 50 T 100 50" fill="none" stroke="${fgColor}" stroke-width="8"/>
    </svg>
  `,
};

export function getPatternDataUrl(type, fgColor, bgColor, scale) {
  const patternFn = SVG_PATTERNS[type] || SVG_PATTERNS.dots;
  const svgString = patternFn(fgColor, bgColor, scale);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
}
