# Plot.*Twist*
Yet another minimalistic timeseries charting tool

-----

![snapshot](https://cloud.githubusercontent.com/assets/2238599/20331303/6ef14f4a-ab59-11e6-9fc4-bf8d0f140a63.gif)

## Description
- Plot data from serial port.
- Export (multiple) timeseries as CSV
- Easy-customizable parser

## Setup
1. run `npm install`
2. in `semantic` direcotry run `gulp build` to build the semantic-ui library
3. change the `config.js` file for a different baudrate/parity/parser
4. `npm start` to start the server

## Configuration File
- `config.parser` corresponds to the
  [`SerialPort.parsers`](https://github.com/EmergingTechnologyAdvisors/node-serialport#module_serialport--SerialPort.parsers)
  from [`node-serialport`](https://github.com/EmergingTechnologyAdvisors/node-serialport)
- `config.messageConverter` takes in the argument from [`Event: "data"`](https://github.com/EmergingTechnologyAdvisors/node-serialport#event-data)
  emitted by the `SerialPort` class
- `config.messageConverter` outputs an array of numbers to be plotted

### Example: Default Configuration (Two Data, CRLF)

```javascript
//...

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

//...
```

## License
The MIT License (MIT) 2016 Yifei Zhang
