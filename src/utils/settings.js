const KEY = "hotel_settings";

export const DEFAULT_SETTINGS = {
  pageSize: 10,
  currency: "دج",
  hotelName: "Hotel Manager",
  defaultRoomView: "table",
};

export function getSettings() {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(updates) {
  const next = { ...getSettings(), ...updates };
  localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("hotel-settings-changed", { detail: next }));
  return next;
}
