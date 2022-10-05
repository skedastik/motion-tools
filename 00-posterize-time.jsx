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

    var properties = comp.selectedProperties;

    if (!properties || properties.length == 0) {
        return;
    }

    var fps = prompt('Enter the desired frame rate.', '12');

    if (!fps) {
        return;
    }

    app.beginUndoGroup("Posterize Time");

    for (var i = 0; i < properties.length; i++) {
        properties[i].expression = 'posterizeTime(' + fps + '); value';
    }

    app.endUndoGroup();
})();
