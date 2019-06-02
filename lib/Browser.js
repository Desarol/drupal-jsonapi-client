(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.DrupalJsonApi = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var runtime = (function (exports) {
  "use strict";

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  IteratorPrototype[iteratorSymbol] = function () {
    return this;
  };

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
  GeneratorFunctionPrototype.constructor = GeneratorFunction;
  GeneratorFunctionPrototype[toStringTagSymbol] =
    GeneratorFunction.displayName = "GeneratorFunction";

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      prototype[method] = function(arg) {
        return this._invoke(method, arg);
      };
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      if (!(toStringTagSymbol in genFun)) {
        genFun[toStringTagSymbol] = "GeneratorFunction";
      }
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return Promise.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return Promise.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new Promise(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
    return this;
  };
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList) {
    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList)
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  Gp[toStringTagSymbol] = "Generator";

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  Gp[iteratorSymbol] = function() {
    return this;
  };

  Gp.toString = function() {
    return "[object Generator]";
  };

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  typeof module === "object" ? module.exports : {}
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  Function("r", "regeneratorRuntime = r")(runtime);
}

},{}],2:[function(require,module,exports){
"use strict";

// eslint-disable-next-line import/no-extraneous-dependencies
require('regenerator-runtime/runtime');

module.exports = require('./index');

},{"./index":12,"regenerator-runtime/runtime":1}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Client =
/*#__PURE__*/
function () {
  function Client(_ref) {
    var transport = _ref.transport,
        baseUrl = _ref.baseUrl,
        authorization = _ref.authorization,
        _ref$sendCookies = _ref.sendCookies,
        sendCookies = _ref$sendCookies === void 0 ? false : _ref$sendCookies,
        _ref$middleware = _ref.middleware,
        middleware = _ref$middleware === void 0 ? [] : _ref$middleware;

    _classCallCheck(this, Client);

    this.transport = transport;
    this.baseUrl = baseUrl;
    this.authorization = authorization;
    this.sendCookies = sendCookies;
    this.middleware = middleware;
  }

  _createClass(Client, [{
    key: "_fetchCSRFToken",
    value: function () {
      var _fetchCSRFToken2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee() {
        var response;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.transport("".concat(this.baseUrl || '', "/rest/session/token"));

              case 2:
                response = _context.sent;
                return _context.abrupt("return", response.text());

              case 4:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function _fetchCSRFToken() {
        return _fetchCSRFToken2.apply(this, arguments);
      }

      return _fetchCSRFToken;
    }()
  }, {
    key: "send",
    value: function () {
      var _send = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(request) {
        var url, body, cache, credentials, headers, integrity, method, mode, redirect, referrer, referrerPolicy, credentialsCopy, copy, xCsrfToken, i;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                url = request.url, body = request.body, cache = request.cache, credentials = request.credentials, headers = request.headers, integrity = request.integrity, method = request.method, mode = request.mode, redirect = request.redirect, referrer = request.referrer, referrerPolicy = request.referrerPolicy;
                credentialsCopy = this.sendCookies === true ? 'same-origin' : credentials;
                copy = new Request(this.baseUrl + url, {
                  body: body,
                  cache: cache,
                  credentials: credentialsCopy,
                  headers: headers,
                  integrity: integrity,
                  method: method,
                  mode: mode,
                  redirect: redirect,
                  referrer: referrer,
                  referrerPolicy: referrerPolicy
                });

                if (!(this.sendCookies === true)) {
                  _context2.next = 8;
                  break;
                }

                _context2.next = 6;
                return this._fetchCSRFToken();

              case 6:
                xCsrfToken = _context2.sent;
                copy.headers.set('X-CSRF-Token', xCsrfToken);

              case 8:
                if (typeof this.authorization === 'string') {
                  copy.headers.set('Authorization', this.authorization);
                }

                i = 0;

              case 10:
                if (!(i < this.middleware.length)) {
                  _context2.next = 17;
                  break;
                }

                _context2.next = 13;
                return this.middleware[i](request);

              case 13:
                copy = _context2.sent;

              case 14:
                i += 1;
                _context2.next = 10;
                break;

              case 17:
                return _context2.abrupt("return", this.transport(copy));

              case 18:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function send(_x) {
        return _send.apply(this, arguments);
      }

      return send;
    }()
  }]);

  return Client;
}();

exports.default = Client;

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _EntityNotFound = _interopRequireDefault(require("./Error/EntityNotFound"));

var _MalformedEntity = _interopRequireDefault(require("./Error/MalformedEntity"));

var _GlobalClient = _interopRequireDefault(require("./GlobalClient"));

var _QueryParameters = _interopRequireDefault(require("./QueryParameters"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var TypeHeaders = {
  Accept: 'application/vnd.api+json',
  'Content-Type': 'application/vnd.api+json'
};

var Entity =
/*#__PURE__*/
function () {
  _createClass(Entity, null, [{
    key: "FromResponse",
    value: function FromResponse(response) {
      var entity = new Entity();

      entity._applySerializedData(response);

      return entity;
    }
    /**
     * Get a single entity.
     *
     * @param {string} entityType
     * @param {string} entityBundle
     * @param {string} entityUuid
     * @param {boolean} refreshCache            default = false
     * @param {string[]} includeRelationships   default = []
     */

  }, {
    key: "Load",
    value: function () {
      var _Load = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(entityType, entityBundle, entityUuid) {
        var refreshCache,
            includeRelationships,
            queryParameters,
            response,
            json,
            entity,
            _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                refreshCache = _args.length > 3 && _args[3] !== undefined ? _args[3] : false;
                includeRelationships = _args.length > 4 && _args[4] !== undefined ? _args[4] : [];

                if (!(Entity.Cache[entityUuid] && refreshCache === false)) {
                  _context.next = 4;
                  break;
                }

                return _context.abrupt("return", Entity.FromResponse(Entity.Cache[entityUuid]));

              case 4:
                queryParameters = new _QueryParameters.default(["include=".concat(includeRelationships.join(','))]);
                _context.next = 7;
                return _GlobalClient.default.send(new Request("/jsonapi/".concat(entityType, "/").concat(entityBundle, "/").concat(entityUuid, "?").concat(includeRelationships.length > 0 ? queryParameters.toString(Number.MAX_SAFE_INTEGER) : '')));

              case 7:
                response = _context.sent;
                _context.next = 10;
                return response.json();

              case 10:
                json = _context.sent;

                if (!(json && json.data)) {
                  _context.next = 16;
                  break;
                }

                entity = Entity.FromResponse(json.data);
                Entity.Cache[entityUuid] = entity._serialize(); // Warm EntityCache so future requests for .expand can pull from cache

                if (json.included) {
                  json.included.forEach(function (includedData) {
                    var includedEntity = Entity.FromResponse(includedData);
                    Entity.Cache[includedEntity.entityUuid] = includedEntity._serialize();
                  });
                }

                return _context.abrupt("return", entity);

              case 16:
                throw new _EntityNotFound.default("Failed to find entity matching entity type ".concat(entityType, ", entity bundle ").concat(entityBundle, " and uuid ").concat(entityUuid));

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function Load(_x, _x2, _x3) {
        return _Load.apply(this, arguments);
      }

      return Load;
    }()
    /**
     * Get entities matching provided filters.
     *
     * @param {object}              config
     *
     * @param {string}              config.entityType
     * @param {string}              config.entityBundle
     * @param {Filter|FilterGroup}  config.filter               default = {}
     * @param {number}              config.pageOffset           default = 0
     * @param {number}              config.pageLimit            default = 50
     */

  }, {
    key: "LoadMultiple",
    value: function () {
      var _LoadMultiple = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(_ref) {
        var entityType, entityBundle, _ref$filter, filter, _ref$pageOffset, pageOffset, _ref$pageLimit, pageLimit, filterQuery, queryParameters, response, json;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                entityType = _ref.entityType, entityBundle = _ref.entityBundle, _ref$filter = _ref.filter, filter = _ref$filter === void 0 ? {} : _ref$filter, _ref$pageOffset = _ref.pageOffset, pageOffset = _ref$pageOffset === void 0 ? 0 : _ref$pageOffset, _ref$pageLimit = _ref.pageLimit, pageLimit = _ref$pageLimit === void 0 ? 50 : _ref$pageLimit;
                filterQuery = typeof filter.query === 'function' ? filter.query() : filter;
                queryParameters = new _QueryParameters.default([filterQuery, "page[offset]=".concat(pageOffset), "page[limit]=".concat(pageLimit)]);
                _context2.next = 5;
                return _GlobalClient.default.send(new Request("/jsonapi/".concat(entityType, "/").concat(entityBundle, "?").concat(queryParameters.toString(Number.MAX_SAFE_INTEGER))));

              case 5:
                response = _context2.sent;
                _context2.next = 8;
                return response.json();

              case 8:
                json = _context2.sent;

                if (!(json && json.data && json.data.length && json.data.length > 0)) {
                  _context2.next = 11;
                  break;
                }

                return _context2.abrupt("return", json.data.map(function (item) {
                  var entity = new Entity();

                  entity._applySerializedData(item);

                  return entity;
                }));

              case 11:
                return _context2.abrupt("return", json.data);

              case 12:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2);
      }));

      function LoadMultiple(_x4) {
        return _LoadMultiple.apply(this, arguments);
      }

      return LoadMultiple;
    }()
    /**
     * Delete a remote entity.
     *
     * @param {string} entityType
     * @param {string} entityBundle
     * @param {string} entityUuid
     */

  }, {
    key: "Delete",
    value: function () {
      var _Delete = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee3(entityType, entityBundle, entityUuid) {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                return _context3.abrupt("return", new Entity(entityType, entityBundle, entityUuid).delete());

              case 1:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3);
      }));

      function Delete(_x5, _x6, _x7) {
        return _Delete.apply(this, arguments);
      }

      return Delete;
    }()
  }]);

  function Entity(entityType, entityBundle, entityUuid) {
    var _this = this;

    _classCallCheck(this, Entity);

    this.entityType = entityType;
    this.entityBundle = entityBundle;
    this.entityUuid = entityUuid || null;
    this._enforceNew = false;
    this._attributes = {};
    this._relationships = {};
    this._changes = {
      attributes: {},
      relationships: {}
    };

    if (this._requiredFields) {
      this._requiredFields.forEach(function (field) {
        if (field.field_type !== 'entity_reference') {
          _this._attributes[field.field_name] = '';
        } else {
          _this._relationships[field.field_name] = {
            data: {}
          };
        }
      });
    } // Setup proxy behaviour for fields


    return new Proxy(this, {
      get: function get(target, key) {
        var fieldName = key;
        var fieldNameTransformations = {
          nid: 'drupal_internal__nid',
          vid: 'drupal_internal__vid'
        };

        if (fieldName in fieldNameTransformations) {
          fieldName = fieldNameTransformations[fieldName];
        }

        if (!(fieldName in target)) {
          if (target._hasField(fieldName)) {
            return target.get(key);
          }
        }

        return target[key];
      },
      set: function set(target, key, value) {
        var fieldName = key;
        var fieldNameTransformations = {
          nid: 'drupal_internal__nid',
          vid: 'drupal_internal__vid'
        };

        if (fieldName in fieldNameTransformations) {
          fieldName = fieldNameTransformations[fieldName];
        }

        if (!(fieldName in target)) {
          if (target._attributes[fieldName]) {
            target.setAttribute(fieldName, value); // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set
            // Must return true if property was set successfully

            return true;
          }

          if (target._relationships[fieldName]) {
            target.setRelationship(fieldName, value);
            return true;
          }
        } // eslint-disable-next-line no-param-reassign


        target[fieldName] = value;
        return true;
      }
    });
  }

  _createClass(Entity, [{
    key: "_applySerializedData",
    value: function _applySerializedData(jsonApiSerialization) {
      var _jsonApiSerialization = jsonApiSerialization.type.split('--'),
          _jsonApiSerialization2 = _slicedToArray(_jsonApiSerialization, 2),
          entityType = _jsonApiSerialization2[0],
          entityBundle = _jsonApiSerialization2[1];

      this.entityType = entityType;
      this.entityBundle = entityBundle;
      this.entityUuid = jsonApiSerialization.id;
      this._attributes = jsonApiSerialization.attributes;
      this._relationships = Object.keys(jsonApiSerialization.relationships).map(function (key) {
        return {
          data: jsonApiSerialization.relationships[key].data,
          _$key: key
        };
      }).reduce(function (prev, curr) {
        var key = curr._$key;
        var copy = curr;
        delete copy._$key;
        return _objectSpread({}, prev, _defineProperty({}, key, copy));
      }, {});
    }
  }, {
    key: "_serializeChanges",
    value: function _serializeChanges() {
      var serialization = {
        data: {
          type: "".concat(this.entityType, "--").concat(this.entityBundle),
          attributes: this._changes.attributes,
          relationships: this._changes.relationships
        }
      };

      if (Object.keys(serialization.data.attributes).length === 0) {
        delete serialization.data.attributes;
      }

      if (Object.keys(serialization.data.relationships).length === 0) {
        delete serialization.data.relationships;
      }

      if (this.entityUuid) {
        serialization.data.id = this.entityUuid;
      }

      return serialization;
    }
  }, {
    key: "_serializeChangesForField",
    value: function _serializeChangesForField(fieldName) {
      return {
        data: this.getChange(fieldName)
      };
    }
  }, {
    key: "_serialize",
    value: function _serialize() {
      var serialization = {
        data: {
          type: "".concat(this.entityType, "--").concat(this.entityBundle),
          attributes: this._attributes,
          relationships: this._relationships
        }
      };

      if (Object.keys(serialization.data.attributes).length === 0) {
        delete serialization.data.attributes;
      }

      if (Object.keys(serialization.data.relationships).length === 0) {
        delete serialization.data.relationships;
      }

      return serialization;
    }
  }, {
    key: "_hasField",
    value: function _hasField(fieldName) {
      return fieldName in this._attributes || fieldName in this._relationships;
    }
    /**
     * Get field value.
     *
     * @param {string} fieldName
     */

  }, {
    key: "get",
    value: function get(fieldName) {
      return this._attributes[fieldName] !== undefined ? this._attributes[fieldName] : this._relationships[fieldName];
    }
    /**
     * Get local changes for this entity.
     *
     * @param {string} fieldName
     */

  }, {
    key: "getChange",
    value: function getChange(fieldName) {
      return this._changes.attributes[fieldName] !== undefined ? this._changes.attributes[fieldName] : this._changes.relationships[fieldName];
    }
    /**
     * Get an expanded representation of a related entity.
     *
     * @param {string} fieldName
     */

  }, {
    key: "expand",
    value: function () {
      var _expand = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee4(fieldName) {
        var _this$_relationships$, _this$_relationships$2, entityType, entityBundle;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                if (this._relationships[fieldName]) {
                  _context4.next = 2;
                  break;
                }

                throw new _MalformedEntity.default("Failed to find related entity from field ".concat(fieldName));

              case 2:
                if (!(this._relationships[fieldName].data && this._relationships[fieldName].data.type && typeof this._relationships[fieldName].data.type === 'string' && this._relationships[fieldName].data.id)) {
                  _context4.next = 5;
                  break;
                }

                _this$_relationships$ = this._relationships[fieldName].data.type.split('--'), _this$_relationships$2 = _slicedToArray(_this$_relationships$, 2), entityType = _this$_relationships$2[0], entityBundle = _this$_relationships$2[1];
                return _context4.abrupt("return", Entity.Load(entityType, entityBundle, this._relationships[fieldName].data.id));

              case 5:
                throw new _MalformedEntity.default("Related field ".concat(fieldName, " doesn't have sufficient information to expand."));

              case 6:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function expand(_x8) {
        return _expand.apply(this, arguments);
      }

      return expand;
    }()
    /**
     * Set an attribute.
     *
     * @param {string} fieldName - Drupal machine name for the field
     * @param {any} fieldValue - value to send to JSON:API
     */

  }, {
    key: "setAttribute",
    value: function setAttribute(fieldName, fieldValue) {
      this._attributes[fieldName] = fieldValue;
      this._changes.attributes[fieldName] = fieldValue;
    }
    /**
     * Set a relationship.
     *
     * @param {string} fieldName - Drupal machine name for the field
     * @param {any} fieldValue - value to send to JSON:API
     */

  }, {
    key: "setRelationship",
    value: function setRelationship(fieldName, fieldValue) {
      var value = fieldValue;

      if (fieldValue instanceof Entity) {
        value = {
          data: {
            type: "".concat(fieldValue.entityType, "--").concat(fieldValue.entityBundle),
            id: fieldValue.entityUuid
          }
        };
      }

      this._relationships[fieldName] = value;
      this._changes.relationships[fieldName] = value;
    }
    /**
     * Take a File and upload it to Drupal.
     *
     * @param {string} fieldName
     * @param {File} file
     */

  }, {
    key: "_toUploadFileRequest",
    value: function () {
      var _toUploadFileRequest2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee5(fieldName, file) {
        var binary;
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return new Promise(function (resolve) {
                  var fr = new FileReader();

                  fr.onload = function (event) {
                    resolve(event.target.result);
                  };

                  fr.readAsArrayBuffer(file);
                });

              case 2:
                binary = _context5.sent;
                return _context5.abrupt("return", this.toUploadBinaryRequest(fieldName, file.name, binary));

              case 4:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _toUploadFileRequest(_x9, _x10) {
        return _toUploadFileRequest2.apply(this, arguments);
      }

      return _toUploadFileRequest;
    }()
    /**
     * @deprecated use _toUploadBinaryRequest
     *
     * @param {string} fieldName
     * @param {string} fileName
     * @param {any} binary
     */

  }, {
    key: "toUploadBinaryRequest",
    value: function toUploadBinaryRequest(fieldName, fileName, binary) {
      return new Request("/jsonapi/".concat(this.entityType, "/").concat(this.entityBundle, "/").concat(fieldName), {
        method: 'POST',
        headers: _objectSpread({}, TypeHeaders, {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': "file; filename=\"".concat(fileName, "\"")
        }),
        body: binary
      });
    }
  }, {
    key: "_toPostRequest",
    value: function _toPostRequest() {
      return new Request("/jsonapi/".concat(this.entityType, "/").concat(this.entityBundle), {
        method: 'POST',
        headers: _objectSpread({}, TypeHeaders),
        body: JSON.stringify(this._serialize())
      });
    }
  }, {
    key: "_toPatchRequest",
    value: function _toPatchRequest() {
      if (!this.entityUuid) {
        throw new _MalformedEntity.default('Entity is missing UUID but was used in a PATCH request.');
      }

      return new Request("/jsonapi/".concat(this.entityType, "/").concat(this.entityBundle, "/").concat(this.entityUuid), {
        method: 'PATCH',
        headers: _objectSpread({}, TypeHeaders),
        body: JSON.stringify(this._serializeChanges())
      });
    }
    /**
     * Build a request to save the entity.
     *
     * This will be either a POST or a PATCH depending on
     * whether or not this is a new entity.
     */

  }, {
    key: "_toSaveRequest",
    value: function _toSaveRequest() {
      return this._enforceNew === true || !this.entityUuid ? this._toPostRequest() : this._toPatchRequest();
    }
    /**
     * Save this entity.
     */

  }, {
    key: "save",
    value: function save() {
      _GlobalClient.default.send(this._toSaveRequest());
    }
    /**
     * Build a request to delete the entity.
     *
     * This will return a DELETE request.
     */

  }, {
    key: "_toDeleteRequest",
    value: function _toDeleteRequest() {
      if (!this.entityUuid) {
        throw new _MalformedEntity.default('Cannot delete an entity without a UUID.');
      }

      return new Request("/jsonapi/".concat(this.entityType, "/").concat(this.entityBundle, "/").concat(this.entityUuid), {
        method: 'DELETE',
        headers: _objectSpread({}, TypeHeaders)
      });
    }
    /**
     * Delete this entity.
     */

  }, {
    key: "delete",
    value: function _delete() {
      _GlobalClient.default.send(this._toDeleteRequest());
    }
  }]);

  return Entity;
}();

exports.default = Entity;

_defineProperty(Entity, "Cache", {});

},{"./Error/EntityNotFound":5,"./Error/MalformedEntity":6,"./GlobalClient":10,"./QueryParameters":11}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var EntityNotFound =
/*#__PURE__*/
function (_Error) {
  _inherits(EntityNotFound, _Error);

  function EntityNotFound() {
    _classCallCheck(this, EntityNotFound);

    return _possibleConstructorReturn(this, _getPrototypeOf(EntityNotFound).apply(this, arguments));
  }

  return EntityNotFound;
}(_wrapNativeSuper(Error));

exports.default = EntityNotFound;

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var MalformedEntity =
/*#__PURE__*/
function (_Error) {
  _inherits(MalformedEntity, _Error);

  function MalformedEntity() {
    _classCallCheck(this, MalformedEntity);

    return _possibleConstructorReturn(this, _getPrototypeOf(MalformedEntity).apply(this, arguments));
  }

  return MalformedEntity;
}(_wrapNativeSuper(Error));

exports.default = MalformedEntity;

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "EntityNotFound", {
  enumerable: true,
  get: function get() {
    return _EntityNotFound.default;
  }
});
Object.defineProperty(exports, "MalformedEntity", {
  enumerable: true,
  get: function get() {
    return _MalformedEntity.default;
  }
});

var _EntityNotFound = _interopRequireDefault(require("./EntityNotFound"));

var _MalformedEntity = _interopRequireDefault(require("./MalformedEntity"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./EntityNotFound":5,"./MalformedEntity":6}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Based on: https://www.drupal.org/docs/8/modules/jsonapi/filtering
 */
var Filter =
/*#__PURE__*/
function () {
  function Filter(_ref) {
    var identifier = _ref.identifier,
        path = _ref.path,
        _ref$operator = _ref.operator,
        operator = _ref$operator === void 0 ? '=' : _ref$operator,
        value = _ref.value,
        memberOf = _ref.memberOf;

    _classCallCheck(this, Filter);

    this.identifier = identifier;
    this.path = path;
    this.operator = operator;
    this.value = value;
    this.memberOf = memberOf;
  }
  /* eslint-disable prefer-template */


  _createClass(Filter, [{
    key: "query",
    value: function query() {
      var _this = this;

      return ["filter[".concat(this.identifier, "][condition][path]=").concat(this.path), this.operator !== '=' ? "filter[".concat(this.identifier, "][condition][operator]=").concat(this.operator) : '', this.memberOf ? "filter[".concat(this.identifier, "][condition][memberOf]=").concat(this.memberOf) : '', typeof this.value.map === 'function' ? this.value.map(function (singleValue) {
        return "filter[".concat(_this.identifier, "][condition][value][]=").concat(singleValue);
      }) : "filter[".concat(this.identifier, "][condition][value]=").concat(this.value)];
    }
    /* eslint-enable prefer-template */

  }]);

  return Filter;
}();

exports.default = Filter;

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Based on: https://www.drupal.org/docs/8/modules/jsonapi/filtering
 */
var FilterGroup =
/*#__PURE__*/
function () {
  function FilterGroup(_ref) {
    var _this = this;

    var identifier = _ref.identifier,
        type = _ref.type,
        memberOf = _ref.memberOf,
        children = _ref.children;

    _classCallCheck(this, FilterGroup);

    this.identifier = identifier;
    this.type = type;
    this.memberOf = memberOf;
    this.children = children.map(function (child) {
      // eslint-disable-next-line no-param-reassign
      child.memberOf = _this.identifier;
      return child;
    });
  }
  /* eslint-disable prefer-template */


  _createClass(FilterGroup, [{
    key: "query",
    value: function query() {
      return ["filter[".concat(this.identifier, "][group][conjunction]=").concat(this.type), this.memberOf ? "filter[".concat(this.identifier, "][group][memberOf]=").concat(this.memberOf) : ''].concat(_toConsumableArray(this.children.map(function (child) {
        return child.query();
      })));
    }
    /* eslint-enable prefer-template */

  }]);

  return FilterGroup;
}();

exports.default = FilterGroup;

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _Client = _interopRequireDefault(require("./Client"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GlobalClient = new _Client.default({
  transport: function transport() {},
  baseUrl: '',
  authorization: null,
  sendCookies: false,
  middleware: []
});
var _default = GlobalClient;
exports.default = _default;

},{"./Client":3}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* eslint-disable */
if (!Array.prototype.flat) {
  Array.prototype.flat = function (depth) {
    var flattend = [];

    (function flat(array, depth) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = array[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var el = _step.value;

          if (Array.isArray(el) && depth > 0) {
            flat(el, depth - 1);
          } else {
            flattend.push(el);
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    })(this, Math.floor(depth) || 1);

    return flattend;
  };
}
/* eslint-enable */


var QueryParameters =
/*#__PURE__*/
function () {
  function QueryParameters(queryParameters) {
    _classCallCheck(this, QueryParameters);

    this.queryParameters = queryParameters;
  }

  _createClass(QueryParameters, [{
    key: "toString",
    value: function toString(depth) {
      return this.queryParameters.flat(depth).map(function (item) {
        return item.query ? item.query() : item;
      }).flat(depth).filter(function (item) {
        return item !== '';
      }).join('&');
    }
  }]);

  return QueryParameters;
}();

exports.default = QueryParameters;

},{}],12:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  Client: true,
  Entity: true,
  EntityCache: true,
  Filter: true,
  FilterGroup: true,
  QueryParameters: true,
  GlobalClient: true
};
Object.defineProperty(exports, "Client", {
  enumerable: true,
  get: function get() {
    return _Client.default;
  }
});
Object.defineProperty(exports, "Entity", {
  enumerable: true,
  get: function get() {
    return _Entity.default;
  }
});
Object.defineProperty(exports, "EntityCache", {
  enumerable: true,
  get: function get() {
    return _Entity.EntityCache;
  }
});
Object.defineProperty(exports, "Filter", {
  enumerable: true,
  get: function get() {
    return _Filter.default;
  }
});
Object.defineProperty(exports, "FilterGroup", {
  enumerable: true,
  get: function get() {
    return _FilterGroup.default;
  }
});
Object.defineProperty(exports, "QueryParameters", {
  enumerable: true,
  get: function get() {
    return _QueryParameters.default;
  }
});
Object.defineProperty(exports, "GlobalClient", {
  enumerable: true,
  get: function get() {
    return _GlobalClient.default;
  }
});

var _Client = _interopRequireDefault(require("./Client"));

var _Entity = _interopRequireWildcard(require("./Entity"));

var _Filter = _interopRequireDefault(require("./Filter"));

var _FilterGroup = _interopRequireDefault(require("./FilterGroup"));

var _QueryParameters = _interopRequireDefault(require("./QueryParameters"));

var _GlobalClient = _interopRequireDefault(require("./GlobalClient"));

var _Error = require("./Error");

Object.keys(_Error).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _Error[key];
    }
  });
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./Client":3,"./Entity":4,"./Error":7,"./Filter":8,"./FilterGroup":9,"./GlobalClient":10,"./QueryParameters":11}]},{},[2])(2)
});
