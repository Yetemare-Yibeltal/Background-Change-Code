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
    image: {
      url: "",
      blur: 0,
      brightness: 100,
    },
    mesh: {
      bgColor: "#0f172a",
      blur: 20,
      points: [
        { x: 20, y: 30, color: "#ec4899" },
        { x: 80, y: 20, color: "#8b5cf6" },
        { x: 50, y: 80, color: "#3b82f6" },
      ],
    },
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

  const renderMeshControlsList = (points) => {
    const list = $("#mesh-anchors-list");
    if (!list) return;
    list.innerHTML = "";

    points.forEach((point, index) => {
      const row = document.createElement("div");
      row.className = "mesh-anchor-row";
      row.innerHTML = `
        <div class="mesh-anchor-info">
          <input type="color" value="${point.color}" data-index="${index}" class="mesh-point-color">
          <span>Point ${index + 1} (${point.x}%, ${point.y}%)</span>
        </div>
        ${points.length > 2 ? `<button class="btn btn-small btn-secondary remove-mesh-btn" data-index="${index}">&times;</button>` : ""}
      `;
      list.appendChild(row);
    });

    list.querySelectorAll(".mesh-point-color").forEach((input) => {
      input.addEventListener("input", (e) => {
        const idx = Number(e.target.getAttribute("data-index"));
        const state = history.getCurrentState();
        state.mesh.points[idx].color = e.target.value;
        history.pushState(state);
      });
    });

    list.querySelectorAll(".remove-mesh-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const idx = Number(e.currentTarget.getAttribute("data-index"));
        const state = history.getCurrentState();
        state.mesh.points.splice(idx, 1);
        history.pushState(state);
        renderMeshControlsList(state.mesh.points);
      });
    });
  };

  const handleMeshDrag = (index, x, y, isCommit) => {
    const state = history.getCurrentState();
    state.mesh.points[index].x = x;
    state.mesh.points[index].y = y;

    if (isCommit) {
      history.pushState(state);
      renderMeshControlsList(state.mesh.points);
    } else {
      currentGeneratedCode = renderPreview(state, handleMeshDrag);
    }
  };

  const history = new HistoryManager(
    initialState,
    (state, canUndo, canRedo) => {
      currentGeneratedCode = renderPreview(state, handleMeshDrag);
      saveStateToStorage(state);

      if (state.activeTab === "mesh" && state.mesh) {
        renderMeshControlsList(state.mesh.points);
      }

      $("#undo-btn").disabled = !canUndo;
      $("#redo-btn").disabled = !canRedo;
    },
  );

  // Initial Sync
  currentGeneratedCode = renderPreview(
    history.getCurrentState(),
    handleMeshDrag,
  );
  if (history.getCurrentState().mesh) {
    renderMeshControlsList(history.getCurrentState().mesh.points);
  }

  // Bind Sidebar Tabs
  bindTabEvents((tabKey) => {
    const currentState = history.getCurrentState();
    currentState.activeTab = tabKey;
    history.pushState(currentState);
  });

  // Solid Inputs
  const solidColorInput = $("#solid-color-input");
  const solidHexInput = $("#solid-hex-input");
  const solidOpacityInput = $("#solid-opacity");

  solidColorInput?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.solid.color = e.target.value;
    if (solidHexInput) solidHexInput.value = e.target.value;
    history.pushState(state);
  });

  solidOpacityInput?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.solid.opacity = Number(e.target.value);
    history.pushState(state);
  });

  // Image Inputs & Drop Zone Handler
  const imageFileInput = $("#image-file-input");
  const imageDropZone = $("#drop-zone");
  const imageBlurInput = $("#image-blur");
  const imageBrightnessInput = $("#image-brightness");

  const handleImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      showToast("Please upload a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const state = history.getCurrentState();
      if (!state.image) state.image = {};
      state.image.url = e.target.result;
      history.pushState(state);
      showToast("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  imageFileInput?.addEventListener("change", (e) => {
    if (e.target.files.length) handleImageFile(e.target.files[0]);
  });

  imageDropZone?.addEventListener("click", () => imageFileInput?.click());

  imageDropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    imageDropZone.classList.add("drag-over");
  });

  imageDropZone?.addEventListener("dragleave", () =>
    imageDropZone.classList.remove("drag-over"),
  );

  imageDropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    imageDropZone.classList.remove("drag-over");
    if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
  });

  imageBlurInput?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    if (!state.image) state.image = {};
    state.image.blur = Number(e.target.value);
    history.pushState(state);
  });

  imageBrightnessInput?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    if (!state.image) state.image = {};
    state.image.brightness = Number(e.target.value);
    history.pushState(state);
  });

  // Mesh Controls
  $("#mesh-bg-color")?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.mesh.bgColor = e.target.value;
    history.pushState(state);
  });

  $("#mesh-blur")?.addEventListener("input", (e) => {
    const state = history.getCurrentState();
    state.mesh.blur = Number(e.target.value);
    $("#mesh-blur-val").textContent = e.target.value;
    history.pushState(state);
  });

  $("#add-mesh-point-btn")?.addEventListener("click", () => {
    const state = history.getCurrentState();
    state.mesh.points.push({
      x: Math.floor(Math.random() * 80) + 10,
      y: Math.floor(Math.random() * 80) + 10,
      color: getRandomHex(),
    });
    history.pushState(state);
    renderMeshControlsList(state.mesh.points);
  });

  // Randomize Trigger Function
  const triggerRandomize = () => {
    const state = history.getCurrentState();
    if (state.activeTab === "solid") {
      const newHex = getRandomHex();
      state.solid.color = newHex;
      if (solidColorInput) solidColorInput.value = newHex;
      if (solidHexInput) solidHexInput.value = newHex;
    } else if (state.activeTab === "mesh") {
      state.mesh.bgColor = getRandomHex();
      state.mesh.points.forEach((p) => {
        p.color = getRandomHex();
        p.x = Math.floor(Math.random() * 80) + 10;
        p.y = Math.floor(Math.random() * 80) + 10;
      });
      renderMeshControlsList(state.mesh.points);
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
