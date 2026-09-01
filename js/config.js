export const DEFAULT_CONFIG = {
  activeTab: "solid",
  solid: {
    color: "#4f46e5",
    opacity: 100,
  },
  gradient: {
    type: "linear",
    angle: 90,
    stops: [
      { color: "#4f46e5", offset: 0 },
      { color: "#9333ea", offset: 100 },
    ],
  },
  pattern: {
    style: "dots",
    fgColor: "#ffffff",
    bgColor: "#1e1b4b",
    scale: 30,
  },
  image: {
    src: null,
    blur: 0,
    brightness: 100,
  },
};
