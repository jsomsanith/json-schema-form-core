'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultFormDefinition = defaultFormDefinition;
exports.stdFormObj = stdFormObj;
exports.text = text;
exports.number = number;
exports.integer = integer;
exports.checkbox = checkbox;
exports.select = select;
exports.checkboxes = checkboxes;
exports.fieldset = fieldset;
exports.array = array;
exports.createDefaults = createDefaults;
exports.defaultForm = defaultForm;

var _sfPath = require('./sf-path');

var _canonicalTitleMap = require('./canonical-title-map');

var _canonicalTitleMap2 = _interopRequireDefault(_canonicalTitleMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Utils */
var stripNullType = function stripNullType(type) {
  if (Array.isArray(type) && type.length === 2) {
    if (type[0] === 'null') {
      return type[1];
    };
    if (type[1] === 'null') {
      return type[0];
    };
  };
  return type;
};

// Creates an default titleMap list from an enum, i.e. a list of strings.
var enumToTitleMap = function enumToTitleMap(enm) {
  var titleMap = []; // canonical titleMap format is a list.
  enm.forEach(function (name) {
    titleMap.push({ name: name, value: name });
  });
  return titleMap;
};

/**
 * Creates a default form definition from a schema.
 */
function defaultFormDefinition(schemaTypes, name, schema, options) {
  var rules = schemaTypes[stripNullType(schema.type)];
  if (rules) {
    var def = void 0;
    // We give each rule a possibility to recurse it's children.
    var innerDefaultFormDefinition = function innerDefaultFormDefinition(childName, childSchema, childOptions) {
      return defaultFormDefinition(schemaTypes, childName, childSchema, childOptions);
    };
    for (var i = 0; i < rules.length; i++) {
      def = rules[i](name, schema, options, innerDefaultFormDefinition);

      // first handler in list that actually returns something is our handler!
      if (def) {

        // Do we have form defaults in the schema under the x-schema-form-attribute?
        if (def.schema['x-schema-form']) {
          Object.assign(def, def.schema['x-schema-form']);
        }

        return def;
      }
    }
  }
}

/**
 * Creates a form object with all common properties
 */
function stdFormObj(name, schema, options) {
  options = options || {};

  // The Object.assign used to be a angular.copy. Should work though.
  var f = options.global && options.global.formDefaults ? Object.assign({}, options.global.formDefaults) : {};
  if (options.global && options.global.supressPropertyTitles === true) {
    f.title = schema.title;
  } else {
    f.title = schema.title || name;
  }

  if (schema.description) {
    f.description = schema.description;
  }
  if (options.required === true || schema.required === true) {
    f.required = true;
  }
  if (schema.maxLength) {
    f.maxlength = schema.maxLength;
  }
  if (schema.minLength) {
    f.minlength = schema.minLength;
  }
  if (schema.readOnly || schema.readonly) {
    f.readonly = true;
  }
  if (schema.minimum) {
    f.minimum = schema.minimum + (schema.exclusiveMinimum ? 1 : 0);
  }
  if (schema.maximum) {
    f.maximum = schema.maximum - (schema.exclusiveMaximum ? 1 : 0);
  }

  // Non standard attributes (DONT USE DEPRECATED)
  // If you must set stuff like this in the schema use the x-schema-form attribute
  if (schema.validationMessage) {
    f.validationMessage = schema.validationMessage;
  }
  if (schema.enumNames) {
    f.titleMap = (0, _canonicalTitleMap2.default)(schema.enumNames, schema['enum']);
  }
  f.schema = schema;

  // Ng model options doesn't play nice with undefined, might be defined
  // globally though
  f.ngModelOptions = f.ngModelOptions || {};

  return f;
};

/*** Schema types to form type mappings, with defaults ***/
function text(name, schema, options) {
  if (stripNullType(schema.type) === 'string' && !schema['enum']) {
    var f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = 'text';
    options.lookup[(0, _sfPath.stringify)(options.path)] = f;
    return f;
  }
}

// default in json form for number and integer is a text field
// input type="number" would be more suitable don't ya think?
function number(name, schema, options) {
  if (stripNullType(schema.type) === 'number') {
    var f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = 'number';
    options.lookup[(0, _sfPath.stringify)(options.path)] = f;
    return f;
  }
}

function integer(name, schema, options) {
  if (stripNullType(schema.type) === 'integer') {
    var f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = 'number';
    options.lookup[(0, _sfPath.stringify)(options.path)] = f;
    return f;
  }
}

function checkbox(name, schema, options) {
  if (stripNullType(schema.type) === 'boolean') {
    var f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = 'checkbox';
    options.lookup[(0, _sfPath.stringify)(options.path)] = f;
    return f;
  }
}

function select(name, schema, options) {
  if (stripNullType(schema.type) === 'string' && schema['enum']) {
    var f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = 'select';
    if (!f.titleMap) {
      f.titleMap = enumToTitleMap(schema['enum']);
    }
    options.lookup[(0, _sfPath.stringify)(options.path)] = f;
    return f;
  }
}

function checkboxes(name, schema, options) {
  if (stripNullType(schema.type) === 'array' && schema.items && schema.items['enum']) {
    var f = stdFormObj(name, schema, options);
    f.key = options.path;
    f.type = 'checkboxes';
    if (!f.titleMap) {
      f.titleMap = enumToTitleMap(schema.items['enum']);
    }
    options.lookup[(0, _sfPath.stringify)(options.path)] = f;
    return f;
  }
}

function fieldset(name, schema, options, defaultFormDef) {
  if (stripNullType(schema.type) === 'object') {
    var f = stdFormObj(name, schema, options);
    f.type = 'fieldset';
    f.key = options.path;
    f.items = [];
    options.lookup[(0, _sfPath.stringify)(options.path)] = f;

    // recurse down into properties
    if (schema.properties) {
      Object.keys(schema.properties).forEach(function (key) {
        var value = schema.properties[key];
        var path = options.path.slice();
        path.push(key);
        if (options.ignore[(0, _sfPath.stringify)(path)] !== true) {
          var required = schema.required && schema.required.indexOf(key) !== -1;

          var def = defaultFormDef(key, value, {
            path: path,
            required: required || false,
            lookup: options.lookup,
            ignore: options.ignore,
            global: options.global
          });
          if (def) {
            f.items.push(def);
          }
        }
      });
    }
    return f;
  }
}

function array(name, schema, options, defaultFormDef) {
  if (stripNullType(schema.type) === 'array') {
    var f = stdFormObj(name, schema, options);
    f.type = 'array';
    f.key = options.path;
    options.lookup[(0, _sfPath.stringify)(options.path)] = f;

    var required = schema.required && schema.required.indexOf(options.path[options.path.length - 1]) !== -1;

    // The default is to always just create one child. This works since if the
    // schemas items declaration is of type: "object" then we get a fieldset.
    // We also follow json form notatation, adding empty brackets "[]" to
    // signify arrays.

    var arrPath = options.path.slice();
    arrPath.push('');

    f.items = [defaultFormDef(name, schema.items, {
      path: arrPath,
      required: required || false,
      lookup: options.lookup,
      ignore: options.ignore,
      global: options.global
    })];

    return f;
  }
}

function createDefaults() {
  // First sorted by schema type then a list.
  // Order has importance. First handler returning an form snippet will be used.
  return {
    string: [select, text],
    object: [fieldset],
    number: [number],
    integer: [integer],
    boolean: [checkbox],
    array: [checkboxes, array]
  };
};

/**
 * Create form defaults from schema
 */
function defaultForm(schema, defaultSchemaTypes, ignore, globalOptions) {
  var form = [];
  var lookup = {}; // Map path => form obj for fast lookup in merging
  ignore = ignore || {};
  globalOptions = globalOptions || {};
  defaultSchemaTypes = defaultSchemaTypes || createDefaults();

  if (schema.properties) {
    Object.keys(schema.properties).forEach(function (key) {
      if (ignore[key] !== true) {
        var required = schema.required && schema.required.indexOf(key) !== -1;
        var def = defaultFormDefinition(defaultSchemaTypes, key, schema.properties[key], {
          path: [key], // Path to this property in bracket notation.
          lookup: lookup, // Extra map to register with. Optimization for merger.
          ignore: ignore, // The ignore list of paths (sans root level name)
          required: required, // Is it required? (v4 json schema style)
          global: globalOptions // Global options, including form defaults
        });
        if (def) {
          form.push(def);
        }
      }
    });
  } else {
    throw new Error('Not implemented. Only type "object" allowed at root level of schema.');
  }
  return { form: form, lookup: lookup };
}