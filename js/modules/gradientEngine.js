export function createGradientBackground(gradientState) {
  const { type, angle, stops } = gradientState;

  const sortedStops = [...stops].sort((a, b) => a.offset - b.offset);
  const stopString = sortedStops
    .map((stop) => `${stop.color} ${stop.offset}%`)
    .join(", ");

  let cssGradient = "";

  if (type === "linear") {
    cssGradient = `linear-gradient(${angle}deg, ${stopString})`;
  } else if (type === "radial") {
    cssGradient = `radial-gradient(circle at center, ${stopString})`;
  } else if (type === "conic") {
    cssGradient = `conic-gradient(from ${angle}deg at 50% 50%, ${stopString})`;
  }

  return {
    css: {
      background: cssGradient,
      filter: "none",
    },
    code: `background: ${cssGradient};`,
  };
}
