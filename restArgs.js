// 传入一个函数，使用函数的最后一个参数存储剩余的函数参数，类似ES6里面的 ...扩展操作符。
function restArgs(func, startIndex) {
  var startIndex = startIndex == null ? func.length - 1 : +startIndex;
  return function() {
    // startIndex ， 是存储 剩余参数的数
    var length = Math.max(arguments.length - startIndex, 0);

    var rest = Array(length);
    var index = 0;

    for (;index < length; index++) {
      rest[index] = arguments[index + startIndex];
    }
    //  call 的性能要高于 apply, 所以增加：
    switch(startIndex) {
      case 0: return func.call(this, rest);
      case 1: return func.call(this, arguments[0], rest);
      case 2: return func.call(this, arguments[0], arguments[1], rest);
    }

    var args = Array(startIndex + 1);
    for (index = 0; index < startIndex; index++) {
      args[index] = arguments[index];
    }

    args[startIndex] = rest;
    return func.apply(this, args);
  }
}

var func = restArgs(function(a, b, c){
    console.log(b, c); // [3, 4, 5]
}, 1)

func(1, 2, 3, 4, 5)
