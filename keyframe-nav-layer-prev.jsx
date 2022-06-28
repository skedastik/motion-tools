//@include "(lib)/LogFactory.jsx"
//@include "(lib)/MT.jsx"

(function () {
    var log = new LogFactory('keyframe-nav-next.log');

    try {
        var layer = app.project.activeItem.selectedLayers[0];
    } catch (e) {
        return;
    }

    if (!layer) {
        return;
    }

    app.beginUndoGroup("Go to Next Keyframe in Layer");

    var properties = MT.getPropertiesFrom(layer);
    var keyTimes = MT.getDistinctSortedKeyTimesFrom(properties);
    var currentTime = app.project.activeItem.time;

    for (var i = keyTimes.length - 1 ; i >= 0; i--) {
        var keyTime = keyTimes[i];
        if (keyTime < currentTime) {
            app.project.activeItem.time = keyTime;
            break;
        }
    }

    app.endUndoGroup();
})();
