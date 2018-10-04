import Element from "./Element";
import RestrictionElement from "./RestrictionElement";

export default class SimpleTypeElement extends Element {
  description(definitions?: any, xmlns?: any) {
    var children = this.children;
    for (var i = 0, child; (child = children[i]); i++) {
      if (child instanceof RestrictionElement)
        return [this.$name, child.description()].filter(Boolean).join("|");
    }
    return {};
  }
}
