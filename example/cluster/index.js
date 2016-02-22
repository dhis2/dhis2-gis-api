import map from '../../src/';

map('map', {
    layers: [{
        type: 'mapQuest',
        name: 'OpenStreetMap',
    }, {
        type: 'serverCluster',
        name: 'Server Cluster',
        overlay: true,
        visible: true,
    }],
    bounds: [[58.787, 4.712], [59.669, 7.458]],
});