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
var ExtensionElement_1 = require("./ExtensionElement");
var SimpleContentElement = /** @class */ (function (_super) {
    __extends(SimpleContentElement, _super);
    function SimpleContentElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SimpleContentElement.prototype.description = function (definitions, xmlns) {
        var children = this.children;
        for (var i = 0, child; (child = children[i]); i++) {
            if (child instanceof ExtensionElement_1.default) {
                return child.description(definitions, xmlns);
            }
        }
        return {};
    };
    return SimpleContentElement;
}(Element_1.default));
exports.default = SimpleContentElement;
