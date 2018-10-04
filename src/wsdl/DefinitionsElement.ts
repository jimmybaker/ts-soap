import Element from "./Element";
import TypesElement from "./TypesElement";
import MessageElement from "./MessageElement";
import SchemaElement from "./SchemaElement";
import PortTypeElement from "./PortTypeElement";
import BindingElement from "./BindingElement";
import ServiceElement from "./ServiceElement";
import DocumentationElement from "./DocumentationElement";
import * as _ from "lodash";

export default class DefinitionsElement extends Element {
  messages: any = {};
  portTypes: any = {};
  bindings: any = {};
  services: any = {};
  schemas: any = {};

  constructor(nsName?: any, attrs?: any, options?: any, schemaAttrs?: any) {
    super(nsName, attrs, options, schemaAttrs);
    if (this.name !== "definitions") {
      this.unexpected(this.nsName);
    }
  }

  addChild(child: any) {
    var self = this;
    if (child instanceof TypesElement) {
      // Merge types.schemas into definitions.schemas
      _.merge(self.schemas, child.schemas);
    } else if (child instanceof MessageElement) {
      self.messages[child.$name] = child;
    } else if (child.name === "import") {
      self.schemas[child.$namespace] = new SchemaElement(child.$namespace, {});
      self.schemas[child.$namespace].addChild(child);
    } else if (child instanceof PortTypeElement) {
      self.portTypes[child.$name] = child;
    } else if (child instanceof BindingElement) {
      if (
        child.transport === "http://schemas.xmlsoap.org/soap/http" ||
        child.transport === "http://www.w3.org/2003/05/soap/bindings/HTTP/"
      )
        self.bindings[child.$name] = child;
    } else if (child instanceof ServiceElement) {
      self.services[child.$name] = child;
    } else if (child instanceof DocumentationElement) {
    }
    this.children.pop();
  }
}
