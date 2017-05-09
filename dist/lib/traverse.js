'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.traverseSchema = traverseSchema;
exports.traverseForm = traverseForm;
/**
 * Traverse a schema, applying a function(schema,path) on every sub schema
 * i.e. every property of an object.
 */
function traverseSchema(schema, fn, path, ignoreArrays) {
  ignoreArrays = ignoreArrays === undefined ? true : ignoreArrays;

  path = path || [];

  var traverse = function traverse(schemaObject, processorFunction, pathArray) {
    processorFunction(schemaObject, pathArray);
    if (schemaObject.properties) {
      Object.keys(schemaObject.properties).forEach(function (name) {
        var currentPath = pathArray.slice();
        currentPath.push(name);
        traverse(schemaObject.properties[name], processorFunction, currentPath);
      });
    }

    // Only support type "array" which have a schemaObject as "items".
    if (!ignoreArrays && schemaObject.items) {
      var arrPath = pathArray.slice();arrPath.push('');
      traverse(schemaObject.items, processorFunction, arrPath);
    }
  };

  traverse(schema, fn, path || []);
}

function traverseForm(form, fn) {
  fn(form);
  if (form.items) {
    form.items.forEach(function (f) {
      traverseForm(f, fn);
    });
  }

  if (form.tabs) {
    form.tabs.forEach(function (tab) {
      if (tab.items) {
        tab.items.forEach(function (f) {
          traverseForm(f, fn);
        });
      }
    });
  }
}