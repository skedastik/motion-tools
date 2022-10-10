(function () {
    var LogFactory = require('./LogFactory.jsx');

    var log = new LogFactory('motion-tools.log');

    module.exports = {
        // Return an array of properties from a given layer.
        getPropertiesFrom: function (layer) {
            var props = [];

            function _getAllProperties(o) {
                for (var i = 1; i <= o.numProperties; i++) {
                    var p = o.property(i);
                    props.push(p);
                    _getAllProperties(p);
                }
            }
            
            _getAllProperties(layer);

            return props;
        },

        // Return an array of selected properties from a given layer.
        getSelectedPropertiesFrom: function (layer) {
            var props = [];

            function _getAllSelectedProperties(o) {
                for (var i = 1; i <= o.numProperties; i++) {
                    var p = o.property(i);

                    if (p.selectedKeys && p.selectedKeys.length > 0) {
                        props.push(p);
                    }
                    
                    _getAllSelectedProperties(p);
                }
            }
            
            _getAllSelectedProperties(layer);

            return props;
        },

        // Return a sorted array of all distinct keyframe times from a given
        // array of properties.
        getDistinctSortedKeyTimesFrom: function (properties) {
            var keyTimes = [];
            var distinctKeyTimes = {};

            for (var i = 0; i < properties.length; i++) {
                var prop = properties[i];
                var numKeys = prop.numKeys;
                if (numKeys !== undefined) {
                    for (var j = 1; j <= numKeys; j++) {
                        var keyTime = prop.keyTime(j);
                        if (!distinctKeyTimes[keyTime]) {
                            distinctKeyTimes[keyTime] = true;
                            keyTimes.push(keyTime);
                        }
                    }
                }
            }

            keyTimes.sort(function (a, b) {
                return a - b;
            });
            
            return keyTimes;
        },

        // Delete key of given property at given index, and recreate it at new
        // time. This will throw an exception if the created key's index differs
        // from the original index. You must take steps to ensure key indices
        // are preserved.
        moveKeyAtTime: function (property, index, newTime) {
            var inType = property.keyInInterpolationType(index);
            var outType = property.keyOutInterpolationType(index);
            var labelIndex = property.keyLabel(index);
            var roving = property.keyRoving(index);
            var selected = property.keySelected(index);
            var spatialAutoBezier = property.keySpatialAutoBezier(index);
            var spatialContinuous = property.keySpatialContinuous(index);
            var inTangent = property.keyInSpatialTangent(index);
            var outTangent = property.keyOutSpatialTangent(index);
            var temporalAutoBezier = property.keyTemporalAutoBezier(index);
            var temporalContinuous = property.keyTemporalContinuous(index);
            var inTemporalEase = property.keyInTemporalEase(index);
            var outTemporalEase = property.keyOutTemporalEase(index);
            var value = property.keyValue(index);

            property.removeKey(index);

            if (property.addKey(newTime) !== index) {
                throw "Index violation attempting to move key: The new key's index must not change.";
            }
            
            property.setInterpolationTypeAtKey(index, inType, outType);
            property.setLabelAtKey(index, labelIndex);
            property.setRovingAtKey(index, roving);
            property.setSelectedAtKey(index, selected);
            property.setSpatialAutoBezierAtKey(index, spatialAutoBezier);
            property.setSpatialContinuousAtKey(index, spatialContinuous);
            property.setSpatialTangentsAtKey(index, inTangent, outTangent);
            property.setTemporalAutoBezierAtKey(index, temporalAutoBezier);
            property.setTemporalContinuousAtKey(index, temporalContinuous);
            property.setTemporalEaseAtKey(index, inTemporalEase, outTemporalEase);
            property.setValueAtKey(index, value);
        }
    };
})();
