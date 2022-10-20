//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    var LogFactory = require('./lib/LogFactory.jsx');
    var MT = require('./lib/MT.jsx');

    var log = new LogFactory('motion-tools.log');

    function main() {
        var document = app.activeDocument;
        var activeLayer = document.activeLayer;

        if (activeLayer.typename !== 'ArtLayer') {
            return;
        }

        // this script will only work if the playhead is at the current layer
        if (!MT.ps.isPlayheadAtLayer(activeLayer)) {
            return;
        }

        activeLayer.duplicate();

        do {
            MT.ps.goToNextFrame();
        } while (MT.ps.isPlayheadAtLayer(activeLayer));

        MT.ps.selectNextSiblingOfLayer(activeLayer);
    }

    try {
        app.activeDocument.suspendHistory('Add Animation Frame', 'main()');
    } catch (e) {
        log(e);
    }
    
})();
