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
var Element_1 = require("./Element");
var index_1 = require("./index");
var ComplexTypeElement_1 = require("./ComplexTypeElement");
var SimpleTypeElement_1 = require("./SimpleTypeElement");
var ElementElement = /** @class */ (function (_super) {
    __extends(ElementElement, _super);
    function ElementElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ElementElement.prototype.description = function (definitions, xmlns) {
        var element = {};
        var name = this.$name;
        var isMany = !this.$maxOccurs
            ? false
            : isNaN(this.$maxOccurs)
                ? this.$maxOccurs === "unbounded"
                : this.$maxOccurs > 1;
        if (this.$minOccurs !== this.$maxOccurs && isMany) {
            name += "[]";
        }
        if (xmlns && xmlns[index_1.TNS_PREFIX]) {
            this.$targetNamespace = xmlns[index_1.TNS_PREFIX];
        }
        var type = this.$type || this.$ref;
        if (type) {
            type = index_1.splitQName(type);
            var typeName = type.name, ns = (xmlns && xmlns[type.prefix]) ||
                (definitions.xmlns[type.prefix] !== undefined &&
                    this.schemaXmlns[type.prefix]) ||
                definitions.xmlns[type.prefix], schema = definitions.schemas[ns], typeElement = schema &&
                (this.$type
                    ? schema.complexTypes[typeName] || schema.types[typeName]
                    : schema.elements[typeName]);
            if (ns && definitions.schemas[ns]) {
                xmlns = definitions.schemas[ns].xmlns;
            }
            if (typeElement && !(typeName in index_1.Primitives)) {
                if (!(typeName in definitions.descriptions.types)) {
                    var elem = {};
                    definitions.descriptions.types[typeName] = elem;
                    var description = typeElement.description(definitions, xmlns);
                    if (typeof description === "string") {
                        elem = description;
                    }
                    else {
                        Object.keys(description).forEach(function (key) {
                            elem[key] = description[key];
                        });
                    }
                    if (this.$ref) {
                        element = elem;
                    }
                    else {
                        element[name] = elem;
                    }
                    if (typeof elem === "object") {
                        elem.targetNSAlias = type.prefix;
                        elem.targetNamespace = ns;
                    }
                    definitions.descriptions.types[typeName] = elem;
                }
                else {
                    if (this.$ref) {
                        element = definitions.descriptions.types[typeName];
                    }
                    else {
                        element[name] = definitions.descriptions.types[typeName];
                    }
                }
            }
            else {
                element[name] = this.$type;
            }
        }
        else {
            var children = this.children;
            element[name] = {};
            for (var i = 0, child; (child = children[i]); i++) {
                if (child instanceof ComplexTypeElement_1.default ||
                    child instanceof SimpleTypeElement_1.default) {
                    element[name] = child.description(definitions, xmlns);
                }
            }
        }
        return element;
    };
    return ElementElement;
}(Element_1.default));
exports.default = ElementElement;
