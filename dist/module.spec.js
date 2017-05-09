'use strict';

var _chai = require('chai');

var _chai2 = _interopRequireDefault(_chai);

var _mocha = require('mocha');

var _module = require('./module');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_chai2.default.should();

(0, _mocha.describe)('module.js', function () {
  (0, _mocha.it)('should hold all the public functions of the API', function () {
    _module.merge.should.be.an('function');
    _module.select.should.be.an('function');
    _module.traverseSchema.should.be.an('function');
    _module.traverseForm.should.be.an('function');
    _module.validate.should.be.an('function');
    _module.sfPath.should.be.an('object');
    _module.schemaDefaults.should.be.an('object');
    _module.canonicalTitleMap.should.be.an('function');
    _module.jsonref.should.be.an('function');
  });
});