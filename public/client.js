require('../semantic/dist/semantic.min.js');
require('../semantic/dist/semantic.min.css');
require('../public/javascripts/canvasjs/canvasjs.min.js')
var $ = require('jquery');
var socket_io = require('socket.io-client');
var socket = socket_io.connect();

var chart;

var startdate;
var timeelasped = function(reset) {
    if (reset) {
        startdate = new Date()
    }
    return new Date(new Date() - startdate);
}

var updateSerialPortList = function(ports, connectedPort, connected) {
    var dropdown = $('#dropdown-serialport');
    var dropdownText = $('#dropdown-serialport-text');
    var dropdownIcon = $('#dropdown-serialport-icon');
    var dropdownOption = $('#dropdown-serialport-option');

    if (ports == null) {
        ports = [];
    }
    if (connected == false) {
        dropdown.addClass('disabled');
        dropdownIcon.css(['icon', 'power'])
        dropdownText.html('Not Connected to Server');
    } else {
        if (ports.length == 0) {
            dropdown.addClass('disabled');
            dropdownIcon.css(['icon', 'bomb'])
            dropdownText.html('No Ports Available');
        } else if (connectedPort == null) {
            dropdown.removeClass('disabled');
            dropdownIcon.css(['icon', 'plug'])
            dropdownText.html('Please Select a Serial Port [' + ports.length + ' available]');
        }
        if (connectedPort != null){
            dropdown.removeClass("disabled")
            dropdownIcon.css(['icon', 'checkmark'])
            dropdownText.html(' Connected to ' + connectedPort);
        }
    }

    if (ports.length > 0) {
        dropdownOption.empty();
        ports.forEach(function (port) {
            dropdownOption.append(
                '<div class="item" data-value="' + port + '">' + port + '</div>'
            );
        });
    };
};

var clearChart = function() {
    series.splice(0, series.length);
    timeelasped(true);
}

var updateChart = function(message) {
    var t = message.timestamp;
    var data = message.data;
    for (var i = 0, len = data.length; i < len; i++) {
        var dataPoints = series[i].dataPoints;
        dataPoints.push({x: t, y: data[i]});
        if (dataPoints.length > 5000) {
            dataPoints.shift();
        }
    }
}

var createChart = function(){
    chart = new CanvasJS.Chart("chartContainer", {
        // height: 500,
        axisX: {
            labelFontSize:12,
            valueFormatString: "ss.ff",
        },
        axisY: {
            labelFontSize:12,
        },
        legend: {
            fontSize:14,
            cursor: "pointer",
            itemclick: function (e) {
                if (typeof (e.dataSeries.visible) === "undefined" || 
                    e.dataSeries.visible) {
                        e.dataSeries.visible = false;
                    } else {
                        e.dataSeries.visible = true;
                    }
                e.chart.render();
            }
        },
        data: series,
    });
}

var chartScrollTask
var enableChartScroll = function() {
    chartScrollTask = setInterval(function() {
        var t = timeelasped();
        chart.options.axisX.minimum = function() {
            var min = new Date(t);
            return min.setSeconds( min.getSeconds() - 7 );
        }();

        chart.options.axisX.maximum = function(){
            var max = new Date(t);
            return max.setSeconds( max.getSeconds() + 2 );
        }();
        chart.render();
    }, 30);
}

var disableChartScroll = function() {
    if (chartScrollTask != null) {
        clearInterval(chartScrollTask);
    }
}

var dataCollection = []
var updateDataCollectionCounter = function(){
    var $updateDataCollection = $('#label-dataset-count');
    $updateDataCollection.html(dataCollection.length);
}

var downloadDataCollection = function(){
    console.log("generating dataset");
    var csvContent = "data:text/csv;charset=utf-8,";
    dataCollection.forEach(function(infoArray, index){
        var dataString = infoArray.join(",");
        csvContent += index < dataCollection.length ? dataString+ "\n" : dataString;
    });
    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    var now = new Date();
    var filename = now.getFullYear()+'-'+parseInt(now.getMonth()+1)+'-'+now.getDate()+'-'+now.getTime()
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename+".csv");
    link.click();
}

var clearDataCollection = function(){
    console.log("dataset is cleared");
    dataCollection = [];
    updateDataCollectionCounter();
}
var updateDataCollection = function(message){
    if (!Array.isArray(message.data)) {
        // do not update throw error message at user
        console.log("error, invalid incoming data");
    }
    dataCollection.push([message.timestamp].concat(message.data));
    updateDataCollectionCounter();
}

var serialPortSelectionCallback = function(text, value){
    clearDataCollection();
    clearChart();
    socket.emit('serialPortSelected', text)
}

var incomingDataCallback = function(message){
    var data = message.data;
    if (series.length != data.length) {
        clearChart();
        data.forEach(function (d){
            series.push({
                showInLegend: true,
                type: "spline",
                xValueType: "dateTime",
                dataPoints: [],
            });
        });
    }
    updateChart(message);
    updateDataCollection(message);
}

socket.on('connect', function() {
    console.log('connected');
});

socket.on('disconnect', function() {
    console.log('disconnect');
    disableChartScroll();
    updateSerialPortList(null, null, false)
});

socket.on('updateSerialPortList', function(ports) {
    updateSerialPortList(ports, null, true);
});

socket.on('serialPortOpen', function(port) {
    enableChartScroll();
    updateSerialPortList(null, port, true);
});

socket.on('incomingData', function(message) {
    incomingDataCallback(message);
});

$(window).resize(function(){
    if (chart) {
        setTimeout( function() {
            chart = null;
            createChart();
            chart.render();
        }, 100);
    }
})

document.addEventListener('DOMContentLoaded', function() {
    var $buttonDataCollectionDownload = $('#button-dataset-download');
    var $buttonDataCollectionClear = $('#button-dataset-clear');

    $buttonDataCollectionClear.on('click', clearDataCollection);
    $buttonDataCollectionDownload.on('click', downloadDataCollection);

    var $dropdown = $('#dropdown-serialport');
    $dropdown.dropdown({
        action: 'hide', 
        onChange: serialPortSelectionCallback
    });

    series = [];

    createChart();
    chart.render();
    clearDataCollection();
});

