import Element from "./Element";
import ChoiceElement from "./ChoiceElement";
import SequenceElement from "./SequenceElement";
import AllElement from "./AllElement";
import SimpleContentElement from "./SimpleContentElement";
import ComplexContentElement from "./ComplexContentElement";

export default class ComplexTypeElement extends Element {
  description(definitions: any, xmlns: any) {
    var children = this.children || [];
    for (var i = 0, child; (child = children[i]); i++) {
      if (
        child instanceof ChoiceElement ||
        child instanceof SequenceElement ||
        child instanceof AllElement ||
        child instanceof SimpleContentElement ||
        child instanceof ComplexContentElement
      ) {
        return child.description(definitions, xmlns);
      }
    }
    return {};
  }
}
