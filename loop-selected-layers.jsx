(function () {
    var comp = app.project.activeItem;

    if (!comp) {
        return;
    }

    var layers = comp.selectedLayers;

    if (!layers) {
        return;
    }

    app.beginUndoGroup("Loop Selected Layers");

    for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];

        var a = layer.inPoint;
        var b = layer.outPoint;

        layer.timeRemapEnabled = true;

        var times = [a, b - comp.frameDuration, b];
        var values = [0, b - a - comp.frameDuration, 0];

        var prop = layer.property("ADBE Time Remapping");

        prop.setValuesAtTimes(times, values);
        prop.expression = 'loopOutDuration(type = "cycle")';

        // set layer's out point to the end of the composition
        layer.outPoint = comp.duration;
    }

    app.endUndoGroup();
})();
