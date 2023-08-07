import { CanvasRenderingContext2D } from "canvas";
import { dumbDeepCopy } from "../../utils/utils.js";
import { Component, ComponentProperties } from "../component/component.js";
import { CanvasUtils } from "../../utils/canvasUtils.js";
import { AllPaths, Corners, Size } from "../../utils/interfaces.js";
import { ComponentType } from "../../utils/enums.js";

type RectangleProperties = ComponentProperties & {
  size: Size;
  corners: Corners;
};

const defaultRectangleProperties: RectangleProperties = {
  ...Component.defaultComponentProperties,
  size: { width: 0, height: 0 },
  corners: { type: "corners4", topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 },
};

// prettier-ignore
class Builder extends Component.Builder {
  builderProperties: RectangleProperties = dumbDeepCopy(defaultRectangleProperties);

  public withSize(size: Size): this { return this.setProperty<RectangleProperties>("size", size); }
  public withCorners(corners: Corners): this { return this.setProperty<RectangleProperties>("corners", corners); }

  public build(): Rectangle { return  super.buildComponent(ComponentType.Rectangle); }
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
    CanvasUtils.drawRoundedRectangle(
      context,
      updatedProperties.position,
      updatedProperties.size,
      CanvasUtils.getColorString(updatedProperties.color),
      updatedProperties.corners
    );
  }

  public override setProperty<RectangleProperties>(propertyPath: AllPaths<RectangleProperties>, value: any) {
    super.setProperty(propertyPath, value);
  }
}
