var escapeMap = {
  '&': '&amp',
  '<': '&lt',
  '>': '&gt',
  '"': '&quot',
  "'": '&#x27',
  '`': '&#x60'
}
var invert = function(obj) {
  var result = {};
  var keys = Object.keys(obj);
  var key;
  for (var i=0, length = keys.length; i < length; i++) {
    key = keys[i];
    result[obj[key]] = key;
  }
  return result;
}
var unescapeMap = invert(escapeMap);
var createEscaper = function(map) {
  var escaper = function(match) {
    return map[match];
  };
  var source = '(?:' + Object.keys(map).join('|') + ')';
  var testRegexp = new RegExp(source);
  var replaceRegexp = new RegExp(source, 'g');
  return function(string) {
    string = string == null ? '' : '' + string;
    return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
  }
};
var escape = createEscaper(escapeMap);
var unescape = createEscaper(unescapeMap);

var a = "<h2>asd'111&222`asd</h2>";
var b = escape(a);
var c = unescape(b);
console.log(a, b, c, a==c);
