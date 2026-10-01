/**
 * Geospatial Helper Utilities for MDSAIPS Service Area Validation
 */

/**
 * Checks if a point (lat, lng) is inside a GeoJSON polygon.
 * GeoJSON polygon coordinates are formatted as [[[lng, lat], [lng, lat], ...]]
 * 
 * @param {number} latitude 
 * @param {number} longitude 
 * @param {Array} polygonCoordinates Array of linear ring coordinates
 * @returns {boolean}
 */
export const isPointInPolygon = (latitude, longitude, polygonCoordinates) => {
  if (!polygonCoordinates || !Array.isArray(polygonCoordinates) || polygonCoordinates.length === 0) {
    return true; // No boundary restriction set
  }

  const ring = polygonCoordinates[0] || polygonCoordinates;
  if (!Array.isArray(ring) || ring.length < 3) return true;

  let inside = false;
  const x = longitude;
  const y = latitude;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
};

/**
 * Calculates distance in kilometers between two lat/lng coordinates (Haversine Formula)
 */
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Validates whether customer's location falls within a vendor/service area configuration.
 * @param {Object} customerLoc - { lat, lng, city }
 * @param {Object} serviceArea - Service area configuration object
 * @returns {{ isAvailable: boolean, message: string }}
 */
export const checkLocationCoverage = (customerLoc = {}, serviceArea = {}) => {
  if (!serviceArea || (!serviceArea.type && !serviceArea.cities?.length && !serviceArea.radiusZone?.radiusKm)) {
    return { isAvailable: true, message: 'Available in your area ✓' };
  }

  const { type, polygon, radiusZone, cities } = serviceArea;

  // 1. City list check
  if (cities && Array.isArray(cities) && cities.length > 0 && customerLoc.city) {
    const cityMatch = cities.some((c) => {
      const cClean = c.trim().toLowerCase();
      const locClean = customerLoc.city.trim().toLowerCase();
      return locClean.includes(cClean) || cClean.includes(locClean);
    });
    if (!cityMatch) {
      return { isAvailable: false, message: `Not available in ${customerLoc.city}.` };
    }
  }

  // 2. Radius check (Only when type is explicitly 'Radius' and center coordinates are valid non-zero numbers)
  if (type === 'Radius' && radiusZone && radiusZone.radiusKm > 0 && radiusZone.center && (radiusZone.center.lat !== 0 || radiusZone.center.lng !== 0)) {
    if (customerLoc.lat != null && customerLoc.lng != null) {
      const distance = getDistanceKm(
        customerLoc.lat,
        customerLoc.lng,
        radiusZone.center.lat,
        radiusZone.center.lng
      );
      if (distance > radiusZone.radiusKm) {
        return {
          isAvailable: false,
          message: `Location is ${distance.toFixed(1)} km away (Service radius: ${radiusZone.radiusKm} km).`,
        };
      }
    }
  }

  // 3. Polygon check
  if (type === 'Polygon' && polygon && polygon.coordinates) {
    if (customerLoc.lat != null && customerLoc.lng != null) {
      const inside = isPointInPolygon(customerLoc.lat, customerLoc.lng, polygon.coordinates);
      if (!inside) {
        return { isAvailable: false, message: 'Location is outside vendor service zone polygon.' };
      }
    }
  }

  return { isAvailable: true, message: 'Available in your area ✓' };
};
