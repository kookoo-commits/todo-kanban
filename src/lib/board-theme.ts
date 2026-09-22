export type BoardTheme = {
  canvas: string;
  paper: string;
  ink: string;
  todo: string;
  doing: string;
  done: string;
};

export const HANJI_THEME: BoardTheme = {
  canvas: "#f1eee7",
  paper: "#fbfaf6",
  ink: "#1c1b17",
  todo: "#8a8478",
  doing: "#4f5d68",
  done: "#4e6556",
};

export const DEFAULT_THEME: BoardTheme = {
  canvas: "#131210",
  paper: "#2c2924",
  ink: "#e6e2da",
  todo: "#9a9286",
  doing: "#4f86a0",
  done: "#7a9a82",
};

export const THEME_PRESETS: { id: string; label: string; hint: string; theme: BoardTheme }[] = [
  { id: "black", label: "블랙", hint: "지금 작업 중인 어두운 테마", theme: DEFAULT_THEME },
  { id: "basic", label: "베이직", hint: "처음 만든 한지 테마", theme: HANJI_THEME },
  {
    id: "indigo",
    label: "쪽",
    hint: "푸른 종이",
    theme: { canvas: "#e7eef4", paper: "#f7fafc", ink: "#1c2a38", todo: "#6d7f90", doing: "#3d5a73", done: "#2f6b5c" },
  },
  {
    id: "ochre",
    label: "황토",
    hint: "따뜻한 종이",
    theme: { canvas: "#f3e6d4", paper: "#fff8ee", ink: "#3a2418", todo: "#c08a4a", doing: "#b45a3c", done: "#5d7a4a" },
  },
];

export const PRIMARY_THEMES = THEME_PRESETS.filter((preset) => preset.id === "black" || preset.id === "basic");

export function themesMatch(a: BoardTheme, b: BoardTheme) {
  return (
    a.canvas === b.canvas &&
    a.paper === b.paper &&
    a.ink === b.ink &&
    a.todo === b.todo &&
    a.doing === b.doing &&
    a.done === b.done
  );
}

const HEX = /^#([0-9a-f]{6})$/i;

export function isHexColor(value: unknown): value is string {
  return typeof value === "string" && HEX.test(value);
}

export function normalizeTheme(raw: unknown): BoardTheme {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    canvas: isHexColor(source.canvas) ? source.canvas : DEFAULT_THEME.canvas,
    paper: isHexColor(source.paper) ? source.paper : DEFAULT_THEME.paper,
    ink: isHexColor(source.ink) ? source.ink : DEFAULT_THEME.ink,
    todo: isHexColor(source.todo) ? source.todo : DEFAULT_THEME.todo,
    doing: isHexColor(source.doing) ? source.doing : DEFAULT_THEME.doing,
    done: isHexColor(source.done) ? source.done : DEFAULT_THEME.done,
  };
}

function parseHex(hex: string): [number, number, number] {
  const match = HEX.exec(hex);
  const value = match ? parseInt(match[1], 16) : 0;
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function toHex([r, g, b]: [number, number, number]) {
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function mix(a: [number, number, number], b: [number, number, number], amount: number): [number, number, number] {
  return [
    Math.round(a[0] + (b[0] - a[0]) * amount),
    Math.round(a[1] + (b[1] - a[1]) * amount),
    Math.round(a[2] + (b[2] - a[2]) * amount),
  ];
}

function luminance([r, g, b]: [number, number, number]) {
  const channel = (value: number) => {
    const scaled = value / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function isDarkHex(hex: string) {
  return luminance(parseHex(hex)) < 0.45;
}

export function themeCssVars(theme: BoardTheme): Record<string, string> {
  const canvas = parseHex(theme.canvas);
  const paper = parseHex(theme.paper);
  const ink = parseHex(theme.ink);
  const dark = isDarkHex(theme.canvas);
  const onCanvas: [number, number, number] = dark ? [230, 226, 218] : [28, 27, 23];
  const surface = mix(canvas, ink, dark ? 0.1 : 0.08);
  const line = mix(canvas, ink, dark ? 0.18 : 0.12);
  const muted = mix(ink, paper, 0.42);
  const faint = mix(ink, paper, 0.58);
  const onCanvasMuted = mix(onCanvas, canvas, dark ? 0.42 : 0.38);
  const ring = dark ? "246 243 235" : "28 27 23";
  const shade = dark ? "0 0 0" : "28 27 23";
  const ringA = dark ? 0.08 : 0.05;
  const ringHover = dark ? 0.12 : 0.08;
  return {
    "--color-canvas": theme.canvas,
    "--color-paper": theme.paper,
    "--color-ink": theme.ink,
    "--color-todo": theme.todo,
    "--color-doing": theme.doing,
    "--color-done": theme.done,
    "--color-on-canvas": toHex(onCanvas),
    "--color-on-canvas-muted": toHex(onCanvasMuted),
    "--color-surface": toHex(surface),
    "--color-line": toHex(line),
    "--color-muted": toHex(muted),
    "--color-faint": toHex(faint),
    "--color-accent": theme.ink,
    "--color-accent-fg": theme.paper,
    "--color-danger-soft": dark ? "#3a241f" : "#f3e4df",
    "--color-scrim": dark ? "#000000" : "#1c1b17",
    "--shadow-card": `0 1px 2px rgb(${shade} / ${dark ? 0.4 : 0.05}), 0 0 0 1px rgb(${ring} / ${ringA})`,
    "--shadow-card-hover": `0 8px 20px rgb(${shade} / ${dark ? 0.5 : 0.08}), 0 0 0 1px rgb(${ring} / ${ringHover})`,
    "--shadow-overlay": `0 18px 40px rgb(${shade} / ${dark ? 0.55 : 0.16}), 0 0 0 1px rgb(${ring} / ${ringHover})`,
    "--shadow-column": `0 0 0 1px rgb(${ring} / ${dark ? 0.07 : 0.05})`,
  };
}

export function applyBoardTheme(theme: BoardTheme, title: string) {
  const root = document.documentElement;
  const vars = themeCssVars(theme);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  root.dataset.surface = isDarkHex(theme.canvas) ? "dark" : "light";
  document.title = title;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme.canvas);
}
