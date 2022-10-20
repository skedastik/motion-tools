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
            str.push(typeIDToStringID(d.getKey(i)) + ' : ' + d.getType(d.getKey(i)));
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

    function getTimelineTimeInFrames() {
        var r = new ActionReference();
        var idproperty = stringIDToTypeID( "property" );
        var idtime = stringIDToTypeID( "time" );
        r.putProperty( idproperty, idtime );
        var idtimeline = stringIDToTypeID( "timeline" );
        r.putClass( idtimeline );
        var d = executeActionGet(r).getObjectValue(stringIDToTypeID("time"));
        
        var seconds = d.getInteger(stringIDToTypeID("seconds"));
        var frame = d.getInteger(stringIDToTypeID("frame"));
        var frameRate = d.getInteger(stringIDToTypeID("frameRate"));

        return seconds * frameRate + frame;
    }

    function getTimelineDurationInFrames() {
        var r = new ActionReference();
        var idproperty = stringIDToTypeID( "property" );
        var idtime = stringIDToTypeID( "duration" );
        r.putProperty( idproperty, idtime );
        var idtimeline = stringIDToTypeID( "timeline" );
        r.putClass( idtimeline );
        var d = executeActionGet(r).getObjectValue(stringIDToTypeID("duration"));
        
        var seconds = d.getInteger(stringIDToTypeID("seconds"));
        var frame = d.getInteger(stringIDToTypeID("frame"));
        var frameRate = d.getInteger(stringIDToTypeID("frameRate"));

        return seconds * frameRate + frame;
    }

    function getTimelineFrameRate() {
        var r = new ActionReference();
        var idproperty = stringIDToTypeID( "property" );
        var idtime = stringIDToTypeID( "duration" );
        r.putProperty( idproperty, idtime );
        var idtimeline = stringIDToTypeID( "timeline" );
        r.putClass( idtimeline );
        var d = executeActionGet(r).getObjectValue(stringIDToTypeID("duration"));
        return d.getInteger(stringIDToTypeID("frameRate"));
    }

    function moveActiveLayerOutTimeInFrames(framesDelta) {
        var frameRate = getTimelineFrameRate();
        var idmoveOutTime = stringIDToTypeID( "moveOutTime" );
        var desc1857 = new ActionDescriptor();
        var idtimeOffset = stringIDToTypeID( "timeOffset" );
        var desc1858 = new ActionDescriptor();
        var idseconds = stringIDToTypeID( "seconds" );
        desc1858.putInteger( idseconds, 0 );
        var idframe = stringIDToTypeID( "frame" );
        desc1858.putInteger( idframe, framesDelta );
        var idframeRate = stringIDToTypeID( "frameRate" );
        desc1858.putDouble( idframeRate, frameRate );
        var idtimecode = stringIDToTypeID( "timecode" );
        desc1857.putObject( idtimeOffset, idtimecode, desc1858 );
        var d = executeAction( idmoveOutTime, desc1857, DialogModes.NO );
    }

    // move timeline playhead to given frame number
    function setTimelineTimeInFrames(frame) {
        var frameRate = getTimelineFrameRate();
        var seconds = frame % frameRate;

        var idset = stringIDToTypeID( "set" );
        var desc457 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
        var ref170 = new ActionReference();
        var idproperty = stringIDToTypeID( "property" );
        var idtime = stringIDToTypeID( "time" );
        ref170.putProperty( idproperty, idtime );
        var idtimeline = stringIDToTypeID( "timeline" );
        ref170.putClass( idtimeline );
        desc457.putReference( idnull, ref170 );
        var idto = stringIDToTypeID( "to" );
        var desc458 = new ActionDescriptor();
        var idseconds = stringIDToTypeID( "seconds" );
        desc458.putInteger( idseconds, seconds );
        var idframe = stringIDToTypeID( "frame" );
        desc458.putInteger( idframe, frame - seconds * frameRate );
        var idframeRate = stringIDToTypeID( "frameRate" );
        desc458.putDouble( idframeRate, frameRate );
        var idtimecode = stringIDToTypeID( "timecode" );
        desc457.putObject( idto, idtimecode, desc458 );
        executeAction( idset, desc457, DialogModes.NO );
    }

    module.exports = {
        getClassDescriptor: getClassDescriptor,
        actionDescriptorToString: actionDescriptorToString,
        selectLayerByItemIndex: selectLayerByItemIndex,
        selectPreviousSiblingOfLayer: selectPreviousSiblingOfLayer,
        selectNextSiblingOfLayer: selectNextSiblingOfLayer,
        goToPreviousFrame: goToPreviousFrame,
        goToNextFrame: goToNextFrame,
        clear: clear,
        isPlayheadAtLayer: isPlayheadAtLayer,
        selectLayerAtPlayhead: selectLayerAtPlayhead,
        moveActiveLayerOutTimeInFrames: moveActiveLayerOutTimeInFrames,
        getTimelineTimeInFrames: getTimelineTimeInFrames,
        getTimelineDurationInFrames: getTimelineDurationInFrames,
        getTimelineFrameRate: getTimelineFrameRate,
        setTimelineTimeInFrames: setTimelineTimeInFrames
    }
})();
