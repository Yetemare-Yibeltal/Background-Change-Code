import { $, $$ } from '../utils/domUtils.js';
import { createSolidBackground } from './solidColor.js';
import { createGradientBackground } from './gradientEngine.js';
import { createPatternBackground } from './patternGenerator.js';
import { createImageBackground } from './imageUploader.js';

export function renderPreview(state) {
  const canvas = $('#preview-canvas');
  let result = { css: {}, code: '' };

  switch (state.activeTab) {
    case 'solid':
      result = createSolidBackground(state.solid);
      break;
    case 'gradient':
      result = createGradientBackground(state.gradient);
      break;
    case 'pattern':
      result = createPatternBackground(state.pattern);
      break;
    case 'image':
      result = createImageBackground(state.image);
      break;
    default:
      result = createSolidBackground(state.solid);
  }

  canvas.style.background = result.css.background;
  canvas.style.filter = result.css.filter;

  return result.code;
}

export function bindTabEvents(onTabChange) {
  $$('.tab-btn').forEach(button => {
    button.addEventListener('click', (e) => {
      const tabKey = e.target.getAttribute('data-tab');
      
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      $$('.tab-panel').forEach(p => p.classList.remove('active'));

      e.target.classList.add('active');
      $(`#panel-${tabKey}`)?.classList.add('active');

      onTabChange(tabKey);
    });
  });
}
