import { getPatternDataUrl } from "../../assets/patterns/svgPatterns.js";

export async function exportBackgroundAsPng(
  state,
  width = 1920,
  height = 1080,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) return;

  const { activeTab } = state;

  if (activeTab === "solid") {
    ctx.fillStyle = state.solid.color;
    ctx.globalAlpha = state.solid.opacity / 100;
    ctx.fillRect(0, 0, width, height);
  } else if (activeTab === "gradient") {
    const { type, angle, stops } = state.gradient;
    let gradient;

    if (type === "linear") {
      const rad = (angle * Math.PI) / 180;
      const x1 = width / 2 - (Math.cos(rad) * width) / 2;
      const y1 = height / 2 - (Math.sin(rad) * height) / 2;
      const x2 = width / 2 + (Math.cos(rad) * width) / 2;
      const y2 = height / 2 + (Math.sin(rad) * height) / 2;
      gradient = ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 2,
      );
    }

    stops.forEach((stop) => {
      gradient.addColorStop(stop.offset / 100, stop.color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } else if (activeTab === "pattern") {
    const { style, fgColor, bgColor, scale } = state.pattern;
    const dataUrl = getPatternDataUrl(style, fgColor, bgColor, scale);

    const img = new Image();
    img.src = dataUrl;
    await img.decode();

    const pattern = ctx.createPattern(img, "repeat");
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, width, height);
    }
  } else if (activeTab === "image" && state.image.src) {
    const img = new Image();
    img.src = state.image.src;
    await img.decode();
    ctx.drawImage(img, 0, 0, width, height);
  }

  // Trigger download link
  const link = document.createElement("a");
  link.download = `aurastudio-background-${Date.now()}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
