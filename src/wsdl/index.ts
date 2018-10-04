import * as _ from "lodash";
import { TNS_PREFIX } from "../utils";
export { TNS_PREFIX } from "../utils";
import AllElement from "./AllElement";
import AnyElement from "./AnyElement";
import BindingElement from "./BindingElement";
import ChoiceElement from "./ChoiceElement";
import ComplexContentElement from "./ComplexContentElement";
import ComplexTypeElement from "./ComplexTypeElement";
import DefinitionsElement from "./DefinitionsElement";
import DocumentationElement from "./DocumentationElement";
import Element from "./Element";
import ElementElement from "./ElementElement";
import EnumerationElement from "./EnumerationElement";
import ExtensionElement from "./ExtensionElement";
import InputElement from "./InputElement";
import MessageElement from "./MessageElement";
import OperationElement from "./OperationElement";
import OutputElement from "./OutputElement";
import PortElement from "./PortElement";
import PortTypeElement from "./PortTypeElement";
import RestrictionElement from "./RestrictionElement";
import SchemaElement from "./SchemaElement";
import SequenceElement from "./SequenceElement";
import ServiceElement from "./ServiceElement";
import SimpleContentElement from "./SimpleContentElement";
import SimpleTypeElement from "./SimpleTypeElement";
import TypesElement from "./TypesElement";

export const Primitives = {
  string: 1,
  boolean: 1,
  decimal: 1,
  float: 1,
  double: 1,
  anyType: 1,
  byte: 1,
  int: 1,
  long: 1,
  short: 1,
  negativeInteger: 1,
  nonNegativeInteger: 1,
  positiveInteger: 1,
  nonPositiveInteger: 1,
  unsignedByte: 1,
  unsignedInt: 1,
  unsignedLong: 1,
  unsignedShort: 1,
  duration: 0,
  dateTime: 0,
  time: 0,
  date: 0,
  gYearMonth: 0,
  gYear: 0,
  gMonthDay: 0,
  gDay: 0,
  gMonth: 0,
  hexBinary: 0,
  base64Binary: 0,
  anyURI: 0,
  QName: 0,
  NOTATION: 0
};

export function splitQName(nsName: any) {
  if (typeof nsName !== "string") {
    return {
      prefix: TNS_PREFIX,
      name: nsName
    };
  }

  const [topLevelName] = nsName.split("|");

  const prefixOffset = topLevelName.indexOf(":");

  return {
    prefix: topLevelName.substring(0, prefixOffset) || TNS_PREFIX,
    name: topLevelName.substring(prefixOffset + 1)
  };
}

export function xmlEscape(obj: any) {
  if (typeof obj === "string") {
    if (obj.substr(0, 9) === "<![CDATA[" && obj.substr(-3) === "]]>") {
      return obj;
    }
    return obj
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  return obj;
}

export function deepMerge(destination?: any, source?: any) {
  return _.mergeWith(destination || {}, source, function(a, b) {
    return _.isArray(a) ? a.concat(b) : undefined;
  });
}

const trimLeft = /^[\s\xA0]+/;
const trimRight = /[\s\xA0]+$/;
export function trim(text: string) {
  return text.replace(trimLeft, "").replace(trimRight, "");
}

export function mapElementTypes(types: any) {
  let rtn: any = {};
  types = types.split(" ");
  types.forEach(function(type: any) {
    rtn[type.replace(/^_/, "")] = (ElementTypeMap[type] || [Element])[0];
  });
  return rtn;
}

const ElementTypeMap: any = {
  types: [TypesElement, "schema documentation"],
  schema: [SchemaElement, "element complexType simpleType include import"],
  element: [ElementElement, "annotation complexType simpleType"],
  any: [AnyElement, ""],
  simpleType: [SimpleTypeElement, "restriction"],
  restriction: [RestrictionElement, "enumeration all choice sequence"],
  extension: [ExtensionElement, "all sequence choice"],
  choice: [ChoiceElement, "element sequence choice any"],
  // group: [GroupElement, 'element group'],
  enumeration: [EnumerationElement, ""],
  complexType: [
    ComplexTypeElement,
    "annotation sequence all complexContent simpleContent choice"
  ],
  complexContent: [ComplexContentElement, "extension"],
  simpleContent: [SimpleContentElement, "extension"],
  sequence: [SequenceElement, "element sequence choice any"],
  all: [AllElement, "element choice"],

  service: [ServiceElement, "port documentation"],
  port: [PortElement, "address documentation"],
  binding: [BindingElement, "_binding SecuritySpec operation documentation"],
  portType: [PortTypeElement, "operation documentation"],
  message: [MessageElement, "part documentation"],
  operation: [OperationElement, "documentation input output fault _operation"],
  input: [InputElement, "body SecuritySpecRef documentation header"],
  output: [OutputElement, "body SecuritySpecRef documentation header"],
  fault: [Element, "_fault documentation"],
  definitions: [
    DefinitionsElement,
    "types message portType binding service import documentation"
  ],
  documentation: [DocumentationElement, ""]
};

for (var n in ElementTypeMap) {
  var v = ElementTypeMap[n];
  v[0].prototype.allowedChildren = mapElementTypes(v[1]);
}
