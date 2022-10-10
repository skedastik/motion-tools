//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    var LogFactory = require('./lib/LogFactory.jsx');
    var MT = require('./lib/MT.jsx');

    var log = new LogFactory('motion-tools.log');

    var comp = app.project.activeItem;

    if (!comp) {
        return;
    }

    var layers = comp.selectedLayers;

    if (!layers) {
        return;
    }

    app.beginUndoGroup("Move Layer to Playhead");

    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        layer.startTime += app.project.activeItem.time - layer.startTime;
    }

    app.endUndoGroup();
})();
