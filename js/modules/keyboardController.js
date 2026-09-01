import { $ } from "../utils/domUtils.js";

export function registerKeyboardShortcuts(actions) {
  document.addEventListener("keydown", (event) => {
    // Prevent triggering shortcuts when typing in inputs
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (
      activeTag === "input" ||
      activeTag === "select" ||
      activeTag === "textarea"
    ) {
      return;
    }

    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const modifier = isMac ? event.metaKey : event.ctrlKey;

    // Undo: Ctrl+Z / Cmd+Z
    if (modifier && !event.shiftKey && event.key.toLowerCase() === "z") {
      event.preventDefault();
      actions.onUndo();
    }
    // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z
    else if (
      (modifier && event.key.toLowerCase() === "y") ||
      (modifier && event.shiftKey && event.key.toLowerCase() === "z")
    ) {
      event.preventDefault();
      actions.onRedo();
    }
    // Randomize: Key 'R'
    else if (!modifier && event.key.toLowerCase() === "r") {
      event.preventDefault();
      actions.onRandomize();
    }
    // Export Code: Key 'E'
    else if (!modifier && event.key.toLowerCase() === "e") {
      event.preventDefault();
      actions.onExport();
    }
    // Toggle Shortcuts Help Modal: Shift + ?
    else if (event.key === "?") {
      event.preventDefault();
      actions.onToggleHelp();
    }
  });
}
