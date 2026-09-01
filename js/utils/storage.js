const STORAGE_KEY = "aurastudio_config_v1";

export function saveStateToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
}

export function loadStateFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to read from localStorage:", error);
    return null;
  }
}
