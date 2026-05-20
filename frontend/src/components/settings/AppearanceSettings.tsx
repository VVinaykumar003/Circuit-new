import { useContext } from "react";
import { ThemeContext } from "@/context/theme-context";

const AppearanceSettings = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const themes = [
    { id: "light", label: "Light" },
    { id: "corporate", label: "Corporate" },
    { id: "dark", label: "Dark" },
  ];

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Appearance</h2>
        <p className="text-sm opacity-70 mt-1">
          Select your preferred theme.
        </p>
      </div>

      {/* Segmented Control */}
      <div className="flex bg-base-200 p-1 rounded-xl">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id as any)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200
              ${
                theme === t.id
                  ? "bg-primary text-primary-content shadow"
                  : "text-base-content/70 hover:text-base-content"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppearanceSettings;