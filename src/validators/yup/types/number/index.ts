import { MixedSchemaEntry } from "../mixed";
import { createNumberGuard } from "./guard";

export { createNumberGuard };

const proceed = (obj, config = {}) => {
  return createNumberGuard(obj, config).verify();
};

export function toNumber(obj, config = {}) {
  return proceed(obj, config) && buildNumber(obj);
}

export function toSchemaEntry(obj, config = {}) {
  return proceed(obj, config) && buildSchemaEntry(obj);
}

export function buildSchemaEntry(obj) {
  return NumberSchemaEntry.schemaEntryFor(obj);
}

export function buildNumber(obj) {
  return NumberSchemaEntry.create(obj);
}

class NumberSchemaEntry extends MixedSchemaEntry {
  constructor(obj) {
    super(obj);
    this.type = this.normalizeNumType(obj.type);
    // this.validatorTypeApi = this.yup.number();
  }

  normalizeNumType(type) {
    return type === "int" ? "integer" : type;
  }

  static create(obj) {
    return new NumberSchemaEntry(obj);
  }

  static schemaEntryFor(obj) {
    return NumberSchemaEntry.create(obj).createSchemaEntry();
  }

  get enabled() {
    return ["range", "posNeg", "integer", "truncate", "round"];
  }

  convert() {
    this.enabled.map(name => this.processConstraint(name));
    super.convert();
    return this;
  }

  processConstraint(name: string) {
    const fn = this[name];
    fn && typeof fn === "function" ? fn.bind(this)() : fn.add();
    return this;
  }

  round() {
    const { round } = this.constraints;
    if (this.isNothing(round)) {
      return this;
    }
    const $round = this.isStringType(round) ? round : "round";
    // round && this.base.round($round);
    return this;
  }

  get grouped() {
    return {
      posNeg: ["positive", "negative"],
      range: ["moreThan", "lessThan", "max", "min"]
    };
  }

  get constraintsTypeMap() {
    return {
      round: {
        type: "string",
        toArg: val => ({
          type: val
        })
      },
      range: "positive"
    };
  }

  get constraintsMap() {
    return {
      on: ["posNeg", "integer", "truncate", "round"],
      value: ["range"]
    };
  }

  get constraintsCheckMap() {
    return {
      // integer: () => this.isIntegerType(this.type)
    };
  }

  // for normalize
  get aliasMap() {
    return {
      max: ["maximum"],
      min: ["minimum"],
      moreThan: ["exclusiveMinimum"],
      lessThan: ["exclusiveMaximum"]
    };
  }
}