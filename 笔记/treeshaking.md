DCE：消除不可能用到的代码，用uglify实现
treeshaking: 去除引用但没用到的方法（引用的类不行，因为可能有副作用，不敢删）

babel解析class: Object.definedProperty，因为class的属性不可枚举，而用.prototype是可枚举的，所以即便没有副作用的类也会产生副作用