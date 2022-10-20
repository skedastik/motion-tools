//@include "node_modules/@yellcorp/extendscript-commonjs/commonjs.js"
require.init($.fileName);

(function () {
    var LogFactory = require('./lib/LogFactory.jsx');
    var MT = require('./lib/MT.jsx');

    var log = new LogFactory('motion-tools.log');

    function actionDescriptorToString(d) {
        str = [];
        for (var i = 0; i < d.count; i++) {
            str.push(typeIDToStringID(d.getKey(i)) + ':' + d.getType(d.getKey(i)));
        }
        return str.join('\n');
    }

    function selectLayerByItemIndex(itemIndex) {
        var d1 = new ActionDescriptor();
        var r1 = new ActionReference();
        r1.putIndex( stringIDToTypeID('layer'), itemIndex );
        d1.putReference( stringIDToTypeID('null'), r1 );
        d1.putBoolean( stringIDToTypeID('MkVs'), false );
        executeAction( stringIDToTypeID('select'), d1, DialogModes.NO );
    }

    // Select the previous sibling art layer of given layer. Returns true if a
    // previous sibling art layer exists, false otherwise.
    function selectPreviousSiblingOfLayer(layer) {
        var artLayers = layer.parent.layers;
        for (var i = 0; i < artLayers.length; i++) {
            if (artLayers[i] === layer) {
                if (i == 0) {
                    return false;
                }
                var sibling = artLayers[i - 1];
                if (sibling.typename !== 'ArtLayer') {
                    return false;
                }
                selectLayerByItemIndex(sibling.itemIndex);
                return true;
            }
        }
    }

    // Select the next sibling art layer of given layer. Returns true if a next
    // sibling art layer exists, false otherwise.
    function selectNextSiblingOfLayer(layer) {
        var artLayers = layer.parent.layers;
        for (var i = 0; i < artLayers.length; i++) {
            if (artLayers[i] === layer) {
                if (i == artLayers.length - 1) {
                    return false;
                }
                var sibling = artLayers[i + 1];
                if (sibling.typename !== 'ArtLayer') {
                    return false;
                }
                selectLayerByItemIndex(sibling.itemIndex);
                return true;
            }
        }
    }

    function goToPreviousFrame() {
        // code captured from script listener plugin
        var idpreviousFrame = stringIDToTypeID( "previousFrame" );
        var desc164 = new ActionDescriptor();
        var idtoNextWholeSecond = stringIDToTypeID( "toNextWholeSecond" );
        desc164.putBoolean( idtoNextWholeSecond, false );
        executeAction( idpreviousFrame, desc164, DialogModes.NO );
    }

    function goToNextFrame() {
        // code captured from script listener plugin
        var idnextFrame = stringIDToTypeID( "nextFrame" );
        var desc165 = new ActionDescriptor();
        var idtoNextWholeSecond = stringIDToTypeID( "toNextWholeSecond" );
        desc165.putBoolean( idtoNextWholeSecond, false );
        executeAction( idnextFrame, desc165, DialogModes.NO );
    }

    function getTimeline() {
        var r1 = new ActionReference();
        var idproperty = stringIDToTypeID( "property" );
        var idworkOutTime = stringIDToTypeID( "workOutTime" );
        r1.putProperty( idproperty, idworkOutTime );
        var idtimeline = stringIDToTypeID( "timeline" );
        r1.putClass( idtimeline );
        var d1 = executeActionGet(r1).getObjectValue(stringIDToTypeID("workOutTime"));

        var r2 = new ActionReference();
        var idproperty = stringIDToTypeID( "property" );
        var idworkOutTime = stringIDToTypeID( "workInTime" );
        r2.putProperty( idproperty, idworkOutTime );
        var idtimeline = stringIDToTypeID( "timeline" );
        r2.putClass( idtimeline );
        var d2 = executeActionGet(r2).getObjectValue(stringIDToTypeID("workInTime"));

        return {
            outSeconds: d1.getInteger(d1.getKey(0)),
            outFrames: d1.getInteger(d1.getKey(1)),
            inSeconds: d2.getInteger(d2.getKey(0)),
            inFrames: d2.getInteger(d2.getKey(1)),
            frameRate: d1.getInteger(d1.getKey(2))
        };
    }

    // Nudge target layer one pixel over, then nudge it back. A no-op.
    function nudgeLayer(layer) {
        layer.translate(1, 0);
        layer.translate(-1, 0);
    }

    function isPlayheadAtLayer(layer) {
        try {
            // A layer can only be nudged if the playhead is at that layer. We
            // exploit this behavior to determine whether the playhead is at the
            // a given layer.
            nudgeLayer(layer);
            return true;
        } catch (e) {
            return false;
        }
    }

    function main() {
        var document = app.activeDocument;
        var activeLayer = document.activeLayer;

        var siblingLayers = activeLayer.typename === 'LayerSet' ?
            activeLayer.artLayers : activeLayer.parent.artLayers;

        for (var i = 0; i < siblingLayers.length; i++) {
            var layer = siblingLayers[i];

            selectLayerByItemIndex(layer.itemIndex);
            
            if (isPlayheadAtLayer(layer)) {
                return;
            }
        }

        // no layer in the group is under the playhead, so reset selection
        selectLayerByItemIndex(activeLayer.itemIndex);
    }

    try {
        app.activeDocument.suspendHistory('Select Layer at Playhead', 'main()');
    } catch (e) {
        log(e);
    }
    
})();
