"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TNS_PREFIX = "__tns__"; // Prefix for targetNamespace
/**
 * Find a key from an object based on the value
 * @param {Object} Namespace prefix/uri mapping
 * @param {*} nsURI value
 * @returns {String} The matching key
 */
function findPrefix(xmlnsMapping, nsURI) {
    for (var n in xmlnsMapping) {
        if (n === exports.TNS_PREFIX)
            continue;
        if (xmlnsMapping[n] === nsURI) {
            return n;
        }
    }
}
exports.findPrefix = findPrefix;
