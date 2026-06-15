import { useEffect, useState } from "react";
import { getSettings, saveSettings } from "../utils/settings";

export function useSettings() {
  const [settings, setSettings] = useState(getSettings);

  useEffect(() => {
    const handler = (e) => setSettings(e.detail);
    window.addEventListener("hotel-settings-changed", handler);
    return () => window.removeEventListener("hotel-settings-changed", handler);
  }, []);

  const update = (updates) => setSettings(saveSettings(updates));

  return { settings, update };
}
