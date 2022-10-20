(function () {
    var LogFactory = require('./LogFactory.jsx');

    var log = new LogFactory('motion-tools.log');

    function getClassDescriptor(className) {
        var r = new ActionReference();
        r.putEnumerated(
            stringIDToTypeID(className),
            stringIDToTypeID("ordinal"),
            stringIDToTypeID("targetEnum")
        );
        return executeActionGet(r);
    }

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
    
    // Select the next sibling art layer of given layer. Returns true if a next
    // sibling art layer exists, false otherwise.
    function selectNextSiblingOfLayer(layer) {
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
    
    // Select the previous sibling art layer of given layer. Returns true if a
    // previous sibling art layer exists, false otherwise.
    function selectPreviousSiblingOfLayer(layer) {
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

    function clear() {
        // select all
        var idset = stringIDToTypeID( "set" );
        var desc241 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
        var ref90 = new ActionReference();
        var idchannel = stringIDToTypeID( "channel" );
        var idselection = stringIDToTypeID( "selection" );
        ref90.putProperty( idchannel, idselection );
        desc241.putReference( idnull, ref90 );
        var idto = stringIDToTypeID( "to" );
        var idordinal = stringIDToTypeID( "ordinal" );
        var idallEnum = stringIDToTypeID( "allEnum" );
        desc241.putEnumerated( idto, idordinal, idallEnum );
        executeAction( idset, desc241, DialogModes.NO );

        // clear
        var iddelete = stringIDToTypeID( "delete" );
        try {
            executeAction( iddelete, undefined, DialogModes.NO );
        } catch (e) {}

        // deselect
        var idset = stringIDToTypeID( "set" );
        var desc243 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
        var ref91 = new ActionReference();
        var idchannel = stringIDToTypeID( "channel" );
        var idselection = stringIDToTypeID( "selection" );
        ref91.putProperty( idchannel, idselection );
        desc243.putReference( idnull, ref91 );
        var idto = stringIDToTypeID( "to" );
        var idordinal = stringIDToTypeID( "ordinal" );
        var idnone = stringIDToTypeID( "none" );
        desc243.putEnumerated( idto, idordinal, idnone );
        executeAction( idset, desc243, DialogModes.NO );
    }

    // Nudge target layer one pixel over, then nudge it back. A no-op.
    function nudgeLayerNoOp(layer) {
        layer.translate(1, 0);
        layer.translate(-1, 0);
    }

    function isPlayheadAtLayer(layer) {
        try {
            // A layer can only be nudged if the playhead is at that layer. We
            // exploit this behavior to determine whether the playhead is at the
            // a given layer.
            nudgeLayerNoOp(layer);
            return true;
        } catch (e) {
            return false;
        }
    }

    // Select the layer in the currently selected layer group under the timeline
    // playhead. This script does nothing if no layer in the currently selected
    // layer group is under the playhead.
    function selectLayerAtPlayhead() {
        var document = app.activeDocument;
        var activeLayer = document.activeLayer;

        if (activeLayer.typename === 'LayerSet') {
            activeLayer = activeLayer.artLayers[0];
        }

        if (isPlayheadAtLayer(activeLayer)) {
            selectLayerByItemIndex(activeLayer.itemIndex)
            // playhead is already at active layer--no further action necessary
            return;
        }

        var siblingLayers = activeLayer.parent.artLayers;

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

    module.exports = {
        getClassDescriptor: getClassDescriptor,
        actionDescriptorToString: actionDescriptorToString,
        selectLayerByItemIndex: selectLayerByItemIndex,
        selectPreviousSiblingOfLayer: selectPreviousSiblingOfLayer,
        selectNextSiblingOfLayer: selectNextSiblingOfLayer,
        goToPreviousFrame: goToPreviousFrame,
        goToNextFrame: goToNextFrame,
        getTimeline: getTimeline,
        clear: clear,
        isPlayheadAtLayer: isPlayheadAtLayer,
        selectLayerAtPlayhead: selectLayerAtPlayhead
    }
})();
