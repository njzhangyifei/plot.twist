var serialport = require('serialport');
var express = require('express');
var config = require('../config')
var stopwatch = require('../extra_modules/stopwatch')
var router = express.Router();

/* GET home page. */
module.exports = function(io){
    router.get('/', function(req, res, next) {
        res.render('index', { title: 'Express' });
    });

    io.on('connection', function (socket) {
        var device = null;

        serialport.list(function (err, ports){
            portNames = [];
            ports.forEach(function (port){
                portNames.push(port.comName);
            })
            socket.emit('updateSerialPortList', portNames);
        });

        var closeSerialPort = function(device) {
            if (device != null && device.isOpen()) {
                console.log('Closing Serial Port ' + device.path);
                device.close( function() {
                    console.log('Closed Serial Port ' + device.path);
                });
            }
        };

        socket.on('serialPortSelected', function (data) {
            if (device != null) {
                closeSerialPort(device);
            }
            console.log('Selected Serial Port ' + data);
            device = new serialport(data, {
                baudRate: config.baudRate,
                parity: config.parity,
                parser: config.parser,
                autoOpen: true
            }, function() {
                console.log('Opened Serial Port ' + device.path);
                socket.emit('serialPortOpen', device.path);
                // reset stopwatch
                stopwatch.reset();

                setInterval(function() {
                    var t = stopwatch.elapsed();
                    var messagePacked = {
                        timestamp: t,
                        data: [Math.sin(t/1000), Math.cos(t/1000)]
                    }
                    socket.emit('incomingData', messagePacked);
                }, 30)

                device.on('data', function(data) {
                    if (data) {
                        var message = config.messageConverter(data);
                        if (message) {
                            var messagePacked = {
                                timestamp: stopwatch.elapsed(),
                                data: message
                            }
                            socket.emit('incomingData', messagePacked);
                        }
                    }
                });
            });
        });

        socket.on('disconnect', function () {
            closeSerialPort(device);
        });

    });

    return router;
}

