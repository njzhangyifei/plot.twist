var serialport = require('serialport');

var config = {}

config.parity = 'none';
config.baudRate = 115200;
config.parser = serialport.parsers.readline("\r\n"),
config.messageConverter = function(data){
    var numbers = data.match(/(\d[\d\.]*)/g);
    var parsed = null;
    if (numbers && Array.isArray(numbers) && numbers.length == 2) {
        parsed = numbers.map(parseFloat);
    }
    return parsed;
}

module.exports = config;
