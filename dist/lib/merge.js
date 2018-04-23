'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.merge = merge;

var _sfPath = require('./sf-path');

var _schemaDefaults = require('./schema-defaults');

var _canonicalTitleMap = require('./canonical-title-map');

var _canonicalTitleMap2 = _interopRequireDefault(_canonicalTitleMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// export function merge(schema, form, schemaDefaultTypes, ignore, options, readonly, asyncTemplates) {
function merge(lookup, form) {
  var typeDefaults = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : (0, _schemaDefaults.createDefaults)();
  var ignore = arguments[3];
  var options = arguments[4];
  var readonly = arguments[5];
  var asyncTemplates = arguments[6];

  var formItems = [];
  var formItemRest = [];
  form = form || [];
  var idx = form.indexOf('*');
  options = options || {};
  var stdForm = {};

  var idxRest = form.indexOf('...');
  if ((typeof lookup === 'undefined' ? 'undefined' : _typeof(lookup)) === 'object' && lookup.hasOwnProperty('properties')) {
    readonly = readonly || lookup.readonly || lookup.readOnly;
    stdForm = (0, _schemaDefaults.defaultForm)(lookup, typeDefaults, ignore, options);

    var defaultFormLookup = stdForm.lookup;

    lookup = defaultFormLookup || lookup;
    formItems = formItems.concat(stdForm.form);
  };

  if (idx !== -1) {
    form = form.slice(0, idx).concat(formItems).concat(form.slice(idx + 1));
  }

  //simple case, we have a "...", just put the formItemRest there
  if (stdForm.form && idxRest !== -1) {
    var formKeys = form.map(function (obj) {
      if (typeof obj === 'string') {
        return obj;
      } else if (obj.key) {
        return obj.key;
      };
    }).filter(function (element) {
      return element !== undefined;
    });

    formItemRest = formItemRest.concat(stdForm.form.map(function (obj) {
      var isInside = formKeys.indexOf(obj.key[0]) !== -1;
      if (!isInside) {
        return obj;
      };
    }).filter(function (element) {
      return element !== undefined;
    }));
  };

  if (idxRest !== -1) {
    form = form.slice(0, idxRest).concat(formItemRest).concat(form.slice(idxRest + 1));
  };

  // ok let's merge!
  // We look at the supplied form and extend it with schema standards
  return form.map(function (obj) {
    // handle the shortcut with just a name
    if (typeof obj === 'string') {
      obj = { key: obj };
    }

    if (obj.key) {
      if (typeof obj.key === 'string') {
        obj.key = (0, _sfPath.parse)(obj.key);
      }
    }

    // If it has a titleMap make sure it's a list
    if (obj.titleMap) {
      obj.titleMap = (0, _canonicalTitleMap2.default)(obj.titleMap);
    }

    // extend with std form from schema.
    if (obj.key) {
      var strid = (0, _sfPath.stringify)(obj.key);
      if (lookup[strid]) {
        var schemaDefaults = lookup[strid];
        if (schemaDefaults) {
          Object.keys(schemaDefaults).forEach(function (attr) {
            if (obj[attr] === undefined) {
              obj[attr] = schemaDefaults[attr];
            }
          });
        }
      }
    }

    // Are we inheriting readonly?
    if (readonly === true) {
      // Inheriting false is not cool.
      obj.readonly = true;
    }

    // if it's a type with items, merge 'em!
    if (obj.items) {
      obj.items = merge(lookup, obj.items, typeDefaults, ignore, options, obj.readonly, asyncTemplates);
    }

    // if its has tabs, merge them also!
    if (obj.tabs) {
      obj.tabs.forEach(function (tab) {
        if (tab.items) {
          tab.items = merge(lookup, tab.items, typeDefaults, ignore, options, obj.readonly, asyncTemplates);
        }
      });
    }

    // Special case: checkbox
    // Since have to ternary state we need a default
    if (obj.type === 'checkbox') {
      // Check for schema property, as the checkbox may be part of the explicitly defined form
      if (obj.schema === undefined) {
        obj.schema = { default: false };
      } else if (obj.schema['default'] === undefined) {
        obj.schema['default'] = false;
      };
    };

    // Special case: template type with tempplateUrl that's needs to be loaded before rendering
    // TODO: this is not a clean solution. Maybe something cleaner can be made when $ref support
    // is introduced since we need to go async then anyway
    if (asyncTemplates && obj.type === 'template' && !obj.template && obj.templateUrl) {
      asyncTemplates.push(obj);
    };

    return obj;
  });
}