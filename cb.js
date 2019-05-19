(function() {
  // 1. 严格模式下， this 为 undefined。
  // 2. 需要适应 浏览器环境 和 node 环境。
  // 3. web worker 环境下没有 window 和 document 对象。但是 和 浏览器环境下有相同的 self 属性。
  // 4. node 的 vm 模块中， 不存在 window，也不存在 global 变量。所以使用 this
  // 5. 微信小程序，window，global，this 都为 undefined。所以用 {}
  var root = (typeof self == 'object' && self.self == self && self) ||
              (typeof global == 'object' && global.global == global && global) ||
              this ||
              {}

  var $ = function(obj) {
    if (obj instanceof $) return obj;
    // this 指向 window，创建新的对象，新的对象的 this 指向自己,并把参数设置在该对象上。相当于用作构造函数。
    if (!(this instanceof $)) return new $(obj);
    this._wrapped = obj;
   };

  // 但是这样在 $ 上面的 方法就 无法调用。需要将 $ 上面的方法复制到 prototype 上面。
  $.functions = function(obj) {
    var names = [];
    for (var key in obj) {
      if (typeof obj[key] === 'function') names.push(key);
    }
    return names.sort();
  }
  // 实现链式调用,链式调用上一个函数的返回结果是this 对象。
  $.chain = function(obj) {
    // 因为这个方法可能 $.chian(), 直接调用，所以需要先 执行 $(obj)
    var instance = $(obj);
    instance._chain = true;
    return instance;
  }
  var chainResult = function(instance, obj) {
    return instance._chain ? $(obj).chain() : obj;
  }
  // 把 $ 上面的所有方法 都挂在对象的原型上面。
  $.mixin = function(obj) {
    $.each($.functions(obj), function(name) {
      var func = $[name] = obj[name];
      $.prototype[name] = function() {
        var args = [this._wrapped];
        [].push.apply(args, arguments);
        var result = func.apply($, args);
        return chainResult(this, result);
      };
    });
    return $;
  };
  $.each = function(obj, callback) {
    for (let i in obj) {
      // 回调函数返回 false 的 时候就终止循环
      if (callback.call(obj[i], obj[i], i) === false) {
        break;
      }
    }
    return obj;
  }

  $.isFunction = function(fn) {
    return typeof fn === 'function';
  };
  $.iteratee = buildintiteratee = function(value, context) {
    return cb(value,context,Infinity)
  };
  $.identity = function(value) {
    return value;
  }
  $.isArray = Array.isArray || function (obj) {
    return toString.call(obj) === '[objetc Array]';
  };
  $.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };
  // 把对象拷贝到目标对象上。
  $.extend = function (target) {
    if (!$.isObject(target)) target = {};
    var length = arguments.length;
    for (let i = 1; i < length; i++) {
      var options = arguments[i];
      if (options !== null) {
        for (let name in options) {
          src = target[name];
          copy = options[name];
          // 解决 循环引用
          if (target === copy) continue;
          // 如果是 对象或数组，可以进行深拷贝
          if (copy && $.isObject(copy) || (copyIsArray = $.isArray(copy))) {
            if (copyIsArray) {
              copyIsArray = false;
              var clone = $.isArray(src) ? src : [];
            } else {
              var clone = $.isObject(src) ? src : {};
            }
            target[name] = $.extend(clone, copy);
          } else if (copy !== undefined) {
            target[name] = copy;
          }
        }
      }
    };
    return target;
  };
  $.isMatch = function(obj, attrs) {
    var keys = Object.keys(attrs), length = keys.length;
    if (obj == null) return !length;
    var object = Object(obj);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      // \值不等，或 不包含这个 key， 就返回 false。
      // 值相等并且key存在，才返回 true 啊。
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  }
  $.matcher = function(attrs) {
    attrs = $.extend({}, attrs);
    console.log('1!', attrs);
    return function(obj) {
      return $.isMatch(obj, attrs);
    }
  };
  $.property = function (path) {
    if (!$.isArray(path)) {
      return shallowProperty(path);
    }
    return function(obj) {
      deepGet(obj, path);
    }
  }
  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    }
  };
  // 根据路径path， 取出深层次的值
  var deepGet = function (obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };
  // 处理，如果传入的回调函数不是函数的情况。
  var cb = function (value, context, argCount) {
    if ($.iteratee !== buildintiteratee) return $.iteratee(value, context);
    // 传入的值为空， 直接返回调用时传入的值。
    if (value == null) return $.identity;
    if ($.isFunction(value)) return optimizeCb(value, context, argCount);
    // 传入的值 是对象，返回对象是否与 调用回调的参数有相同的属性和值。
    if ($.isObject(value) && !$.isArray(value)) return $.matcher(value);
    // 是基础类型的时候，返回元素对应的属性值的情况。
    return $.property(value);
  }
  var optimizeCb = function (func, context, argCount) {
    // 没有传入执行上下文，直接返回
    if (context === void 0) return func;
    // switch 的目的 是提高效率
    switch (argCount) {
      case 1:
        return function(value) {
          return func.call(context, value);
        };
      case 2: null;
      case 3:
        return function(value, index, collection) {
          return func.call(context, value, index, collection)
        };
      case 4:
        return function(accumulator, value, index, collection) {
          return func.call(context, accumulator, value, index, collection)
        };
    }
    return function() {
      return func.apply(context, arguments);
    }
  };
  // 数组的 map 方法。
  $.map = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var length = obj.length; results = Array(length);
    for (var index = 0; index < length; index++) {
      results[index] = iteratee.call(context, obj[index], index, obj);
    }
    return results;
  }
  //要在 $.mixin($) 之前添加自定义的函数
  $.mixin($);
  $.prototype.value = function() {
    return this._wrapped;
  }
  $.prototype.toString = function() {
    return String(this._wrapped);
  }
  // 为了支持 模块化， 要在合适的环境中作为模块导出。
  // 1. 老版本的 node ，只有exports， 没有mocule.exports
  // 2. 在页面中生成，<div id="exports"></div> 这样一个标签，就会在 window.exports 上面挂载这个标签，所有需要判断是不是 DOM 元素。
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && ! module.nodeType && module.exports) {
      exports = module.exports = $;
    }
    exports.$ = $;
  } else {
    root.$ = $;
  }
})();

console.log(exports.$.map([1,2,3,4], function(item) {
  return item + 2;
}));
console.log(exports.$.map([{name: '1'}, {name: 2}], 'name'));
console.log(exports.$.map([{name: '1'}, {name: 2}], {name: '3'}));
console.log(exports.$.map([{name: '1'}, {name: 2}] ));
