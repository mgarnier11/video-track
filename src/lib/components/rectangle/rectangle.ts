import { CanvasRenderingContext2D } from "@mgarnier11/my-canvas";
import { dumbDeepCopy } from "../../utils/utils.js";
import { Component, ComponentProperties } from "../component/component.js";
import { CanvasUtils } from "../../utils/canvasUtils.js";
import { AllPaths, Color, Corners, Size } from "../../utils/interfaces.js";
import { ComponentType } from "../../utils/enums.js";

type RectangleProperties = ComponentProperties & {
  size: Size;
  corners: Corners;
  borderColor: Color;
  borderWidth: number;
  fill: boolean;
  border: boolean;
};

const defaultRectangleProperties: RectangleProperties = {
  ...Component.defaultComponentProperties,
  size: { width: 0, height: 0 },
  corners: { type: "corners4", topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
  borderColor: { type: "rgba", r: 0, g: 0, b: 0 },
  borderWidth: 0,
  fill: true,
  border: false,
};

class Builder extends Component.Builder {
  builderProperties: RectangleProperties = dumbDeepCopy(defaultRectangleProperties);

  public withBorderColor(color: Color): this {
    return this.setProperty<RectangleProperties>("borderColor", color);
  }
  public withBorderWidth(width: number): this {
    return this.setProperty<RectangleProperties>("borderWidth", width);
  }
  public withSize(size: Size): this {
    return this.setProperty<RectangleProperties>("size", size);
  }
  public withCorners(corners: Corners): this {
    return this.setProperty<RectangleProperties>("corners", corners);
  }
  public fillOnly(): this {
    return this.setProperty<RectangleProperties>("fill", true).setProperty<RectangleProperties>("border", false);
  }
  public borderOnly(): this {
    return this.setProperty<RectangleProperties>("fill", false).setProperty<RectangleProperties>("border", true);
  }
  public fillAndBorder(): this {
    return this.setProperty<RectangleProperties>("fill", true).setProperty<RectangleProperties>("border", true);
  }

  public build(): Rectangle {
    return super.buildComponent<Rectangle>(ComponentType.Rectangle);
  }
}

export class Rectangle extends Component {
  public static Builder = Builder;

  protected type = ComponentType.Rectangle;
  protected override properties: RectangleProperties = dumbDeepCopy(defaultRectangleProperties);

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: RectangleProperties
  ) {
    if (updatedProperties.border) {
      CanvasUtils.drawRoundedRectangleBorder(
        context,
        {
          x: updatedProperties.position.x + updatedProperties.borderWidth / 2,
          y: updatedProperties.position.y + updatedProperties.borderWidth / 2,
        },
        {
          width: updatedProperties.size.width - updatedProperties.borderWidth,
          height: updatedProperties.size.height - updatedProperties.borderWidth,
        },
        CanvasUtils.getColorString(updatedProperties.borderColor),
        updatedProperties.corners,
        updatedProperties.borderWidth
      );
    }

    if (updatedProperties.fill) {
      CanvasUtils.drawRoundedRectangle(
        context,
        updatedProperties.position,
        updatedProperties.size,
        CanvasUtils.getColorString(updatedProperties.color),
        updatedProperties.corners
      );
    }
  }

  public override setProperty<RectangleProperties>(propertyPath: AllPaths<RectangleProperties>, value: any) {
    super.setProperty(propertyPath, value);
  }
}
