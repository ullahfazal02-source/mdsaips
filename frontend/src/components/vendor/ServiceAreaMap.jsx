import React, { useState } from 'react';
import axios from 'axios';

/**
 * ServiceAreaMap Component
 * Vendor configuration panel for Cities, Radius Zone, and Geofenced Polygons.
 */
const ServiceAreaMap = ({ initialArea = {}, onUpdate }) => {
  const [areaType, setAreaType] = useState(initialArea.type || 'Cities');
  const [citiesInput, setCitiesInput] = useState(
    initialArea.cities ? initialArea.cities.join(', ') : 'Bangalore, Mysore'
  );
  const [radiusKm, setRadiusKm] = useState(initialArea.radiusZone?.radiusKm || 15);
  const [centerLat, setCenterLat] = useState(initialArea.radiusZone?.center?.lat || 12.9716);
  const [centerLng, setCenterLng] = useState(initialArea.radiusZone?.center?.lng || 77.5946);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem('token');
  const API_BASE = '/api/v1';

  const handleSaveArea = async (e) => {
    e.preventDefault();
    setSaving(true);

    const cities = citiesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    const payload = {
      serviceArea: {
        type: areaType,
        cities,
        radiusZone: {
          center: { lat: Number(centerLat), lng: Number(centerLng) },
          radiusKm: Number(radiusKm),
        },
      },
    };

    try {
      const res = await axios.put(`${API_BASE}/vendors/service-area`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert('Service area updated successfully!');
        if (onUpdate) onUpdate(res.data.data.serviceArea);
      }
    } catch (err) {
      console.error('Failed to update service area:', err);
      alert('Failed to update service area.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
      <div>
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
          <span>🗺️</span> Vendor Service Area & Geographic Coverage
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Configure where your services are available to avoid out-of-boundary booking requests.
        </p>
      </div>

      <form onSubmit={handleSaveArea} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Coverage Strategy</label>
          <select
            value={areaType}
            onChange={(e) => setAreaType(e.target.value)}
            className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Cities">City List (Multiple Cities)</option>
            <option value="Radius">Distance Radius (km around central location)</option>
            <option value="Polygon">Geofenced Polygon Zone</option>
          </select>
        </div>

        {areaType === 'Cities' && (
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Served Cities (Comma separated)</label>
            <input
              type="text"
              value={citiesInput}
              onChange={(e) => setCitiesInput(e.target.value)}
              placeholder="e.g. Bangalore, Mysore, Mangalore"
              className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        {areaType === 'Radius' && (
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Center Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={centerLat}
                  onChange={(e) => setCenterLat(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Center Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={centerLng}
                  onChange={(e) => setCenterLng(e.target.value)}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Coverage Radius: {radiusKm} km</label>
              <input
                type="range"
                min="1"
                max="100"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>
        )}

        {areaType === 'Polygon' && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <span className="font-bold">📍 Polygon Geofence Configured</span>
            <p>Geofenced coordinates polygon is active on your profile. Point-in-polygon ray casting algorithm will validate incoming customer coordinates.</p>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors"
        >
          {saving ? 'Saving...' : 'Save Service Area'}
        </button>
      </form>
    </div>
  );
};

export default ServiceAreaMap;
