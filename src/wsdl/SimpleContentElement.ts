import Element from "./Element";
import ExtensionElement from "./ExtensionElement";

export default class SimpleContentElement extends Element {
  description(definitions: any, xmlns: any) {
    var children = this.children;
    for (var i = 0, child; (child = children[i]); i++) {
      if (child instanceof ExtensionElement) {
        return child.description(definitions, xmlns);
      }
    }
    return {};
  }
}
