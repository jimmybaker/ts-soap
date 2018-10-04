"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var index_1 = require("./index");
var Element = /** @class */ (function () {
    function Element(nsName, attrs, options, schemaAttrs) {
        if (attrs === void 0) { attrs = null; }
        if (options === void 0) { options = null; }
        if (schemaAttrs === void 0) { schemaAttrs = null; }
        this.allowedChildren = [];
        var parts = index_1.splitQName(nsName);
        this.nsName = nsName;
        this.prefix = parts.prefix;
        this.name = parts.name;
        this.children = [];
        this.xmlns = {};
        this.schemaXmlns = {};
        this._initializeOptions(options);
        for (var key in attrs) {
            var match = /^xmlns:?(.*)$/.exec(key);
            if (match) {
                this.xmlns[match[1] ? match[1] : index_1.TNS_PREFIX] = attrs[key];
            }
            else {
                if (key === "value") {
                    this[this.valueKey] = attrs[key];
                }
                else {
                    this["$" + key] = attrs[key];
                }
            }
        }
        for (var schemaKey in schemaAttrs) {
            var schemaMatch = /^xmlns:?(.*)$/.exec(schemaKey);
            if (schemaMatch && schemaMatch[1]) {
                this.schemaXmlns[schemaMatch[1]] = schemaAttrs[schemaKey];
            }
        }
        if (this.$targetNamespace !== undefined) {
            // Add targetNamespace to the mapping
            this.xmlns[index_1.TNS_PREFIX] = this.$targetNamespace;
        }
    }
    Element.prototype._initializeOptions = function (options) {
        if (options) {
            this.valueKey = options.valueKey || "$value";
            this.xmlKey = options.xmlKey || "$xml";
            this.ignoredNamespaces = options.ignoredNamespaces || [];
        }
        else {
            this.valueKey = "$value";
            this.xmlKey = "$xml";
            this.ignoredNamespaces = [];
        }
    };
    Element.prototype.deleteFixedAttrs = function () {
        this.children && this.children.length === 0 && delete this.children;
        this.xmlns && Object.keys(this.xmlns).length === 0 && delete this.xmlns;
        delete this.nsName;
        delete this.prefix;
        delete this.name;
    };
    Element.prototype.startElement = function (stack, nsName, attrs, options, schemaXmlns) {
        if (!this.allowedChildren) {
            return;
        }
        var ChildClass = this.allowedChildren[index_1.splitQName(nsName).name], element = null;
        if (ChildClass) {
            stack.push(new ChildClass(nsName, attrs, options, schemaXmlns));
        }
        else {
            this.unexpected(nsName);
        }
    };
    Element.prototype.endElement = function (stack, nsName) {
        if (this.nsName === nsName) {
            if (stack.length < 2)
                return;
            var parent = stack[stack.length - 2];
            if (this !== stack[0]) {
                _.defaultsDeep(stack[0].xmlns, this.xmlns);
                // delete this.xmlns;
                parent.children.push(this);
                parent.addChild(this);
            }
            stack.pop();
        }
    };
    Element.prototype.addChild = function (child) {
        return;
    };
    Element.prototype.unexpected = function (name) {
        throw new Error("Found unexpected element (" + name + ") inside " + this.nsName);
    };
    Element.prototype.description = function (definitions, xmlns) {
        if (definitions === void 0) { definitions = null; }
        if (xmlns === void 0) { xmlns = null; }
        return this.$name || this.name;
    };
    return Element;
}());
exports.default = Element;
