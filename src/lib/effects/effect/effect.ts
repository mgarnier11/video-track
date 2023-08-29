import { CanvasRenderingContext2D } from "@mgarnier11/my-canvas";
import { dumbDeepCopy, generateId, setPropertyValue } from "../../utils/utils.js";
import { EffectType } from "../../utils/enums.js";

export interface EffectProperties {}

class Builder {
  protected builderProperties: EffectProperties = dumbDeepCopy(Effect.defaultEffectProperties);

  protected setProperty<T>(propertyPath: keyof T, value: any): this {
    setPropertyValue(this.builderProperties, propertyPath as string, value);

    return this;
  }

  protected buildEffect<T extends Effect>(type: EffectType): T {
    const EffectClass = Effect.typeToClass[type];

    if (!EffectClass) {
      throw new Error(`Unknown effect type: ${type}`);
    }

    const effect = new EffectClass() as Effect;

    effect.setProperties(this.builderProperties);

    return effect as T;
  }
}

export abstract class Effect {
  public static typeToClass: any = undefined;
  public static async setTypeToClass() {
    Effect.typeToClass = {
      [EffectType.BorderAnimation]: (await import("../borderAnimation/borderAnimation.js")).BorderAnimation,
      [EffectType.Switch]: (await import("../switch/switch.js")).Switch,
      [EffectType.Transition]: (await import("../transition/transition.js")).Transition,
      [EffectType.Set]: (await import("../set/set.js")).Set,
    };
  }

  public static defaultEffectProperties: EffectProperties = {};
  protected properties: EffectProperties = dumbDeepCopy(Effect.defaultEffectProperties);
  protected type: EffectType = EffectType.Unknown;
  protected id: string;
  public getId = (): string => this.id;

  constructor() {
    this.id = generateId();
  }

  public abstract apply(context: CanvasRenderingContext2D, actualFrame: number, componentProperties: any): any;

  public setProperties(properties: EffectProperties) {
    this.properties = dumbDeepCopy(properties);
  }

  public getProperties(): EffectProperties {
    return dumbDeepCopy(this.properties);
  }
  public toJSON(): any {
    return {
      properties: this.getProperties(),
      type: this.type,
      id: this.id,
    };
  }

  public static fromJSON<T extends Effect>(json: any): T {
    const EffectClass = Effect.typeToClass[json.type as EffectType];

    if (!EffectClass) {
      throw new Error(`Unknown effect type: ${json.type}`);
    }

    const effect = new EffectClass() as Effect;

    effect.id = json.id;
    effect.setProperties(json.properties);

    return effect as T;
  }

  public static Builder = Builder;
}

export const registerEffects = async () => {
  await Effect.setTypeToClass();
};
