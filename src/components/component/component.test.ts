import { Component } from "./component";

describe("Component", () => {
  describe("Component.Builder", () => {
    describe("withPosition", () => {
      it("should set the position", () => {
        const component = new Component.Builder().withPosition({ x: 10, y: 20 });

        expect((component as any).builderProperties.position).toEqual({ x: 10, y: 20 });
      });
    });
  });

  describe("Component", () => {});
});
