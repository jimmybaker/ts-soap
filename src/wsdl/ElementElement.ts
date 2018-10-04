import Element from "./Element";
import { TNS_PREFIX, splitQName, Primitives } from "./index";
import ComplexTypeElement from "./ComplexTypeElement";
import SimpleTypeElement from "./SimpleTypeElement";

export default class ElementElement extends Element {
  $ref: any;
  $type: any;
  $minOccurs: any;
  $maxOccurs: any;

  description(definitions: any, xmlns: any) {
    let element: any = {};
    let name = this.$name;
    var isMany = !this.$maxOccurs
      ? false
      : isNaN(this.$maxOccurs)
        ? this.$maxOccurs === "unbounded"
        : this.$maxOccurs > 1;
    if (this.$minOccurs !== this.$maxOccurs && isMany) {
      name += "[]";
    }

    if (xmlns && xmlns[TNS_PREFIX]) {
      this.$targetNamespace = xmlns[TNS_PREFIX];
    }
    var type = this.$type || this.$ref;
    if (type) {
      type = splitQName(type);
      var typeName = type.name,
        ns =
          (xmlns && xmlns[type.prefix]) ||
          (definitions.xmlns[type.prefix] !== undefined &&
            this.schemaXmlns[type.prefix]) ||
          definitions.xmlns[type.prefix],
        schema = definitions.schemas[ns],
        typeElement =
          schema &&
          (this.$type
            ? schema.complexTypes[typeName] || schema.types[typeName]
            : schema.elements[typeName]);

      if (ns && definitions.schemas[ns]) {
        xmlns = definitions.schemas[ns].xmlns;
      }

      if (typeElement && !(typeName in Primitives)) {
        if (!(typeName in definitions.descriptions.types)) {
          var elem: any = {};
          definitions.descriptions.types[typeName] = elem;
          var description = typeElement.description(definitions, xmlns);
          if (typeof description === "string") {
            elem = description;
          } else {
            Object.keys(description).forEach(function(key) {
              elem[key] = description[key];
            });
          }

          if (this.$ref) {
            element = elem;
          } else {
            element[name] = elem;
          }

          if (typeof elem === "object") {
            elem.targetNSAlias = type.prefix;
            elem.targetNamespace = ns;
          }

          definitions.descriptions.types[typeName] = elem;
        } else {
          if (this.$ref) {
            element = definitions.descriptions.types[typeName];
          } else {
            element[name] = definitions.descriptions.types[typeName];
          }
        }
      } else {
        element[name] = this.$type;
      }
    } else {
      var children = this.children;
      element[name] = {};
      for (var i = 0, child; (child = children[i]); i++) {
        if (
          child instanceof ComplexTypeElement ||
          child instanceof SimpleTypeElement
        ) {
          element[name] = child.description(definitions, xmlns);
        }
      }
    }
    return element;
  }
}
