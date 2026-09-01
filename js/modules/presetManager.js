export async function loadPresets(container, onSelectPreset) {
  try {
    const response = await fetch("assets/presets/defaultPresets.json");
    const presets = await response.json();

    container.innerHTML = "";

    presets.forEach((preset) => {
      const card = document.createElement("div");
      card.className = "preset-card";
      card.title = preset.name;

      if (preset.type === "solid") {
        card.style.background = preset.config.color;
      } else if (preset.type === "gradient") {
        const stops = preset.config.stops
          .map((s) => `${s.color} ${s.offset}%`)
          .join(", ");
        card.style.background = `linear-gradient(135deg, ${stops})`;
      } else if (preset.type === "pattern") {
        card.style.backgroundColor = preset.config.bgColor;
      }

      card.addEventListener("click", () => onSelectPreset(preset));
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Could not load presets:", err);
  }
}
