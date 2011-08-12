//Degas framework

(function(global) {
  var middleware = [];

  /**
   * The degas object.  Use `degas('selector')` for quick DOM access when built with the DOM module.
   *
   * @returns {Object} The degas object, run through `init`
   */
  function degas() {
    var result, i;
    for (i = 0; i < middleware.length; i++) {
      result = middleware[i].apply(degas, arguments);
      if (result) {
				return result;
			}
    }
  }

  degas.VERSION = '0.0.1';

  /**
   * This alias will be used as an alternative to `degas()`.
   * If `__degas_alias` is present in the global scope this will be used instead. 
   * 
   */
  degas.alias = global.__degas_alias || '$t';
  global[degas.alias] = degas;

  /**
   * Determine if an object is an `Array`.
   *
   * @param {Object} object An object that may or may not be an array
   * @returns {Boolean} True if the parameter is an array
   */
  degas.isArray = Array.isArray || function(object) {
    return !!(object && object.concat
              && object.unshift && !object.callee);
  };

  /**
   * Convert an `Array`-like collection into an `Array`.
   *
   * @param {Object} collection A collection of items that responds to length
   * @returns {Array} An `Array` of items
   */
  degas.toArray = function(collection) {
    var results = [], i;
    for (i = 0; i < collection.length; i++) {
      results.push(collection[i]);
    }
    return results;
  };

  // This can be overriden by libraries that extend degas(...)
  degas.init = function(fn) {
    middleware.unshift(fn);
  };

  /**
   * Determines if an object is a `Number`.
   *
   * @param {Object} object A value to test
   * @returns {Boolean} True if the object is a Number
   */
  degas.isNumber = function(object) {
    return (object === +object) || (toString.call(object) === '[object Number]');
  };

  /**
   * Binds a function to an object.
   *
   * @param {Function} fn A function
   * @param {Object} object An object to bind to
   * @returns {Function} A rebound method
   */
  degas.bind = function(fn, object) {
    var slice = Array.prototype.slice,
        args  = slice.apply(arguments, [2]);
    return function() {
      return fn.apply(object || {}, args.concat(slice.apply(arguments)));
    };
  };

  var testCache = {},
      detectionTests = {};

  /**
   * Used to add feature-detection methods.
   *
   * @param {String} name The name of the test
   * @param {Function} fn The function that performs the test
   */
  degas.addDetectionTest = function(name, fn) {
    if (!detectionTests[name]) {
			detectionTests[name] = fn;
		}
  };

  /**
   * Run a feature detection name.
   *
   * @param {String} name The name of the test
   * @returns {Boolean} The outcome of the test
   */
  degas.detect = function(testName) {
    if (typeof testCache[testCache] === 'undefined') {
      testCache[testName] = detectionTests[testName]();
    }
    return testCache[testName];
  };

  if (global.degas) {
    throw new Error('degas has already been defined');
  } else {
    global.degas = degas;
    if (typeof exports !== 'undefined') {
			exports.degas = degas;
		}
  }
}(typeof window === 'undefined' ? this : window));


degas.Class = function() {
  return degas.oo.create.apply(this, arguments);
}

degas.oo = {
  create: function() {
    var methods = null,
        parent  = undefined,
        klass   = function() {
          this.$super = function(method, args) { return degas.oo.$super(this.$parent, this, method, args); };
          this.initialize.apply(this, arguments);
        };

    if (typeof arguments[0] === 'function') {
      parent = arguments[0];
      methods = arguments[1];
    } else {
      methods = arguments[0];
    }

    if (typeof parent !== 'undefined') {
      degas.oo.extend(klass.prototype, parent.prototype);
      klass.prototype.$parent = parent.prototype;
    }

    degas.oo.mixin(klass, methods);
    degas.oo.extend(klass.prototype, methods);
    klass.prototype.constructor = klass;

    if (!klass.prototype.initialize)
      klass.prototype.initialize = function(){};

    return klass;
  },

  mixin: function(klass, methods) {
    if (typeof methods.include !== 'undefined') {
      if (typeof methods.include === 'function') {
        degas.oo.extend(klass.prototype, methods.include.prototype);
      } else {
        for (var i = 0; i < methods.include.length; i++) {
          degas.oo.extend(klass.prototype, methods.include[i].prototype);
        }
      }
    }
  },

  extend: function(destination, source) {
    for (var property in source)
      destination[property] = source[property];
    return destination;
  },
  $super: function(parentClass, instance, method, args) {
    return parentClass[method].apply(instance, args);
  }
};