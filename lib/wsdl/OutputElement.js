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
var OutputElement = /** @class */ (function (_super) {
    __extends(OutputElement, _super);
    function OutputElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OutputElement.prototype.addChild = function (child) {
        if (child.name === "body") {
            this.use = child.$use;
            if (this.use === "encoded") {
                this.encodingStyle = child.$encodingStyle;
            }
            this.children.pop();
        }
    };
    return OutputElement;
}(Element_1.default));
exports.default = OutputElement;
