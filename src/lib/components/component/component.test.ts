import { CanvasRenderingContext2D } from "@mgarnier11/my-canvas";
import { Effect } from "../../effects/effect/effect";
import { ComponentType } from "../../utils/enums";
import * as utils from "../../utils/utils";
import { Component, registerComponents } from "./component";

describe("Component", () => {
  describe("Component.Builder", () => {
    const builder: any = new Component.Builder();

    describe("setProperty", () => {
      it("should set the property", () => {
        jest.spyOn(utils, "setPropertyValue").mockImplementation(() => {});

        const builderReturn = builder.setProperty("test", 10);

        expect(utils.setPropertyValue).toHaveBeenCalledWith(expect.any(Object), "test", 10);
        expect(builderReturn).toEqual(builder);
      });
    });

    describe("withPosition", () => {
      it("should set the position", () => {
        const componentBuilder = builder.withPosition({ x: 10, y: 20 });

        expect(componentBuilder.builderProperties.position).toEqual({ x: 10, y: 20 });
      });
    });

    describe("withDisplay", () => {
      it("should set the display", () => {
        const componentBuilder = builder.withDisplay(true);

        expect(componentBuilder.builderProperties.display).toEqual(true);
      });
    });

    describe("withColor", () => {
      it("should set the color", () => {
        const componentBuilder = builder.withColor({ type: "rgba", r: 10, g: 20, b: 30 });

        expect(componentBuilder.builderProperties.color).toEqual({ type: "rgba", r: 10, g: 20, b: 30 });
      });
    });

    describe("withOpacity", () => {
      it("should set the opacity", () => {
        const componentBuilder = builder.withOpacity(0.5);

        expect(componentBuilder.builderProperties.opacity).toEqual(0.5);
      });
    });

    describe("withEffects", () => {
      it("should set the effects", () => {
        const componentBuilder = builder.withEffects(["test" as any]);

        expect(componentBuilder.effects).toEqual(["test"]);
      });
    });

    describe("buildComponent", () => {
      it("should build a component", () => {
        const setPropertiesMock = jest.fn();
        const setEffectsMock = jest.fn();
        const testClassMock = jest.fn().mockImplementation(() => {
          return {
            setProperties: setPropertiesMock,
            setEffects: setEffectsMock,
          };
        });

        Component.typeToClass = {
          [ComponentType.Unknown]: testClassMock,
        };

        const builder = new Component.Builder();

        const component = (builder as any).buildComponent(ComponentType.Unknown);

        expect(testClassMock).toHaveBeenCalled();
        expect(setPropertiesMock).toHaveBeenCalledWith((builder as any).builderProperties);
        expect(setEffectsMock).toHaveBeenCalledWith((builder as any).effects);
      });

      it("should throw an error if the type is unknown", () => {
        Component.typeToClass = {};

        const builder = new Component.Builder();

        expect(() => (builder as any).buildComponent(ComponentType.Unknown)).toThrowError(
          "Unknown component type: unknown"
        );
      });
    });
  });

  describe("Component", () => {
    class ComponentTest extends Component {
      public static Builder = class extends Component.Builder {
        public build(): ComponentTest {
          return super.buildComponent(ComponentType.Unknown);
        }
      };

      protected drawComponent(
        context: CanvasRenderingContext2D,
        frame: number,
        updatedProperties: any,
        ...params: any
      ): Promise<void> {
        return new Promise((res) => res());
      }
    }

    let component: any;

    beforeEach(() => {
      Component.typeToClass = {
        [ComponentType.Unknown]: ComponentTest,
      };

      component = new ComponentTest.Builder().build();
    });

    describe("getId", () => {
      it("should return the id", () => {
        component.id = "test";

        expect(component.getId()).toEqual("test");
      });
    });

    describe("toJSON", () => {
      it("should return the json", () => {
        const subComponent1: any = new ComponentTest.Builder().build();
        const subComponent2: any = new ComponentTest.Builder().build();

        component.id = "test";
        component.properties = { test: 10 };
        component.effects = [{ toJSON: () => "effect1" }, { toJSON: () => "effect2" }];
        component.subComponents = new Map([
          ["subComponent1", subComponent1],
          ["subComponent2", subComponent2],
        ]);

        subComponent1.id = "subComponent1";
        subComponent1.properties = { test: 20 };
        subComponent1.effects = [{ toJSON: () => "effect3" }, { toJSON: () => "effect4" }];

        subComponent2.id = "subComponent2";
        subComponent2.properties = { test: 30 };
        subComponent2.effects = [{ toJSON: () => "effect5" }, { toJSON: () => "effect6" }];

        const json = component.toJSON();

        expect(json).toEqual({
          id: "test",
          type: ComponentType.Unknown,
          properties: { test: 10 },
          effects: ["effect1", "effect2"],
          subComponents: {
            subComponent1: {
              id: "subComponent1",
              type: ComponentType.Unknown,
              properties: { test: 20 },
              effects: ["effect3", "effect4"],
              subComponents: {},
            },
            subComponent2: {
              id: "subComponent2",
              type: ComponentType.Unknown,
              properties: { test: 30 },
              effects: ["effect5", "effect6"],
              subComponents: {},
            },
          },
        });
      });
    });

    describe("fromJSON", () => {
      it("should return the component", () => {
        jest.spyOn(Effect, "fromJSON").mockImplementation((effect: any) => effect);

        const json = {
          id: "test",
          type: ComponentType.Unknown,
          properties: { test: 10 },
          effects: [{ effect: "effect1" }, { effect: "effect2" }],
          subComponents: {
            subComponent1: {
              id: "subComponent1",
              type: ComponentType.Unknown,
              properties: { test: 20 },
              effects: [{ effect: "effect3" }, { effect: "effect4" }],
              subComponents: {},
            },
            subComponent2: {
              id: "subComponent2",
              type: ComponentType.Unknown,
              properties: { test: 30 },
              effects: [{ effect: "effect5" }, { effect: "effect6" }],
              subComponents: {},
            },
          },
        };

        const component = Component.fromJSON(json) as any;

        expect(component.id).toEqual("test");
        expect(component.properties).toEqual({ test: 10 });
        expect(component.effects).toEqual([{ effect: "effect1" }, { effect: "effect2" }]);
        expect(component.subComponents.get("subComponent1").id).toEqual("subComponent1");
        expect(component.subComponents.get("subComponent1").properties).toEqual({ test: 20 });
        expect(component.subComponents.get("subComponent1").effects).toEqual([
          { effect: "effect3" },
          { effect: "effect4" },
        ]);
        expect(component.subComponents.get("subComponent2").id).toEqual("subComponent2");
        expect(component.subComponents.get("subComponent2").properties).toEqual({ test: 30 });
        expect(component.subComponents.get("subComponent2").effects).toEqual([
          { effect: "effect5" },
          { effect: "effect6" },
        ]);
      });

      it("should throw an error if the type is unknown", () => {
        const json = {
          id: "test",
          type: "test",
        };

        expect(() => Component.fromJSON(json)).toThrowError("Unknown component type: test");
      });
    });

    describe("setProperties", () => {
      it("should set the properties", () => {
        component.setProperties({ test: 10 } as any);

        expect(component.properties).toEqual({ test: 10 });
      });
    });

    describe("setEffects", () => {
      it("should set the effects", () => {
        component.setEffects(["test" as any]);

        expect(component.effects).toEqual(["test"]);
      });
    });

    describe("addSubComponent", () => {
      it("should add a sub component", () => {
        component.addSubComponent("test", "test" as any);

        expect(component.subComponents.get("test")).toEqual("test");
      });
    });

    describe("getProperties", () => {
      it("should get the properties", () => {
        component.properties = { test: 10 };

        const spy = jest.spyOn(utils, "dumbDeepCopy");

        expect(component.getProperties()).toEqual({ test: 10 });
        expect(spy).toHaveBeenCalledWith({ test: 10 });
      });
    });

    describe("setProperty", () => {
      it("should set the property", () => {
        jest.spyOn(utils, "setPropertyValue").mockImplementation(() => {});

        component.setProperty("test", 10);

        expect(utils.setPropertyValue).toHaveBeenCalledWith(expect.any(Object), "test", 10);
      });
    });

    describe("applyEffects", () => {
      it("should apply the effects and return modified properties", () => {
        const applyFn = (context: any, frame: number, properties: any) => {
          return { ...properties, test: properties.test + 5 };
        };
        const effect1 = { apply: jest.fn(applyFn) };
        const effect2 = { apply: jest.fn(applyFn) };

        component.effects = [effect1, effect2];
        component.properties = { test: 10 };

        const properties = component.applyEffects("context" as any, 10);

        expect(effect1.apply).toHaveBeenCalledWith("context", 10, { test: 10 });
        expect(effect2.apply).toHaveBeenCalledWith("context", 10, { test: 15 });
        expect(properties).toEqual({ test: 20 });
      });
    });

    describe("draw", () => {
      it("should apply the effects and draw the components and its subcomponents", async () => {
        const applyFn = (context: any, frame: number, properties: any) => {
          return {
            ...properties,
            position: { x: properties.position.x + 5, y: properties.position.y + 5 },
            opacity: properties.opacity - 0.05,
          };
        };
        const effect1 = { apply: jest.fn(applyFn) };
        const effect2 = { apply: jest.fn(applyFn) };

        const subComponent1 = { draw: jest.fn() };
        const subComponent2 = { draw: jest.fn() };

        const context = { save: jest.fn(), restore: jest.fn(), translate: jest.fn(), globalAlpha: 1 } as any;

        component.effects = [effect1, effect2];
        component.properties = { position: { x: 10, y: 10 }, opacity: 0.5, display: true };
        component.subComponents = new Map([
          ["subComponent1", subComponent1],
          ["subComponent2", subComponent2],
        ]);

        const drawComponentSpy = jest.spyOn(component as any, "drawComponent").mockImplementation(() => {});
        const contextSaveSpy = jest.spyOn(context, "save").mockImplementation(() => {});
        const contextRestoreSpy = jest.spyOn(context, "restore").mockImplementation(() => {});
        const contextTranslateSpy = jest.spyOn(context, "translate").mockImplementation(() => {});

        await component.draw(context, 10);

        expect(effect1.apply).toHaveBeenCalledWith(context, 10, {
          position: { x: 10, y: 10 },
          opacity: 0.5,
          display: true,
        });
        expect(effect2.apply).toHaveBeenCalledWith(context, 10, {
          position: { x: 15, y: 15 },
          opacity: 0.45,
          display: true,
        });
        expect(drawComponentSpy).toHaveBeenCalledWith(context, 10, {
          position: { x: 20, y: 20 },
          opacity: 0.4,
          display: true,
        });
        expect(context.globalAlpha).toEqual(0.4);
        expect(contextSaveSpy).toHaveBeenCalled();
        expect(contextRestoreSpy).toHaveBeenCalled();
        expect(contextTranslateSpy).toHaveBeenCalledWith(20, 20);
        expect(subComponent1.draw).toHaveBeenCalledWith(context, 10);
        expect(subComponent2.draw).toHaveBeenCalledWith(context, 10);
      });

      it("should not draw the component if display is false", () => {
        const context = { save: jest.fn(), restore: jest.fn(), translate: jest.fn(), globalAlpha: 1 } as any;

        component.properties = { display: false };

        const drawComponentSpy = jest.spyOn(component as any, "drawComponent").mockImplementation(() => {});
        const contextSaveSpy = jest.spyOn(context, "save").mockImplementation(() => {});
        const contextRestoreSpy = jest.spyOn(context, "restore").mockImplementation(() => {});
        const contextTranslateSpy = jest.spyOn(context, "translate").mockImplementation(() => {});

        component.draw(context, 10);

        expect(drawComponentSpy).not.toHaveBeenCalled();
        expect(contextSaveSpy).not.toHaveBeenCalled();
        expect(contextRestoreSpy).not.toHaveBeenCalled();
        expect(contextTranslateSpy).not.toHaveBeenCalled();
      });
    });

    describe("getSubComponent", () => {
      it("should get the sub component", () => {
        component.subComponents = new Map([["test", "test"]]);

        expect(component.getSubComponent("test")).toEqual("test");
      });
    });

    describe("getEffect", () => {
      it("should get the effect", () => {
        const effect1 = { getId: () => "test1" };
        const effect2 = { getId: () => "test2" };

        component.effects = [effect1, effect2];

        expect(component.getEffect("test2")).toEqual(effect2);
      });
    });
  });

  describe("registerComponents", () => {
    it("should register the components", async () => {
      jest.mock("../rectangle/rectangle.js", () => ({ Rectangle: "rectangle" }));
      jest.mock("../text/text.js", () => ({ Text: "text" }));
      jest.mock("../progressBar/progressBar.js", () => ({ ProgressBar: "progressBar" }));

      await registerComponents();

      expect(Component.typeToClass).toEqual({
        [ComponentType.Rectangle]: "rectangle",
        [ComponentType.Text]: "text",
        [ComponentType.ProgressBar]: "progressBar",
      });
    });
  });
});
