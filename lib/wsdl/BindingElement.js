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
var BindingElement = /** @class */ (function (_super) {
    __extends(BindingElement, _super);
    function BindingElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.transport = "";
        _this.style = "";
        _this.methods = {};
        return _this;
    }
    BindingElement.prototype.addChild = function (child) {
        if (child.name === "binding") {
            this.transport = child.$transport;
            this.style = child.$style;
            this.children.pop();
        }
    };
    BindingElement.prototype.postProcess = function (definitions) {
        var type = index_1.splitQName(this.$type).name;
        var portType = definitions.portTypes[type];
        var style = this.style;
        var children = this.children;
        if (portType) {
            portType.postProcess(definitions);
            this.methods = portType.methods;
            for (var i = 0, child; (child = children[i]); i++) {
                if (child.name !== "operation")
                    continue;
                child.postProcess(definitions, "binding");
                children.splice(i--, 1);
                child.style || (child.style = style);
                var method = this.methods[child.$name];
                if (method) {
                    method.style = child.style;
                    method.soapAction = child.soapAction;
                    method.inputSoap = child.input || null;
                    method.outputSoap = child.output || null;
                    method.inputSoap && method.inputSoap.deleteFixedAttrs();
                    method.outputSoap && method.outputSoap.deleteFixedAttrs();
                }
            }
        }
        delete this.$name;
        delete this.$type;
        this.deleteFixedAttrs();
    };
    BindingElement.prototype.description = function (definitions) {
        var methods = {};
        for (var name_1 in this.methods) {
            var method = this.methods[name_1];
            methods[name_1] = method.description(definitions);
        }
        return methods;
    };
    return BindingElement;
}(Element_1.default));
exports.default = BindingElement;
