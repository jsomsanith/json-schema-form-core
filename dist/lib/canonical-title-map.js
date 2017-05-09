"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (titleMap, originalEnum) {
  if (!Array.isArray(titleMap)) {
    var canonical = [];
    if (originalEnum) {
      originalEnum.forEach(function (value) {
        canonical.push({ name: titleMap[value], value: value });
      });
    } else {
      Object.keys(titleMap).forEach(function (value) {
        canonical.push({ name: titleMap[value], value: value });
      });
    }
    return canonical;
  }
  return titleMap;
};