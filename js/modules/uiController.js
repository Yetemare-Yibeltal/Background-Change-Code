import { $ } from "../utils/domUtils.js";
import { processSvgPattern } from "./svgPatternEngine.js";
import { generateMeshCss, renderMeshHandles } from "./meshGradientEngine.js";

export function renderPreview(state, onMeshPointDrag) {
  const canvas = $("#preview-canvas");
  if (!canvas) return "";

  // Reset core styles
  canvas.style.backgroundColor = "";
  canvas.style.backgroundImage = "";
  canvas.style.backgroundSize = "";
  canvas.style.backgroundPosition = "";
  canvas.style.backgroundRepeat = "";
  canvas.style.filter = "";
  canvas.style.opacity = "";

  // Clean handles when switching tabs
  canvas.querySelectorAll(".mesh-point-handle").forEach((el) => el.remove());

  const centerCard = canvas.querySelector(
    ".live-preview-card, #preview-card, .preview-center-text",
  );

  let generatedCss = "";

  if (state.activeTab === "solid") {
    if (centerCard) centerCard.style.display = "none";
    const color = state.solid?.color || "#4f46e5";
    const opacity = (state.solid?.opacity ?? 100) / 100;
    canvas.style.backgroundColor = color;
    canvas.style.opacity = opacity;
    generatedCss = `background-color: ${color};\nopacity: ${opacity};`;
  } else if (state.activeTab === "gradient") {
    if (centerCard) centerCard.style.display = "none";
    const type = state.gradient?.type || "linear";
    const angle = state.gradient?.angle ?? 90;
    const stops =
      state.gradient?.stops && state.gradient.stops.length > 0
        ? state.gradient.stops
        : [
            { color: "#4f46e5", position: 0 },
            { color: "#9333ea", position: 100 },
          ];

    const stopString = stops.map((s) => `${s.color} ${s.position}%`).join(", ");
    const bgString =
      type === "linear"
        ? `linear-gradient(${angle}deg, ${stopString})`
        : `radial-gradient(circle, ${stopString})`;

    canvas.style.backgroundImage = bgString;
    generatedCss = `background-image: ${bgString};`;
  } else if (state.activeTab === "mesh") {
    if (centerCard) centerCard.style.display = "none";
    const bgColor = state.mesh?.bgColor || "#0f172a";
    const blur = state.mesh?.blur ?? 20;
    const points = state.mesh?.points || [
      { x: 20, y: 30, color: "#ec4899" },
      { x: 80, y: 20, color: "#8b5cf6" },
      { x: 50, y: 80, color: "#3b82f6" },
    ];

    canvas.style.backgroundColor = bgColor;
    const meshConfig = generateMeshCss(points, blur);
    if (meshConfig) {
      canvas.style.backgroundImage = meshConfig.backgroundImage;
      canvas.style.filter = meshConfig.filter;
      generatedCss = `background-color: ${bgColor};\nbackground-image: ${meshConfig.backgroundImage};\nfilter: ${meshConfig.filter};`;
    }

    if (onMeshPointDrag) {
      renderMeshHandles(canvas, points, onMeshPointDrag);
    }
  } else if (state.activeTab === "svg" || state.activeTab === "pattern") {
    if (centerCard) centerCard.style.display = "none";
    const rawSvg =
      state.svgPattern?.rawSvg ||
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>`;
    const bgColor = state.svgPattern?.bgColor || "#0f172a";
    const fillColor = state.svgPattern?.fillColor || "#38bdf8";
    const opacity = state.svgPattern?.opacity ?? 80;
    const tileSize = state.svgPattern?.tileSize ?? 40;
    const tileMode = state.svgPattern?.tileMode || "repeat";

    canvas.style.backgroundColor = bgColor;
    const patternConfig = processSvgPattern(
      rawSvg,
      fillColor,
      opacity,
      100,
      tileSize,
      tileMode,
    );
    if (patternConfig) {
      canvas.style.backgroundImage = patternConfig.backgroundImage;
      canvas.style.backgroundSize = patternConfig.backgroundSize;
      canvas.style.backgroundRepeat = patternConfig.backgroundRepeat;

      generatedCss = `background-color: ${bgColor};\nbackground-image: ${patternConfig.backgroundImage};\nbackground-size: ${patternConfig.backgroundSize};\nbackground-repeat: ${patternConfig.backgroundRepeat};`;
    }
  } else if (state.activeTab === "image") {
    const url = state.image?.url;
    const blur = state.image?.blur ?? 0;
    const brightness = state.image?.brightness ?? 100;

    if (url) {
      if (centerCard) centerCard.style.display = "none";
      canvas.style.backgroundColor = "transparent";
      canvas.style.backgroundImage = `url("${url}")`;
      canvas.style.backgroundSize = "cover";
      canvas.style.backgroundPosition = "center";
      canvas.style.filter = `blur(${blur}px) brightness(${brightness}%);`;

      generatedCss = `background-image: url("${url}");\nbackground-size: cover;\nbackground-position: center;\nfilter: blur(${blur}px) brightness(${brightness}%);`;
    } else {
      if (centerCard) centerCard.style.display = "flex";
      canvas.style.backgroundColor = "#1e1b4b";
      generatedCss = `background-color: #1e1b4b; /* Upload an image */`;
    }
  }

  return generatedCss;
}

export function bindTabEvents(onTabChange) {
  const tabs = document.querySelectorAll(".tab-btn");
  const panels = document.querySelectorAll(".tab-panel");

  tabs.forEach((tab) => {
    tab.addEventListener("click", (e) => {
      const targetTab = e.currentTarget.getAttribute("data-tab");
      if (!targetTab) return;

      tabs.forEach((t) => t.classList.remove("active"));
      panels.forEach((p) => {
        p.classList.remove("active");
        p.classList.add("hidden");
      });

      e.currentTarget.classList.add("active");
      const targetPanel = document.getElementById(`panel-${targetTab}`);
      if (targetPanel) {
        targetPanel.classList.remove("hidden");
        targetPanel.classList.add("active");
      }

      if (onTabChange) onTabChange(targetTab);
    });
  });
}
