'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _objectpath = require('objectpath');

Object.defineProperty(exports, 'parse', {
  enumerable: true,
  get: function get() {
    return _objectpath.parse;
  }
});
Object.defineProperty(exports, 'stringify', {
  enumerable: true,
  get: function get() {
    return _objectpath.stringify;
  }
});
Object.defineProperty(exports, 'normalize', {
  enumerable: true,
  get: function get() {
    return _objectpath.normalize;
  }
});
exports.name = name;


/**
 * I am a name formatter function for processing keys into names for classes or Id.
 *
 * @param  {Array<string>} key         I am the key array of a processed schema key
 * @param  {string}        separator   I am the separator between the key items and optional form name
 * @param  {string}        formName    I am an optional form name
 * @param  {boolean}       omitNumbers I determine if numeric values should be included in the output or withheld
 *
 * @return {string}                    I am the formatted key
 */
function name(key, separator) {
  var formName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var omitNumbers = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

  if (key) {
    var fieldKey = key.slice();
    var fieldSeparator = separator || '-';

    if (omitNumbers) {
      fieldKey = fieldKey.filter(function (currentKey) {
        return typeof currentKey !== 'number';
      });
    };

    return (formName.length !== 0 ? formName + fieldSeparator : '') + fieldKey.join(fieldSeparator);
  };

  return '';
};