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
var OperationElement = /** @class */ (function (_super) {
    __extends(OperationElement, _super);
    function OperationElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.input = null;
        _this.output = null;
        _this.inputSoap = null;
        _this.outputSoap = null;
        _this.style = "";
        _this.soapAction = "";
        return _this;
    }
    OperationElement.prototype.addChild = function (child) {
        if (child.name === "operation") {
            this.soapAction = child.$soapAction || "";
            this.style = child.$style || "";
            this.children.pop();
        }
    };
    OperationElement.prototype.postProcess = function (definitions, tag) {
        var children = this.children;
        for (var i = 0, child; (child = children[i]); i++) {
            if (child.name !== "input" && child.name !== "output")
                continue;
            if (tag === "binding") {
                this[child.name] = child;
                children.splice(i--, 1);
                continue;
            }
            var messageName = index_1.splitQName(child.$message).name;
            var message = definitions.messages[messageName];
            message.postProcess(definitions);
            if (message.element) {
                definitions.messages[message.element.$name] = message;
                this[child.name] = message.element;
            }
            else {
                this[child.name] = message;
            }
            children.splice(i--, 1);
        }
        this.deleteFixedAttrs();
    };
    OperationElement.prototype.description = function (definitions) {
        var inputDesc = this.input ? this.input.description(definitions) : null;
        var outputDesc = this.output ? this.output.description(definitions) : null;
        return {
            input: inputDesc && inputDesc[Object.keys(inputDesc)[0]],
            output: outputDesc && outputDesc[Object.keys(outputDesc)[0]]
        };
    };
    return OperationElement;
}(Element_1.default));
exports.default = OperationElement;
