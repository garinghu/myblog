CommonJS模块规范
1. 模块引用：
  require
2. 模块定义:
  exports:唯一导出出口
  module:模块自身，exports是module的属性，一个文件就是一个module
3. 模块标识

引入模块的三个步骤
1. 路径分析
2. 文件定位:
文件扩展名分析：.js -> .json -> .node(需要调用fs模块同步阻塞判断文件是否存在)
分析目录和包：如果只拿到目录，会将其作为包来处理，会查找package.json文件，取出main文件定位
3. 编译执行:
每个模块都是一个对象
定位到文件后，node会新建模块对象，然后载入并编译
编译成功后会用文件路径作为缩影缓存在Module._cache上

exports, require, module在编译时会包装在头中

exports, module.exports区别：exports在编译时以形参的形式传入，如果直接修改exports的值(例：exports = a)只是对exports的引用发生改变，并不会修改exports的值，所以要用modules.exports




模块分类：
1. 核心模块：编译时加载到内存中，路径优先判读，加载最快
2. 文件模块：需要完整执行三个步骤，比核心模块慢

node引入过的模块都会进行缓存（缓存编译后的对象），require()方法对相同模块的二次加载都一律采用缓存优先的方式，核心模块的缓存检查优先于文件模块

标识符分类
1. 核心模块（http, fs, path等）
2. 相对路径
3. 绝对路径
4. 非路径形式的文件模块，如自定义的connect模块
不能加载与核心模块名相同的自定义模块

路径形式：require方法会转换为真实路径，以真实路径为索引放入缓存中，方便二次加载


模块路径(module.paths)，依次向上查找node_modules目录



CommonJS包规范
1. 包结构：目录打包为一定格式的文件，安装后解压还原为目录
2. 包描述：package.json

npm是commonJs包规范的一种实践，对于Node而言，NPM帮助完成了第三方模块的发布、安装和依赖等

node模块的引入过程是同步的，在server端没有问题，但在前端同步引入会花费很多时间来等待脚本加载完成，两者的加载速度不在一个数量级上，所以引入了异步模块定义AMD

AMD: commonJS必须要在引用后才能使用，会花时间等待引入,只能异步加载，所以需要引入AMD，通过require.js支持
模块定义
```javascript
define(function(){
    function sum(a,b){
    	return a + b
    }
    return {
    	sum: sum
    }
})
```
模块调用
```javascript
require(['assets/js/a'],function(math) {
  console.log(math)
  console.log(math.sum(4,6))
})
```

CMD：依赖就近，只有在用到模块的时候再去加载