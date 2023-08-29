import { CanvasRenderingContext2D } from "@mgarnier11/my-canvas";

import { AllPaths, Color, Point } from "../../utils/interfaces.js";
import { dumbDeepCopy, generateId, setPropertyValue } from "../../utils/utils.js";
import { ComponentType } from "../../utils/enums.js";
import { Effect } from "../../effects/effect/effect.js";

export interface ComponentProperties {
  position: Point;
  display: boolean;
  color: Color;
  opacity: number;
}

class Builder {
  protected type: ComponentType = ComponentType.Unknown;
  protected builderProperties: ComponentProperties = dumbDeepCopy(Component.defaultComponentProperties);
  protected effects: Effect[] = [];

  protected setProperty<T>(propertyPath: keyof T, value: any): this {
    setPropertyValue(this.builderProperties, propertyPath as string, value);

    return this;
  }

  public withPosition(position: Point): this {
    return this.setProperty<ComponentProperties>("position", position);
  }
  public withDisplay(display: boolean): this {
    return this.setProperty<ComponentProperties>("display", display);
  }
  public withColor(color: Color): this {
    return this.setProperty<ComponentProperties>("color", color);
  }
  public withOpacity(opacity: number): this {
    return this.setProperty<ComponentProperties>("opacity", opacity);
  }
  public withEffects(effects: Effect[]): this {
    this.effects = effects;
    return this;
  }

  protected buildComponent<T extends Component>(type: ComponentType): T {
    const ComponentClass = Component.typeToClass[type];

    if (!ComponentClass) {
      throw new Error(`Unknown component type: ${type}`);
    }

    const component = new ComponentClass() as Component;

    component.setProperties(this.builderProperties);
    component.setEffects(this.effects);

    return component as T;
  }
}

export abstract class Component {
  public static Builder = Builder;

  public static typeToClass: any = undefined;
  public static async setTypeToClass() {
    Component.typeToClass = {
      [ComponentType.Rectangle]: (await import("../rectangle/rectangle.js")).Rectangle,
      [ComponentType.Text]: (await import("../text/text.js")).Text,
      [ComponentType.ProgressBar]: (await import("../progressBar/progressBar.js")).ProgressBar,
    };
  }

  public static defaultComponentProperties: ComponentProperties = {
    position: { x: 0, y: 0 },
    display: true,
    color: { type: "rgba", r: 0, g: 0, b: 0 },
    opacity: 1,
  };

  protected id: string;
  public getId = (): string => this.id;

  constructor() {
    this.id = generateId();
  }

  protected type: ComponentType = ComponentType.Unknown;
  protected effects: Effect[] = [];
  protected subComponents: Map<string, Component> = new Map();

  protected properties: ComponentProperties = dumbDeepCopy(Component.defaultComponentProperties);

  public toJSON(): any {
    const subComponents = Object.fromEntries(
      Array.from(this.subComponents.entries()).map(([name, component]) => [name, component.toJSON()])
    );

    const effects = this.effects.map((effect) => effect.toJSON());

    return {
      type: this.type,
      properties: this.getProperties(),
      effects: effects,
      subComponents: subComponents,
      id: this.id,
    };
  }

  public static fromJSON<T extends Component>(json: any): T {
    const ComponentClass = Component.typeToClass[json.type as ComponentType];

    if (!ComponentClass) {
      throw new Error(`Unknown component type: ${json.type}`);
    }

    const component = new ComponentClass() as Component;

    component.id = json.id;
    component.setProperties(json.properties);
    component.effects = json.effects.map((effect: any) => Effect.fromJSON(effect));
    component.subComponents = new Map(
      Object.entries(json.subComponents).map(([name, subComponent]: [string, any]) => [
        name,
        Component.fromJSON(subComponent),
      ])
    );

    component.setSpecialProperties(json);

    return component as T;
  }

  protected setSpecialProperties(json: any): void {}

  public setProperties(properties: ComponentProperties) {
    this.properties = dumbDeepCopy(properties);
  }

  public setEffects(effects: Effect[]) {
    this.effects = effects;
  }

  public addSubComponent(name: string, component: Component) {
    this.subComponents.set(name, component);
  }

  public getProperties(): ComponentProperties {
    return dumbDeepCopy(this.properties);
  }

  protected setProperty<T>(propertyPath: AllPaths<T>, value: any) {
    return setPropertyValue(this.properties, propertyPath, value);
  }

  public applyEffects(context: CanvasRenderingContext2D, frame: number) {
    let properties = this.getProperties();

    for (const effect of this.effects.values()) {
      properties = effect.apply(context, frame, properties);
    }

    return properties;
  }

  public draw(context: CanvasRenderingContext2D, frame: number, ...params: any) {
    const updatedProperties = this.applyEffects(context, frame);

    if (updatedProperties.display) {
      context.save();

      context.globalAlpha = updatedProperties.opacity;

      this.drawComponent(context, frame, updatedProperties, ...params);

      context.translate(updatedProperties.position.x, updatedProperties.position.y);

      for (const subComponent of this.subComponents.values()) {
        subComponent.draw(context, frame);
      }

      context.restore();
    }
  }

  protected getSubComponent<T extends Component>(name: string): T {
    return this.subComponents.get(name) as T;
  }

  public getEffect<T extends Effect>(id: string): T {
    return this.effects.find((effect) => effect.getId() === id) as T;
  }

  protected abstract drawComponent(
    context: CanvasRenderingContext2D,
    frame: number,
    updatedProperties: any,
    ...params: any
  ): void;
}

export const registerComponents = async () => {
  await Component.setTypeToClass();
};
