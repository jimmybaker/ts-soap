import Element from "./Element";
import AnyElement from "./AnyElement";

export default class SequenceElement extends Element {
  description(definitions?: any, xmlns?: any) {
    var children = this.children;
    var sequence: any = {};
    for (var i = 0, child; (child = children[i]); i++) {
      if (child instanceof AnyElement) {
        continue;
      }
      var description = child.description(definitions, xmlns);
      for (var key in description) {
        sequence[key] = description[key];
      }
    }
    return sequence;
  }
}
