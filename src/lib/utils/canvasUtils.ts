import { CanvasRenderingContext2D } from "@mgarnier11/my-canvas";
import { Color, Corners, Point, Size } from "./interfaces.js";

export class CanvasUtils {
  private static roundRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    corners?: Corners
  ): void {
    if (corners !== undefined) {
      if (typeof corners === "number") {
        context.roundRect(x, y, width, height, [corners]);
      } else if (corners.type === "corners2") {
        context.roundRect(x, y, width, height, [corners.topLeft, corners.topRight]);
      } else if (corners.type === "corners4") {
        context.roundRect(x, y, width, height, [
          corners.topLeft,
          corners.topRight,
          corners.bottomRight,
          corners.bottomLeft,
        ]);
      }
    } else {
      context.rect(x, y, width, height);
    }
  }

  public static drawRoundedRectangle(
    context: CanvasRenderingContext2D,
    position: Point,
    size: Size,
    color: string,
    corners?: Corners
  ): void {
    context.save();
    context.fillStyle = color;
    context.beginPath();
    CanvasUtils.roundRect(context, position.x, position.y, size.width, size.height, corners);
    context.fill();
    context.closePath();
    context.restore();
  }

  public static drawRoundedRectangleBorder(
    context: CanvasRenderingContext2D,
    position: Point,
    size: Size,
    color: string,
    corners?: Corners,
    lineWidth = 1
  ): void {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.beginPath();
    CanvasUtils.roundRect(context, position.x, position.y, size.width, size.height, corners);
    context.stroke();
    context.closePath();
    context.restore();
  }

  public static getColorString(color: Color) {
    if (typeof color === "string") return color;
    if (color.type === "hsla") {
      return `hsl(${color.h}, ${color.s}%, ${color.l}%, ${color.a ?? 1})`;
    } else if (color.type === "rgba") {
      return `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a ?? 1})`;
    } else {
      return "";
    }
  }
}
