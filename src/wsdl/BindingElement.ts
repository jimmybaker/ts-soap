import Element from "./Element";
import { splitQName } from "./index";

export default class BindingElement extends Element {
  transport: any = "";
  style: any = "";
  methods: any = {};
  $type: any;

  addChild(child: any) {
    if (child.name === "binding") {
      this.transport = child.$transport;
      this.style = child.$style;
      this.children.pop();
    }
  }

  postProcess(definitions: any) {
    let type = splitQName(this.$type).name;
    let portType = definitions.portTypes[type];
    let style = this.style;
    let children = this.children;
    if (portType) {
      portType.postProcess(definitions);
      this.methods = portType.methods;

      for (var i = 0, child; (child = children[i]); i++) {
        if (child.name !== "operation") continue;
        child.postProcess(definitions, "binding");
        children.splice(i--, 1);
        child.style || (child.style = style);
        var method = this.methods[child.$name];

        if (method) {
          method.style = child.style;
          method.soapAction = child.soapAction;
          method.inputSoap = child.input || null;
          method.outputSoap = child.output || null;
          method.inputSoap && method.inputSoap.deleteFixedAttrs();
          method.outputSoap && method.outputSoap.deleteFixedAttrs();
        }
      }
    }
    delete this.$name;
    delete this.$type;
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
