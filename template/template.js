(function() {
  this.tmpl = function(str) {
    var str = document.getElementById(str).innerHTML;

    var string = "var p = []; p.push('";

    string += str.replace(/[\r\t\n]/g, "")
    .replace(/<%=([\s\S]+?)%>/g, " ');p.push($1);p.push(' ")
    .replace(/<%/g, " '); ")
    .replace(/%>/g, " p.push(' ")

    string += "');return p.join('');"

    console.log(string);

    var render = new Function(string);
    return function (data) {
      return render.call(this, data);
    }
  };
  var settings = {
      // 求值
      evaluate: /<%([\s\S]+?)%>/g,
      // 插入
      interpolate: /<%=([\s\S]+?)%>/g,
  };
  // 处理特殊字符
  var escapes = {
      "'": "'",
      '\\': '\\',
      '\r': 'r',
      '\n': 'n',
      '\u2028': 'u2028',
      '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;
  this.tmpl2 = function(str) {
    var str = document.getElementById(str).innerHTML;
    var string = " var _p = ''; _p += '";

    string += str.replace(escapeRegExp, match => {
      return '\\' + escapes[match];
    })
    .replace(settings.interpolate, " ' + ($1 == null ? '' : $1) + ' ")
    .replace(settings.evaluate, " ';$1 _p+=' ")

    string += "';console.log(_p);return _p;"
    console.log(string)
    var render = new Function(string);
    return function (data) {
      return render.call(this, data);
    }
  };
  // 合并正则
  this.tmpl3 = function(str) {
    var matcher = new RegExp([(settings.interpolate).source, (settings.evaluate).source].join('|') + '|$' , 'g');
    var index = 0;
    var source = "_p+='";
    var text = document.getElementById(str).innerHTML;
    // 之所以匹配最后一项， 是为了 text.slice(index, offset) 的时候，截取最后一个字符。
    text.replace(matcher, (match, interpolate, evaluate, offset) => {
      source += text.slice(index, offset).replace(escapeRegExp, match => {
        return '\\' + escapes[match];
      });
      index = offset + match.length;

      if (interpolate) {
        source += " '+\n((_t =("+interpolate+")) == null ? '' : _t)+\n' ";
      } else if (evaluate) {
        source += "';\n " + evaluate + "\n_p+='";
      }
      return match;
    });
    source += "';\n";
    source = 'with(obj || {}) {\n' + source + '}\n';
    source = "var _t,_p='';" + source + 'return _p;\n';
    console.log(source);
    var render = new Function('obj', source);
    return render;

  };
})();
 var results =document.getElementById('container');

 var users = [
   {"name": "a", "url": "http://localhost/a"},
   {"name": "b", "url": "http://localhost/b"},
   {"name": "c", "url": "http://localhost/c"}
 ];
var compiled = tmpl3("user_tmpl");
 results.innerHTML = compiled(users);
