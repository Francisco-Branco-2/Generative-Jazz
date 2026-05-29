import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);
const COLORBLIND_KEY = "gj_colorblind";

export function ThemeProvider({ children }) {
  document.documentElement.setAttribute("data-theme", "dark");

  const [colorblindMode, setColorblindModeState] = useState(() => {
    const saved = localStorage.getItem(COLORBLIND_KEY) || "none";
    if (saved !== "none") document.documentElement.setAttribute("data-colorblind", saved);
    return saved;
  });

  useEffect(() => {
    localStorage.setItem(COLORBLIND_KEY, colorblindMode);
    if (colorblindMode === "none") {
      document.documentElement.removeAttribute("data-colorblind");
    } else {
      document.documentElement.setAttribute("data-colorblind", colorblindMode);
    }
  }, [colorblindMode]);

  return (
    <ThemeContext.Provider value={{
      colorblindMode,
      setColorblindMode: setColorblindModeState,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() { return useContext(ThemeContext); }
