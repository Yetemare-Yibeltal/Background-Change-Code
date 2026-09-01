import { getPatternDataUrl } from "../../assets/patterns/svgPatterns.js";

export function createPatternBackground(patternState) {
  const { style, fgColor, bgColor, scale } = patternState;
  const dataUrl = getPatternDataUrl(style, fgColor, bgColor, scale);

  return {
    css: {
      background: `url("${dataUrl}") repeat center center`,
      filter: "none",
    },
    code: `background-image: url("${dataUrl}");\nbackground-repeat: repeat;`,
  };
}
