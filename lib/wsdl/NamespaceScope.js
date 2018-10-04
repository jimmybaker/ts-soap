"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NamespaceScope = /** @class */ (function () {
    function NamespaceScope(parent) {
        if (!(this instanceof NamespaceScope)) {
            return new NamespaceScope(parent);
        }
        this.parent = parent;
        this.namespaces = {};
    }
    /**
     * Look up the namespace URI by prefix
     * @param {String} prefix Namespace prefix
     * @param {Boolean} [localOnly] Search current scope only
     * @returns {String} Namespace URI
     */
    NamespaceScope.prototype.getNamespaceURI = function (prefix, localOnly) {
        switch (prefix) {
            case "xml":
                return "http://www.w3.org/XML/1998/namespace";
            case "xmlns":
                return "http://www.w3.org/2000/xmlns/";
            default:
                var nsUri = this.namespaces[prefix];
                /*jshint -W116 */
                if (nsUri != null) {
                    return nsUri.uri;
                }
                else if (!localOnly && this.parent) {
                    return this.parent.getNamespaceURI(prefix);
                }
                else {
                    return null;
                }
        }
    };
    NamespaceScope.prototype.getNamespaceMapping = function (prefix) {
        switch (prefix) {
            case "xml":
                return {
                    uri: "http://www.w3.org/XML/1998/namespace",
                    prefix: "xml",
                    declared: true
                };
            case "xmlns":
                return {
                    uri: "http://www.w3.org/2000/xmlns/",
                    prefix: "xmlns",
                    declared: true
                };
            default:
                var mapping = this.namespaces[prefix];
                /*jshint -W116 */
                if (mapping != null) {
                    return mapping;
                }
                else if (this.parent) {
                    return this.parent.getNamespaceMapping(prefix);
                }
                else {
                    return null;
                }
        }
    };
    /**
     * Look up the namespace prefix by URI
     * @param {String} nsUri Namespace URI
     * @param {Boolean} [localOnly] Search current scope only
     * @returns {String} Namespace prefix
     */
    NamespaceScope.prototype.getPrefix = function (nsUri, localOnly) {
        switch (nsUri) {
            case "http://www.w3.org/XML/1998/namespace":
                return "xml";
            case "http://www.w3.org/2000/xmlns/":
                return "xmlns";
            default:
                for (var p in this.namespaces) {
                    if (this.namespaces[p].uri === nsUri) {
                        return p;
                    }
                }
                if (!localOnly && this.parent) {
                    return this.parent.getPrefix(nsUri);
                }
                else {
                    return null;
                }
        }
    };
    return NamespaceScope;
}());
exports.default = NamespaceScope;
