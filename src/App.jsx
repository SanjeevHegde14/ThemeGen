import { useMemo, useState, useRef } from "react";

const harmonyModes = {
  Complementary: 2,
  Triadic: 3,
  Tetradic: 4,
  Monochromatic: 5,
};

// core Color Logic
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

function generatePalette(mode, baseHue) {
  const colorCount = harmonyModes[mode];
  if (mode === "Monochromatic") {
    return Array.from({ length: 5 }, (_, i) =>
      hslToHex(baseHue, 65, 25 + i * 15),
    );
  }
  const step = 360 / colorCount;
  return Array.from({ length: colorCount }, (_, i) =>
    hslToHex((baseHue + i * step) % 360, 60, 50),
  );
}

export default function App() {
  const [mode, setMode] = useState("Complementary");
  const [baseHue, setBaseHue] = useState(210);
  const [isDarkMode, setIsDarkMode] = useState(true); // Strict UI mode
  const [activePage, setActivePage] = useState("landing");
  const wheelRef = useRef(null);

  const palette = useMemo(
    () => generatePalette(mode, baseHue),
    [mode, baseHue],
  );

  // STRICT UI THEME (Editor Shell - Never changes based on wheel)
  const ui = {
    panel: isDarkMode ? "#121212" : "#FFFFFF",
    canvas: isDarkMode ? "#000000" : "#F3F4F6",
    text: isDarkMode ? "#FFFFFF" : "#111827",
    border: isDarkMode ? "#2D2D2D" : "#E5E7EB",
    input: isDarkMode ? "#1E1E1E" : "#F9FAFB",
  };

  // WEBSITE PREVIEW THEME (The project being built)
  const project = {
    primary: palette[0],
    secondary: palette[1] || palette[0],
    bg: isDarkMode ? "#0F172A" : "#FFFFFF",
    text: isDarkMode ? "#F8FAFC" : "#0F172A",
    card: isDarkMode ? "#1E293B" : "#F1F5F9",
  };

  const handleWheelClick = (e) => {
    const rect = wheelRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x) * (180 / Math.PI);
    setBaseHue(Math.round((angle + 450) % 360));
  };

  const exportConfig = () => {
    const data = {
      name: "ThemeGen_Export",
      palette: palette,
      tokens: project,
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    alert("Design System Exported to Clipboard");
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ backgroundColor: ui.canvas, color: ui.text }}
    >
      {/* LEFT EDITOR PANEL */}
      <aside
        className="w-80 flex flex-col border-r shadow-2xl z-50"
        style={{ backgroundColor: ui.panel, borderColor: ui.border }}
      >
        <div
          className="p-6 border-b flex justify-between items-center"
          style={{ borderColor: ui.border }}
        >
          <h1 className="text-xl font-black tracking-tight">ThemeGen</h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full border hover:bg-opacity-80 transition"
            style={{ borderColor: ui.border, backgroundColor: ui.input }}
          >
            {isDarkMode ? "🌙" : "☀️"}
          </button>
        </div>

        <div className="p-6 space-y-10 overflow-y-auto">
          {/* CLICKABLE WHEEL */}
          <div className="space-y-4">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
              Select Hue
            </label>
            <div
              ref={wheelRef}
              onClick={handleWheelClick}
              className="relative aspect-square rounded-full cursor-crosshair border-4 shadow-2xl"
              style={{
                background:
                  "conic-gradient(red, yellow, lime, aqua, blue, magenta, red)",
                borderColor: ui.border,
              }}
            >
              <div
                className="absolute top-1/2 left-1/2 w-6 h-6 bg-white border-[3px] border-black rounded-full shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ transform: `rotate(${baseHue}deg) translateY(-80px)` }}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase opacity-50">
                Harmony Mode
              </label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="w-full p-3 rounded-lg border text-sm outline-none font-medium"
                style={{
                  backgroundColor: ui.input,
                  borderColor: ui.border,
                  color: ui.text,
                }}
              >
                {Object.keys(harmonyModes).map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </div>

            <div
              className="p-4 rounded-xl border flex gap-2"
              style={{ borderColor: ui.border, backgroundColor: ui.input }}
            >
              {palette.map((c) => (
                <div
                  key={c}
                  className="h-8 flex-1 rounded-sm shadow-sm"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={exportConfig}
            className="w-full py-4 rounded-xl text-white font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition"
            style={{ backgroundColor: project.primary }}
          >
            Export Design System
          </button>
        </div>
      </aside>

      {/* MAIN PREVIEW CANVAS */}
      <main className="flex-1 flex flex-col p-12 overflow-hidden">
        {/* PAGE TABS */}
        <div
          className="flex gap-1 mb-8 self-center p-1 rounded-xl border shadow-sm"
          style={{ backgroundColor: ui.panel, borderColor: ui.border }}
        >
          {["landing", "dashboard", "settings"].map((p) => (
            <button
              key={p}
              onClick={() => setActivePage(p)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition ${activePage === p ? "text-white" : ""}`}
              style={{
                backgroundColor:
                  activePage === p ? project.primary : "transparent",
                color: activePage === p ? "#FFF" : ui.text,
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* THE PORTAL (MOCK WEBSITE) */}
        <div
          className="flex-1 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border transition-all duration-500"
          style={{ backgroundColor: project.bg, borderColor: ui.border }}
        >
          <nav
            className="px-8 py-6 border-b flex justify-between items-center"
            style={{ borderColor: ui.border }}
          >
            <div
              className="flex items-center gap-3 font-bold text-xl uppercase tracking-tighter"
              style={{ color: project.text }}
            >
              <div
                className="w-8 h-8 rounded-lg"
                style={{ backgroundColor: project.primary }}
              />
              <span>Studio_Alpha</span>
            </div>
            <div
              className="flex gap-8 text-sm font-bold opacity-40"
              style={{ color: project.text }}
            >
              <span>Work</span>
              <span>About</span>
              <span>Contact</span>
            </div>
            <button
              className="px-6 py-2 rounded-full text-white font-bold text-sm"
              style={{ backgroundColor: project.primary }}
            >
              Start Project
            </button>
          </nav>

          <div className="flex-1 p-16 overflow-y-auto">
            {activePage === "landing" && (
              <div className="max-w-4xl space-y-10">
                <h2
                  className="text-7xl font-black leading-tight"
                  style={{ color: project.text }}
                >
                  Your vision, <br />
                  <span style={{ color: project.primary }}>perfectly</span>{" "}
                  colored.
                </h2>
                <p
                  className="text-xl max-w-xl opacity-60"
                  style={{ color: project.text }}
                >
                  This preview reflects your design system in real-time. Rotate
                  the wheel to update primary accents while maintaining a clean
                  {isDarkMode ? " dark " : " light "} workspace.
                </p>
                <div className="flex gap-4 pt-4">
                  <button
                    className="px-10 py-5 rounded-2xl text-white font-black shadow-2xl"
                    style={{ backgroundColor: project.primary }}
                  >
                    Get Started
                  </button>
                  <button
                    className="px-10 py-5 rounded-2xl border-2 font-black"
                    style={{
                      borderColor: project.primary,
                      color: project.primary,
                    }}
                  >
                    View Work
                  </button>
                </div>
              </div>
            )}

            {activePage === "dashboard" && (
              <div className="space-y-12">
                <div className="flex justify-between items-center">
                  <h2
                    className="text-4xl font-black"
                    style={{ color: project.text }}
                  >
                    Project Overview
                  </h2>
                  <div className="flex gap-2">
                    <div
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: project.secondary }}
                    />
                    <div
                      className="w-10 h-10 rounded-full"
                      style={{ backgroundColor: project.primary }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-8">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-10 rounded-[2rem] shadow-sm border"
                      style={{
                        backgroundColor: project.card,
                        borderColor: ui.border,
                      }}
                    >
                      <h4
                        className="text-[10px] font-bold uppercase opacity-40 mb-4"
                        style={{ color: project.text }}
                      >
                        Metric Group 0{i}
                      </h4>
                      <p
                        className="text-5xl font-black"
                        style={{ color: project.text }}
                      >
                        84%
                      </p>
                      <div className="mt-6 h-2 w-full bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full"
                          style={{
                            width: "84%",
                            backgroundColor: project.primary,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activePage === "settings" && (
              <div className="max-w-2xl space-y-12">
                <h2
                  className="text-4xl font-black"
                  style={{ color: project.text }}
                >
                  Preferences
                </h2>
                <div className="space-y-4">
                  {[
                    "System Appearance",
                    "Primary Notification",
                    "Auto-Save Theme",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex justify-between items-center p-8 rounded-3xl"
                      style={{ backgroundColor: project.card }}
                    >
                      <span
                        className="font-bold text-lg"
                        style={{ color: project.text }}
                      >
                        {item}
                      </span>
                      <div
                        className="w-14 h-7 rounded-full p-1"
                        style={{ backgroundColor: project.primary }}
                      >
                        <div className="w-5 h-5 bg-white rounded-full ml-auto shadow-md" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
