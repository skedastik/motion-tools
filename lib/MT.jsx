(function () {
    var LogFactory = require('./LogFactory.jsx');

    var log = new LogFactory('motion-tools.log');

    module.exports = {
        // get an array of properties from a given layer
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

        // get an array of selected properties from a given layer
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

        // get a sorted array of all distinct keyframe times from a given array of properties
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
        }
    };
})();
