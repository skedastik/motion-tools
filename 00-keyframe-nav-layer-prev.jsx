//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    var LogFactory = require('./lib/LogFactory.jsx');
    var MT = require('./lib/MT.jsx');
    
    var log = new LogFactory('motion-tools.log');

    try {
        var layer = app.project.activeItem.selectedLayers[0];
    } catch (e) {
        return;
    }

    if (!layer) {
        return;
    }

    app.beginUndoGroup("Go to Next Keyframe in Layer");

    var properties = MT.getSelectedPropertiesFrom(layer);
    
    if (properties.length == 0) {
        properties = MT.getPropertiesFrom(layer);
    }

    var keyTimes = MT.getDistinctSortedKeyTimesFrom(properties);
    var currentTime = app.project.activeItem.time;

    for (var i = keyTimes.length - 1 ; i >= 0; i--) {
        var keyTime = keyTimes[i];
        if (keyTime < currentTime) {
            app.project.activeItem.time = keyTime;
            break;
        }
    }

    app.endUndoGroup();
})();
