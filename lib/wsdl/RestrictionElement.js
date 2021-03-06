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
var SequenceElement_1 = require("./SequenceElement");
var ChoiceElement_1 = require("./ChoiceElement");
var index_1 = require("./index");
var RestrictionElement = /** @class */ (function (_super) {
    __extends(RestrictionElement, _super);
    function RestrictionElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RestrictionElement.prototype.description = function (definitions, xmlns) {
        var children = this.children;
        var desc;
        for (var i = 0, child; (child = children[i]); i++) {
            if (child instanceof SequenceElement_1.default || child instanceof ChoiceElement_1.default) {
                desc = child.description(definitions, xmlns);
                break;
            }
        }
        if (desc && this.$base) {
            var type = index_1.splitQName(this.$base), typeName = type.name, ns = (xmlns && xmlns[type.prefix]) || definitions.xmlns[type.prefix], schema = definitions.schemas[ns], typeElement = schema &&
                (schema.complexTypes[typeName] ||
                    schema.types[typeName] ||
                    schema.elements[typeName]);
            desc.getBase = function () {
                return typeElement.description(definitions, schema.xmlns);
            };
            return desc;
        }
        // then simple element
        var base = this.$base ? this.$base + "|" : "";
        var restrictions = this.children
            .map(function (child) {
            return child.description();
        })
            .join(",");
        return [this.$base, restrictions].filter(Boolean).join("|");
    };
    return RestrictionElement;
}(Element_1.default));
exports.default = RestrictionElement;
