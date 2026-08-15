import React from 'react';
import { Calendar, MapPin, Users, Building, Home, HardHat, Clock, AlertTriangle } from 'lucide-react';

/**
 * DomainBookingFields Component
 * Dynamically renders category-specific input fields for Event, Construction, Home, and Accommodation domains.
 */
export const DomainBookingFields = ({ category = 'event', formData, onChange, todayStr }) => {
  const catLower = (category || 'event').toLowerCase();

  switch (catLower) {
    case 'construction':
      return (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <HardHat className="w-5 h-5 text-amber-400" />
            <span>Construction Project Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Start Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Preferred Start Date *</label>
              <input
                type="date"
                min={todayStr}
                value={formData.preferredStartDate || formData.eventDate || ''}
                onChange={(e) => {
                  onChange('preferredStartDate', e.target.value);
                  onChange('eventDate', e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            {/* Project Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Project Type *</label>
              <select
                value={formData.projectType || 'Renovation'}
                onChange={(e) => onChange('projectType', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="New Construction">New Construction</option>
                <option value="Renovation">Renovation & Remodeling</option>
                <option value="Interior Fit-out">Interior Design & Fit-out</option>
                <option value="Structural Repair">Structural Repair</option>
                <option value="Architectural Design">Architectural & Civil Planning</option>
              </select>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Property Type *</label>
              <select
                value={formData.propertyType || 'Residential'}
                onChange={(e) => onChange('propertyType', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              >
                <option value="Residential">Residential Villa / Apartment</option>
                <option value="Commercial">Commercial Office / Retail</option>
                <option value="Industrial">Industrial Warehouse</option>
                <option value="Land">Vacant Plot / Land</option>
              </select>
            </div>

            {/* Area & Unit */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Plot / Built Area</label>
                <input
                  type="number"
                  placeholder="e.g. 2400"
                  value={formData.area || ''}
                  onChange={(e) => onChange('area', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Unit</label>
                <select
                  value={formData.unit || 'sqft'}
                  onChange={(e) => onChange('unit', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="sqft">sq. ft.</option>
                  <option value="sqm">sq. m.</option>
                  <option value="acres">acres</option>
                </select>
              </div>
            </div>

            {/* Estimated Budget */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Target Budget (₹)</label>
              <input
                type="number"
                placeholder="e.g. 1500000"
                value={formData.estimatedBudget || ''}
                onChange={(e) => onChange('estimatedBudget', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Project Location */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block">Site Location / Address *</label>
              <input
                type="text"
                placeholder="e.g. Plot No. 42, Electronic City Phase 1, Bangalore"
                value={formData.projectLocation || formData.address || ''}
                onChange={(e) => {
                  onChange('projectLocation', e.target.value);
                  onChange('address', e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
                required
              />
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Project Description & Specifications</label>
            <textarea
              rows="3"
              placeholder="e.g. 3-story residential building construction with RCC structure and modular kitchen..."
              value={formData.projectDescription || ''}
              onChange={(e) => onChange('projectDescription', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500"
            ></textarea>
          </div>
        </div>
      );

    case 'home':
      return (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Home className="w-5 h-5 text-emerald-400" />
            <span>Home Service Request Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferred Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Preferred Service Date *</label>
              <input
                type="date"
                min={todayStr}
                value={formData.preferredDate || formData.eventDate || ''}
                onChange={(e) => {
                  onChange('preferredDate', e.target.value);
                  onChange('eventDate', e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Service Type *</label>
              <select
                value={formData.serviceType || 'General Repair'}
                onChange={(e) => onChange('serviceType', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Plumbing">Plumbing & Sanitary</option>
                <option value="Electrical">Electrical Repairs & Wiring</option>
                <option value="Deep Cleaning">Home Deep Cleaning</option>
                <option value="Appliance Repair">Appliance Repair (AC, Refrigerator, etc.)</option>
                <option value="Painting">Wall Painting & Waterproofing</option>
                <option value="Carpentry">Carpentry & Furniture Maintenance</option>
                <option value="General Repair">General Handyman Service</option>
              </select>
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Preferred Time Slot</label>
              <select
                value={formData.preferredTime || 'Morning'}
                onChange={(e) => onChange('preferredTime', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Morning">Morning (8:00 AM - 12:00 PM)</option>
                <option value="Afternoon">Afternoon (12:00 PM - 4:00 PM)</option>
                <option value="Evening">Evening (4:00 PM - 8:00 PM)</option>
              </select>
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Service Urgency</label>
              <select
                value={formData.urgency || 'Normal'}
                onChange={(e) => onChange('urgency', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="Normal">Normal (Within scheduled slot)</option>
                <option value="Urgent">Urgent (Same day priority)</option>
                <option value="Emergency">Emergency (Immediate dispatch)</option>
              </select>
            </div>

            {/* Service Address */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block">Home Address *</label>
              <input
                type="text"
                placeholder="e.g. Apartment 402, Green Valley Enclave, Indiranagar, Bangalore"
                value={formData.serviceAddress || formData.address || ''}
                onChange={(e) => {
                  onChange('serviceAddress', e.target.value);
                  onChange('address', e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          {/* Problem Description */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Problem Description & Issues *</label>
            <textarea
              rows="3"
              placeholder="e.g. Water pipe leakage under kitchen sink causing water clogging..."
              value={formData.problemDescription || ''}
              onChange={(e) => onChange('problemDescription', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              required
            ></textarea>
          </div>
        </div>
      );

    case 'accommodation':
      return (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Building className="w-5 h-5 text-purple-400" />
            <span>Accommodation & Stay Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Check-In Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Check-In Date *</label>
              <input
                type="date"
                min={todayStr}
                value={formData.checkInDate || formData.eventDate || ''}
                onChange={(e) => {
                  onChange('checkInDate', e.target.value);
                  onChange('eventDate', e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Check-Out Date */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Check-Out Date *</label>
              <input
                type="date"
                min={formData.checkInDate || todayStr}
                value={formData.checkOutDate || ''}
                onChange={(e) => onChange('checkOutDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Total Guests *</label>
              <input
                type="number"
                min="1"
                value={formData.guests || formData.guestCount || 1}
                onChange={(e) => {
                  onChange('guests', e.target.value);
                  onChange('guestCount', e.target.value);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Rooms */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Number of Rooms *</label>
              <input
                type="number"
                min="1"
                value={formData.rooms || 1}
                onChange={(e) => onChange('rooms', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            {/* Guest Details */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300 block">Primary Guest Name & Contact</label>
              <input
                type="text"
                placeholder="e.g. John Doe, Phone: +91 9876543210"
                value={formData.guestDetails || ''}
                onChange={(e) => onChange('guestDetails', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Special Requests & Preferences</label>
            <textarea
              rows="3"
              placeholder="e.g. High floor room with city view, late check-in at 9 PM, extra bed..."
              value={formData.specialRequests || formData.specialRequirements || ''}
              onChange={(e) => {
                onChange('specialRequests', e.target.value);
                onChange('specialRequirements', e.target.value);
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-purple-500"
            ></textarea>
          </div>
        </div>
      );

    case 'event':
    default:
      return (
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <span>Event Date & Location Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Event Date Picker */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Event Date *</label>
              <input
                type="date"
                min={todayStr}
                value={formData.eventDate || ''}
                onChange={(e) => onChange('eventDate', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
                required
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Event Type *</label>
              <select
                value={formData.eventType || 'Wedding'}
                onChange={(e) => onChange('eventType', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              >
                <option value="Wedding">Wedding / Marriage</option>
                <option value="Reception">Reception</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Anniversary">Anniversary</option>
                <option value="General Service">Other / General Service</option>
              </select>
            </div>

            {/* Guest Count */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Estimated Guest Count</label>
              <input
                type="number"
                min="1"
                value={formData.guestCount || 100}
                onChange={(e) => onChange('guestCount', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>

            {/* Venue Name */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">Venue / Hall Name</label>
              <input
                type="text"
                placeholder="e.g. Grand Palace Convention Hall"
                value={formData.venue || ''}
                onChange={(e) => onChange('venue', e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Event Address / Location *</label>
            <input
              type="text"
              placeholder="e.g. MG Road, Indiranagar, Bangalore"
              value={formData.address || ''}
              onChange={(e) => onChange('address', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
              required
            />
          </div>

          {/* Special Requirements */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">Special Requirements / Instructions</label>
            <textarea
              rows="2"
              placeholder="e.g. Stage floral decoration, specific color scheme, sound system setup..."
              value={formData.specialRequirements || ''}
              onChange={(e) => onChange('specialRequirements', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-brand-500"
            ></textarea>
          </div>
        </div>
      );
  }
};

export default DomainBookingFields;
