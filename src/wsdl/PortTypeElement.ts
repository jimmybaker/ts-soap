import Element from "./Element";

export default class PortTypeElement extends Element {
  methods: any = {};

  postProcess(definitions: any) {
    var children = this.children;
    if (typeof children === "undefined") return;
    for (var i = 0, child; (child = children[i]); i++) {
      if (child.name !== "operation") continue;
      child.postProcess(definitions, "portType");
      this.methods[child.$name] = child;
      children.splice(i--, 1);
    }
    delete this.$name;
    this.deleteFixedAttrs();
  }

  description(definitions?: any) {
    let methods: any = {};
    for (let name in this.methods) {
      let method = this.methods[name];
      methods[name] = method.description(definitions);
    }
    return methods;
  }
}
