"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "Filter", {
  enumerable: true,
  get: function () {
    return _Filter.default;
  }
});
Object.defineProperty(exports, "FilterGroup", {
  enumerable: true,
  get: function () {
    return _FilterGroup.default;
  }
});
Object.defineProperty(exports, "Sort", {
  enumerable: true,
  get: function () {
    return _Sort.default;
  }
});
Object.defineProperty(exports, "SortDirection", {
  enumerable: true,
  get: function () {
    return _Sort.SortDirection;
  }
});
Object.defineProperty(exports, "QueryParameters", {
  enumerable: true,
  get: function () {
    return _QueryParameters.default;
  }
});
Object.defineProperty(exports, "Resource", {
  enumerable: true,
  get: function () {
    return _Resource.default;
  }
});
Object.defineProperty(exports, "FileResource", {
  enumerable: true,
  get: function () {
    return _FileResource.default;
  }
});

var _Filter = _interopRequireDefault(require("./Filter"));

var _FilterGroup = _interopRequireDefault(require("./FilterGroup"));

var _Sort = _interopRequireWildcard(require("./Sort"));

var _QueryParameters = _interopRequireDefault(require("./QueryParameters"));

var _Resource = _interopRequireDefault(require("./Resource"));

var _FileResource = _interopRequireDefault(require("./FileResource"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }