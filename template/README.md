# 第一版本
## 模板示例：
```
<%for ( var i = 0; i < users.length; i++ ) { %>
    <li>
        <a href="<%=users[i].url%>">
            <%=users[i].name%>
        </a>
    </li>
<% } %>
```
## 需要转换为：
```
var p = [];
p.push('');

for (var i=0; i < users.length; i++) {
  p.push('<li><a href="');
  p.push(users[i].url);
  p.push('">');
  p.push(users[i].name);
  p.push('</a></li>');
}
<!-- 然后： -->
element.innerHTML = p.join('');

- <%=users[i].name%>  替换为 ');p.push(users[i].name);p.push('
- <% 替换为 ');
-  %> 替换为 p.push('

- 然后加上 开头和结尾：
string = "var p = [];p.push('";
string += "');return p.join('');"
```
## Function:
- Function 构造函数创建一个新的 Function 对象。 在 JavaScript 中, 每个函数实际上都是一个 Function 对象。
- new Function ([arg1[, arg2[, ...argN]],] functionBody)
-
  ```
  var adder = new Function("a", "b", "return a + b");
  adder(2, 6); // 8
  ```
## 正则表达式：
- \w, 匹配 字母，数字，下划线。
- . , 除行终结符之外的任何单个字符。
- \s\S, 匹配所有的内容。
# 第二版本
## 模板示例：
```
<%for ( var i = 0; i < users.length; i++ ) { %>
    <li>
        <a href="<%=users[i].url%>">
            <%=users[i].name%>
        </a>
    </li>
<% } %>
```
## 需要转换为：
```
var p = '';

for (var i=0; i < users.length; i++) {
  p += '<li><a href="' + users[i].url + '>' + users[i].name + '</a></li>'
}
<!-- 然后： -->
element.innerHTML = p;



- <%=users[i].name%>  替换为  ' + users[i].url + ' // 相当于，把字符串分割，。。。 + a + 。。。
- <% } %>替换为  ';$1 _p+=' ;

- 然后加上 开头和结尾：
string = "var p = '';
string += "';return _p;"
- 为了 防止 取得的值 为空， 用  .replace(settings.interpolate, " ' + ($1 == null ? '' : $1) + ' ")
```
# 第三版本
- 上面的方法，进行了多次替换，然而其实可以只进行一次替换。
- 就是在执行多次匹配函数的时候， 不断复制字符串，处理字符串，拼接字符串，最后拼接首尾代码。
- with 语句可以扩展一个语句的作用域链(scope chain)。当需要多次访问一个对象的时候，可以使用 with 做简化。
```
function Person(){
    this.name = 'Kevin';
    this.age = '18';
}

var person = new Person();

with(person) {
    console.log('my name is ' + name + ', age is ' + age + '.')
}
// my name is Kevin, age is 18.
```
- 不建议使用 with 语句，因为它可能是混淆错误和兼容性问题的根源，除此之外，也会造成性能低下
