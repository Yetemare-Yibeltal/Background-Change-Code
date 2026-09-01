export function createImageBackground(imageState) {
  const { src, blur, brightness } = imageState;

  if (!src) {
    return {
      css: {
        background: "#1e293b",
        filter: "none",
      },
      code: `/* Upload an image to generate styles */`,
    };
  }

  return {
    css: {
      background: `url("${src}") no-repeat center center / cover`,
      filter: `blur(${blur}px) brightness(${brightness}%)`,
    },
    code: `background-image: url("${src}");\nbackground-size: cover;\nbackground-position: center;\nfilter: blur(${blur}px) brightness(${brightness}%);`,
  };
}
