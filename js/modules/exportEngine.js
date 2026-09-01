import { $ } from "../utils/domUtils.js";
import { copyToClipboard } from "../utils/downloadHelpers.js";
import { showToast } from "../utils/domUtils.js";

export function setupExportModal(getCurrentCssCode) {
  const modal = $("#export-modal");
  const openBtn = $("#export-code-btn");
  const closeBtn = $("#close-modal-btn");
  const copyBtn = $("#copy-code-btn");
  const codeOutput = $("#css-code-output");

  openBtn.addEventListener("click", () => {
    codeOutput.textContent = getCurrentCssCode();
    modal.classList.remove("hidden");
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  copyBtn.addEventListener("click", async () => {
    const success = await copyToClipboard(codeOutput.textContent);
    if (success) {
      showToast("CSS copied to clipboard!");
      modal.classList.add("hidden");
    }
  });
}
