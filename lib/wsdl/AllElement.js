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
var AnyElement_1 = require("./AnyElement");
var AllElement = /** @class */ (function (_super) {
    __extends(AllElement, _super);
    function AllElement() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AllElement.prototype.description = function (definitions, xmlns) {
        var children = this.children;
        var sequence = {};
        for (var i = 0, child; (child = children[i]); i++) {
            if (child instanceof AnyElement_1.default) {
                continue;
            }
            var description = child.description(definitions, xmlns);
            for (var key in description) {
                sequence[key] = description[key];
            }
        }
        return sequence;
    };
    return AllElement;
}(Element_1.default));
exports.default = AllElement;
