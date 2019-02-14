import L from 'leaflet';

// Converts from [lat,lng] to [lng,lat]
export const toLatLng = lnglat => [...lnglat].reverse();

// Converts from [lng,lat] to [lat,lng]
export const toLngLat = (latlng) => {
    if (Array.isArray(latlng)) {
        return [...latlng].reverse();
    } else if (latlng instanceof L.LatLng) {
        return [latlng.lng, latlng.lat];
    }
};

// Converts from [[lng,lat],[lng,lat]] to [[lat,lng],[lat,lng]]
export const toLatLngBounds = bounds => bounds.map(toLatLng);

// Converts from [[lat,lng],[lat,lng]] to [[lng,lat],[lng,lat]]
export const toLngLatBounds = (bounds) => {
    if (Array.isArray(bounds)) {
        return bounds.map(toLngLat);
    } else if (bounds instanceof L.LatLngBounds) {
        return [toLngLat(bounds.getSouthWest()), toLngLat(bounds.getNorthEast())];
    }
};