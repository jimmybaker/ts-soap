import Element from "./Element";
import SequenceElement from "./SequenceElement";
import ChoiceElement from "./ChoiceElement";
import * as _ from "lodash";
import { Primitives, splitQName } from "./index";

export default class ExtensionElement extends Element {
  $base: any;

  description(definitions: any, xmlns: any) {
    var children = this.children;
    var desc = {};
    for (var i = 0, child; (child = children[i]); i++) {
      if (child instanceof SequenceElement || child instanceof ChoiceElement) {
        desc = child.description(definitions, xmlns);
      }
    }
    if (this.$base) {
      var type = splitQName(this.$base),
        typeName = type.name,
        ns = (xmlns && xmlns[type.prefix]) || definitions.xmlns[type.prefix],
        schema = definitions.schemas[ns];

      if (typeName in Primitives) {
        return this.$base;
      } else {
        var typeElement =
          schema &&
          (schema.complexTypes[typeName] ||
            schema.types[typeName] ||
            schema.elements[typeName]);

        if (typeElement) {
          var base = typeElement.description(definitions, schema.xmlns);
          desc = _.defaultsDeep(base, desc);
        }
      }
    }
    return desc;
  }
}
