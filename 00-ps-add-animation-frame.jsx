//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    var LogFactory = require('./lib/LogFactory.jsx');
    var MT = require('./lib/MT.jsx');

    var log = new LogFactory('motion-tools.log');

    function main() {
        var document = app.activeDocument;
        var originalActiveLayer = document.activeLayer;

        MT.ps.selectLayerAtPlayhead();

        var activeLayer = document.activeLayer;

        if (activeLayer.typename !== 'ArtLayer') {
            MT.ps.selectLayerByItemIndex(originalActiveLayer.itemIndex);
            return;
        }

        var newLayer = activeLayer.duplicate();

        do {
            MT.ps.goToNextFrame();
        } while (MT.ps.isPlayheadAtLayer(activeLayer));

        MT.ps.selectLayerByItemIndex(newLayer.itemIndex);
    }

    try {
        app.activeDocument.suspendHistory('Add Animation Frame', 'main()');
    } catch (e) {
        log(e);
    }
    
})();
