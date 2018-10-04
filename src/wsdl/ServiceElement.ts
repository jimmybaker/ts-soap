import Element from "./Element";
import { splitQName } from "./index";

export default class ServiceElement extends Element {
  ports: any = null;

  postProcess(definitions: any) {
    let children = this.children;
    let bindings = definitions.bindings;
    if (children && children.length > 0) {
      for (var i = 0, child; (child = children[i]); i++) {
        if (child.name !== "port") continue;
        var bindingName = splitQName(child.$binding).name;
        var binding = bindings[bindingName];
        if (binding) {
          binding.postProcess(definitions);
          this.ports[child.$name] = {
            location: child.location,
            binding: binding
          };
          children.splice(i--, 1);
        }
      }
    }
    delete this.$name;
    this.deleteFixedAttrs();
  }

  description(definitions?: any) {
    let ports: any = {};
    for (let name in this.ports) {
      let port = this.ports[name];
      ports[name] = port.binding.description(definitions);
    }
    return ports;
  }
}
