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

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

document.addEventListener("DOMContentLoaded", () => {
  const savedState = loadStateFromStorage();
  const initialState = savedState || {
    ...DEFAULT_CONFIG,
    svgPattern: {
      rawSvg: DEFAULT_SVG,
      bgColor: "#0f172a",
      fillColor: "#38bdf8",
      opacity: 80,
      tileSize: 40,
      tileMode: "repeat",
    },
  };

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

  // SVG Pattern Controls Setup
  const svgFileInput = $("#svg-file-input");
  const svgDropZone = $("#svg-drop-zone");
  const svgBgColor = $("#svg-bg-color");
  const svgFillColor = $("#svg-fill-color");
  const svgOpacity = $("#svg-opacity");
  const svgTileSize = $("#svg-tile-size");
  const svgPreviewBox = $("#svg-preview-container");

  const updateSvgPreviewThumbnail = (svgText) => {
    if (svgPreviewBox && svgText) {
      svgPreviewBox.innerHTML = svgText;
    }
  };

  updateSvgPreviewThumbnail(history.getCurrentState().svgPattern?.rawSvg);

  const handleSvgFile = (file) => {
    if (!file || !file.name.endsWith(".svg")) {
      showToast("Please upload a valid .SVG file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const state = history.getCurrentState();
      state.svgPattern.rawSvg = e.target.result;
      updateSvgPreviewThumbnail(e.target.result);
      history.pushState(state);
      showToast("SVG Pattern loaded successfully!");
    };
    reader.readAsText(file);
  };

  svgFileInput?.addEventListener("change", (e) =>
    handleSvgFile(e.target.files[0]),
  );

  svgDropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    svgDropZone.classList.add("drag-over");
  });

  svgDropZone?.addEventListener("dragleave", () =>
    svgDropZone.classList.remove("drag-over"),
  );

  svgDropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    svgDropZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) handleSvgFile(e.dataTransfer.files[0]);
  });

  svgBgColor?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.svgPattern.bgColor = e.target.value;
    history.pushState(state);
  });

  svgFillColor?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.svgPattern.fillColor = e.target.value;
    history.pushState(state);
  });

  svgOpacity?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.svgPattern.opacity = Number(e.target.value);
    history.pushState(state);
  });

  svgTileSize?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.svgPattern.tileSize = Number(e.target.value);
    $("#svg-size-val").textContent = e.target.value;
    history.pushState(state);
  });

  $$(".tiling-option-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      $$(".tiling-option-btn").forEach((b) => b.classList.remove("active"));
      e.currentTarget.classList.add("active");
      const mode = e.currentTarget.getAttribute("data-mode");
      const state = history.getCurrentState();
      state.svgPattern.tileMode = mode;
      history.pushState(state);
    });
  });

  // Randomize Trigger Function
  const triggerRandomize = () => {
    const state = history.getCurrentState();
    if (state.activeTab === "solid") {
      state.solid.color = getRandomHex();
    } else if (state.activeTab === "svg") {
      state.svgPattern.bgColor = getRandomHex();
      state.svgPattern.fillColor = getRandomHex();
      if (svgBgColor) svgBgColor.value = state.svgPattern.bgColor;
      if (svgFillColor) svgFillColor.value = state.svgPattern.fillColor;
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

  // Shortcuts Modal
  const shortcutsModal = $("#shortcuts-modal");
  const toggleShortcutsModal = () => shortcutsModal?.classList.toggle("hidden");

  $("#shortcuts-btn")?.addEventListener("click", toggleShortcutsModal);
  $("#close-shortcuts-modal-btn")?.addEventListener(
    "click",
    toggleShortcutsModal,
  );

  // Register Keyboard Shortcuts
  registerKeyboardShortcuts({
    onUndo: () => history.canUndo() && history.undo(),
    onRedo: () => history.canRedo() && history.redo(),
    onRandomize: triggerRandomize,
    onExport: () => $("#export-code-btn")?.click(),
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

  setupExportModal(() => currentGeneratedCode);
});
