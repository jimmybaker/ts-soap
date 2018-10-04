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
var ChoiceElement_1 = require("./ChoiceElement");
var SequenceElement_1 = require("./SequenceElement");
var AllElement_1 = require("./AllElement");
var SimpleContentElement_1 = require("./SimpleContentElement");
var ComplexContentElement_1 = require("./ComplexContentElement");
var ComplexTypeElement = /** @class */ (function (_super) {
    __extends(ComplexTypeElement, _super);
    function ComplexTypeElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ComplexTypeElement.prototype.description = function (definitions, xmlns) {
        var children = this.children || [];
        for (var i = 0, child; (child = children[i]); i++) {
            if (child instanceof ChoiceElement_1.default ||
                child instanceof SequenceElement_1.default ||
                child instanceof AllElement_1.default ||
                child instanceof SimpleContentElement_1.default ||
                child instanceof ComplexContentElement_1.default) {
                return child.description(definitions, xmlns);
            }
        }
        return {};
    };
    return ComplexTypeElement;
}(Element_1.default));
exports.default = ComplexTypeElement;
