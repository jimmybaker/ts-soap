import stripBom = require("strip-bom");
import * as assert from "assert";
import { splitQName, TNS_PREFIX, trim, xmlEscape } from "./index";
import { findPrefix } from "../utils";
import * as sax from "sax";
import * as _ from "lodash";
import Element from "./Element";
import DefinitionsElement from "./DefinitionsElement";
import TypesElement from "./TypesElement";
import SchemaElement from "./SchemaElement";
import NamespaceContext from "./NamespaceContext";

export default class WSDL {
  uri: string;
  callback: any;
  _includesWsdl: any = [];
  ignoredNamespaces: string[] = ["tns", "targetNamespace", "typedNamespace"];
  ignoreBaseNameSpaces: boolean = false;
  valueKey: string = "$value";
  xmlKey: string = "$xml";
  _originalIgnoredNamespaces: any;
  options: any;
  WSDL_CACHE: any;
  definitions: any;
  services: any;
  xml: any;

  constructor(definition: any, uri: any, options: any) {
    const self = this;
    let fromFunc: any;

    this.uri = uri;
    this.callback = function() {};
    this._includesWsdl = [];

    // initialize WSDL cache
    this.WSDL_CACHE = (options || {}).WSDL_CACHE || {};

    this._initializeOptions(options);

    if (typeof definition === "string") {
      definition = stripBom(definition);
      fromFunc = this._fromXML;
    } else if (typeof definition === "object") {
      fromFunc = this._fromServices;
    } else {
      throw new Error(
        "WSDL constructor takes either an XML string or service definition"
      );
    }

    fromFunc.call(self, definition);
  }

  _initializeOptions(options: any) {
    this._originalIgnoredNamespaces = (options || {}).ignoredNamespaces;
    this.options = {};

    var ignoredNamespaces = options ? options.ignoredNamespaces : null;

    if (
      ignoredNamespaces &&
      (Array.isArray(ignoredNamespaces.namespaces) ||
        typeof ignoredNamespaces.namespaces === "string")
    ) {
      if (ignoredNamespaces.override) {
        this.options.ignoredNamespaces = ignoredNamespaces.namespaces;
      } else {
        this.options.ignoredNamespaces = this.ignoredNamespaces.concat(
          ignoredNamespaces.namespaces
        );
      }
    } else {
      this.options.ignoredNamespaces = this.ignoredNamespaces;
    }

    this.options.valueKey = options.valueKey || this.valueKey;
    this.options.xmlKey = options.xmlKey || this.xmlKey;
    if (options.escapeXML !== undefined) {
      this.options.escapeXML = options.escapeXML;
    } else {
      this.options.escapeXML = true;
    }
    if (options.returnFault !== undefined) {
      this.options.returnFault = options.returnFault;
    } else {
      this.options.returnFault = false;
    }
    this.options.handleNilAsNull = !!options.handleNilAsNull;

    if (options.namespaceArrayElements !== undefined) {
      this.options.namespaceArrayElements = options.namespaceArrayElements;
    } else {
      this.options.namespaceArrayElements = true;
    }

    // Allow any request headers to keep passing through
    this.options.wsdl_headers = options.wsdl_headers;
    this.options.wsdl_options = options.wsdl_options;
    if (options.httpClient) {
      this.options.httpClient = options.httpClient;
    }

    // The supplied request-object should be passed through
    if (options.request) {
      this.options.request = options.request;
    }

    var ignoreBaseNameSpaces = options ? options.ignoreBaseNameSpaces : null;
    if (
      ignoreBaseNameSpaces !== null &&
      typeof ignoreBaseNameSpaces !== "undefined"
    ) {
      this.options.ignoreBaseNameSpaces = ignoreBaseNameSpaces;
    } else {
      this.options.ignoreBaseNameSpaces = this.ignoreBaseNameSpaces;
    }

    // Works only in client
    this.options.forceSoap12Headers = options.forceSoap12Headers;
    this.options.customDeserializer = options.customDeserializer;

    if (options.overrideRootElement !== undefined) {
      this.options.overrideRootElement = options.overrideRootElement;
    }

    this.options.useEmptyTag = !!options.useEmptyTag;
  }

  describeServices() {
    let services: any = {};
    for (var name in this.services) {
      var service = this.services[name];
      services[name] = service.description(this.definitions);
    }
    return services;
  }

  toXML() {
    return this.xml || "";
  }

  xmlToObject(xml: any, callback?: any) {
    let self = this;
    let p: any = typeof callback === "function" ? {} : sax.parser(true, {});
    let objectName: any = null;
    let root: any = {};
    let schema = {
      Envelope: {
        Header: {
          Security: {
            UsernameToken: {
              Username: "string",
              Password: "string"
            }
          }
        },
        Body: {
          Fault: {
            faultcode: "string",
            faultstring: "string",
            detail: "string"
          }
        }
      }
    };
    let stack: any = [{ name: null, object: root, schema: schema }];
    let xmlns: any = {};

    let refs: any = {};
    let id; // {id:{hrefs:[],obj:}, ...}

    p.onopentag = function(node: any) {
      var nsName = node.name;
      var attrs = node.attributes;

      let name = splitQName(nsName).name;
      let attributeName;
      let top = stack[stack.length - 1];
      let topSchema = top.schema;
      let elementAttributes: any = {};
      let hasNonXmlnsAttribute: boolean = false;
      let hasNilAttribute: boolean = false;
      let obj: any = {};
      var originalName = name;

      if (!objectName && top.name === "Body" && name !== "Fault") {
        var message = self.definitions.messages[name];
        // Support RPC/literal messages where response body contains one element named
        // after the operation + 'Response'. See http://www.w3.org/TR/wsdl#_names
        if (!message) {
          try {
            // Determine if this is request or response
            var isInput = false;
            var isOutput = false;
            if (/Response$/.test(name)) {
              isOutput = true;
              name = name.replace(/Response$/, "");
            } else if (/Request$/.test(name)) {
              isInput = true;
              name = name.replace(/Request$/, "");
            } else if (/Solicit$/.test(name)) {
              isInput = true;
              name = name.replace(/Solicit$/, "");
            }
            // Look up the appropriate message as given in the portType's operations
            var portTypes = self.definitions.portTypes;
            var portTypeNames = Object.keys(portTypes);
            // Currently this supports only one portType definition.
            var portType = portTypes[portTypeNames[0]];
            if (isInput) {
              name = portType.methods[name].input.$name;
            } else {
              name = portType.methods[name].output.$name;
            }
            message = self.definitions.messages[name];
            // 'cache' this alias to speed future lookups
            self.definitions.messages[originalName] =
              self.definitions.messages[name];
          } catch (e) {
            if (self.options.returnFault) {
              p.onerror(e);
            }
          }
        }

        topSchema = message.description(self.definitions);
        objectName = originalName;
      }

      if (attrs.href) {
        id = attrs.href.substr(1);
        if (!refs[id]) {
          refs[id] = { hrefs: [], obj: null };
        }
        refs[id].hrefs.push({ par: top.object, key: name, obj: obj });
      }
      if ((id = attrs.id)) {
        if (!refs[id]) {
          refs[id] = { hrefs: [], obj: null };
        }
      }

      //Handle element attributes
      for (attributeName in attrs) {
        if (/^xmlns:|^xmlns$/.test(attributeName)) {
          xmlns[splitQName(attributeName).name] = attrs[attributeName];
          continue;
        }
        hasNonXmlnsAttribute = true;
        elementAttributes[attributeName] = attrs[attributeName];
      }

      for (attributeName in elementAttributes) {
        var res = splitQName(attributeName);
        if (
          res.name === "nil" &&
          xmlns[res.prefix] === "http://www.w3.org/2001/XMLSchema-instance" &&
          elementAttributes[attributeName] &&
          (elementAttributes[attributeName].toLowerCase() === "true" ||
            elementAttributes[attributeName] === "1")
        ) {
          hasNilAttribute = true;
          break;
        }
      }

      if (hasNonXmlnsAttribute) {
        obj[self.options.attributesKey] = elementAttributes;
      }

      // Pick up the schema for the type specified in element's xsi:type attribute.
      var xsiTypeSchema;
      var xsiType = elementAttributes["xsi:type"];
      if (xsiType) {
        var type = splitQName(xsiType);
        var typeURI;
        if (type.prefix === TNS_PREFIX) {
          // In case of xsi:type = "MyType"
          typeURI = xmlns[type.prefix] || xmlns.xmlns;
        } else {
          typeURI = xmlns[type.prefix];
        }
        var typeDef = self.findSchemaObject(typeURI, type.name);
        if (typeDef) {
          xsiTypeSchema = typeDef.description(self.definitions);
        }
      }

      if (topSchema && topSchema[name + "[]"]) {
        name = name + "[]";
      }
      stack.push({
        name: originalName,
        object: obj,
        schema: xsiTypeSchema || (topSchema && topSchema[name]),
        id: attrs.id,
        nil: hasNilAttribute
      });
    };

    p.onclosetag = function(nsName: any) {
      var cur = stack.pop(),
        obj = cur.object,
        top = stack[stack.length - 1],
        topObject = top.object,
        topSchema = top.schema,
        name = splitQName(nsName).name;

      if (
        typeof cur.schema === "string" &&
        (cur.schema === "string" || cur.schema.split(":")[1] === "string")
      ) {
        if (typeof obj === "object" && Object.keys(obj).length === 0)
          obj = cur.object = "";
      }

      if (cur.nil === true) {
        if (self.options.handleNilAsNull) {
          obj = null;
        } else {
          return;
        }
      }

      if (_.isPlainObject(obj) && !Object.keys(obj).length) {
        obj = null;
      }

      if (topSchema && topSchema[name + "[]"]) {
        if (!topObject[name]) {
          topObject[name] = [];
        }
        topObject[name].push(obj);
      } else if (name in topObject) {
        if (!Array.isArray(topObject[name])) {
          topObject[name] = [topObject[name]];
        }
        topObject[name].push(obj);
      } else {
        topObject[name] = obj;
      }

      if (cur.id) {
        refs[cur.id].obj = obj;
      }
    };

    p.oncdata = function(text: any) {
      var originalText = text;
      text = trim(text);
      if (!text.length) {
        return;
      }

      if (/<\?xml[\s\S]+\?>/.test(text)) {
        var top = stack[stack.length - 1];
        var value = self.xmlToObject(text);
        if (top.object[self.options.attributesKey]) {
          top.object[self.options.valueKey] = value;
        } else {
          top.object = value;
        }
      } else {
        p.ontext(originalText);
      }
    };

    p.onerror = function(e: any) {
      p.resume();
      throw {
        Fault: {
          faultcode: 500,
          faultstring: "Invalid XML",
          detail: new Error(e).message,
          statusCode: 500
        }
      };
    };

    p.ontext = function(text: any) {
      var originalText = text;
      text = trim(text);
      if (!text.length) {
        return;
      }

      var top = stack[stack.length - 1];
      var name = splitQName(top.schema).name,
        value;

      if (
        self.options &&
        self.options.customDeserializer &&
        self.options.customDeserializer[name]
      ) {
        value = self.options.customDeserializer[name](text, top);
      } else {
        if (name === "int" || name === "integer") {
          value = parseInt(text, 10);
        } else if (name === "bool" || name === "boolean") {
          value = text.toLowerCase() === "true" || text === "1";
        } else if (name === "dateTime" || name === "date") {
          value = new Date(text);
        } else {
          if (self.options.preserveWhitespace) {
            text = originalText;
          }
          // handle string or other types
          if (typeof top.object !== "string") {
            value = text;
          } else {
            value = top.object + text;
          }
        }
      }

      if (top.object[self.options.attributesKey]) {
        top.object[self.options.valueKey] = value;
      } else {
        top.object = value;
      }
    };

    if (typeof callback === "function") {
      // we be streaming
      var saxStream = sax.createStream(true, {});
      saxStream.on("opentag", p.onopentag);
      saxStream.on("closetag", p.onclosetag);
      saxStream.on("cdata", p.oncdata);
      saxStream.on("text", p.ontext);
      xml
        .pipe(saxStream)
        .on("error", function(err: Error) {
          callback(err);
        })
        .on("end", function() {
          var r;
          try {
            r = finish();
          } catch (e) {
            return callback(e);
          }
          callback(null, r);
        });
      return;
    }
    p.write(xml).close();

    return finish();

    function finish() {
      // MultiRef support: merge objects instead of replacing
      for (var n in refs) {
        var ref = refs[n];
        for (var i = 0; i < ref.hrefs.length; i++) {
          _.assign(ref.hrefs[i].obj, ref.obj);
        }
      }

      if (root.Envelope) {
        var body = root.Envelope.Body;
        if (body && body.Fault) {
          var code = body.Fault.faultcode && body.Fault.faultcode.$value;
          var string = body.Fault.faultstring && body.Fault.faultstring.$value;
          var detail = body.Fault.detail && body.Fault.detail.$value;

          code = code || body.Fault.faultcode;
          string = string || body.Fault.faultstring;
          detail = detail || body.Fault.detail;

          var error = new Error(
            code + ": " + string + (detail ? ": " + detail : "")
          );

          // error.root = root;
          throw error;
        }
        return root.Envelope;
      }
      return root;
    }
  }

  /**
   * Look up a XSD type or element by namespace URI and name
   * @param {String} nsURI Namespace URI
   * @param {String} qname Local or qualified name
   * @returns {*} The XSD type/element definition
   */
  findSchemaObject(nsURI?: any, qname?: any) {
    if (!nsURI || !qname) {
      return null;
    }

    var def = null;

    if (this.definitions.schemas) {
      var schema = this.definitions.schemas[nsURI];
      if (schema) {
        if (qname.indexOf(":") !== -1) {
          qname = qname.substring(qname.indexOf(":") + 1, qname.length);
        }

        // if the client passed an input element which has a `$lookupType` property instead of `$type`
        // the `def` is found in `schema.elements`.
        def =
          schema.complexTypes[qname] ||
          schema.types[qname] ||
          schema.elements[qname];
      }
    }

    return def;
  }

  /**
   * Create document style xml string from the parameters
   * @param {String} name
   * @param {*} params
   * @param {String} nsPrefix
   * @param {String} nsURI
   * @param {String} type
   */
  objectToDocumentXML(
    name?: any,
    params?: any,
    nsPrefix?: any,
    nsURI?: any,
    type?: any
  ) {
    //If user supplies XML already, just use that.  XML Declaration should not be present.
    if (params && params._xml) {
      return params._xml;
    }
    let args: any = {};
    args[name] = params;
    let parameterTypeObj = type ? this.findSchemaObject(nsURI, type) : null;
    return this.objectToXML(
      args,
      null,
      nsPrefix,
      nsURI,
      true,
      null,
      parameterTypeObj
    );
  }

  /**
   * Create RPC style xml string from the parameters
   * @param {String} name
   * @param {*} params
   * @param {String} nsPrefix
   * @param {String} nsURI
   * @returns {string}
   */
  objectToRpcXML(
    name?: any,
    params?: any,
    nsPrefix?: any,
    nsURI?: any,
    isParts?: any
  ) {
    var parts = [];
    var defs = this.definitions;
    var nsAttrName = "_xmlns";

    nsPrefix = nsPrefix || findPrefix(defs.xmlns, nsURI);

    nsURI = nsURI || defs.xmlns[nsPrefix];
    nsPrefix = nsPrefix === TNS_PREFIX ? "" : nsPrefix + ":";

    parts.push(["<", nsPrefix, name, ">"].join(""));

    for (var key in params) {
      if (!params.hasOwnProperty(key)) {
        continue;
      }
      if (key !== nsAttrName) {
        var value = params[key];
        var prefixedKey = (isParts ? "" : nsPrefix) + key;
        var attributes = [];
        if (
          typeof value === "object" &&
          value.hasOwnProperty(this.options.attributesKey)
        ) {
          var attrs = value[this.options.attributesKey];
          for (var n in attrs) {
            attributes.push(" " + n + "=" + '"' + attrs[n] + '"');
          }
        }
        parts.push(
          ["<", prefixedKey]
            .concat(attributes)
            .concat(">")
            .join("")
        );
        parts.push(
          typeof value === "object"
            ? this.objectToXML(value, key, nsPrefix, nsURI)
            : xmlEscape(value)
        );
        parts.push(["</", prefixedKey, ">"].join(""));
      }
    }
    parts.push(["</", nsPrefix, name, ">"].join(""));
    return parts.join("");
  }

  /**
   * Convert an object to XML.  This is a recursive method as it calls itself.
   *
   * @param {Object} obj the object to convert.
   * @param {String} name the name of the element (if the object being traversed is
   * an element).
   * @param {String} nsPrefix the namespace prefix of the object I.E. xsd.
   * @param {String} nsURI the full namespace of the object I.E. http://w3.org/schema.
   * @param {Boolean} isFirst whether or not this is the first item being traversed.
   * @param {?} xmlnsAttr
   * @param {?} parameterTypeObject
   * @param {NamespaceContext} nsContext Namespace context
   */
  objectToXML(
    obj: any,
    name?: any,
    nsPrefix?: any,
    nsURI?: any,
    isFirst?: any,
    xmlnsAttr?: any,
    schemaObject?: any,
    nsContext?: any
  ): string {
    var self = this;
    var schema = this.definitions.schemas[nsURI];

    var parentNsPrefix = nsPrefix ? nsPrefix.parent : undefined;
    if (typeof parentNsPrefix !== "undefined") {
      //we got the parentNsPrefix for our array. setting the namespace-variable back to the current namespace string
      nsPrefix = nsPrefix.current;
    }

    parentNsPrefix = noColonNameSpace(parentNsPrefix);
    if (this.isIgnoredNameSpace(parentNsPrefix)) {
      parentNsPrefix = "";
    }

    var soapHeader = !schema;
    var qualified = schema && schema.$elementFormDefault === "qualified";
    var parts = [];
    var prefixNamespace = (nsPrefix || qualified) && nsPrefix !== TNS_PREFIX;

    var xmlnsAttrib = "";
    if (nsURI && isFirst) {
      if (
        self.options.overrideRootElement &&
        self.options.overrideRootElement.xmlnsAttributes
      ) {
        self.options.overrideRootElement.xmlnsAttributes.forEach(function(
          attribute: any
        ) {
          xmlnsAttrib += " " + attribute.name + '="' + attribute.value + '"';
        });
      } else {
        if (prefixNamespace && !this.isIgnoredNameSpace(nsPrefix)) {
          // resolve the prefix namespace
          xmlnsAttrib += " xmlns:" + nsPrefix + '="' + nsURI + '"';
        }
        // only add default namespace if the schema elementFormDefault is qualified
        if (qualified || soapHeader) xmlnsAttrib += ' xmlns="' + nsURI + '"';
      }
    }

    if (!nsContext) {
      nsContext = new NamespaceContext();
      nsContext.declareNamespace(nsPrefix, nsURI);
    } else {
      nsContext.pushContext();
    }

    // explicitly use xmlns attribute if available
    if (
      xmlnsAttr &&
      !(
        self.options.overrideRootElement &&
        self.options.overrideRootElement.xmlnsAttributes
      )
    ) {
      xmlnsAttrib = xmlnsAttr;
    }

    var ns = "";

    if (self.options.overrideRootElement && isFirst) {
      ns = self.options.overrideRootElement.namespace;
    } else if (
      prefixNamespace &&
      (qualified || isFirst || soapHeader) &&
      !this.isIgnoredNameSpace(nsPrefix)
    ) {
      ns = nsPrefix;
    }

    var i, n;
    // start building out XML string.
    if (Array.isArray(obj)) {
      for (i = 0, n = obj.length; i < n; i++) {
        var item = obj[i];
        var arrayAttr = self.processAttributes(item, nsContext),
          correctOuterNsPrefix = parentNsPrefix || ns; //using the parent namespace prefix if given

        var body = self.objectToXML(
          item,
          name,
          nsPrefix,
          nsURI,
          false,
          null,
          schemaObject,
          nsContext
        );

        var openingTagParts = [
          "<",
          appendColon(correctOuterNsPrefix),
          name,
          arrayAttr,
          xmlnsAttrib
        ];

        if (body === "" && self.options.useEmptyTag) {
          // Use empty (self-closing) tags if no contents
          openingTagParts.push(" />");
          parts.push(openingTagParts.join(""));
        } else {
          openingTagParts.push(">");
          if (self.options.namespaceArrayElements || i === 0) {
            parts.push(openingTagParts.join(""));
          }
          parts.push(body);
          if (self.options.namespaceArrayElements || i === n - 1) {
            parts.push(
              ["</", appendColon(correctOuterNsPrefix), name, ">"].join("")
            );
          }
        }
      }
    } else if (typeof obj === "object") {
      for (name in obj) {
        if (!obj.hasOwnProperty(name)) continue;
        //don't process attributes as element
        if (name === self.options.attributesKey) {
          continue;
        }
        //Its the value of a xml object. Return it directly.
        if (name === self.options.xmlKey) {
          nsContext.popContext();
          return obj[name];
        }
        //Its the value of an item. Return it directly.
        if (name === self.options.valueKey) {
          nsContext.popContext();
          return xmlEscape(obj[name]);
        }

        var child = obj[name];
        if (typeof child === "undefined") {
          continue;
        }

        var attr = self.processAttributes(child, nsContext);

        var value = "";
        var nonSubNameSpace = "";
        var emptyNonSubNameSpace = false;

        var nameWithNsRegex = /^([^:]+):([^:]+)$/.exec(name);
        if (nameWithNsRegex) {
          nonSubNameSpace = nameWithNsRegex[1] + ":";
          name = nameWithNsRegex[2];
        } else if (name[0] === ":") {
          emptyNonSubNameSpace = true;
          name = name.substr(1);
        }

        if (isFirst) {
          value = self.objectToXML(
            child,
            name,
            nsPrefix,
            nsURI,
            false,
            null,
            schemaObject,
            nsContext
          );
        } else {
          if (self.definitions.schemas) {
            if (schema) {
              var childSchemaObject = self.findChildSchemaObject(
                schemaObject,
                name
              );
              //find sub namespace if not a primitive
              if (
                childSchemaObject &&
                ((childSchemaObject.$type &&
                  childSchemaObject.$type.indexOf("xsd:") === -1) ||
                  childSchemaObject.$ref ||
                  childSchemaObject.$name)
              ) {
                /*if the base name space of the children is not in the ingoredSchemaNamspaces we use it.
               This is because in some services the child nodes do not need the baseNameSpace.
               */

                var childNsPrefix: any = "";
                var childName = "";
                var childNsURI;
                var childXmlnsAttrib: any = "";

                var elementQName =
                  childSchemaObject.$ref || childSchemaObject.$name;
                if (elementQName) {
                  elementQName = splitQName(elementQName);
                  childName = elementQName.name;
                  if (elementQName.prefix === TNS_PREFIX) {
                    // Local element
                    childNsURI = childSchemaObject.$targetNamespace;
                    childNsPrefix = nsContext.registerNamespace(childNsURI);
                    if (this.isIgnoredNameSpace(childNsPrefix)) {
                      childNsPrefix = nsPrefix;
                    }
                  } else {
                    childNsPrefix = elementQName.prefix;
                    if (this.isIgnoredNameSpace(childNsPrefix)) {
                      childNsPrefix = nsPrefix;
                    }
                    childNsURI =
                      schema.xmlns[childNsPrefix] ||
                      self.definitions.xmlns[childNsPrefix];
                  }

                  var unqualified = false;
                  // Check qualification form for local elements
                  if (
                    childSchemaObject.$name &&
                    childSchemaObject.targetNamespace === undefined
                  ) {
                    if (childSchemaObject.$form === "unqualified") {
                      unqualified = true;
                    } else if (childSchemaObject.$form === "qualified") {
                      unqualified = false;
                    } else {
                      unqualified = schema.$elementFormDefault !== "qualified";
                    }
                  }
                  if (unqualified) {
                    childNsPrefix = "";
                  }

                  if (childNsURI && childNsPrefix) {
                    if (nsContext.declareNamespace(childNsPrefix, childNsURI)) {
                      childXmlnsAttrib =
                        " xmlns:" + childNsPrefix + '="' + childNsURI + '"';
                      xmlnsAttrib += childXmlnsAttrib;
                    }
                  }
                }

                var resolvedChildSchemaObject;
                if (childSchemaObject.$type) {
                  var typeQName = splitQName(childSchemaObject.$type);
                  var typePrefix = typeQName.prefix;
                  var typeURI =
                    schema.xmlns[typePrefix] ||
                    self.definitions.xmlns[typePrefix];
                  childNsURI = typeURI;
                  if (
                    typeURI !== "http://www.w3.org/2001/XMLSchema" &&
                    typePrefix !== TNS_PREFIX
                  ) {
                    // Add the prefix/namespace mapping, but not declare it
                    nsContext.addNamespace(typePrefix, typeURI);
                  }
                  resolvedChildSchemaObject =
                    self.findSchemaType(typeQName.name, typeURI) ||
                    childSchemaObject;
                } else {
                  resolvedChildSchemaObject =
                    self.findSchemaObject(childNsURI, childName) ||
                    childSchemaObject;
                }

                if (
                  childSchemaObject.$baseNameSpace &&
                  this.options.ignoreBaseNameSpaces
                ) {
                  childNsPrefix = nsPrefix;
                  childNsURI = nsURI;
                }

                if (this.options.ignoreBaseNameSpaces) {
                  childNsPrefix = "";
                  childNsURI = "";
                }

                ns = childNsPrefix;

                if (Array.isArray(child)) {
                  //for arrays, we need to remember the current namespace
                  childNsPrefix = {
                    current: childNsPrefix,
                    parent: ns
                  };
                } else {
                  //parent (array) already got the namespace
                  childXmlnsAttrib = null;
                }

                value = self.objectToXML(
                  child,
                  name,
                  childNsPrefix,
                  childNsURI,
                  false,
                  childXmlnsAttrib,
                  resolvedChildSchemaObject,
                  nsContext
                );
              } else if (
                obj[self.options.attributesKey] &&
                obj[self.options.attributesKey].xsi_type
              ) {
                //if parent object has complex type defined and child not found in parent
                var completeChildParamTypeObject = self.findChildSchemaObject(
                  obj[self.options.attributesKey].xsi_type.type,
                  obj[self.options.attributesKey].xsi_type.xmlns
                );

                nonSubNameSpace =
                  obj[self.options.attributesKey].xsi_type.prefix;
                nsContext.addNamespace(
                  obj[self.options.attributesKey].xsi_type.prefix,
                  obj[self.options.attributesKey].xsi_type.xmlns
                );
                value = self.objectToXML(
                  child,
                  name,
                  obj[self.options.attributesKey].xsi_type.prefix,
                  obj[self.options.attributesKey].xsi_type.xmlns,
                  false,
                  null,
                  null,
                  nsContext
                );
              } else {
                if (Array.isArray(child)) {
                  name = nonSubNameSpace + name;
                }

                value = self.objectToXML(
                  child,
                  name,
                  nsPrefix,
                  nsURI,
                  false,
                  null,
                  null,
                  nsContext
                );
              }
            } else {
              value = self.objectToXML(
                child,
                name,
                nsPrefix,
                nsURI,
                false,
                null,
                null,
                nsContext
              );
            }
          }
        }

        ns = noColonNameSpace(ns);
        if (
          prefixNamespace &&
          !qualified &&
          isFirst &&
          !self.options.overrideRootElement
        ) {
          ns = nsPrefix;
        } else if (this.isIgnoredNameSpace(ns)) {
          ns = "";
        }

        var useEmptyTag = !value && self.options.useEmptyTag;
        if (!Array.isArray(child)) {
          // start tag
          parts.push(
            [
              "<",
              emptyNonSubNameSpace ? "" : appendColon(nonSubNameSpace || ns),
              name,
              attr,
              xmlnsAttrib,
              child === null ? ' xsi:nil="true"' : "",
              useEmptyTag ? " />" : ">"
            ].join("")
          );
        }

        if (!useEmptyTag) {
          parts.push(value);
          if (!Array.isArray(child)) {
            // end tag
            parts.push(
              [
                "</",
                emptyNonSubNameSpace ? "" : appendColon(nonSubNameSpace || ns),
                name,
                ">"
              ].join("")
            );
          }
        }
      }
    } else if (obj !== undefined) {
      parts.push(self.options.escapeXML ? xmlEscape(obj) : obj);
    }
    nsContext.popContext();
    return parts.join("");
  }

  isIgnoredNameSpace(ns: any) {
    return this.options.ignoredNamespaces.indexOf(ns) > -1;
  }

  filterOutIgnoredNameSpace(ns: any) {
    var namespace = noColonNameSpace(ns);
    return this.isIgnoredNameSpace(namespace) ? "" : namespace;
  }

  processAttributes(child: any, nsContext: any) {
    var attr = "";

    if (child === null) {
      child = [];
    }

    var attrObj = child[this.options.attributesKey];
    if (attrObj && attrObj.xsi_type) {
      var xsiType = attrObj.xsi_type;

      var prefix = xsiType.prefix || xsiType.namespace;
      // Generate a new namespace for complex extension if one not provided
      if (!prefix) {
        prefix = nsContext.registerNamespace(xsiType.xmlns);
      } else {
        nsContext.declareNamespace(prefix, xsiType.xmlns);
      }
      xsiType.prefix = prefix;
    }

    if (attrObj) {
      for (var attrKey in attrObj) {
        //handle complex extension separately
        if (attrKey === "xsi_type") {
          var attrValue = attrObj[attrKey];
          attr += ' xsi:type="' + attrValue.prefix + ":" + attrValue.type + '"';
          attr += " xmlns:" + attrValue.prefix + '="' + attrValue.xmlns + '"';

          continue;
        } else {
          attr += " " + attrKey + '="' + xmlEscape(attrObj[attrKey]) + '"';
        }
      }
    }

    return attr;
  }

  /**
   * Look up a schema type definition
   * @param name
   * @param nsURI
   * @returns {*}
   */
  findSchemaType(name: any, nsURI: any) {
    if (!this.definitions.schemas || !name || !nsURI) {
      return null;
    }

    var schema = this.definitions.schemas[nsURI];
    if (!schema || !schema.complexTypes) {
      return null;
    }

    return schema.complexTypes[name];
  }

  findChildSchemaObject(
    parameterTypeObj?: any,
    childName?: any,
    backtrace?: any
  ): any {
    if (!parameterTypeObj || !childName) {
      return null;
    }

    if (!backtrace) {
      backtrace = [];
    }

    if (backtrace.indexOf(parameterTypeObj) >= 0) {
      // We've recursed back to ourselves; break.
      return null;
    } else {
      backtrace = backtrace.concat([parameterTypeObj]);
    }

    var found = null,
      i = 0,
      child,
      ref;

    if (
      Array.isArray(parameterTypeObj.$lookupTypes) &&
      parameterTypeObj.$lookupTypes.length
    ) {
      var types = parameterTypeObj.$lookupTypes;

      for (i = 0; i < types.length; i++) {
        var typeObj = types[i];

        if (typeObj.$name === childName) {
          found = typeObj;
          break;
        }
      }
    }

    var object = parameterTypeObj;
    if (object.$name === childName && object.name === "element") {
      return object;
    }
    if (object.$ref) {
      ref = splitQName(object.$ref);
      if (ref.name === childName) {
        return object;
      }
    }

    var childNsURI;

    // want to avoid unecessary recursion to improve performance
    if (object.$type && backtrace.length === 1) {
      var typeInfo = splitQName(object.$type);
      if (typeInfo.prefix === TNS_PREFIX) {
        childNsURI = parameterTypeObj.$targetNamespace;
      } else {
        childNsURI = this.definitions.xmlns[typeInfo.prefix];
      }
      var typeDef = this.findSchemaType(typeInfo.name, childNsURI);
      if (typeDef) {
        return this.findChildSchemaObject(typeDef, childName, backtrace);
      }
    }

    if (object.children) {
      for (i = 0, child; (child = object.children[i]); i++) {
        found = this.findChildSchemaObject(child, childName, backtrace);
        if (found) {
          break;
        }

        if (child.$base) {
          var baseQName = splitQName(child.$base);
          var childNameSpace =
            baseQName.prefix === TNS_PREFIX ? "" : baseQName.prefix;
          childNsURI =
            child.xmlns[baseQName.prefix] ||
            this.definitions.xmlns[baseQName.prefix];

          var foundBase = this.findSchemaType(baseQName.name, childNsURI);

          if (foundBase) {
            found = this.findChildSchemaObject(foundBase, childName, backtrace);

            if (found) {
              found.$baseNameSpace = childNameSpace;
              found.$type = childNameSpace + ":" + childName;
              break;
            }
          }
        }
      }
    }

    if (!found && object.$name === childName) {
      return object;
    }

    return found;
  }

  _parse(xml: any) {
    var self = this;
    let p: sax.SAXParser = sax.parser(true, {});
    let stack: any = [];
    let root: any = null;
    let types: any = null;
    let schema: any = null;
    let schemaAttrs: any = null;
    let options = self.options;

    p.onopentag = function(node: any) {
      var nsName = node.name;
      var attrs = node.attributes;

      var top = stack[stack.length - 1];
      var name = splitQName(nsName).name;

      if (name === "schema") {
        schemaAttrs = attrs;
      }
      if (top) {
        try {
          top.startElement(stack, nsName, attrs, options, schemaAttrs);
        } catch (e) {
          if (self.options.strict) {
            throw e;
          } else {
            stack.push(new Element(nsName, attrs, options, schemaAttrs));
          }
        }
      } else {
        if (name === "definitions") {
          root = new DefinitionsElement(nsName, attrs, options);
          stack.push(root);
        } else if (name === "schema") {
          // Shim a structure in here to allow the proper objects to be created when merging back.
          root = new DefinitionsElement("definitions", {}, {});
          types = new TypesElement("types", {}, {});
          schema = new SchemaElement(nsName, attrs, options);
          types.addChild(schema);
          root.addChild(types);
          stack.push(schema);
        } else {
          throw new Error("Unexpected root element of WSDL or include");
        }
      }
    };

    p.onclosetag = function(name: any) {
      var top = stack[stack.length - 1];
      assert(top, "Unmatched close tag: " + name);

      top.endElement(stack, name);
    };

    p.write(xml).close();

    return root;
  }

  _fromXML(xml: any) {
    this.definitions = this._parse(xml);
    this.definitions.descriptions = {
      types: {}
    };
    this.xml = xml;
  }

  _fromServices(services: any) {}

  _xmlnsMap(): string {
    var xmlns = this.definitions.xmlns;
    var str = "";
    for (var alias in xmlns) {
      if (alias === "" || alias === TNS_PREFIX) {
        continue;
      }
      var ns = xmlns[alias];
      switch (ns) {
        case "http://xml.apache.org/xml-soap": // apachesoap
        case "http://schemas.xmlsoap.org/wsdl/": // wsdl
        case "http://schemas.xmlsoap.org/wsdl/soap/": // wsdlsoap
        case "http://schemas.xmlsoap.org/wsdl/soap12/": // wsdlsoap12
        case "http://schemas.xmlsoap.org/soap/encoding/": // soapenc
        case "http://www.w3.org/2001/XMLSchema": // xsd
          continue;
      }
      if (~ns.indexOf("http://schemas.xmlsoap.org/")) {
        continue;
      }
      if (~ns.indexOf("http://www.w3.org/")) {
        continue;
      }
      if (~ns.indexOf("http://xml.apache.org/")) {
        continue;
      }
      str += " xmlns:" + alias + '="' + ns + '"';
    }
    return str;
  }
}

function appendColon(ns: any) {
  return ns && ns.charAt(ns.length - 1) !== ":" ? ns + ":" : ns;
}

function noColonNameSpace(ns: any) {
  return ns && ns.charAt(ns.length - 1) === ":"
    ? ns.substring(0, ns.length - 1)
    : ns;
}
