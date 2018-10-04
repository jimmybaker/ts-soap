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
var TypesElement_1 = require("./TypesElement");
var MessageElement_1 = require("./MessageElement");
var SchemaElement_1 = require("./SchemaElement");
var PortTypeElement_1 = require("./PortTypeElement");
var BindingElement_1 = require("./BindingElement");
var ServiceElement_1 = require("./ServiceElement");
var DocumentationElement_1 = require("./DocumentationElement");
var _ = require("lodash");
var DefinitionsElement = /** @class */ (function (_super) {
    __extends(DefinitionsElement, _super);
    function DefinitionsElement(nsName, attrs, options, schemaAttrs) {
        var _this = _super.call(this, nsName, attrs, options, schemaAttrs) || this;
        _this.messages = {};
        _this.portTypes = {};
        _this.bindings = {};
        _this.services = {};
        _this.schemas = {};
        if (_this.name !== "definitions") {
            _this.unexpected(_this.nsName);
        }
        return _this;
    }
    DefinitionsElement.prototype.addChild = function (child) {
        var self = this;
        if (child instanceof TypesElement_1.default) {
            // Merge types.schemas into definitions.schemas
            _.merge(self.schemas, child.schemas);
        }
        else if (child instanceof MessageElement_1.default) {
            self.messages[child.$name] = child;
        }
        else if (child.name === "import") {
            self.schemas[child.$namespace] = new SchemaElement_1.default(child.$namespace, {});
            self.schemas[child.$namespace].addChild(child);
        }
        else if (child instanceof PortTypeElement_1.default) {
            self.portTypes[child.$name] = child;
        }
        else if (child instanceof BindingElement_1.default) {
            if (child.transport === "http://schemas.xmlsoap.org/soap/http" ||
                child.transport === "http://www.w3.org/2003/05/soap/bindings/HTTP/")
                self.bindings[child.$name] = child;
        }
        else if (child instanceof ServiceElement_1.default) {
            self.services[child.$name] = child;
        }
        else if (child instanceof DocumentationElement_1.default) {
        }
        this.children.pop();
    };
    return DefinitionsElement;
}(Element_1.default));
exports.default = DefinitionsElement;
