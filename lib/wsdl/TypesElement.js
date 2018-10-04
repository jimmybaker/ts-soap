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
var SchemaElement_1 = require("./SchemaElement");
var Element_1 = require("./Element");
var TypesElement = /** @class */ (function (_super) {
    __extends(TypesElement, _super);
    function TypesElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.schemas = {};
        return _this;
    }
    TypesElement.prototype.addChild = function (child) {
        assert(child instanceof SchemaElement_1.default);
        var targetNamespace = child.$targetNamespace;
        if (!this.schemas.hasOwnProperty(targetNamespace)) {
            this.schemas[targetNamespace] = child;
        }
        else {
            console.error('Target-Namespace "' +
                targetNamespace +
                '" already in use by another Schema!');
        }
    };
    return TypesElement;
}(Element_1.default));
exports.default = TypesElement;
