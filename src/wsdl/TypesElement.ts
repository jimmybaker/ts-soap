import * as assert from "assert";
import SchemaElement from "./SchemaElement";
import Element from "./Element";

export default class TypesElement extends Element {
  schemas: any = {};

  addChild(child: any) {
    assert(child instanceof SchemaElement);

    var targetNamespace = child.$targetNamespace;

    if (!this.schemas.hasOwnProperty(targetNamespace)) {
      this.schemas[targetNamespace] = child;
    } else {
      console.error(
        'Target-Namespace "' +
          targetNamespace +
          '" already in use by another Schema!'
      );
    }
  }
}
