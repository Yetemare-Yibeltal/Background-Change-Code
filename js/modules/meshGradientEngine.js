import { $ } from "../utils/domUtils.js";

/**
 * Builds CSS markup combining radial gradients into a unified mesh texture.
 */
export function generateMeshCss(points, blurAmount) {
  if (!points || !points.length) return "";

  const gradients = points.map((p) => {
    return `radial-gradient(at ${p.x}% ${p.y}%, ${p.color} 0px, transparent 50%)`;
  });

  return {
    backgroundImage: gradients.join(", "),
    filter: `blur(${blurAmount}px)`,
  };
}

/**
 * Renders interactive drag handles directly over the preview canvas.
 */
export function renderMeshHandles(container, points, onPointMove) {
  // Clear prior handle overlays
  container.querySelectorAll(".mesh-point-handle").forEach((el) => el.remove());

  points.forEach((point, index) => {
    const handle = document.createElement("div");
    handle.className = "mesh-point-handle";
    handle.style.left = `${point.x}%`;
    handle.style.top = `${point.y}%`;
    handle.style.backgroundColor = point.color;
    handle.setAttribute("data-index", index.toString());

    let isDragging = false;

    const onMouseDown = (e) => {
      e.preventDefault();
      isDragging = true;
      handle.classList.add("dragging");

      const rect = container.getBoundingClientRect();

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        const x = Math.max(
          0,
          Math.min(100, ((moveEvent.clientX - rect.left) / rect.width) * 100),
        );
        const y = Math.max(
          0,
          Math.min(100, ((moveEvent.clientY - rect.top) / rect.height) * 100),
        );

        handle.style.left = `${x}%`;
        handle.style.top = `${y}%`;
        onPointMove(index, Math.round(x), Math.round(y), false);
      };

      const onMouseUp = () => {
        if (isDragging) {
          isDragging = false;
          handle.classList.remove("dragging");
          window.removeEventListener("mousemove", onMouseMove);
          window.removeEventListener("mouseup", onMouseUp);

          const currentX = parseFloat(handle.style.left);
          const currentY = parseFloat(handle.style.top);
          onPointMove(index, Math.round(currentX), Math.round(currentY), true);
        }
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    };

    handle.addEventListener("mousedown", onMouseDown);
    container.appendChild(handle);
  });
}
