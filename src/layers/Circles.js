// Facility layer circular area
import {GeoJson} from './GeoJson';

export const Circles = GeoJson.extend({

    options: {
        radius: 1000,
        style: {
            color: '#95c8fb',
            weight: 1,
        },
        opacityFactor: 0.2,
    },

    initialize(options = {}) {
        if (!options.pointToLayer) {
            options.pointToLayer = this.pointToLayer.bind(this);
        }

        GeoJson.prototype.initialize.call(this, options);
    },

    pointToLayer(feature, latlng) {
        return L.circle(latlng, {
            radius: this.options.radius,
            pane: this.options.pane,
        });
    },

    setOpacity(opacity) {
        this.setStyle({
            opacity,
            fillOpacity: opacity * this.options.opacityFactor,
        });
    },

});

export default function circles(options) {
    return new Circles(options);
}
