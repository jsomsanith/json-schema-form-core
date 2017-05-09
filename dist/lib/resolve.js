'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.jsonref = jsonref;

var _jsonRefsStandalone = require('./../../lib/json-refs-standalone');

var JsonRefs = _interopRequireWildcard(_jsonRefsStandalone);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function jsonref(schema, callBack) {
  var promise = new Promise(function (resolve, reject) {
    JsonRefs.resolveRefs(schema, {
      "filter": ['relative', 'local', 'remote']
    }).then(function (res) {
      resolve(res.resolved);
    }).catch(function (err) {
      reject(new Error(err));
    });
  });

  if (typeof callBack === 'function') {
    promise.then(function (resolved) {
      callBack(null, resolved);
    }).catch(function (error) {
      callBack(error);
    });
  } else {
    return promise;
  }
};