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
var ChoiceElement = /** @class */ (function (_super) {
    __extends(ChoiceElement, _super);
    function ChoiceElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChoiceElement.prototype.description = function (definitions, xmlns) {
        var children = this.children;
        var choice = {};
        for (var i = 0, child = void 0; (child = children[i]); i++) {
            var description = child.description(definitions, xmlns);
            for (var key in description) {
                choice[key] = description[key];
            }
        }
        return choice;
    };
    return ChoiceElement;
}(Element_1.default));
exports.default = ChoiceElement;
