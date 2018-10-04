import Element from "./Element";

export default class ChoiceElement extends Element {
  description(definitions?: any, xmlns?: any) {
    let children = this.children;
    let choice: any = {};
    for (let i = 0, child; (child = children[i]); i++) {
      let description = child.description(definitions, xmlns);
      for (let key in description) {
        choice[key] = description[key];
      }
    }
    return choice;
  }
}
