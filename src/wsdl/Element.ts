import * as _ from "lodash";
import { splitQName, TNS_PREFIX } from "./index";

interface IElement {
  [key: string]: any;
}

export default class Element {
  nsName: any;
  prefix: any;
  name: any;
  $name: any;
  children: any;
  xmlns: any;
  schemaXmlns: any;
  valueKey: any;
  $targetNamespace: any;
  xmlKey: any;
  ignoredNamespaces: any;
  allowedChildren: any = [];

  constructor(
    nsName: any,
    attrs: any = null,
    options: any = null,
    schemaAttrs: any = null
  ) {
    var parts = splitQName(nsName);

    this.nsName = nsName;
    this.prefix = parts.prefix;
    this.name = parts.name;
    this.children = [];
    this.xmlns = {};
    this.schemaXmlns = {};

    this._initializeOptions(options);

    for (var key in attrs) {
      var match = /^xmlns:?(.*)$/.exec(key);
      if (match) {
        this.xmlns[match[1] ? match[1] : TNS_PREFIX] = attrs[key];
      } else {
        if (key === "value") {
          (this as IElement)[this.valueKey] = attrs[key];
        } else {
          (this as IElement)["$" + key] = attrs[key];
        }
      }
    }
    for (var schemaKey in schemaAttrs) {
      var schemaMatch = /^xmlns:?(.*)$/.exec(schemaKey);
      if (schemaMatch && schemaMatch[1]) {
        this.schemaXmlns[schemaMatch[1]] = schemaAttrs[schemaKey];
      }
    }
    if (this.$targetNamespace !== undefined) {
      // Add targetNamespace to the mapping
      this.xmlns[TNS_PREFIX] = this.$targetNamespace;
    }
  }

  _initializeOptions(options: any) {
    if (options) {
      this.valueKey = options.valueKey || "$value";
      this.xmlKey = options.xmlKey || "$xml";
      this.ignoredNamespaces = options.ignoredNamespaces || [];
    } else {
      this.valueKey = "$value";
      this.xmlKey = "$xml";
      this.ignoredNamespaces = [];
    }
  }

  deleteFixedAttrs() {
    this.children && this.children.length === 0 && delete this.children;
    this.xmlns && Object.keys(this.xmlns).length === 0 && delete this.xmlns;
    delete this.nsName;
    delete this.prefix;
    delete this.name;
  }

  startElement(
    stack: any,
    nsName: any,
    attrs: any,
    options: any,
    schemaXmlns: any
  ) {
    if (!this.allowedChildren) {
      return;
    }

    var ChildClass = this.allowedChildren[splitQName(nsName).name],
      element = null;

    if (ChildClass) {
      stack.push(new ChildClass(nsName, attrs, options, schemaXmlns));
    } else {
      this.unexpected(nsName);
    }
  }

  endElement(stack: any, nsName: any) {
    if (this.nsName === nsName) {
      if (stack.length < 2) return;
      var parent = stack[stack.length - 2];
      if (this !== stack[0]) {
        _.defaultsDeep(stack[0].xmlns, this.xmlns);
        // delete this.xmlns;
        parent.children.push(this);
        parent.addChild(this);
      }
      stack.pop();
    }
  }

  addChild(child: any) {
    return;
  }

  unexpected(name: any) {
    throw new Error(
      "Found unexpected element (" + name + ") inside " + this.nsName
    );
  }

  description(definitions: any = null, xmlns: any = null) {
    return this.$name || this.name;
  }
}
