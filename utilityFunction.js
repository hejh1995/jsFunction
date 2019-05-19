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
   // 为了避免访问冲突，页面中也存在 $ 这个变量。
   var previous$ = root.$;
   $.noConfict = function() {
     root.$ = previous$;
     return this;
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
  // 返回，返回输入值的函数，可以作为默认函数。
  $.constant = function(value) {
    return function() {
      return value
    }
  }
  // 可以作为默认函数。
  $.noop = function() {};
  $.propertyOf = function(obj) {
    if (obj == null) {
      return $.noop;
    }
    return function(path) {
      return !$.isArray(path) ? obj[path] : deepGet(obj, path);
    }
  }
  var deepGet = function(obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
        if (obj == null) return void 0;
        obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };
  // 返回一个 min 和 max 之间的随机整数。如果你只传递一个参数，那么将返回 0 和这个参数之间的整数。
  $.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
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
  root.$ = $;
})();
