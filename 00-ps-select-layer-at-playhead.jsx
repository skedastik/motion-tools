//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    var LogFactory = require('./lib/LogFactory.jsx');
    var MT = require('./lib/MT.jsx');

    var log = new LogFactory('motion-tools.log');

    function main() {
        MT.ps.selectLayerAtPlayhead();
    }

    try {
        main();
    } catch (e) {
        log(e);
    }
    
})();
