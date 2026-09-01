import { DEFAULT_CONFIG } from "./config.js";
import { $, $$ } from "./utils/domUtils.js";
import { getRandomHex } from "./utils/colorUtils.js";
import { loadStateFromStorage, saveStateToStorage } from "./utils/storage.js";
import { HistoryManager } from "./modules/historyManager.js";
import { renderPreview, bindTabEvents } from "./modules/uiController.js";
import { loadPresets } from "./modules/presetManager.js";
import { setupExportModal } from "./modules/exportEngine.js";

document.addEventListener("DOMContentLoaded", () => {
  const savedState = loadStateFromStorage();
  const initialState = savedState || DEFAULT_CONFIG;

  let currentGeneratedCode = "";

  const history = new HistoryManager(
    initialState,
    (state, canUndo, canRedo) => {
      currentGeneratedCode = renderPreview(state);
      saveStateToStorage(state);

      $("#undo-btn").disabled = !canUndo;
      $("#redo-btn").disabled = !canRedo;
    },
  );

  // Initial Sync
  currentGeneratedCode = renderPreview(history.getCurrentState());

  // Bind Sidebar Tabs
  bindTabEvents((tabKey) => {
    const currentState = history.getCurrentState();
    currentState.activeTab = tabKey;
    history.pushState(currentState);
  });

  // Solid Inputs
  const solidColorInput = $("#solid-color-input");
  const solidHexInput = $("#solid-hex-input");

  solidColorInput.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.solid.color = e.target.value;
    solidHexInput.value = e.target.value;
    history.pushState(state);
  });

  // Randomize Button
  $("#randomize-btn").addEventListener("click", () => {
    const state = history.getCurrentState();
    if (state.activeTab === "solid") {
      const newHex = getRandomHex();
      state.solid.color = newHex;
      solidColorInput.value = newHex;
      solidHexInput.value = newHex;
    } else if (state.activeTab === "gradient") {
      state.gradient.stops[0].color = getRandomHex();
      state.gradient.stops[1].color = getRandomHex();
    }
    history.pushState(state);
  });

  // Undo / Redo
  $("#undo-btn").addEventListener("click", () => history.undo());
  $("#redo-btn").addEventListener("click", () => history.redo());

  // Load Presets
  loadPresets($("#presets-grid"), (preset) => {
    const state = history.getCurrentState();
    state.activeTab = preset.type;
    state[preset.type] = preset.config;

    $$(".tab-btn").forEach((b) => b.classList.remove("active"));
    $$(".tab-panel").forEach((p) => p.classList.remove("active"));
    $(`[data-tab="${preset.type}"]`).classList.add("active");
    $(`#panel-${preset.type}`).classList.add("active");

    history.pushState(state);
  });

  // Export Modal Setup
  setupExportModal(() => currentGeneratedCode);
});
