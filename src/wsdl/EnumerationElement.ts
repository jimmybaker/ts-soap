import Element from "./Element";

export default class EnumerationElement extends Element {
  [key: string]: any;

  description() {
    return this[this.valueKey];
  }
}
