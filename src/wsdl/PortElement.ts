import Element from "./Element";

export default class PortElement extends Element {
  location: any = null;

  addChild(child: any) {
    if (child.name === "address" && typeof child.$location !== "undefined") {
      this.location = child.$location;
    }
  }
}
