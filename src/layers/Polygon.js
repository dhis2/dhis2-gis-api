import L from 'leaflet';
import { coordsToLatLngs } from '../utils/geometry';

export const Polygon = L.Polygon.extend({

    initialize(feature, options) {
        const { type, coordinates } = feature.geometry;
        const latlngs = coordsToLatLngs(coordinates, type === 'Polygon' ? 1 : 2);

        L.Polygon.prototype.initialize.call(this, latlngs, {
            ...options,
            color: feature.properties.color || options.color,
            fillOpacity: options.opacity,
        });

        this.feature = feature;
        this._latlng = this.getBounds().getCenter();
    },

    setOpacity(opacity) {
        this.setStyle({
            opacity,
            fillOpacity: opacity,
        });
    },

    // Needed for client clustering
    getLatLng() {
        return this._latlng;
    },

    // Dummy method needed for client clustering
    setLatLng() {},
});

export default function polygon(feature, options) {
    return new Polygon(feature, options);
}
