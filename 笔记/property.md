```
var myObject = { a: 2,b:3 };
Object.defineProperty( myObject, Symbol.iterator,{   enumerable: false,
    writable: false,
    configurable: true,
    value: function() { var o = this;
            varidx=0;
            var ks = Object.keys( o ); 
            return {
                next: function() {
                    return {
                        value: o[ks[idx++]],
                        done: (idx > ks.length)
                    };
                } 
            };
    } 
});
// 手动遍历 myObject
var it = myObject[Symbol.iterator](); 
it.next(); // { value:2, done:false } 
it.next(); // { value:3, done:false } 
it.next(); // { value:unde ned, done:true }
```


