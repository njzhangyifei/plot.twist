var stopwatch = {}

stopwatch.reset = function(){
    stopwatch.startTime = new Date;
}

stopwatch.elapsed = function(){
    if (!stopwatch.startTime) {
        stopwatch.reset();
    }
    return new Date - stopwatch.startTime;
}

module.exports = stopwatch;

