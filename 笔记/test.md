**类只是一种设计模式，而不是必须的编程基础**


大部分科班出身的开发者都是C，C++，Java启蒙（可能也有像我一样学过C#），认为面向对象是一门语言必备的开发模式，在接触JavaScript时都会相信它会提供一种完备的面向对象机制，经过一定的学习，会发现js在面向对象上并没有提供标准的解决方案，但大部分人仍然会认为这只是语法问题，而丝毫不会怀疑面向对象并非是js必须的编程基础。


new 并非是构造函数，只是构造调用
传统语言中类的实例化以为址**把类的行为复制到物理对象中**
而在js中只是创建了多个关联到prototype的对象，所有对象的内部[[prototype]]相互关联，并非完全独立

Object.getPrototypeOf( a ) === Foo.prototype;

constructor其实是挂在Foo.prototype上的，如果重写prototype，关联将消失

原型链图->对类重新理解

{...a}也是浅复制

```
Object.defineProperty( myObject, "a", {
    value: 2,
    writable: true, // 是否可修改
    configurable: true, // 使用 defineProperty(..) 方法来修改属性描述符
    enumerable: true, //是否是对象的可枚举属性，出现在for...in...中
    get: function() {
        return 2;
    }// get和set会忽略writable和value属性
});
```

"b" in myObject是否在原型链中
hasOwnProperty(..)是否在对象中
Object.prototype.hasOwnProperty. call(myObject,"a") //creat(null)没绑定原型

Object.keys(..) 和 Object.getOwnPropertyNames(..) 都只会查找对象直接包含的属性