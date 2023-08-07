import { CanvasRenderingContext2D } from "canvas";
import { Effect } from "../../effects/effect/effect.js";
import { Component, ComponentProperties } from "../component/component.js";
import { dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { Text } from "../text/text.js";
import { RectangleBorder } from "../rectangle/rectangleBorder.js";
import { BorderAnimation } from "../../effects/borderAnimation/borderAnimation.js";
import { Transition } from "../../effects/transition/transition.js";
import { AllPaths, Color, Corners, Size } from "../../utils/interfaces.js";
import { ComponentType, TransitionType } from "../../utils/enums.js";
import { Rectangle } from "../rectangle/rectangle.js";

interface ProgressSettings {
  offset: Size;
  corners: Corners;
}

interface BorderSettings {
  width: number;
  color: Color;
  corners: Corners;
}

type ProgressBarProperties = ComponentProperties & {
  size: Size;
  startFrame: number;
  endFrame: number;
  progressSettings: ProgressSettings;
  borderSettings: BorderSettings;
  transitionType: TransitionType;
};

const defaultProgressBarProperties: ProgressBarProperties = {
  ...Component.defaultComponentProperties,
  size: { width: 0, height: 0 },
  startFrame: 0,
  endFrame: 0,
  progressSettings: {
    offset: { width: 0, height: 0 },
    corners: 0,
  },
  borderSettings: {
    width: 0,
    color: { type: "rgba", r: 0, g: 0, b: 0 },
    corners: 0,
  },
  transitionType: TransitionType.EASE_IN_OUT,
};

// prettier-ignore
class Builder extends Component.Builder {
  builderProperties: ProgressBarProperties = dumbDeepCopy(defaultProgressBarProperties);
  
  public withSize(size: Size): this { return this.setProperty<ProgressBarProperties>("size", size); }
  public withStartFrame(startFrame: number): this { return this.setProperty<ProgressBarProperties>("startFrame", startFrame); }
  public withEndFrame(endFrame: number): this { return this.setProperty<ProgressBarProperties>("endFrame", endFrame); }
  public withProgressSettings(progressSettings: ProgressSettings): this { return this.setProperty<ProgressBarProperties>("progressSettings", progressSettings); }
  public withBorderSettings(borderSettings: BorderSettings): this { return this.setProperty<ProgressBarProperties>("borderSettings", borderSettings); }
  public withTransitionType(transitionType: TransitionType): this { return this.setProperty<ProgressBarProperties>("transitionType", transitionType); }

  public build(framerate: number) {
    const component = super.buildComponent<ProgressBar>(ComponentType.ProgressBar);

    component.setEffects([
      ...this.effects,
      new BorderAnimation.Builder()
        .withStartFrame(this.builderProperties.endFrame)
        .withEndFrame(this.builderProperties.endFrame + framerate * 0.25)
        .withBorderDelay(2) //has to be indexed to the framerate
        .withNbBorders(3)
        .build(),
    ]);

    const progressTransition = new Transition.Builder()
      .withProperty("size.width")
      .withEndValue(this.builderProperties.size.width - this.builderProperties.progressSettings.offset.width * 2)
      .withStartFrame(this.builderProperties.startFrame)
      .withEndFrame(this.builderProperties.endFrame)
      .withTransitionType(this.builderProperties.transitionType)
      .build();
      
    component.setSpecialProperties({
      progressTransitionId: progressTransition.getId(),
    });

    component.addSubComponent(
      "border",
      new RectangleBorder.Builder()
        .withPosition({ x: 0, y: 0 })
        .withSize({ width: 0, height: 0 })
        .withWidth(this.builderProperties.borderSettings.width)
        .withColor(this.builderProperties.borderSettings.color)
        .withCorners(this.builderProperties.borderSettings.corners)
        .build()
    );
    component.addSubComponent(
      "progress",
      new Rectangle.Builder()
        .withPosition({ x: this.builderProperties.progressSettings.offset.width, y: 0 })
        .withSize({ width: 0, height: 0 })
        .withColor(this.builderProperties.color)
        .withCorners(this.builderProperties.progressSettings.corners)
        .withEffects([progressTransition])
        .build()
    );

    return component;
  }
}

export class ProgressBar extends Component {
  public static Builder = Builder;

  protected type = ComponentType.ProgressBar;
  protected override properties: ProgressBarProperties = dumbDeepCopy(defaultProgressBarProperties);
  private progressTransitionId: string = "";

  public override toJSON() {
    const json = super.toJSON();

    return {
      ...json,
      progressTransitionId: this.progressTransitionId,
    };
  }

  public override setSpecialProperties(json: any) {
    this.progressTransitionId = json.progressTransitionId;
  }

  public override drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: ProgressBarProperties
  ) {
    const border = this.getSubComponent<RectangleBorder>("border");
    border.setProperty("size", updatedProperties.size);
    border.setProperty("color", updatedProperties.borderSettings.color);
    border.setProperty("width", updatedProperties.borderSettings.width);
    border.setProperty("corners", updatedProperties.borderSettings.corners);

    const progress = this.getSubComponent<Rectangle>("progress");
    progress.setProperty("position.x", updatedProperties.progressSettings.offset.width);
    progress.setProperty("position.y", updatedProperties.progressSettings.offset.height);
    progress.setProperty(
      "size.height",
      updatedProperties.size.height - updatedProperties.progressSettings.offset.height * 2
    );
    progress.setProperty("color", updatedProperties.color);
    progress.setProperty("corners", updatedProperties.progressSettings.corners);

    const progressTransition = progress.getEffect<Transition>(this.progressTransitionId);

    if (progressTransition)
      progressTransition.updateEndValue(
        updatedProperties.size.width - updatedProperties.progressSettings.offset.width * 2
      );
  }

  public override setProperty<ProgressBarProperties>(propertyPath: AllPaths<ProgressBarProperties>, value: any) {
    super.setProperty(propertyPath, value);
  }
}
