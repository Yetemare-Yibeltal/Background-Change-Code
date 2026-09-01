import { DEFAULT_CONFIG } from "./config.js";
import { $, $$ } from "./utils/domUtils.js";
import { getRandomHex } from "./utils/colorUtils.js";
import { loadStateFromStorage, saveStateToStorage } from "./utils/storage.js";
import { HistoryManager } from "./modules/historyManager.js";
import { renderPreview, bindTabEvents } from "./modules/uiController.js";
import { loadPresets } from "./modules/presetManager.js";
import { setupExportModal } from "./modules/exportEngine.js";
import { exportBackgroundAsPng } from "./utils/canvasExporter.js";
import { registerKeyboardShortcuts } from "./modules/keyboardController.js";
import { showToast } from "./utils/domUtils.js";

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

  solidColorInput?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.solid.color = e.target.value;
    if (solidHexInput) solidHexInput.value = e.target.value;
    history.pushState(state);
  });

  // Randomize Trigger Function
  const triggerRandomize = () => {
    const state = history.getCurrentState();
    if (state.activeTab === "solid") {
      const newHex = getRandomHex();
      state.solid.color = newHex;
      if (solidColorInput) solidColorInput.value = newHex;
      if (solidHexInput) solidHexInput.value = newHex;
    } else if (state.activeTab === "gradient") {
      state.gradient.stops[0].color = getRandomHex();
      state.gradient.stops[1].color = getRandomHex();
    }
    history.pushState(state);
    showToast("Theme randomized!");
  };

  $("#randomize-btn")?.addEventListener("click", triggerRandomize);

  // Download PNG Handler
  $("#download-png-btn")?.addEventListener("click", async () => {
    const resolution = $("#resolution-select")?.value || "1080p";
    let width = 1920;
    let height = 1080;

    if (resolution === "4k") {
      width = 3840;
      height = 2160;
    } else if (resolution === "720p") {
      width = 1280;
      height = 720;
    }

    showToast(`Generating ${resolution.toUpperCase()} PNG...`);
    await exportBackgroundAsPng(history.getCurrentState(), width, height);
    showToast("Download started!");
  });

  // Undo / Redo
  $("#undo-btn")?.addEventListener("click", () => history.undo());
  $("#redo-btn")?.addEventListener("click", () => history.redo());

  // Shortcuts Modal View
  const shortcutsModal = $("#shortcuts-modal");
  const toggleShortcutsModal = () => {
    shortcutsModal?.classList.toggle("hidden");
  };

  $("#shortcuts-btn")?.addEventListener("click", toggleShortcutsModal);
  $("#close-shortcuts-modal-btn")?.addEventListener(
    "click",
    toggleShortcutsModal,
  );

  // Register Keyboard Shortcuts
  registerKeyboardShortcuts({
    onUndo: () => {
      if (history.canUndo()) {
        history.undo();
        showToast("Undo");
      }
    },
    onRedo: () => {
      if (history.canRedo()) {
        history.redo();
        showToast("Redo");
      }
    },
    onRandomize: triggerRandomize,
    onExport: () => {
      $("#export-code-btn")?.click();
    },
    onToggleHelp: toggleShortcutsModal,
  });

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
