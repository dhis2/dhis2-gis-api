// Base class for most vector layers

import L from 'leaflet';

export const GeoJson = L.GeoJSON.extend({

    options: {
        highlightStyle: {
            weight: 2,
        },
        resetStyle: {
            weight: 1,
        },
    },

    initialize(options = {}) {
        L.GeoJSON.prototype.initialize.call(this, options.data, options);
    },

    addLayer(layer) {
        const options = this.options;
        const feature = layer.feature;

        if (options.hoverLabel || options.label) {
            layer.bindTooltip(L.Util.template(options.hoverLabel || options.label, feature.properties), {
                sticky: true,
            });
        }

        if (options.popup && !(options.popup instanceof Function)) {
            layer.bindPopup(L.Util.template(options.popup, feature.properties));
        }

        L.GeoJSON.prototype.addLayer.call(this, layer);
    },

    setOpacity(opacity) {
        this.setStyle({
            opacity: opacity,
            fillOpacity: opacity,
        });
    },

    findById(id) {
        for (const i in this._layers) {
            if (this._layers[i].feature.id === id) {
                return this._layers[i];
            }
        }

        return null;
    },

    onAdd(map) {
        L.GeoJSON.prototype.onAdd.call(this, map);

        if (this.options.highlightStyle) {
            this.on('mouseover', this.onMouseOver, this);
            this.on('mouseout', this.onMouseOut, this);
        }

        if (this.options.contextmenu) {
            this.on('contextmenu', this.options.contextmenu);
        }
    },

    onRemove(map) {
        L.GeoJSON.prototype.onRemove.call(this, map);

        if (this.options.highlightStyle) {
            this.off('mouseover', this.onMouseOver, this);
            this.off('mouseout', this.onMouseOut, this);
        }

        if (this.options.contextmenu) {
            this.off('contextmenu', this.options.contextmenu);
        }
    },

    // Set highlight style
    onMouseOver(evt) {
        evt.layer.setStyle(this.options.highlightStyle);
    },

    // Reset style
    onMouseOut(evt) {
        evt.layer.setStyle(this.options.resetStyle);
    },

});

export default function geoJson(options) {
    return new GeoJson(options);
}
