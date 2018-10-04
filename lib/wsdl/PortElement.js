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
var PortElement = /** @class */ (function (_super) {
    __extends(PortElement, _super);
    function PortElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.location = null;
        return _this;
    }
    PortElement.prototype.addChild = function (child) {
        if (child.name === "address" && typeof child.$location !== "undefined") {
            this.location = child.$location;
        }
    };
    return PortElement;
}(Element_1.default));
exports.default = PortElement;
