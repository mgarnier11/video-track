import { CanvasRenderingContext2D } from "@mgarnier11/my-canvas";
import { dumbDeepCopy, getPropertyValue, setPropertyValue } from "../../utils/utils.js";
import { Effect, EffectProperties } from "../effect/effect.js";
import { EffectType, TransitionType } from "../../utils/enums.js";

type TransitionProperties = EffectProperties & {
  property: string;
  endValue: number;
  startFrame: number;
  endFrame: number;
  transitionType: TransitionType;
};

const defaultTransitionProperties: TransitionProperties = {
  property: "",
  endValue: 0,
  startFrame: 0,
  endFrame: 0,
  transitionType: TransitionType.LINEAR,
};

// prettier-ignore
class Builder extends Effect.Builder {
  builderProperties: TransitionProperties = dumbDeepCopy(defaultTransitionProperties);

  public withProperty(property: string): this { return this.setProperty<TransitionProperties>("property", property); }
  public withEndValue(endValue: number): this { return this.setProperty<TransitionProperties>("endValue", endValue); }
  public withStartFrame(startFrame: number): this { return this.setProperty<TransitionProperties>("startFrame", startFrame); }
  public withEndFrame(endFrame: number): this { return this.setProperty<TransitionProperties>("endFrame", endFrame); }
  public withTransitionType(transitionType: TransitionType): this { return this.setProperty<TransitionProperties>("transitionType", transitionType); }

  public build(): Transition { return this.buildEffect<Transition>(EffectType.Transition); }
  
}

export class Transition extends Effect {
  public static override Builder = Builder;

  protected type = EffectType.Transition;
  protected override properties: TransitionProperties = dumbDeepCopy(defaultTransitionProperties);

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    const startFrame = this.properties.startFrame;
    const endFrame = this.properties.endFrame;
    const transitionType = this.properties.transitionType;

    if (actualFrame < startFrame) return properties;
    if (actualFrame > endFrame) {
      setPropertyValue(properties, this.properties.property, this.properties.endValue);
      return properties;
    }

    const startValue = getPropertyValue(properties, this.properties.property);

    let progress = 0;

    if (transitionType === TransitionType.LINEAR) {
      progress = (actualFrame - startFrame) / (endFrame - startFrame);
    } else if (transitionType === TransitionType.EASE_IN) {
      progress = Math.pow((actualFrame - startFrame) / (endFrame - startFrame), 2);
    } else if (transitionType === TransitionType.EASE_OUT) {
      progress = 1 - Math.pow(1 - (actualFrame - startFrame) / (endFrame - startFrame), 2);
    } else if (transitionType === TransitionType.EASE_IN_OUT) {
      progress = 0.5 - 0.5 * Math.cos((Math.PI * (actualFrame - startFrame)) / (endFrame - startFrame));
    }

    setPropertyValue(
      properties,
      this.properties.property,
      startValue + (this.properties.endValue - startValue) * progress
    );

    return properties;
  }

  public updateEndValue(endValue: number) {
    this.properties.endValue = endValue;
  }

  public updateStartFrame(startFrame: number) {
    this.properties.startFrame = startFrame;
  }

  public updateEndFrame(endFrame: number) {
    this.properties.endFrame = endFrame;
  }
}
