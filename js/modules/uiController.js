import { $ } from '../utils/domUtils.js';
import { processSvgPattern } from './svgPatternEngine.js';
import { generateMeshCss, renderMeshHandles } from './meshGradientEngine.js';

export function renderPreview(state, onMeshPointDrag) {
  const canvas = $('#preview-canvas');
  if (!canvas) return '';

  canvas.style.cssText = ''; // Clear prior inline styles
  
  // Clean handles when switching tabs
  canvas.querySelectorAll('.mesh-point-handle').forEach(el => el.remove());

  let generatedCss = '';

  if (state.activeTab === 'solid') {
    const color = state.solid?.color || '#4f46e5';
    const opacity = (state.solid?.opacity ?? 100) / 100;
    canvas.style.backgroundColor = color;
    canvas.style.opacity = opacity;
    generatedCss = `background-color: ${color};\nopacity: ${opacity};`;
  } else if (state.activeTab === 'gradient') {
    const { type, angle, stops } = state.gradient;
    const stopString = stops.map(s => `${s.color} ${s.position}%`).join(', ');
    const bgString = type === 'linear' 
      ? `linear-gradient(${angle}deg, ${stopString})`
      : `${type}-gradient(circle, ${stopString})`;
    
    canvas.style.backgroundImage = bgString;
    generatedCss = `background-image: ${bgString};`;
  } else if (state.activeTab === 'mesh') {
    const { bgColor, blur, points } = state.mesh || {};
    canvas.style.backgroundColor = bgColor || '#0f172a';
    
    const meshConfig = generateMeshCss(points, blur || 0);
    if (meshConfig) {
      canvas.style.backgroundImage = meshConfig.backgroundImage;
      canvas.style.filter = meshConfig.filter;
      generatedCss = `background-color: ${bgColor || '#0f172a'};\nbackground-image: ${meshConfig.backgroundImage};\nfilter: ${meshConfig.filter};`;
    }

    if (onMeshPointDrag) {
      renderMeshHandles(canvas, points || [], onMeshPointDrag);
    }
  } else if (state.activeTab === 'svg') {
    const { rawSvg, bgColor, fillColor, opacity, tileSize, tileMode } = state.svgPattern || {};
    canvas.style.backgroundColor = bgColor || '#0f172a';

    if (rawSvg) {
      const patternConfig = processSvgPattern(rawSvg, fillColor, opacity, 100, tileSize, tileMode);
      if (patternConfig) {
        canvas.style.backgroundImage = patternConfig.backgroundImage;
        canvas.style.backgroundSize = patternConfig.backgroundSize;
        canvas.style.backgroundRepeat = patternConfig.backgroundRepeat;

        generatedCss = `background-color: ${bgColor};\nbackground-image: ${patternConfig.backgroundImage};\nbackground-size: ${patternConfig.backgroundSize};\nbackground-repeat: ${patternConfig.backgroundRepeat};`;
      }
    } else {
      generatedCss = `background-color: ${bgColor || '#0f172a'};`;
    }
  } else if (state.activeTab === 'image') {
    const { url, blur, brightness } = state.image || {};
    if (url) {
      canvas.style.backgroundImage = `url("${url}")`;
      canvas.style.backgroundSize = 'cover';
      canvas.style.backgroundPosition = 'center';
      canvas.style.filter = `blur(${blur || 0}px) brightness(${brightness ?? 100}%)`;

      generatedCss = `background-image: url("${url}");\nbackground-size: cover;\nbackground-position: center;\nfilter: blur(${blur || 0}px) brightness(${brightness ?? 100}%);`;
    } else {
      canvas.style.backgroundColor = '#1e1b4b';
      generatedCss = `background-color: #1e1b4b; /* Upload an image */`;
    }
  }

  return generatedCss;
}

export function bindTabEvents(onTabChange) {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

      const targetTab = e.currentTarget.getAttribute('data-tab');
      e.currentTarget.classList.add('active');
      $(`#panel-${targetTab}`)?.classList.add('active');

      if (onTabChange) onTabChange(targetTab);
    });
  });
}