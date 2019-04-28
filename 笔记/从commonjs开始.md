## 为什么要搞模块化
js作为一种解释型语言，无论是在浏览器还是在node，手写的词法语法都会进行编译再由环境执行，如果没有模块化，并不会影响程序的执行，就像过去我们把所有的代码都写到一个js文件中并通过script标签引用一样。所以我们在提及js模块化时应该意识到，模块化只是在把代码交给环境执行前的优化，使js在一定程度上拥有承接大型项目的能力，对于开发者来说，拥有模块化只是“换个方式写代码”，而不同的模块化规范的区别也只是在代码书写上的约束和在将代码交付给环境编译执行前的优化策略不同。

### script标签形式

无论是Java的包机制，还是PHP的include机制，模块的最优载体应该是文件，一个文件即是一个模块，这样即便于合作开发，也便于模块的管理，而script标签往往都需要对应一个外部文件，把不同的模块分作不同的script标签进行引入，似乎是一个很好的解决方法，但由于script标签的局限性，这种方法也被历史所淘汰了。
1. script标签是以链表形式引入的，当面对复杂的树形依赖关系时很难梳理引用顺序
2. 所有script标签里的代码共享一个作用域，很容易产出变量污染
3. 不支持编程化加载资源，很难判断资源是否加载完成
但在这种情况下，也催生出了很多优秀的模块化规范以及工具库，例如AMD、CMD等等，它们在实现时往往都需要面临以下几个问题：
-  如何去按照依赖关系引入相应的标签？
-  如何解决变量作用域污染？
-  如何判断引入资源的状态？
-  如何处理循环引用？
-  重复引用怎么办？
这里以流传较广的require.js为例，看下AMD是如何解决上述问题的
先看下require写法
```javascript
//模块引用
require(['jquery', 'underscore', 'backbone'], function ($, _, Backbone){

　　　　// some code here

});

// 模块定义
define(function (){
　　　　var add = function (x,y){
　　　　　　return x+y;
　　　　};

　　　　return {
　　　　　　add: add
　　　　};
});

// 模块路径查找配置文件
require.config({
　　　　paths: {

　　　　　　"jquery": "lib/jquery.min",
　　　　　　"underscore": "lib/underscore.min",
　　　　　　"backbone": "lib/backbone.min"

　　　　}
});
```
require.js在模块引入时先确定依赖模块，再通过回调传参的形式传给回调函数，以函数作用域划分模块作用域，解决了作用域污染的问题。并通过配置文件查找模块路径，可以看下模块引入的源码：
- 创建节点
```javascript
req.createNode = function (config, moduleName, url) {
  var node = config.xhtml ?
    document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
    document.createElement('script');
  node.type = config.scriptType || 'text/javascript';
  node.charset = 'utf-8';
  node.async = true;
  return node;
};
```
require.js通过script标签获取模块文件，并设置**async**对async标签异步加载
- 加载节点
```javascript
req.load = function (context, moduleName, url) {
  var config = (context && context.config) || {},
  node;
  if (isBrowser) {
    //create a async script element
    node = req.createNode(config, moduleName, url);
    //add Events [onreadystatechange,load,error]
    .....
    //set url for loading
    node.src = url;
    //insert script element to head and start load
    currentlyAddingScript = node;
    if (baseElement) {
      head.insertBefore(node, baseElement);
    } else {
      head.appendChild(node);
    }
    currentlyAddingScript = null;
    return node;
  } else if (isWebWorker) {
    .........
  }
};
```
通过绑定onreadystatechange,load,error等事件监听资源加载状态

总结下就是：
1. 通过异步加载标签的形式解决复杂的依赖关系
2. 通过绑定onreadystatechange,load,error等事件监听资源加载状态
3. 在事件中传入回调函数来触发引用逻辑，暴漏模块接口
4. 通过维护模块状态及缓存（将加载的模块存在对象中）来处理循环引用及重复引用

#### 问题
依赖通过script标签异步加载，是运行时加载，加载的效果完全依赖于浏览器，难以做到全面的监控而避免意外的发生；配置文件的额外书写也降低了文件的复用性。

### node对commonJS的支持

通过分析上一代的模块化方式，通过加载多个script标签的方式是将规范映射到代码运行时，对浏览器的依赖过大，而浏览器在运行代码时变换莫测，有很多不可控因素，并且多次去请求静态资源也是对资源的一种损耗，当依赖模块过多时，维护大量的配置文件也是一个不小的开支。

在前端被困在这样的技术局限无法自拔时，node对CommonJS的支持似乎给模块化带来了一线生机

node在支持CommonJS时带来了两样法宝，助力了前端模块化的发展
#### 强大的包管理工具：npm

npm帮助完成了第三方模块的发布、安装和依赖等。借助NPM，Node与第三方模块之间形成了很好的一个生态系统。

![myblog/images/transaction1.png](https://github.com/garinghu/myblog/raw/master/images/npm1.png)

npm 通过**包结构**与**包描述文件**在一定程度上解决了变量依赖、依赖关系等代码组 织性问题

- 包结构

包实际上是一个存档文件，即一个目录直接打包为.zip或tar.gz格式的文件，安装后解压还原 为目录

- 包描述文件

包描述文件用于表达非代码相关的信息，它是一个JSON格式的文件——package.json，位于 包的根目录下，是包的重要组成部分

在目录结构上以这种形式表现
```
├── node_modules // 包存储
│   ├── npm包1 
│   │   ├── node_modules // 模版组件
│   │   └── npm包1 // 模版组件
│   ├── npm包2 
└── package.json //包描述文件
```
可以看到，项目会有自己的包描述文件，而项目依赖的包也会有自己的包描述文件，合理解决了树形复杂依赖的问题，也使得包结构更加美观，通过package.json与node_modules的映射也方便了npm包的维护

npm现在已经是一个包共享平台，所有人都可以贡献模块并将其打包分享到这个平台上，也可以在许可证(大多是MIT许可证)的允许下免费使用它们。潜在的问题在于，在[NPM平台](https://www.npmjs.com/)上，每个人都可以分享包到平台上，鉴于开发人员水平不一，上面的包的质量也良莠不齐。

- 一些跨宿主的API

ECMAScript仅定义了部分核心库，对于文件系统，I/O流等常见需求却没有标准的API，就HTML5的发展状况而言，W3C标准化在一定意义上是在推进这个过程，但是它仅限于浏览器端。而CommonJS规范涵盖了模块、二进制、Buffer、字符集编码、I/O流、进程环境、文件系统、套接字、单元测试、Web服务器网关接口、 包管理等。

Node对CommonJS的支持产生了很多跨宿主的API，例如对文件的操作使得在模块化过程中对文件的读写成为可能。


### 归一：webpack

上文提到，node产出了包管理工具NPM，以及跨宿主API，前端应该如何利用这两个特性去重新组织模块化呢？这时开发者们遇到了以下几个问题：
1. 既然可以在代码交付前就可以对文件进行读写，过去加载异步script标签的步骤是不是可以提前？
2. 如何处理过去的AMD、CMD、UMD规范？

这里以webpack为例，看看webpack是如何处理这两个问题的

> webpack 是一个现代 JavaScript 应用程序的静态模块打包器(module bundler)。当 webpack 处理应用程序时，它会递归地构建一个依赖关系图(dependency graph)，其中包含应用程序需要的每个模块，然后将所有这些模块打包成一个或多个bundle。


webpack实质做的是在代码交付前通过既定语法找到模块（文件）间的依赖关系，最终（常常）生成一个打包文件，代码执行时只需要引入这一个文件即可。

我认为这是模块化革命性的进展：**程序员只需要关心代码逻辑，运行时的逻辑无需关心**。

但是在过去，我们配置的配置文件，或是在define语句中定义的依赖数组，都与代码运行时息息相关，我们需要关注依赖的加载状态，需要考虑到浏览器的各种突发情况，并且一段相同逻辑的代码，使用了支持不同模块化规范的库，竟然会影响代码运行时的性能，容易让人费解。但webpack的到来，我们只需要关心文件需要哪些依赖，webpack会将一切模块化的逻辑隔绝在代码交付前。

#### 如何处理过去的AMD、CMD、UMD规范

无论是AMD的define语法还是CommonJS的require，都指定了模块的路径，webpack需要做的是识别模块路径，解析文件，按照配置打包到指定的位置。

webpack为了降低用户的迁入成本，原生支持了AMD、CommonJS、UMD等模块化规范的语法（esModule在webpack2也支持，放到后面去说）。可以通过打包后的代码了解下不同的模块化规范在webpack中是如何被编译的。

- AMD
```javascript
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {
	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(example2){
	    example2.sayHello();
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(){
	    return {
	        sayHello:function(){
	            alert('hello world!');
	        }
	    };
	}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }
/******/ ]);
```
可以看到，最终是以IIFE的形式展现
```javascript
(function(modules) {...})([模块1, 模块2])
```
通过闭包的形式（理论上IIFE不应该叫闭包）划分作用域

再参数部分
```javascript
function(module, exports, __webpack_require__) {
  // 模块参数，相当于define中模块依赖数组
  var __WEBPACK_AMD_DEFINE_ARRAY__, 
  // 模块结果，相当于return
  __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_ARRAY__ = [
	    __webpack_require__(1)
	], __WEBPACK_AMD_DEFINE_RESULT__ = function(example2){
      example2.sayHello();
    // 通过apply将加载的参数传递给模块
  }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), 
  // 导出结果
  __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

},
```
比较核心的__webpack_require__部分
```javascript
function __webpack_require__(moduleId) {
// 在模块缓存中是否存在该模块
if(installedModules[moduleId])
// 存在就直接返回
return installedModules[moduleId].exports;
// 初始化模块
var module = installedModules[moduleId] = {
 			exports: {},
 			id: moduleId,
			loaded: false
 		};

 		// 给调用传进来的函数，并传递参数
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

 		// 标定模块已经被加载
		module.loaded = true;

		// 模块导出
 		return module.exports;
 	}
```
通过最上面require.js的源码对比可知，打包后的代码不存在什么异步引用标签的逻辑，webpack只是识别了AMD对模块路径的引用，并打包成了跟require.js毫无关系的代码。

- CommonJS
> 篇幅有限，只放上相同区域的对比图（右侧是CommonJS的打包结果）

参数部分
![myblog/images/amd_common1.png](https://github.com/garinghu/myblog/raw/master/images/amd_common1.png)
除了AMD会为__webpack_require__的结果包装成数组传入到输出结果中外，其他没有什么区别


比较核心的__webpack_require__部分

![myblog/images/amd_common1.png](https://github.com/garinghu/myblog/raw/master/images/amd_common2.png)

竟然完全相同

> 这种在不同模块化方案下打包后结构高度统一的方案为webpack带来了诸多好处，因为webpack只需要在模块入口导出这一块处理好不同模块化的差异即可，对后续的模块加载和优化等等都打下了坚实的基础。当然，目前可能还感觉不到这些好处，但是到目前为止，你应该可以非常直观地感觉到，webpack的确能同时支持多种模块化方案混合使用

这就是这小节取名为**归一**的原因，无论是过去的模块化规范有着什么特性，在webpack这里只剩下语法规则而已。

### ES6 module

es module和前面的AMD、CommonJS规定的语法一样，浏览器都不会运行，都需要相应的载体（如需引入支持AMD的require.js）或编译（在webpack中的编译即为打包过程，和浏览器引擎的编译无关）才能在浏览器中运行。

es module是现今前端最主流的模块化规范，有必要单独写一个小节

es module有以下几个特点：

- 只能作为模块顶层的语句出现
- import 的模块名只能是字符串常量
- import binding 是 immutable的

其中比较有名的就是：**ES6的模块引入是静态分析的，故而可以在编译时正确判断到底加载了什么代码**

前文说到，对于开发者来说，无论什么模块化规范在其他载体的支持下出现了什么运行时的特性，在webpack中只剩下了语法规范而已。es module的这么多特性也都是在**书写代码时**和**打包工具编译时**做了约束而已。

为了明确这一特点，还是看下es module在webpack中编译后的样子

IIFE参数部分
```javascript
([
(function(module, __webpack_exports__, __webpack_require__) {

  "use strict";
  Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
  /* harmony import */
  var __WEBPACK_IMPORTED_MODULE_0__m__ = __webpack_require__(1);

  Object(__WEBPACK_IMPORTED_MODULE_0__m__["a" /* default */])();
  Object(__WEBPACK_IMPORTED_MODULE_0__m__["b" /* foo */])();

}),
(function(module, __webpack_exports__, __webpack_require__) {

  "use strict";
  /* harmony export (immutable) */
  __webpack_exports__["a"] = bar;
  /* harmony export (immutable) */
  __webpack_exports__["b"] = foo;

  function bar () {
      return 1;
  };
  function foo () {
      return 2;
  }

})
]);
```

__webpack_require__部分
```javascript
function __webpack_require__(moduleId) {
      // Check if module is in cache
      if(installedModules[moduleId]) {
          return installedModules[moduleId].exports;
      }
      // Create a new module (and put it into the cache)
      var module = installedModules[moduleId] = {
          i: moduleId,
          l: false,
          exports: {}
      };
      // Execute the module function
      modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
      // Flag the module as loaded
      module.l = true;
      // Return the exports of the module
      return module.exports;
  }
```

可以看到和上面webpack对AMD和CommonJS的区别并无区别，只看编译后代码是无法看出任何特性的，es modules的特性是编译时的特性。

阮大的解释就很棒
![myblog/images/es4](https://github.com/garinghu/myblog/raw/master/images/es4.png)


### 后记
这篇文章断断续续写了几天，最开始是想简单写下node的模块机制，但写着写着就想了解下前端的模块化进程，在整理知识点的同时，更多的是对技术的思考。

很惭愧，我在2016年才开始接触前端，在2018年才开始思考自己的知识体系，那时已经有种感觉：现在的前端知识图和几年前完全不一样。而所有技术的发展都是有前因后果的，都是有迭代过程的，对于我这种新人来说，了解这些过程是否有意义，其实这正是我想在这篇文章中着重讨论的。

2018年初在实习面试的时候人家问我：知道AMD和CMD的区别吗？当时我并不知道，只知道es module，因为大家都在用es module。

查了相关文章，大部分也只介绍了**AMD是依赖前置**、**CMD是依赖就近**，也就是上文提到的**对模块化的运行时映射**，而在webpack中不存在任何运行时的处理，而webpack却支持AMD的打包，看了很多相关文章的评论，似乎不只是我，很多人对此也非常困惑。

我将其理解为时代局限，在很多知识的传播过程中，由于并未理解当时人们的构思，很多过去文章的术语在当前知识体系的语境下很容易误解（就例如在webpack语境下的编译与在浏览器引擎语境下的编译完全不是一个意思，而模块化的规范以及支持规范的载体也常常有人分不清）

为了解决这个问题，我从require.js入手，了解了AMD产生的原因以及require.js是如何去支持这些规范的（这么说同样有问题，据说是先有了require.js才在推广过程中出现了AMD），又通过webpack打包后代码分析webpack对AMD的支持，才得出结论：如今所谓的AMD和CMD特性在webpack中只剩下了语法规范，如果我想搞个NBMD，只要写个能解释这个规范的loader即可，和AMD与CMD并没有任何区别。

这种“补历史课”的行为是否有意义呢？至少到现在为止，除了解决了我很久的困惑外似乎不会对我代码上的产出有直接的结果，但却巩固了我的知识体系，使之不会再成为我未来道路上的“伏笔”。

套用**加缪**的名言

**认清了技术的真相，仍如西西弗斯般花时间去研究，也许这正是程序员的荣耀**
















