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
var ServiceElement = /** @class */ (function (_super) {
    __extends(ServiceElement, _super);
    function ServiceElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.ports = null;
        return _this;
    }
    ServiceElement.prototype.postProcess = function (definitions) {
        var children = this.children;
        var bindings = definitions.bindings;
        if (children && children.length > 0) {
            for (var i = 0, child; (child = children[i]); i++) {
                if (child.name !== "port")
                    continue;
                var bindingName = index_1.splitQName(child.$binding).name;
                var binding = bindings[bindingName];
                if (binding) {
                    binding.postProcess(definitions);
                    this.ports[child.$name] = {
                        location: child.location,
                        binding: binding
                    };
                    children.splice(i--, 1);
                }
            }
        }
        delete this.$name;
        this.deleteFixedAttrs();
    };
    ServiceElement.prototype.description = function (definitions) {
        var ports = {};
        for (var name_1 in this.ports) {
            var port = this.ports[name_1];
            ports[name_1] = port.binding.description(definitions);
        }
        return ports;
    };
    return ServiceElement;
}(Element_1.default));
exports.default = ServiceElement;
