import Element from "./Element";
import SequenceElement from "./SequenceElement";
import ChoiceElement from "./ChoiceElement";
import { splitQName } from "./index";

export default class RestrictionElement extends Element {
  $base: any;

  description(definitions?: any, xmlns?: any) {
    var children = this.children;
    var desc;
    for (var i = 0, child; (child = children[i]); i++) {
      if (child instanceof SequenceElement || child instanceof ChoiceElement) {
        desc = child.description(definitions, xmlns);
        break;
      }
    }
    if (desc && this.$base) {
      var type = splitQName(this.$base),
        typeName = type.name,
        ns = (xmlns && xmlns[type.prefix]) || definitions.xmlns[type.prefix],
        schema = definitions.schemas[ns],
        typeElement =
          schema &&
          (schema.complexTypes[typeName] ||
            schema.types[typeName] ||
            schema.elements[typeName]);

      desc.getBase = function() {
        return typeElement.description(definitions, schema.xmlns);
      };
      return desc;
    }

    // then simple element
    var base = this.$base ? this.$base + "|" : "";
    var restrictions = this.children
      .map(function(child: any) {
        return child.description();
      })
      .join(",");

    return [this.$base, restrictions].filter(Boolean).join("|");
  }
}
