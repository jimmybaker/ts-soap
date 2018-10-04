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
var assert = require("assert");
var _ = require("lodash");
var Element_1 = require("./Element");
var index_1 = require("./index");
var SchemaElement = /** @class */ (function (_super) {
    __extends(SchemaElement, _super);
    function SchemaElement() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.complexTypes = {};
        _this.types = {};
        _this.elements = {};
        _this.includes = [];
        return _this;
    }
    SchemaElement.prototype.merge = function (source) {
        assert(source instanceof SchemaElement);
        if (this.$targetNamespace === source.$targetNamespace) {
            _.merge(this.complexTypes, source.complexTypes);
            _.merge(this.types, source.types);
            _.merge(this.elements, source.elements);
            _.merge(this.xmlns, source.xmlns);
        }
        return this;
    };
    SchemaElement.prototype.addChild = function (child) {
        if (child.$name in index_1.Primitives)
            return;
        if (child.name === "include" || child.name === "import") {
            var location = child.$schemaLocation || child.$location;
            if (location) {
                this.includes.push({
                    namespace: child.$namespace || child.$targetNamespace || this.$targetNamespace,
                    location: location
                });
            }
        }
        else if (child.name === "complexType") {
            this.complexTypes[child.$name] = child;
        }
        else if (child.name === "element") {
            this.elements[child.$name] = child;
        }
        else if (child.$name) {
            this.types[child.$name] = child;
        }
        this.children.pop();
        // child.deleteFixedAttrs();
    };
    return SchemaElement;
}(Element_1.default));
exports.default = SchemaElement;
