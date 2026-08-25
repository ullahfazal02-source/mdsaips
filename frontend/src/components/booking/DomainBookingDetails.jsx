import React from 'react';
import {
  Calendar,
  Users,
  MapPin,
  Building,
  Wrench,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Hotel,
} from 'lucide-react';

import { getDomainLabel } from '../../config/domains';

/**
 * Domain-Specific Booking Details Form Component
 * Dynamically renders required input fields based on Service.category (event, construction, home, accommodation).
 */
export const DomainBookingDetails = ({ category = 'event', formData, onChange }) => {
  const catKey = (category || 'event').toLowerCase();
  const domainLabel = getDomainLabel(catKey);

  const handleInputChange = (field, value) => {
    onChange({
      ...formData,
      [field]: value,
    });
  };

  if (catKey === 'construction') {
    return (
      <div className="space-y-4 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs">
          <span className="text-slate-300">Service Domain (Read-Only):</span>
          <span className="font-extrabold text-blue-400 uppercase tracking-wider">{domainLabel}</span>
        </div>

        <h4 className="text-sm font-bold text-blue-400 flex items-center space-x-2">
          <Building className="w-4 h-4 text-blue-400" />
          <span>Construction & Renovation Project Details</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Project Type *</label>
            <input
              type="text"
              required
              value={formData.projectType || ''}
              onChange={(e) => handleInputChange('projectType', e.target.value)}
              placeholder="e.g. Residential Renovation, Villa Construction"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Property Type</label>
            <input
              type="text"
              value={formData.propertyType || ''}
              onChange={(e) => handleInputChange('propertyType', e.target.value)}
              placeholder="e.g. Apartment, Independent House, Office"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Project Area (sq.ft)</label>
            <input
              type="number"
              min={1}
              value={formData.area || ''}
              onChange={(e) => handleInputChange('area', e.target.value)}
              placeholder="1200"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Estimated Budget (₹)</label>
            <input
              type="number"
              min={0}
              value={formData.estimatedBudget || ''}
              onChange={(e) => handleInputChange('estimatedBudget', e.target.value)}
              placeholder="500000"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Preferred Start Date *</label>
            <input
              type="date"
              required
              value={formData.preferredStartDate || ''}
              onChange={(e) => handleInputChange('preferredStartDate', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Project Location / Site Address *</label>
            <input
              type="text"
              required
              value={formData.projectLocation || formData.address || ''}
              onChange={(e) => {
                handleInputChange('projectLocation', e.target.value);
                handleInputChange('address', e.target.value);
              }}
              placeholder="Site plot/flat number and full street address"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="text-slate-300 font-semibold block">Project Description & Scope</label>
          <textarea
            rows={3}
            value={formData.projectDescription || ''}
            onChange={(e) => handleInputChange('projectDescription', e.target.value)}
            placeholder="Specify materials preference, structural changes, or special design blueprints..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
    );
  }

  if (catKey === 'home') {
    const subCat = (formData.subCategory || formData.serviceType || '').toLowerCase();
    const isAc = subCat.includes('ac') || subCat.includes('air_conditioning') || subCat.includes('cooler');
    const isRo = subCat.includes('ro') || subCat.includes('purifier');
    const isCctv = subCat.includes('cctv') || subCat.includes('smart') || subCat.includes('biometric') || subCat.includes('automation');

    return (
      <div className="space-y-4 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
          <span className="text-slate-300">Service Domain (Read-Only):</span>
          <span className="font-extrabold text-emerald-400 uppercase tracking-wider">{domainLabel}</span>
        </div>

        <h4 className="text-sm font-bold text-emerald-400 flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-emerald-400" />
          <span>Home Service Requirements</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Service / Problem Type *</label>
            <input
              type="text"
              required
              value={formData.serviceType || formData.problemType || ''}
              onChange={(e) => {
                handleInputChange('serviceType', e.target.value);
                handleInputChange('problemType', e.target.value);
              }}
              placeholder="e.g. Pipe Leakage, AC Service, CCTV Installation"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Conditional AC Fields */}
          {isAc && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">AC / Appliance Type</label>
                <select
                  value={formData.acType || 'Split AC'}
                  onChange={(e) => handleInputChange('acType', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Split AC">Split AC</option>
                  <option value="Window AC">Window AC</option>
                  <option value="Cassette AC">Cassette AC</option>
                  <option value="Inverter AC">Inverter AC</option>
                  <option value="Air Cooler">Air Cooler</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Brand / Model</label>
                <input
                  type="text"
                  value={formData.acBrand || ''}
                  onChange={(e) => handleInputChange('acBrand', e.target.value)}
                  placeholder="e.g. Daikin, Voltas, LG"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          {/* Conditional RO Fields */}
          {isRo && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">RO Purifier Type</label>
                <input
                  type="text"
                  value={formData.roType || ''}
                  onChange={(e) => handleInputChange('roType', e.target.value)}
                  placeholder="e.g. RO + UV + UF Alkaline"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">Water Purifier Brand</label>
                <input
                  type="text"
                  value={formData.waterPurifierBrand || ''}
                  onChange={(e) => handleInputChange('waterPurifierBrand', e.target.value)}
                  placeholder="e.g. Kent, Aquaguard, Pureit"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          {/* Conditional CCTV / Smart Home Fields */}
          {isCctv && (
            <>
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">System / Camera Count</label>
                <input
                  type="number"
                  min={1}
                  value={formData.numberOfDevices || ''}
                  onChange={(e) => handleInputChange('numberOfDevices', e.target.value)}
                  placeholder="4"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Urgency Level</label>
            <select
              value={formData.urgency || 'Normal'}
              onChange={(e) => handleInputChange('urgency', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Normal">Normal Service</option>
              <option value="Urgent">Urgent (Same Day)</option>
              <option value="Emergency">Emergency (Immediate Response)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Preferred Service Date *</label>
            <input
              type="date"
              required
              value={formData.preferredDate || ''}
              onChange={(e) => handleInputChange('preferredDate', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Preferred Time Window</label>
            <select
              value={formData.preferredTime || 'Morning (9 AM - 12 PM)'}
              onChange={(e) => handleInputChange('preferredTime', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            >
              <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
              <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
              <option value="Evening (4 PM - 8 PM)">Evening (4 PM - 8 PM)</option>
            </select>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-slate-300 font-semibold block">Service Address *</label>
            <input
              type="text"
              required
              value={formData.serviceAddress || formData.address || ''}
              onChange={(e) => {
                handleInputChange('serviceAddress', e.target.value);
                handleInputChange('address', e.target.value);
              }}
              placeholder="Flat/House number, street address, and landmark"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="text-slate-300 font-semibold block">Problem Description & Specific Requests</label>
          <textarea
            rows={3}
            value={formData.problemDescription || ''}
            onChange={(e) => handleInputChange('problemDescription', e.target.value)}
            placeholder="Describe the issue, required tools, or specific area in the house..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
    );
  }

  if (catKey === 'accommodation') {
    return (
      <div className="space-y-4 border-t border-slate-800 pt-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs">
          <span className="text-slate-300">Service Domain (Read-Only):</span>
          <span className="font-extrabold text-purple-400 uppercase tracking-wider">{domainLabel}</span>
        </div>

        <h4 className="text-sm font-bold text-purple-400 flex items-center space-x-2">
          <Hotel className="w-4 h-4 text-purple-400" />
          <span>Accommodation & Stay Details</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Check-In Date *</label>
            <input
              type="date"
              required
              value={formData.checkInDate || ''}
              onChange={(e) => handleInputChange('checkInDate', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Check-Out Date *</label>
            <input
              type="date"
              required
              value={formData.checkOutDate || ''}
              onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Number of Guests</label>
            <input
              type="number"
              min={1}
              value={formData.guests || ''}
              onChange={(e) => handleInputChange('guests', e.target.value)}
              placeholder="2"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold block">Number of Rooms</label>
            <input
              type="number"
              min={1}
              value={formData.rooms || ''}
              onChange={(e) => handleInputChange('rooms', e.target.value)}
              placeholder="1"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-slate-300 font-semibold block">Primary Guest Information</label>
            <input
              type="text"
              value={formData.guestDetails || ''}
              onChange={(e) => handleInputChange('guestDetails', e.target.value)}
              placeholder="Lead guest name and contact number"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        <div className="space-y-1 text-xs">
          <label className="text-slate-300 font-semibold block">Special Requests</label>
          <textarea
            rows={3}
            value={formData.specialRequests || ''}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="Early check-in, high floor room, airport pickup preference..."
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>
    );
  }

  // Default Event Domain
  return (
    <div className="space-y-4 border-t border-slate-800 pt-4">
      <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
        <span className="text-slate-300">Service Domain (Read-Only):</span>
        <span className="font-extrabold text-amber-400 uppercase tracking-wider">{domainLabel}</span>
      </div>

      <h4 className="text-sm font-bold text-amber-400 flex items-center space-x-2">
        <Calendar className="w-4 h-4 text-amber-400" />
        <span>Event Reservation Details</span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Event Type *</label>
          <input
            type="text"
            required
            value={formData.eventType || ''}
            onChange={(e) => handleInputChange('eventType', e.target.value)}
            placeholder="e.g. Wedding Reception, Corporate Gala"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Event Date *</label>
          <input
            type="date"
            required
            value={formData.eventDate || ''}
            onChange={(e) => handleInputChange('eventDate', e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Guest Count</label>
          <input
            type="number"
            min={1}
            value={formData.guestCount || ''}
            onChange={(e) => handleInputChange('guestCount', e.target.value)}
            placeholder="150"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-slate-300 font-semibold block">Venue Name</label>
          <input
            type="text"
            value={formData.venue || ''}
            onChange={(e) => handleInputChange('venue', e.target.value)}
            placeholder="e.g. Grand Ballroom"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label className="text-slate-300 font-semibold block">Venue Address / Location *</label>
          <input
            type="text"
            required
            value={formData.address || ''}
            onChange={(e) => handleInputChange('address', e.target.value)}
            placeholder="Full street address and city"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      <div className="space-y-1 text-xs">
        <label className="text-slate-300 font-semibold block">Special Requirements & Preferences</label>
        <textarea
          rows={3}
          value={formData.specialRequirements || ''}
          onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
          placeholder="Stage dimension requests, theme color palette, setup timeline..."
          className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-brand-500"
        />
      </div>
    </div>
  );
};

export default DomainBookingDetails;
