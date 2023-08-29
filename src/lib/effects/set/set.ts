import { CanvasRenderingContext2D } from "@mgarnier11/my-canvas";
import { Effect, EffectProperties } from "../effect/effect.js";
import { dumbDeepCopy, setPropertyValue } from "../../utils/utils.js";
import { EffectType } from "../../utils/enums.js";

type SetProperties = EffectProperties & {
  property: string;
  frameToSet: number;
  value: any;
};

const defaultSetProperties: SetProperties = {
  property: "",
  frameToSet: 0,
  value: null,
};

class Builder extends Effect.Builder {
  builderProperties: SetProperties = dumbDeepCopy(defaultSetProperties);

  public withProperty(property: string): this {
    return this.setProperty<SetProperties>("property", property);
  }
  public withFrameToSet(frameToSet: number): this {
    return this.setProperty<SetProperties>("frameToSet", frameToSet);
  }
  public withValue(value: any): this {
    return this.setProperty<SetProperties>("value", value);
  }

  public build(): Set {
    return this.buildEffect<Set>(EffectType.Set);
  }
}

export class Set extends Effect {
  public static override Builder = Builder;

  protected type = EffectType.Set;
  protected override properties: SetProperties = dumbDeepCopy(defaultSetProperties);

  public override apply(context: CanvasRenderingContext2D, actualFrame: number, properties: any): void {
    if (actualFrame >= this.properties.frameToSet) {
      setPropertyValue(properties, this.properties.property, this.properties.value);
    }

    return properties;
  }
}
