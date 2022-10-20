//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    var LogFactory = require('./lib/LogFactory.jsx');
    var MT = require('./lib/MT.jsx');

    var log = new LogFactory('motion-tools.log');

    function main() {
        var document = app.activeDocument;
        var originalActiveLayer = document.activeLayer;

        // Attempt to select the layer at the playhead.
        MT.ps.selectLayerAtPlayhead();

        var activeLayer = document.activeLayer;

        if (activeLayer.typename !== 'ArtLayer') {
            // We should have ended up with an art layer, reset and bail if not.
            MT.ps.selectLayerByItemIndex(originalActiveLayer.itemIndex);
            return;
        }

        // Choose a TIME DELTA equal to the timeline duration.
        var TIME_DELTA = MT.ps.getTimelineDurationInFrames();

        // Increase the out-point of the active layer by the TIME DELTA.
        MT.ps.moveActiveLayerOutTimeInFrames(TIME_DELTA);

        // Record the resulting timeline duration.
        var da = MT.ps.getTimelineDurationInFrames();

        // Duplicate the active layer to create a new animation frame with
        // identical duration.
        var newLayer = activeLayer.duplicate();

        // Record the timeline duration after duplicating.
        var db = MT.ps.getTimelineDurationInFrames();

        // The active layer's original duration is equal to the difference in
        // timeline duration before and after duplication minus the TIME DELTA.
        // The reason we needed to first add the TIME DELTA is to guarantee that
        // the resulting layer's duration is longer than the timeline.
        var activeLayerOriginalDuration = db - da - TIME_DELTA;

        // Reset the active layer's out-point to its original value by
        // substracting the TIME DELTA.
        MT.ps.moveActiveLayerOutTimeInFrames(-TIME_DELTA);

        // Select the new animation frame.
        MT.ps.selectLayerByItemIndex(newLayer.itemIndex);

        // The new animation frame's duration duplicated the TIME DELTA, so
        // reset it too.
        MT.ps.moveActiveLayerOutTimeInFrames(-TIME_DELTA);

        // Advance the playhead by the active layer's original duration so that
        // it is above the new animation frame.
        MT.ps.setTimelineTimeInFrames(MT.ps.getTimelineTimeInFrames() + activeLayerOriginalDuration);

        // Clear the new animation frame so that we have a fresh canvas to draw
        // on.
        MT.ps.clear();
    }

    try {
        app.activeDocument.suspendHistory('Add Animation Frame', 'main()');
    } catch (e) {
        log(e);
    }
    
})();
