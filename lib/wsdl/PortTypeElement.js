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
var PortTypeElement = /** @class */ (function (_super) {
    __extends(PortTypeElement, _super);
    function PortTypeElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.methods = {};
        return _this;
    }
    PortTypeElement.prototype.postProcess = function (definitions) {
        var children = this.children;
        if (typeof children === "undefined")
            return;
        for (var i = 0, child; (child = children[i]); i++) {
            if (child.name !== "operation")
                continue;
            child.postProcess(definitions, "portType");
            this.methods[child.$name] = child;
            children.splice(i--, 1);
        }
        delete this.$name;
        this.deleteFixedAttrs();
    };
    PortTypeElement.prototype.description = function (definitions) {
        var methods = {};
        for (var name_1 in this.methods) {
            var method = this.methods[name_1];
            methods[name_1] = method.description(definitions);
        }
        return methods;
    };
    return PortTypeElement;
}(Element_1.default));
exports.default = PortTypeElement;
