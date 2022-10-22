
//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    try {
        var LogFactory = require('./lib/LogFactory.jsx');
        var log = new LogFactory('motion-tools.log');
    
        var MT = require('./lib/MT.jsx');
    
        function main() {
            MT.ps.selectNextLayerFrom(app.activeDocument.activeLayer);
            MT.ps.setTimelineTimeInFrames(MT.ps.getActiveLayerInPointInFrames());
        }

        app.activeDocument.suspendHistory('Add Animation Frame', 'main()');
    } catch (e) {
        log(e);
    }    
})();
