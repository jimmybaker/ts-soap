"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var utils_1 = require("../utils");
var utils_2 = require("../utils");
exports.TNS_PREFIX = utils_2.TNS_PREFIX;
var AllElement_1 = require("./AllElement");
var AnyElement_1 = require("./AnyElement");
var BindingElement_1 = require("./BindingElement");
var ChoiceElement_1 = require("./ChoiceElement");
var ComplexContentElement_1 = require("./ComplexContentElement");
var ComplexTypeElement_1 = require("./ComplexTypeElement");
var DefinitionsElement_1 = require("./DefinitionsElement");
var DocumentationElement_1 = require("./DocumentationElement");
var Element_1 = require("./Element");
var ElementElement_1 = require("./ElementElement");
var EnumerationElement_1 = require("./EnumerationElement");
var ExtensionElement_1 = require("./ExtensionElement");
var InputElement_1 = require("./InputElement");
var MessageElement_1 = require("./MessageElement");
var OperationElement_1 = require("./OperationElement");
var OutputElement_1 = require("./OutputElement");
var PortElement_1 = require("./PortElement");
var PortTypeElement_1 = require("./PortTypeElement");
var RestrictionElement_1 = require("./RestrictionElement");
var SchemaElement_1 = require("./SchemaElement");
var SequenceElement_1 = require("./SequenceElement");
var ServiceElement_1 = require("./ServiceElement");
var SimpleContentElement_1 = require("./SimpleContentElement");
var SimpleTypeElement_1 = require("./SimpleTypeElement");
var TypesElement_1 = require("./TypesElement");
exports.Primitives = {
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
function splitQName(nsName) {
    if (typeof nsName !== "string") {
        return {
            prefix: utils_1.TNS_PREFIX,
            name: nsName
        };
    }
    var topLevelName = nsName.split("|")[0];
    var prefixOffset = topLevelName.indexOf(":");
    return {
        prefix: topLevelName.substring(0, prefixOffset) || utils_1.TNS_PREFIX,
        name: topLevelName.substring(prefixOffset + 1)
    };
}
exports.splitQName = splitQName;
function xmlEscape(obj) {
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
exports.xmlEscape = xmlEscape;
function deepMerge(destination, source) {
    return _.mergeWith(destination || {}, source, function (a, b) {
        return _.isArray(a) ? a.concat(b) : undefined;
    });
}
exports.deepMerge = deepMerge;
var trimLeft = /^[\s\xA0]+/;
var trimRight = /[\s\xA0]+$/;
function trim(text) {
    return text.replace(trimLeft, "").replace(trimRight, "");
}
exports.trim = trim;
function mapElementTypes(types) {
    var rtn = {};
    types = types.split(" ");
    types.forEach(function (type) {
        rtn[type.replace(/^_/, "")] = (ElementTypeMap[type] || [Element_1.default])[0];
    });
    return rtn;
}
exports.mapElementTypes = mapElementTypes;
var ElementTypeMap = {
    types: [TypesElement_1.default, "schema documentation"],
    schema: [SchemaElement_1.default, "element complexType simpleType include import"],
    element: [ElementElement_1.default, "annotation complexType simpleType"],
    any: [AnyElement_1.default, ""],
    simpleType: [SimpleTypeElement_1.default, "restriction"],
    restriction: [RestrictionElement_1.default, "enumeration all choice sequence"],
    extension: [ExtensionElement_1.default, "all sequence choice"],
    choice: [ChoiceElement_1.default, "element sequence choice any"],
    // group: [GroupElement, 'element group'],
    enumeration: [EnumerationElement_1.default, ""],
    complexType: [
        ComplexTypeElement_1.default,
        "annotation sequence all complexContent simpleContent choice"
    ],
    complexContent: [ComplexContentElement_1.default, "extension"],
    simpleContent: [SimpleContentElement_1.default, "extension"],
    sequence: [SequenceElement_1.default, "element sequence choice any"],
    all: [AllElement_1.default, "element choice"],
    service: [ServiceElement_1.default, "port documentation"],
    port: [PortElement_1.default, "address documentation"],
    binding: [BindingElement_1.default, "_binding SecuritySpec operation documentation"],
    portType: [PortTypeElement_1.default, "operation documentation"],
    message: [MessageElement_1.default, "part documentation"],
    operation: [OperationElement_1.default, "documentation input output fault _operation"],
    input: [InputElement_1.default, "body SecuritySpecRef documentation header"],
    output: [OutputElement_1.default, "body SecuritySpecRef documentation header"],
    fault: [Element_1.default, "_fault documentation"],
    definitions: [
        DefinitionsElement_1.default,
        "types message portType binding service import documentation"
    ],
    documentation: [DocumentationElement_1.default, ""]
};
for (var n in ElementTypeMap) {
    var v = ElementTypeMap[n];
    v[0].prototype.allowedChildren = mapElementTypes(v[1]);
}
