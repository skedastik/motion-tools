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
    
    function selectLayer(layer) {
        app.activeDocument.activeLayer = layer;
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
                selectLayer(sibling);
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
                selectLayer(sibling);
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

    // Returns true if free transform is enabled
    // from r-bin: https://community.adobe.com/t5/photoshop-ecosystem-discussions/is-there-any-way-to-move-the-time-indicator-of-timeline-to-first-frame-of-the-layer-using-photoshop/td-p/9945227
    function isTransformEnabled(layer) {
        var r = new ActionReference();        
        r.putEnumerated(charIDToTypeID("capp"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));    
        var d = new ActionDescriptor();  
        d.putReference( charIDToTypeID( "null" ), r );    
        d.putString (stringIDToTypeID("command"), "getCommandEnabled");    
        d.putDouble(stringIDToTypeID("commandID"), 2207 );    
        return executeAction(stringIDToTypeID("uiInfo"), d, DialogModes.NO)
            .getObjectValue(stringIDToTypeID("result"))
            .getBoolean(stringIDToTypeID("enabled"));
    }

    // Returns true if the timeline playhead is above the given layer, false
    // otherwise.
    function isPlayheadAtLayer(layer) {
        return isTransformEnabled();
    }

    // Select the layer in the currently selected layer group under the timeline
    // playhead. This script does nothing if no layer in the currently selected
    // layer group is under the playhead.
    function selectLayerAtPlayhead() {
        var activeLayer = app.activeDocument.activeLayer;

        if (activeLayer.typename === 'LayerSet') {
            activeLayer = activeLayer.artLayers[0];
        }

        if (isPlayheadAtLayer(activeLayer)) {
            selectLayer(activeLayer)
            // playhead is already at active layer--no further action necessary
            return;
        }

        var siblingLayers = activeLayer.parent.artLayers;

        for (var i = 0; i < siblingLayers.length; i++) {
            var layer = siblingLayers[i];

            selectLayer(layer);
            
            if (isPlayheadAtLayer(layer)) {
                return;
            }
        }

        // no layer in the group is under the playhead, so reset selection
        selectLayer(activeLayer);
    }

    function getTimelineTimeInFrames() {
        var r = new ActionReference();
        var idproperty = stringIDToTypeID( "property" );
        var idtime = stringIDToTypeID( "time" );
        r.putProperty( idproperty, idtime );
        var idtimeline = stringIDToTypeID( "timeline" );
        r.putClass( idtimeline );
        var d = executeActionGet(r).getObjectValue(stringIDToTypeID("time"));
        
        var hours = 0;
        try {
            hours = d.getInteger(stringIDToTypeID("hours"));
        } catch (e) {}

        var minutes = 0;
        try {
            minutes = d.getInteger(stringIDToTypeID("minutes"));
        } catch (e) {}

        var seconds = d.getInteger(stringIDToTypeID("seconds"));
        var frame = d.getInteger(stringIDToTypeID("frame"));
        var frameRate = d.getInteger(stringIDToTypeID("frameRate"));

        return (hours * 60 * 60 + minutes * 60 + seconds) * frameRate + frame;
    }

    function getTimelineDurationInFrames() {
        var r = new ActionReference();
        var idproperty = stringIDToTypeID( "property" );
        var idtime = stringIDToTypeID( "duration" );
        r.putProperty( idproperty, idtime );
        var idtimeline = stringIDToTypeID( "timeline" );
        r.putClass( idtimeline );
        var d = executeActionGet(r).getObjectValue(stringIDToTypeID("duration"));
        
        var hours = 0;
        try {
            hours = d.getInteger(stringIDToTypeID("hours"));
        } catch (e) {}

        var minutes = 0;
        try {
            minutes = d.getInteger(stringIDToTypeID("minutes"));
        } catch (e) {}

        var seconds = d.getInteger(stringIDToTypeID("seconds"));
        var frame = d.getInteger(stringIDToTypeID("frame"));
        var frameRate = d.getInteger(stringIDToTypeID("frameRate"));

        return (hours * 60 * 60 + minutes * 60 + seconds) * frameRate + frame;
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

    // Select next layer from the given layer. This may not necessarily be a
    // sibling layer (i.e. in the same group).
    function selectNextLayerFrom(layer) {
        var idselect = stringIDToTypeID( "select" );
        var desc609 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
        var ref475 = new ActionReference();
        var idlayer = stringIDToTypeID( "layer" );
        var idordinal = stringIDToTypeID( "ordinal" );
        var idforwardEnum = stringIDToTypeID( "forwardEnum" );
        ref475.putEnumerated( idlayer, idordinal, idforwardEnum );
        desc609.putReference( idnull, ref475 );
        var idmakeVisible = stringIDToTypeID( "makeVisible" );
        desc609.putBoolean( idmakeVisible, false );
        var idlayerID = stringIDToTypeID( "layerID" );
        var list263 = new ActionList();
        list263.putInteger( layer.id );
        desc609.putList( idlayerID, list263 );
        executeAction( idselect, desc609, DialogModes.NO ); 
    }

    // Select previous layer from the given layer. This may not necessarily be a
    // sibling layer (i.e. in the same group).
    function selectPreviousLayerFrom(layer) {
        var idselect = stringIDToTypeID( "select" );
        var desc686 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
        var ref549 = new ActionReference();
        var idlayer = stringIDToTypeID( "layer" );
        var idordinal = stringIDToTypeID( "ordinal" );
        var idbackwardEnum = stringIDToTypeID( "backwardEnum" );
        ref549.putEnumerated( idlayer, idordinal, idbackwardEnum );
        desc686.putReference( idnull, ref549 );
        var idmakeVisible = stringIDToTypeID( "makeVisible" );
        desc686.putBoolean( idmakeVisible, false );
        var idlayerID = stringIDToTypeID( "layerID" );
        var list267 = new ActionList();
        list267.putInteger( layer.id );
        desc686.putList( idlayerID, list267 );
        executeAction( idselect, desc686, DialogModes.NO );
    }

    // Return the duration of the given layer.
    // SIDE EFFECTS: Undo history is affected.
    function getLayerDuration(layer) {
        // Choose a TIME DELTA equal to the timeline duration (X).
        var TIME_DELTA = getTimelineDurationInFrames();

        // Increase the out-point of the active layer by the TIME DELTA.
        moveActiveLayerOutTimeInFrames(TIME_DELTA);

        // Record the resulting timeline duration (A).
        var da = getTimelineDurationInFrames();

        // Duplicate the active layer to create a new animation frame with
        // identical duration.
        var newLayer = layer.duplicate();

        // Record the timeline duration after duplicating (B).
        var db = getTimelineDurationInFrames();

        // Reset the active layer's out-point to its original value by
        // substracting the TIME DELTA.
        moveActiveLayerOutTimeInFrames(-TIME_DELTA);

        // Select the new animation frame.
        selectLayer(newLayer.id);

        // Reset the duplication frame's duration too.
        moveActiveLayerOutTimeInFrames(-TIME_DELTA);

        // The layer's original duration can be derived as B - A - X. The reason
        // we needed to first add the TIME DELTA is to guarantee that the
        // layer's duration is longer than the timeline's.
        return db - da - TIME_DELTA;
    }

    // Return the in-point (i.e. start time) of the active (selected) layer in
    // frames.
    // SIDE EFFECTS: Undo history is affected.
    function getActiveLayerInPointInFrames() {
        var activeLayer = app.activeDocument.activeLayer;
        
        var timelineDuration = getTimelineDurationInFrames();
        var playheadPosition = getTimelineTimeInFrames();

        var left = 0;
        var right = playheadPosition + timelineDuration;
        var mid;

        // Increase the duration of the active layer by twice the timeline's
        // duration, X, and move the playhead forward by X. The playhead is
        // guaranteed to be above the timeline. 
        moveActiveLayerOutTimeInFrames(timelineDuration * 2);
        setTimelineTimeInFrames(right);

        // Now it's just a matter of performing a binary search behind the
        // playhead to find the in-point of the layer.
        var iters = 0;
        do {
            mid = Math.ceil((left + right) / 2);
            setTimelineTimeInFrames(mid);
            if (isPlayheadAtLayer(activeLayer)) {
                right = mid;
            } else {
                left = mid;
            }
        } while (left + 1 < right);

        // reset layer duration and playhead position
        moveActiveLayerOutTimeInFrames(-timelineDuration * 2);
        setTimelineTimeInFrames(playheadPosition);

        if (right != 1) {
            return right;
        }

        // we need to handle the special case of a frame starting at time 0
        setTimelineTimeInFrames(0);
        return isPlayheadAtLayer(activeLayer) ? 0 : 1;
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
        selectLayer: selectLayer,
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
        setTimelineTimeInFrames: setTimelineTimeInFrames,
        getLayerDuration: getLayerDuration,
        getActiveLayerInPointInFrames: getActiveLayerInPointInFrames,
        selectNextLayerFrom: selectNextLayerFrom,
        selectPreviousLayerFrom: selectPreviousLayerFrom
    }
})();
