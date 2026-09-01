/**
 * Sanitizes and encodes raw SVG text into a dynamic data-URI CSS string.
 */
export function processSvgPattern(
  svgText,
  fillColor,
  opacity,
  scale,
  tileSize,
  tileMode,
) {
  if (!svgText) return "";

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, "image/svg+xml");
  const svgEl = doc.querySelector("svg");

  if (!svgEl) return "";

  // Apply fill color overrides to vector elements
  svgEl.setAttribute("fill", fillColor);
  svgEl.setAttribute("opacity", (opacity / 100).toString());

  // Convert updated SVG DOM to string
  const serializedSvg = new XMLSerializer().serializeToString(svgEl);
  const encodedSvg = encodeURIComponent(serializedSvg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  const dataUri = `data:image/svg+xml;utf8,${encodedSvg}`;
  const actualTileSize = Math.max(10, Math.round((tileSize * scale) / 50));

  let repeatStyle = "repeat";
  if (tileMode === "space") repeatStyle = "space";
  if (tileMode === "round") repeatStyle = "round";

  return {
    backgroundImage: `url("${dataUri}")`,
    backgroundSize: `${actualTileSize}px ${actualTileSize}px`,
    backgroundRepeat: repeatStyle,
  };
}
