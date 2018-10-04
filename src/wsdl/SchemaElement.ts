import * as assert from "assert";
import * as _ from "lodash";
import Element from "./Element";
import { Primitives } from "./index";

export default class SchemaElement extends Element {
  complexTypes: any = {};
  types: any = {};
  elements: any = {};
  includes: any = [];

  merge(source: any) {
    assert(source instanceof SchemaElement);
    if (this.$targetNamespace === source.$targetNamespace) {
      _.merge(this.complexTypes, source.complexTypes);
      _.merge(this.types, source.types);
      _.merge(this.elements, source.elements);
      _.merge(this.xmlns, source.xmlns);
    }
    return this;
  }

  addChild(child: any) {
    if (child.$name in Primitives) return;
    if (child.name === "include" || child.name === "import") {
      var location = child.$schemaLocation || child.$location;
      if (location) {
        this.includes.push({
          namespace:
            child.$namespace || child.$targetNamespace || this.$targetNamespace,
          location: location
        });
      }
    } else if (child.name === "complexType") {
      this.complexTypes[child.$name] = child;
    } else if (child.name === "element") {
      this.elements[child.$name] = child;
    } else if (child.$name) {
      this.types[child.$name] = child;
    }
    this.children.pop();
    // child.deleteFixedAttrs();
  }
}
