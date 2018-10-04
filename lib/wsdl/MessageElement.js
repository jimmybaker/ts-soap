"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var Element_1 = require("./Element");
var index_1 = require("./index");
var MessageElement = /** @class */ (function (_super) {
    __extends(MessageElement, _super);
    function MessageElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.element = null;
        _this.parts = null;
        return _this;
    }
    MessageElement.prototype.postProcess = function (definitions) {
        var part = null;
        var child;
        var children = this.children || [];
        var ns;
        var nsName;
        var i;
        var type;
        for (i in children) {
            if ((child = children[i]).name === "part") {
                part = child;
                break;
            }
        }
        if (!part) {
            return;
        }
        if (part.$element) {
            var lookupTypes = [], elementChildren;
            delete this.parts;
            nsName = index_1.splitQName(part.$element);
            ns = nsName.prefix;
            var schema = definitions.schemas[definitions.xmlns[ns]];
            this.element = schema.elements[nsName.name];
            if (!this.element) {
                // debug(
                //   nsName.name +
                //     " is not present in wsdl and cannot be processed correctly."
                // );
                return;
            }
            this.element.targetNSAlias = ns;
            this.element.targetNamespace = definitions.xmlns[ns];
            // set the optional $lookupType to be used within `client#_invoke()` when
            // calling `wsdl#objectToDocumentXML()
            this.element.$lookupType = part.$element;
            elementChildren = this.element.children;
            // get all nested lookup types (only complex types are followed)
            if (elementChildren.length > 0) {
                for (i = 0; i < elementChildren.length; i++) {
                    lookupTypes.push(this._getNestedLookupTypeString(elementChildren[i]));
                }
            }
            // if nested lookup types where found, prepare them for furter usage
            if (lookupTypes.length > 0) {
                lookupTypes = lookupTypes
                    .join("_")
                    .split("_")
                    .filter(function removeEmptyLookupTypes(type) {
                    return type !== "^";
                });
                var schemaXmlns = definitions.schemas[this.element.targetNamespace].xmlns;
                for (i = 0; i < lookupTypes.length; i++) {
                    lookupTypes[i] = this._createLookupTypeObject(lookupTypes[i], schemaXmlns);
                }
            }
            this.element.$lookupTypes = lookupTypes;
            if (this.element.$type) {
                type = index_1.splitQName(this.element.$type);
                var typeNs = (schema.xmlns && schema.xmlns[type.prefix]) ||
                    definitions.xmlns[type.prefix];
                if (typeNs) {
                    if (type.name in index_1.Primitives) {
                        // this.element = this.element.$type;
                    }
                    else {
                        // first check local mapping of ns alias to namespace
                        schema = definitions.schemas[typeNs];
                        var ctype = schema.complexTypes[type.name] ||
                            schema.types[type.name] ||
                            schema.elements[type.name];
                        if (ctype) {
                            this.parts = ctype.description(definitions, schema.xmlns);
                        }
                    }
                }
            }
            else {
                var method = this.element.description(definitions, schema.xmlns);
                this.parts = method[nsName.name];
            }
            this.children.splice(0, 1);
        }
        else {
            // rpc encoding
            this.parts = {};
            delete this.element;
            for (i = 0; (part = this.children[i]); i++) {
                if (part.name === "documentation") {
                    // <wsdl:documentation can be present under <wsdl:message>
                    continue;
                }
                assert(part.name === "part", "Expected part element");
                nsName = index_1.splitQName(part.$type);
                ns = definitions.xmlns[nsName.prefix];
                type = nsName.name;
                var schemaDefinition = definitions.schemas[ns];
                if (typeof schemaDefinition !== "undefined") {
                    this.parts[part.$name] =
                        definitions.schemas[ns].types[type] ||
                            definitions.schemas[ns].complexTypes[type];
                }
                else {
                    this.parts[part.$name] = part.$type;
                }
                if (typeof this.parts[part.$name] === "object") {
                    this.parts[part.$name].prefix = nsName.prefix;
                    this.parts[part.$name].xmlns = ns;
                }
                this.children.splice(i--, 1);
            }
        }
        this.deleteFixedAttrs();
    };
    /**
     * Takes a given namespaced String(for example: 'alias:property') and creates a lookupType
     * object for further use in as first (lookup) `parameterTypeObj` within the `objectToXML`
     * method and provides an entry point for the already existing code in `findChildSchemaObject`.
     *
     * @method _createLookupTypeObject
     * @param {String}            nsString          The NS String (for example "alias:type").
     * @param {Object}            xmlns       The fully parsed `wsdl` definitions object (including all schemas).
     * @returns {Object}
     * @private
     */
    MessageElement.prototype._createLookupTypeObject = function (nsString, xmlns) {
        var splittedNSString = index_1.splitQName(nsString);
        var nsAlias = splittedNSString.prefix;
        var splittedName = splittedNSString.name.split("#");
        var type = splittedName[0];
        var name = splittedName[1];
        var lookupTypeObj = {};
        lookupTypeObj.$namespace = xmlns[nsAlias];
        lookupTypeObj.$type = nsAlias + ":" + type;
        lookupTypeObj.$name = name;
        return lookupTypeObj;
    };
    /**
     * Iterates through the element and every nested child to find any defined `$type`
     * property and returns it in a underscore ('_') separated String (using '^' as default
     * value if no `$type` property was found).
     *
     * @method _getNestedLookupTypeString
     * @param {Object}            element         The element which (probably) contains nested `$type` values.
     * @returns {String}
     * @private
     */
    MessageElement.prototype._getNestedLookupTypeString = function (element) {
        var resolvedType = "^", excluded = this.ignoredNamespaces.concat("xs"); // do not process $type values wich start with
        if (element.hasOwnProperty("$type") && typeof element.$type === "string") {
            if (excluded.indexOf(element.$type.split(":")[0]) === -1) {
                resolvedType += "_" + element.$type + "#" + element.$name;
            }
        }
        if (element.children.length > 0) {
            var self = this;
            element.children.forEach(function (child) {
                var resolvedChildType = self
                    ._getNestedLookupTypeString(child)
                    .replace(/\^_/, "");
                if (resolvedChildType && typeof resolvedChildType === "string") {
                    resolvedType += "_" + resolvedChildType;
                }
            });
        }
        return resolvedType;
    };
    MessageElement.prototype.description = function (definitions) {
        if (this.element) {
            return this.element && this.element.description(definitions);
        }
        var desc = {};
        desc[this.$name] = this.parts;
        return desc;
    };
    return MessageElement;
}(Element_1.default));
exports.default = MessageElement;
