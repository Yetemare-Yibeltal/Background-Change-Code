import { hexToRgba } from "../utils/colorUtils.js";

export function createSolidBackground(solidState) {
  const { color, opacity } = solidState;
  const cssValue = hexToRgba(color, opacity);

  return {
    css: {
      background: cssValue,
      filter: "none",
    },
    code: `background-color: ${cssValue};`,
  };
}
