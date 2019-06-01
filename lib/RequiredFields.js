"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var RequiredFields =
/*#__PURE__*/
function () {
  function RequiredFields(entityType, entityBundle, fields) {
    _classCallCheck(this, RequiredFields);

    this.entityType = entityType;
    this.entityBundle = entityBundle;
    this.fields = fields;
    this.fields.unshift({
      attributes: {
        machine_name: "".concat(entityType, ".").concat(entityBundle, ".title"),
        field_name: 'title',
        field_type: 'text',
        label: 'Title',
        description: '',
        translatable: true
      }
    });
  }

  _createClass(RequiredFields, [{
    key: "serialize",
    value: function serialize() {
      return {
        entity_type: this.entityType,
        entity_bundle: this.entityBundle,
        fields: this.fields.filter(function (field) {
          return field.attributes.required;
        }).map(function (field) {
          return {
            machine_name: field.attributes.drupal_internal__id,
            field_name: field.attributes.field_name,
            field_type: field.attributes.field_type,
            label: field.attributes.label,
            description: field.attributes.description,
            translatable: field.attributes.translatable
          };
        })
      };
    }
  }]);

  return RequiredFields;
}();

exports.default = RequiredFields;