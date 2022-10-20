//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    var LogFactory = require('./lib/LogFactory.jsx');
    var MT = require('./lib/MT.jsx');

    var log = new LogFactory('motion-tools.log');

    function main() {
        var document = app.activeDocument;
        var activeLayer = document.activeLayer;

        var siblingLayers = activeLayer.typename === 'LayerSet' ?
            activeLayer.artLayers : activeLayer.parent.artLayers;

        for (var i = 0; i < siblingLayers.length; i++) {
            var layer = siblingLayers[i];

            MT.ps.selectLayerByItemIndex(layer.itemIndex);
            
            if (MT.ps.isPlayheadAtLayer(layer)) {
                return;
            }
        }

        // no layer in the group is under the playhead, so reset selection
        MT.ps.selectLayerByItemIndex(activeLayer.itemIndex);
    }

    try {
        app.activeDocument.suspendHistory('Select Layer at Playhead', 'main()');
    } catch (e) {
        log(e);
    }
    
})();
