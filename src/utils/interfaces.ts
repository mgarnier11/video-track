export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

interface HSLAColor {
  type: "hsla";
  h: number;
  s: number;
  l: number;
  a?: number;
}

interface RGBAColor {
  type: "rgba";
  r: number;
  g: number;
  b: number;
  a?: number;
}

export type Color = HSLAColor | RGBAColor | string;

interface Corners4 {
  type: "corners4";
  topLeft: number;
  topRight: number;
  bottomRight: number;
  bottomLeft: number;
}

interface Corners2 {
  type: "corners2";
  topLeft: number;
  topRight: number;
}

export type Corners = Corners4 | Corners2 | number;
