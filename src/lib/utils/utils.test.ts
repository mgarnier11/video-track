import * as utils from "./utils";

describe("utils", () => {
  describe("dumbDeepCopy", () => {
    it("should return a deep copy of the object", () => {
      const object = {
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
      };

      const copy = utils.dumbDeepCopy(object);

      expect(copy).toEqual(object);
      expect(copy).not.toBe(object);
      expect(copy.b).not.toBe(object.b);
    });
  });

  describe("getPropertyValue", () => {
    it("should return the value of the property", () => {
      const object = {
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
      };

      const value = utils.getPropertyValue(object, "b.c");

      expect(value).toEqual(2);
    });
  });

  describe("setPropertyValue", () => {
    it("should set the value of the property", () => {
      const object = {
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
      };

      utils.setPropertyValue(object, "b.c", 4);

      expect(object.b.c).toEqual(4);
    });

    it("should set the value of the property when it is an object", () => {
      const object = {
        a: 1,
        b: {
          c: 2,
          d: 3,
        },
      };

      utils.setPropertyValue(object, "b", { c: 4, d: 5 });

      expect(object.b).toEqual({ c: 4, d: 5 });
    });
  });

  describe("generateId", () => {
    it("should return a new id", () => {
      jest.spyOn(Date, "now").mockReturnValue(123456789);
      jest.spyOn(Math, "random").mockReturnValue(0.123456789);

      const id = utils.generateId();

      expect(id).toEqual("21i3v94fzzzxjylrx");
    });

    it("should return a unique id", () => {
      const ids = new Set<string>();

      for (let i = 0; i < 1000; i++) {
        const id = utils.generateId();

        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }

      expect(ids.size).toEqual(1000);
    });
  });
});
