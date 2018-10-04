import Element from "./Element";
import { splitQName } from "./index";

export default class OperationElement extends Element {
  input: any = null;
  output: any = null;
  inputSoap: any = null;
  outputSoap: any = null;
  style: any = "";
  soapAction: any = "";
  [key: string]: any;

  addChild(child: any) {
    if (child.name === "operation") {
      this.soapAction = child.$soapAction || "";
      this.style = child.$style || "";
      this.children.pop();
    }
  }

  postProcess(definitions: any, tag: any) {
    var children = this.children;
    for (var i = 0, child; (child = children[i]); i++) {
      if (child.name !== "input" && child.name !== "output") continue;
      if (tag === "binding") {
        this[child.name] = child;
        children.splice(i--, 1);
        continue;
      }
      var messageName = splitQName(child.$message).name;
      var message = definitions.messages[messageName];
      message.postProcess(definitions);
      if (message.element) {
        definitions.messages[message.element.$name] = message;
        this[child.name] = message.element;
      } else {
        this[child.name] = message;
      }
      children.splice(i--, 1);
    }
    this.deleteFixedAttrs();
  }

  description(definitions?: any) {
    var inputDesc = this.input ? this.input.description(definitions) : null;
    var outputDesc = this.output ? this.output.description(definitions) : null;
    return {
      input: inputDesc && inputDesc[Object.keys(inputDesc)[0]],
      output: outputDesc && outputDesc[Object.keys(outputDesc)[0]]
    };
  }
}
