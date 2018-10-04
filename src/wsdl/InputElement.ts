import Element from "./Element";

export default class InputElement extends Element {
  use: any;
  encodingStyle: any;

  addChild(child: any) {
    if (child.name === "body") {
      this.use = child.$use;
      if (this.use === "encoded") {
        this.encodingStyle = child.$encodingStyle;
      }
      this.children.pop();
    }
  }
}
