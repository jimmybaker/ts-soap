import NamespaceScope from "./NamespaceScope";

export default class NamespaceContext {
  scopes: any;
  prefixCount: any;
  currentScope: any;

  constructor() {
    if (!(this instanceof NamespaceContext)) {
      return new NamespaceContext();
    }
    this.scopes = [];
    this.pushContext();
    this.prefixCount = 0;
  }

  /**
   * Add a prefix/URI namespace mapping
   * @param {String} prefix Namespace prefix
   * @param {String} nsUri Namespace URI
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {boolean} true if the mapping is added or false if the mapping
   * already exists
   */
  addNamespace(prefix?: any, nsUri?: any, localOnly?: any) {
    if (this.getNamespaceURI(prefix, localOnly) === nsUri) {
      return false;
    }
    if (this.currentScope) {
      this.currentScope.namespaces[prefix] = {
        uri: nsUri,
        prefix: prefix,
        declared: false
      };
      return true;
    }
    return false;
  }

  /**
   * Push a scope into the context
   * @returns {NamespaceScope} The current scope
   */
  pushContext() {
    var scope = new NamespaceScope(this.currentScope);
    this.scopes.push(scope);
    this.currentScope = scope;
    return scope;
  }

  /**
   * Pop a scope out of the context
   * @returns {NamespaceScope} The removed scope
   */
  popContext() {
    var scope = this.scopes.pop();
    if (scope) {
      this.currentScope = scope.parent;
    } else {
      this.currentScope = null;
    }
    return scope;
  }

  /**
   * Look up the namespace URI by prefix
   * @param {String} prefix Namespace prefix
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {String} Namespace URI
   */
  getNamespaceURI(prefix?: any, localOnly?: any) {
    return (
      this.currentScope && this.currentScope.getNamespaceURI(prefix, localOnly)
    );
  }

  /**
   * Look up the namespace prefix by URI
   * @param {String} nsURI Namespace URI
   * @param {Boolean} [localOnly] Search current scope only
   * @returns {String} Namespace prefix
   */
  getPrefix(nsUri?: any, localOnly?: any) {
    return this.currentScope && this.currentScope.getPrefix(nsUri, localOnly);
  }

  /**
   * Register a namespace
   * @param {String} nsUri Namespace URI
   * @returns {String} The matching or generated namespace prefix
   */
  registerNamespace(nsUri: any) {
    var prefix = this.getPrefix(nsUri);
    if (prefix) {
      // If the namespace has already mapped to a prefix
      return prefix;
    } else {
      // Try to generate a unique namespace
      while (true) {
        prefix = "ns" + ++this.prefixCount;
        if (!this.getNamespaceURI(prefix)) {
          // The prefix is not used
          break;
        }
      }
    }
    this.addNamespace(prefix, nsUri, true);
    return prefix;
  }

  /**
   * Declare a namespace prefix/uri mapping
   * @param {String} prefix Namespace prefix
   * @param {String} nsUri Namespace URI
   * @returns {Boolean} true if the declaration is created
   */
  declareNamespace(prefix?: any, nsUri?: any) {
    if (this.currentScope) {
      var mapping = this.currentScope.getNamespaceMapping(prefix);
      if (mapping && mapping.uri === nsUri && mapping.declared) {
        return false;
      }
      this.currentScope.namespaces[prefix] = {
        uri: nsUri,
        prefix: prefix,
        declared: true
      };
      return true;
    }
    return false;
  }
}
