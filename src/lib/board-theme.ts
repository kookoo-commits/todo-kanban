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
