import L from 'leaflet';
import label from './Label';
import polylabel from 'polylabel';
import 'leaflet.layergroup.collision';
import layerMixin from './layerMixin';

const geojsonArea = require('geojson-area');

// Base class for most vector layers
export const GeoJson = L.GeoJSON.extend({

    options: {
        style: {
            weight: 1,
        },
        highlightStyle: {
            weight: 3,
        },
        resetStyle: {
            weight: 1,
        },
    },

    initialize(options = {}) {
        if (!options.pointToLayer) {
            options.pointToLayer = this.pointToLayer.bind(this);
        }

        if (options.label) {
            this._labels = L.layerGroup({ margin: 2 });
        }

        L.GeoJSON.prototype.initialize.call(this, options.data, options);
    },

    addLayer(layer) { // eslint-disable-line
        const options = this.options;
        const feature = layer.feature;

        // Add text label
        if (options.label) {
            this.addLabel(layer, L.Util.template(options.label, feature.properties));
        }

        if (options.hoverLabel || options.label) {
            const tooltip = L.Util.template(options.hoverLabel || options.label, feature.properties);
            layer.bindTooltip(tooltip, {
                sticky: true,
            });
        }

        if (options.popup && !(options.popup instanceof Function)) {
            layer.bindPopup(L.Util.template(options.popup, feature.properties));
        }

        L.GeoJSON.prototype.addLayer.call(this, layer);
    },

    // Add label to layer
    addLabel(layer, text) {
        const prop = layer.feature.properties;
        const geometry = layer.feature.geometry;
        const labelStyle = L.extend(prop.labelStyle || {}, this.options.labelStyle);
        const latlng = this._getLabelLatlng(geometry);

        if (prop.style && prop.style.color) {
            labelStyle.color = prop.style.color;
        }

        layer._label = label(latlng, {
            html: text,
            position: geometry.type === 'Point' ? 'below' : 'middle',
            labelStyle: labelStyle,
            pane: this.options.labelPane || 'markerPane',
        });

        this._labels.addLayer(layer._label);
    },

    // Use circle markers for point features
    pointToLayer(geojson, latlng) {
        this.options.style.pane = this.options.pane;
        return new L.CircleMarker(latlng, this.options.style);
    },

    setOpacity(opacity) {
        this.setStyle({
            opacity,
            fillOpacity: opacity,
        });
    },

    findById(id) {
        for (const i in this._layers) { // eslint-disable-line
            if (this._layers[i].feature.id === id) {
                return this._layers[i];
            }
        }

        return null;
    },

    onAdd(map) {
        const { onClick, onRightClick, highlightStyle } = this.options;

        L.GeoJSON.prototype.onAdd.call(this, map);

        if (this._labels) {
            map.addLayer(this._labels);
        }

        if (onClick) {
            this.on('click', this.onClick, this);
        }

        if (onRightClick) {
            this.on('contextmenu', this.onRightClick, this);
        }

        if (highlightStyle) {
            this.on('mouseover', this.onMouseOver, this);
            this.on('mouseout', this.onMouseOut, this);
        }

        this.fire('ready');
    },

    onRemove(map) {
        const { onClick, onRightClick, highlightStyle } = this.options;

        L.GeoJSON.prototype.onRemove.call(this, map);

        if (this._labels) {
            map.removeLayer(this._labels);
        }

        if (onClick) {
            this.off('click', this.onClick, this);
        }

        if (onRightClick) {
            this.off('contextmenu', this.onRightClick, this);
        }

        if (highlightStyle) {
            this.off('mouseover', this.onMouseOver, this);
            this.off('mouseout', this.onMouseOut, this);
        }
    },

    // Set highlight style
    onMouseOver(evt) {
        evt.layer.setStyle(this.options.highlightStyle);
    },

    // Reset style
    onMouseOut(evt) {
        if (!evt.layer.feature.isSelected) {
            evt.layer.setStyle(this.options.resetStyle);
        }
    },

    // "Normalise" event before passing back to app
    onClick(evt) {
        L.DomEvent.stopPropagation(evt);

        const { type, layer, latlng } = evt;
        const coordinates = [latlng.lng, latlng.lat]; 
        const feature = layer.feature;

        this.options.onClick({ type, coordinates, feature });
    },

    // "Normalise" event before passing back to app
    onRightClick(evt) {
        L.DomEvent.stopPropagation(evt);

        const { type, layer, latlng, originalEvent } = evt;
        const coordinates = [latlng.lng, latlng.lat]; 
        const position = [originalEvent.x, originalEvent.pageY || originalEvent.y];
        const feature = layer.feature;

        this.options.onRightClick({ type, coordinates, position, feature });
    },

    // Returns the best label placement
    _getLabelLatlng(geometry) {
        const coords = geometry.coordinates;
        let biggestRing;

        if (geometry.type === 'Point') {
            return [coords[1], coords[0]];
        } else if (geometry.type === 'Polygon') {
            biggestRing = coords;
        } else if (geometry.type === 'MultiPolygon') {
            biggestRing = coords[0];

            // If more than one polygon, place the label on the polygon with the biggest area
            if (coords.length > 1) {
                let biggestSize = 0;

                coords.forEach((ring) => {
                    const size = geojsonArea.ring(ring[0]); // Area calculation

                    if (size > biggestSize) {
                        biggestRing = ring;
                        biggestSize = size;
                    }
                });
            }
        }

        // Returns pole of inaccessibility, the most distant internal point from the polygon outline
        return polylabel(biggestRing, 2).reverse();
    },

    ...layerMixin,
});

export default function geoJson(options) {
    return new GeoJson(options);
}
