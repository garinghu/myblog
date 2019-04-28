var events = require('events');
var proxy = new events.EventEmitter();
proxy.on('test', (data) => { console.log(data) });
proxy.emit('test', 123)